package com.jobportal.auth.dto;

import lombok.Data;

@Data
public class TokenResponse {
    private String token;
    private String email;
    private String role;

    public TokenResponse(String token, String email, String role) {
        this.token = token;
        this.email = email;
        this.role = role;
    }
}
