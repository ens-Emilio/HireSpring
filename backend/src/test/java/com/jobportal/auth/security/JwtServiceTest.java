package com.jobportal.auth.security;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Base64;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    private UserDetails userDetails;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        // Use reflection to set private fields
        setField(jwtService, "secret", Base64.getEncoder().encodeToString("my-256-bit-secret-key-for-testing-purposes-only".getBytes()));
        setField(jwtService, "expirationMs", 86400000L);

        userDetails = new User(
                "test@example.com",
                "password",
                List.of(new SimpleGrantedAuthority("ROLE_CANDIDATE"))
        );
    }

    private void setField(Object target, String fieldName, Object value) {
        try {
            java.lang.reflect.Field field = target.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(target, value);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    void generateToken_Success() {
        String token = jwtService.generateToken(userDetails);

        assertNotNull(token);
        assertTrue(token.split("\\.").length == 3);
    }

    @Test
    void extractUsername_Success() {
        String token = jwtService.generateToken(userDetails);

        String username = jwtService.extractUsername(token);

        assertEquals("test@example.com", username);
    }

    @Test
    void isTokenValid_ValidToken_ReturnsTrue() {
        String token = jwtService.generateToken(userDetails);

        assertTrue(jwtService.isTokenValid(token, userDetails));
    }

    @Test
    void isTokenValid_WrongUser_ReturnsFalse() {
        String token = jwtService.generateToken(userDetails);
        UserDetails otherUser = new User("other@example.com", "password", List.of());

        assertFalse(jwtService.isTokenValid(token, otherUser));
    }

    @Test
    void isTokenValid_ExpiredToken_ReturnsFalse() {
        // Create service with short expiration
        JwtService shortJwtService = new JwtService();
        setField(shortJwtService, "secret", Base64.getEncoder().encodeToString("my-256-bit-secret-key-for-testing-purposes-only".getBytes()));
        setField(shortJwtService, "expirationMs", -1000L); // Already expired

        String token = shortJwtService.generateToken(userDetails);

        assertFalse(shortJwtService.isTokenValid(token, userDetails));
    }

    @Test
    void isTokenValid_MalformedToken_ReturnsFalse() {
        assertFalse(jwtService.isTokenValid("invalid.token.here", userDetails));
    }

    @Test
    void isTokenValid_EmptyToken_ReturnsFalse() {
        assertFalse(jwtService.isTokenValid("", userDetails));
    }

    @Test
    void extractClaim_Success() {
        String token = jwtService.generateToken(userDetails);

        var issuedAt = jwtService.extractClaim(token, claims -> claims.getIssuedAt());

        assertNotNull(issuedAt);
    }
}
