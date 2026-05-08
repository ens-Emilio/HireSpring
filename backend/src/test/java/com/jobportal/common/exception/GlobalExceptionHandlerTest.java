package com.jobportal.common.exception;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
    }

    @Test
    void handleResourceNotFound_Returns404() {
        ResponseEntity<Map<String, String>> response = handler.handleResourceNotFound(
                new ResourceNotFoundException("User not found"));

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("User not found", response.getBody().get("error"));
    }

    @Test
    void handleBusinessException_Returns400() {
        ResponseEntity<Map<String, String>> response = handler.handleBusinessException(
                new BusinessException("Invalid operation"));

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Invalid operation", response.getBody().get("error"));
    }

    @Test
    void handleDuplicateResource_Returns409() {
        ResponseEntity<Map<String, String>> response = handler.handleDuplicateResource(
                new DuplicateResourceException("Email already exists"));

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals("Email already exists", response.getBody().get("error"));
    }

    @Test
    void handleForbidden_Returns403() {
        ResponseEntity<Map<String, String>> response = handler.handleForbidden(
                new ForbiddenException("Access denied"));

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertEquals("Access denied", response.getBody().get("error"));
    }

    @Test
    void handleValidation_Returns400WithDetails() {
        // Create a mock binding result
        Object target = new Object();
        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(target, "target");
        bindingResult.addError(new FieldError("target", "email", "Invalid email format"));
        bindingResult.addError(new FieldError("target", "password", "Too short"));

        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(
                (MethodParameter) null, bindingResult);

        ResponseEntity<Map<String, Object>> response = handler.handleValidation(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Validation failed", response.getBody().get("error"));
        @SuppressWarnings("unchecked")
        Map<String, String> details = (Map<String, String>) response.getBody().get("details");
        assertNotNull(details);
        assertEquals("Invalid email format", details.get("email"));
        assertEquals("Too short", details.get("password"));
    }

    @Test
    void handleMalformedJson_Returns400() {
        ResponseEntity<Map<String, String>> response = handler.handleMalformedJson(
                new HttpMessageNotReadableException("Invalid JSON"));

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Invalid request body", response.getBody().get("error"));
    }

    @Test
    void handleIllegalArgument_Returns400() {
        ResponseEntity<Map<String, String>> response = handler.handleIllegalArgument(
                new IllegalArgumentException("Bad value"));

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Bad value", response.getBody().get("error"));
    }

    @Test
    void handleBadCredentials_Returns401() {
        ResponseEntity<Map<String, String>> response = handler.handleBadCredentials(
                new BadCredentialsException("Bad credentials"));

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("Invalid email or password", response.getBody().get("error"));
    }

    @Test
    void handleAccessDenied_Returns403() {
        ResponseEntity<Map<String, String>> response = handler.handleAccessDenied(
                new AccessDeniedException("Access denied"));

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertEquals("Access denied", response.getBody().get("error"));
    }

    @Test
    void handleGenericException_Returns500() {
        ResponseEntity<Map<String, String>> response = handler.handleGenericException(
                new RuntimeException("Unexpected"));

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("An unexpected error occurred", response.getBody().get("error"));
    }
}
