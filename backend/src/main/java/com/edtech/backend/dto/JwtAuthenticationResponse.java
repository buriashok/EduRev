package com.edtech.backend.dto;

public class JwtAuthenticationResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private String role;
    private boolean otpRequired;
    private String message;

    public JwtAuthenticationResponse(String accessToken, String refreshToken, String role) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.role = role;
    }

    public JwtAuthenticationResponse(String role, boolean otpRequired, String message) {
        this.role = role;
        this.otpRequired = otpRequired;
        this.message = message;
    }

    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public boolean isOtpRequired() { return otpRequired; }
    public void setOtpRequired(boolean otpRequired) { this.otpRequired = otpRequired; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
