package com.edtech.backend.service;

import com.edtech.backend.dto.*;
import com.edtech.backend.model.*;
import com.edtech.backend.repository.*;
import com.edtech.backend.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private OTPRecordRepository otpRecordRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private TOTPService totpService;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private OTPService otpService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private LoginAttemptService loginAttemptService;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public void register(RegisterRequest registerRequest) {
        String email = registerRequest.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email Address already in use!");
        }

        if (registerRequest.getRole() == Role.ADMIN) {
            throw new RuntimeException("Admin accounts cannot be self-registered.");
        }

        User user = new User();
        user.setFirstName(registerRequest.getFirstName().trim());
        user.setLastName(registerRequest.getLastName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setRole(registerRequest.getRole());
        user.setEmailVerified(false);
        user.setPasswordSet(true);
        userRepository.save(user);

        otpService.generateOTP(email, OTPRecord.OTPPurpose.REGISTRATION);
        logAction(user.getId(), "SIGNUP", "Awaiting OTP verification", "system");
    }

    @Transactional
    public JwtAuthenticationResponse login(LoginRequest loginRequest, String ipAddress, String deviceInfo) {
        String email = loginRequest.getEmail().trim().toLowerCase();
        if (loginAttemptService.isBlocked(email)) {
            throw new RuntimeException("Too many login attempts. Please try again in 15 minutes.");
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            email,
                            loginRequest.getPassword()
                    )
            );
        } catch (BadCredentialsException ex) {
            loginAttemptService.recordFailure(email);
            throw new RuntimeException("Invalid email or password");
        }

        loginAttemptService.clearFailures(email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!Boolean.TRUE.equals(user.isActive())) {
            throw new RuntimeException("This account is currently deactivated.");
        }

        if (!Boolean.TRUE.equals(user.isEmailVerified())) {
            throw new RuntimeException("Please verify your email address before signing in.");
        }

        if (requiresOtp(user)) {
            if ("APP".equalsIgnoreCase(user.getTwoFactorMethod())) {
                logAction(user.getId(), "LOGIN_OTP_REQUIRED", "Pending authenticator app verification", ipAddress);
                return new JwtAuthenticationResponse(user.getRole().name(), true, "Please enter the code from your authenticator app.");
            } else {
                otpService.generateOTP(user.getEmail(), OTPRecord.OTPPurpose.LOGIN);
                logAction(user.getId(), "LOGIN_OTP_SENT", "Pending privileged login verification", ipAddress);
                return new JwtAuthenticationResponse(user.getRole().name(), true, "A verification code has been sent to your email.");
            }
        }

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        boolean suspiciousLogin = isSuspiciousLogin(user, ipAddress, deviceInfo);
        String accessToken = tokenProvider.generateTokenFromUserId(user.getId());
        String refreshToken = createSession(user, ipAddress, deviceInfo, Boolean.TRUE.equals(loginRequest.getRememberMe()));

        logAction(user.getId(), "LOGIN", "SUCCESS", ipAddress);

        notificationService.createNotification(
                user,
                suspiciousLogin ? "Suspicious Login Alert" : "New Login Alert",
                "A " + (suspiciousLogin ? "new IP or device" : "new login") + " was detected for your account from IP: "
                        + ipAddress + " (" + deviceInfo + ").",
                suspiciousLogin ? NotificationType.WARNING : NotificationType.SECURITY,
                "/settings/sessions"
        );

        return new JwtAuthenticationResponse(accessToken, refreshToken, user.getRole().name());
    }

    @Transactional
    public JwtAuthenticationResponse googleLogin(GoogleLoginRequest request, String ipAddress, String deviceInfo) {
        Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
        User user;

        if (existingUser.isPresent()) {
            user = existingUser.get();
            if (user.getGoogleId() == null) {
                user.setGoogleId(request.getIdToken()); // In real app, verify token and get ID
                user.setEmailVerified(true);
                userRepository.save(user);
                logAction(user.getId(), "GOOGLE_LINK", "SUCCESS", ipAddress);
            }
        } else {
            user = new User();
            user.setEmail(request.getEmail());
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setProfileImage(request.getProfileImage());
            user.setGoogleId(request.getIdToken());
            user.setRole(Role.STUDENT); // Default role
            user.setEmailVerified(true);
            user.setPasswordSet(false);
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString())); // Temporary random password
            userRepository.save(user);
            logAction(user.getId(), "GOOGLE_SIGNUP", "SUCCESS", ipAddress);
        }

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        boolean suspiciousLogin = isSuspiciousLogin(user, ipAddress, deviceInfo);
        String accessToken = tokenProvider.generateTokenFromUserId(user.getId());
        String refreshToken = createSession(user, ipAddress, deviceInfo, true);
        
        logAction(user.getId(), "GOOGLE_LOGIN", "SUCCESS", ipAddress);

        notificationService.createNotification(
                user,
                suspiciousLogin ? "Suspicious Social Login" : "Social Login Alert",
                "You just signed in using Google from IP: " + ipAddress + ".",
                suspiciousLogin ? NotificationType.WARNING : NotificationType.SECURITY,
                "/settings/sessions"
        );

        return new JwtAuthenticationResponse(accessToken, refreshToken, user.getRole().name());
    }

    @Transactional
    public String createSession(User user, String ipAddress, String deviceInfo, boolean rememberMe) {
        String refreshToken = UUID.randomUUID().toString();
        Session session = new Session();
        session.setUser(user);
        session.setRefreshToken(refreshToken);
        session.setIpAddress(ipAddress);
        session.setDeviceInfo(deviceInfo);
        session.setLastActive(LocalDateTime.now());
        session.setExpiresAt(LocalDateTime.now().plusDays(rememberMe ? 30 : 7));
        sessionRepository.save(session);
        return refreshToken;
    }

    public void logAction(Long userId, String action, String details, String ipAddress) {
        AuditLog log = new AuditLog();
        log.setUserId(userId);
        log.setAction(action);
        log.setDetails(details);
        log.setIpAddress(ipAddress);
        auditLogRepository.save(log);
    }

    @Transactional
    public JwtAuthenticationResponse refresh(String refreshToken, String ipAddress, String deviceInfo) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new RuntimeException("Invalid refresh token");
        }

        Session session = sessionRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        if (!session.isActive() || session.getExpiresAt().isBefore(LocalDateTime.now())) {
            session.setActive(false);
            sessionRepository.save(session);
            throw new RuntimeException("Session expired");
        }

        User user = session.getUser();
        String accessToken = tokenProvider.generateTokenFromUserId(user.getId());
        
        // Rotate refresh token
        String newRefreshToken = UUID.randomUUID().toString();
        session.setRefreshToken(newRefreshToken);
        session.setLastActive(LocalDateTime.now());
        session.setExpiresAt(LocalDateTime.now().plusDays(7));
        sessionRepository.save(session);

        return new JwtAuthenticationResponse(accessToken, newRefreshToken, user.getRole().name());
    }

    @Transactional
    public JwtAuthenticationResponse verifyLoginOtp(VerifyOtpLoginRequest request, String ipAddress, String deviceInfo) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if ("APP".equalsIgnoreCase(user.getTwoFactorMethod())) {
            if (!totpService.verifyCode(user.getTwoFactorSecret(), request.getOtp())) {
                throw new RuntimeException("Invalid authentication code");
            }
        } else {
            boolean validOtp = otpService.verifyOTP(email, request.getOtp(), OTPRecord.OTPPurpose.LOGIN);
            if (!validOtp) {
                throw new RuntimeException("Invalid or expired OTP");
            }
        }

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        boolean suspiciousLogin = isSuspiciousLogin(user, ipAddress, deviceInfo);
        String accessToken = tokenProvider.generateTokenFromUserId(user.getId());
        String refreshToken = createSession(user, ipAddress, deviceInfo, Boolean.TRUE.equals(request.getRememberMe()));

        logAction(user.getId(), "LOGIN", "SUCCESS_AFTER_OTP", ipAddress);

        notificationService.createNotification(
                user,
                suspiciousLogin ? "Privileged Login From New Device" : "Secure Login Success",
                "MFA verification successful from IP: " + ipAddress + ".",
                suspiciousLogin ? NotificationType.WARNING : NotificationType.SECURITY,
                "/settings/sessions"
        );

        return new JwtAuthenticationResponse(accessToken, refreshToken, user.getRole().name());
    }

    @Transactional
    public void verifyEmail(EmailVerificationRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isValid = otpService.verifyOTP(email, request.getToken(), OTPRecord.OTPPurpose.REGISTRATION);
        
        if (!isValid) {
            throw new RuntimeException("Invalid or expired OTP code");
        }

        user.setEmailVerified(true);
        userRepository.save(user);
        logAction(user.getId(), "EMAIL_VERIFIED", "Registration OTP verified", "system");

        notificationService.createNotification(user, "Account Verified", 
            "Welcome to EduRev! Your email has been successfully verified.", 
            NotificationType.SUCCESS, "/dashboard");
    }

    @Transactional
    public void sendPasswordResetLink(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email.trim().toLowerCase());
        if (userOptional.isEmpty()) {
            return;
        }

        User user = userOptional.get();
        String resetToken = UUID.randomUUID().toString();
        otpRecordRepository.findByEmailAndPurpose(user.getEmail(), OTPRecord.OTPPurpose.FORGOT_PASSWORD)
                .ifPresent(otpRecordRepository::delete);

        OTPRecord record = new OTPRecord();
        record.setEmail(user.getEmail());
        record.setOtpCode(resetToken);
        record.setPurpose(OTPRecord.OTPPurpose.FORGOT_PASSWORD);
        record.setExpiresAt(LocalDateTime.now().plusHours(1));
        otpRecordRepository.save(record);

        emailService.sendPasswordResetEmail(user.getEmail(), resetToken);
        logAction(user.getId(), "PASSWORD_RESET_REQUEST", "Reset link generated", "system");
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        OTPRecord record = otpRecordRepository.findByEmailAndPurpose(email, OTPRecord.OTPPurpose.FORGOT_PASSWORD)
                .orElseThrow(() -> new RuntimeException("Reset request not found"));

        if (!record.getOtpCode().equals(request.getToken()) || record.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Reset link is invalid or expired");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword().trim()));
        user.setPasswordSet(true);
        userRepository.save(user);
        otpRecordRepository.delete(record);
        sessionRepository.deleteByUser(user);
        logAction(user.getId(), "PASSWORD_RESET", "Password updated from reset link", "system");

        notificationService.createNotification(user, "Password Changed", 
            "Your password has been successfully reset. If you did not do this, please contact support immediately.", 
            NotificationType.SECURITY, "/settings");
    }

    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return;
        }
        sessionRepository.deleteByRefreshToken(refreshToken);
    }

    private boolean requiresOtp(User user) {
        return user.getRole() == Role.ADMIN
                || user.getRole() == Role.INSTRUCTOR
                || Boolean.TRUE.equals(user.isTwoFactorEnabled());
    }

    private boolean isSuspiciousLogin(User user, String ipAddress, String deviceInfo) {
        return sessionRepository.findTop5ByUserOrderByLastActiveDesc(user).stream()
                .noneMatch(session -> safeEquals(session.getIpAddress(), ipAddress)
                        && safeEquals(session.getDeviceInfo(), deviceInfo));
    }

    private boolean safeEquals(String left, String right) {
        if (left == null) {
            return right == null;
        }
        return left.equals(right);
    }
}
