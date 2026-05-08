package com.jobportal.auth.dto;

import lombok.Data;

@Data
public class UserResponse {
    private String id;
    private String email;
    private String role;
    private boolean emailVerified;
}
