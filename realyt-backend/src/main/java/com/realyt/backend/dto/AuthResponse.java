package com.realyt.backend.dto;

public class AuthResponse {
    private String token;
    private String email;
    private String role;
    private String message;

    public AuthResponse(String token, String email, String role) {
        this(token, email, role, null);
    }

    public AuthResponse(String token, String email, String role, String message) {
        this.token = token;
        this.email = email;
        this.role = role;
        this.message = message;
    }

    public String getToken() {
        return token;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
