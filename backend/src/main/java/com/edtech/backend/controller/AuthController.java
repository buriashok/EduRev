package com.edtech.backend.controller;

import com.edtech.backend.dto.*;
import com.edtech.backend.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest, HttpServletRequest request, HttpServletResponse response) {
        String ipAddress = request.getRemoteAddr();
        String deviceInfo = request.getHeader("User-Agent");
        JwtAuthenticationResponse authResponse = authService.login(loginRequest, ipAddress, deviceInfo);
        applyAuthCookies(response, authResponse, Boolean.TRUE.equals(loginRequest.getRememberMe()));
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        authService.register(registerRequest);
        return ResponseEntity.ok(Map.of("message", "Registration successful. Please verify your email before signing in."));
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@Valid @RequestBody GoogleLoginRequest googleRequest, HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        String deviceInfo = request.getHeader("User-Agent");
        return ResponseEntity.ok(authService.googleLogin(googleRequest, ipAddress, deviceInfo));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody(required = false) TokenRefreshRequest refreshRequest, HttpServletRequest request, HttpServletResponse response) {
        String ipAddress = request.getRemoteAddr();
        String deviceInfo = request.getHeader("User-Agent");
        String refreshToken = extractRefreshToken(refreshRequest, request);
        JwtAuthenticationResponse authResponse = authService.refresh(refreshToken, ipAddress, deviceInfo);
        applyAuthCookies(response, authResponse, true);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/login/verify-otp")
    public ResponseEntity<?> verifyLoginOtp(@Valid @RequestBody VerifyOtpLoginRequest otpRequest, HttpServletRequest request, HttpServletResponse response) {
        String ipAddress = request.getRemoteAddr();
        String deviceInfo = request.getHeader("User-Agent");
        JwtAuthenticationResponse authResponse = authService.verifyLoginOtp(otpRequest, ipAddress, deviceInfo);
        applyAuthCookies(response, authResponse, Boolean.TRUE.equals(otpRequest.getRememberMe()));
        return ResponseEntity.ok(authResponse);
    }

    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String email, @RequestParam String token) {
        EmailVerificationRequest request = new EmailVerificationRequest();
        request.setEmail(email);
        request.setToken(token);
        authService.verifyEmail(request);
        return ResponseEntity.ok(Map.of("message", "Email verified successfully."));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest forgotPasswordRequest) {
        authService.sendPasswordResetLink(forgotPasswordRequest.getEmail());
        return ResponseEntity.ok(Map.of("message", "If the email exists, a reset link has been generated."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest resetPasswordRequest) {
        authService.resetPassword(resetPasswordRequest);
        return ResponseEntity.ok(Map.of("message", "Password reset successfully."));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody(required = false) Map<String, String> payload, HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = payload == null ? null : payload.get("refreshToken");
        if (refreshToken == null || refreshToken.isBlank()) {
            refreshToken = extractCookie(request, "edurev_refresh");
        }
        authService.logout(refreshToken);
        clearCookie(response, "edurev_access");
        clearCookie(response, "edurev_refresh");
        return ResponseEntity.ok("Logged out successfully");
    }

    private String extractRefreshToken(TokenRefreshRequest refreshRequest, HttpServletRequest request) {
        if (refreshRequest != null && refreshRequest.getRefreshToken() != null && !refreshRequest.getRefreshToken().isBlank()) {
            return refreshRequest.getRefreshToken();
        }
        return extractCookie(request, "edurev_refresh");
    }

    private String extractCookie(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }

        for (Cookie cookie : cookies) {
            if (name.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    private void applyAuthCookies(HttpServletResponse response, JwtAuthenticationResponse authResponse, boolean rememberMe) {
        if (authResponse == null || authResponse.isOtpRequired() || authResponse.getAccessToken() == null) {
            return;
        }

        ResponseCookie accessCookie = ResponseCookie.from("edurev_access", authResponse.getAccessToken())
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ofDays(1))
                .build();

        ResponseCookie refreshCookie = ResponseCookie.from("edurev_refresh", authResponse.getRefreshToken())
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(rememberMe ? Duration.ofDays(30) : Duration.ofDays(7))
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
    }

    private void clearCookie(HttpServletResponse response, String name) {
        ResponseCookie cookie = ResponseCookie.from(name, "")
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
