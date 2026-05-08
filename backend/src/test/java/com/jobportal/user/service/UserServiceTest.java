package com.jobportal.user.service;

import com.jobportal.user.entity.Role;
import com.jobportal.user.entity.User;
import com.jobportal.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id("user-1")
                .email("test@example.com")
                .password("encoded-password")
                .role(Role.CANDIDATE)
                .build();
    }

    @Test
    void findById_Success() {
        when(userRepository.findById("user-1")).thenReturn(Optional.of(testUser));

        Optional<User> result = userService.findById("user-1");

        assertTrue(result.isPresent());
        assertEquals("test@example.com", result.get().getEmail());
    }

    @Test
    void findById_NotFound() {
        when(userRepository.findById("unknown")).thenReturn(Optional.empty());

        Optional<User> result = userService.findById("unknown");

        assertTrue(result.isEmpty());
    }

    @Test
    void findByEmail_Success() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        Optional<User> result = userService.findByEmail("test@example.com");

        assertTrue(result.isPresent());
        assertEquals("user-1", result.get().getId());
    }

    @Test
    void existsByEmail_ReturnsTrue() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        assertTrue(userService.existsByEmail("test@example.com"));
    }

    @Test
    void existsByEmail_ReturnsFalse() {
        when(userRepository.existsByEmail("unknown@example.com")).thenReturn(false);

        assertFalse(userService.existsByEmail("unknown@example.com"));
    }

    @Test
    void save_Success() {
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        User result = userService.save(testUser);

        assertNotNull(result);
        assertEquals("test@example.com", result.getEmail());
        verify(userRepository).save(testUser);
    }

    @Test
    void count_ReturnsValue() {
        when(userRepository.count()).thenReturn(100L);

        long count = userService.count();

        assertEquals(100L, count);
    }
}
