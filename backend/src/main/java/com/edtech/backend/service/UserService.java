package com.edtech.backend.service;

import com.edtech.backend.dto.AdminUserUpdateRequest;
import com.edtech.backend.model.AuditLog;
import com.edtech.backend.model.Role;
import com.edtech.backend.model.User;
import com.edtech.backend.model.Session;
import com.edtech.backend.repository.AuditLogRepository;
import com.edtech.backend.repository.UserRepository;
import com.edtech.backend.repository.SessionRepository;
import com.edtech.backend.repository.OTPRecordRepository;
import com.edtech.backend.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private OTPRecordRepository otpRecordRepository;

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public User updateUser(Long id, User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        user.setFirstName(sanitize(userDetails.getFirstName(), user.getFirstName(), 60));
        user.setLastName(sanitize(userDetails.getLastName(), user.getLastName(), 60));
        user.setPhoneNumber(sanitize(userDetails.getPhoneNumber(), null, 40));
        user.setAddress(sanitize(userDetails.getAddress(), null, 255));
        user.setBio(sanitize(userDetails.getBio(), null, 200));

        if (userDetails.getProfileImage() != null) {
            if (userDetails.getProfileImage().length() > 1_500_000) {
                throw new RuntimeException("Profile image exceeds the 1MB limit");
            }
            user.setProfileImage(userDetails.getProfileImage());
        }

        if (userDetails.isTwoFactorEnabled() != null) {
            user.setTwoFactorEnabled(userDetails.isTwoFactorEnabled());
        }

        if (userDetails.getTwoFactorMethod() != null && !userDetails.getTwoFactorMethod().isBlank()) {
            user.setTwoFactorMethod(userDetails.getTwoFactorMethod().trim().toUpperCase());
        }

        return userRepository.save(user);
    }

    public List<Session> getActiveSessions(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return sessionRepository.findByUserAndIsActiveTrue(user);
    }

    public void revokeSession(Long userId, Long sessionId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        Session session = sessionRepository.findByIdAndUser(sessionId, user)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        session.setActive(false);
        sessionRepository.save(session);
    }

    public User updatePassword(Long id, String currentPassword, String newPassword) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        if (Boolean.TRUE.equals(user.isPasswordSet()) && (currentPassword == null || !passwordEncoder.matches(currentPassword, user.getPassword()))) {
            throw new RuntimeException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordSet(true);
        return userRepository.save(user);
    }

    public Map<String, Object> exportUserData(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        Map<String, Object> export = new LinkedHashMap<>();
        export.put("id", user.getId());
        export.put("firstName", user.getFirstName());
        export.put("lastName", user.getLastName());
        export.put("email", user.getEmail());
        export.put("role", user.getRole());
        export.put("phoneNumber", user.getPhoneNumber());
        export.put("address", user.getAddress());
        export.put("bio", user.getBio());
        export.put("profileImage", user.getProfileImage());
        export.put("emailVerified", user.isEmailVerified());
        export.put("passwordSet", user.isPasswordSet());
        export.put("twoFactorEnabled", user.isTwoFactorEnabled());
        export.put("twoFactorMethod", user.getTwoFactorMethod());
        export.put("lastLoginAt", user.getLastLoginAt() == null ? null : user.getLastLoginAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        export.put("createdAt", user.getCreatedAt() == null ? null : user.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        export.put("activeSessions", getActiveSessions(id));
        return export;
    }

    public List<User> getAllUsersForAdmin() {
        return userRepository.findAllByOrderByCreatedAtDesc();
    }

    public User adminUpdateUser(Long adminUserId, Long targetUserId, AdminUserUpdateRequest request) {
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + targetUserId));

        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }

        if (request.getActive() != null) {
            user.setActive(request.getActive());
            if (!request.getActive()) {
                sessionRepository.deleteByUser(user);
            }
        }

        User savedUser = userRepository.save(user);
        auditLogService.log(adminUserId, "ADMIN_UPDATE_USER", String.valueOf(targetUserId),
                "Role=" + savedUser.getRole() + ", Active=" + savedUser.isActive());
        return savedUser;
    }

    public void forceLogoutUser(Long adminUserId, Long targetUserId) {
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + targetUserId));
        sessionRepository.deleteByUser(user);
        auditLogService.log(adminUserId, "FORCE_LOGOUT", String.valueOf(targetUserId), "All active sessions revoked");
    }

    public Map<String, String> impersonateUser(Long adminUserId, Long targetUserId) {
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + targetUserId));

        if (!Boolean.TRUE.equals(user.isActive())) {
            throw new RuntimeException("Cannot impersonate a frozen user");
        }

        String accessToken = jwtTokenProvider.generateTokenFromUserId(user.getId());
        String refreshToken = UUID.randomUUID().toString();

        Session session = new Session();
        session.setUser(user);
        session.setRefreshToken(refreshToken);
        session.setDeviceInfo("Admin impersonation session");
        session.setIpAddress("system");
        session.setLastActive(java.time.LocalDateTime.now());
        session.setExpiresAt(java.time.LocalDateTime.now().plusHours(8));
        sessionRepository.save(session);

        auditLogService.log(adminUserId, "IMPERSONATE_USER", String.valueOf(targetUserId), "Admin impersonation issued");

        Map<String, String> response = new LinkedHashMap<>();
        response.put("accessToken", accessToken);
        response.put("refreshToken", refreshToken);
        response.put("role", user.getRole().name());
        return response;
    }

    public List<AuditLog> getRecentAuditLogs() {
        return auditLogRepository.findTop50ByOrderByTimestampDesc();
    }

    public List<AuditLog> getLoginHistory(Long userId) {
        return auditLogRepository.findByUserIdOrderByTimestampDesc(userId).stream()
                .filter(log -> log.getAction() != null && log.getAction().contains("LOGIN"))
                .toList();
    }

    public Map<String, Object> importUsersFromCsv(Long adminUserId, String csvContent) {
        String[] rows = csvContent.replace("\uFEFF", "").split("\\r?\\n");
        List<String> createdEmails = new ArrayList<>();
        List<String> skippedRows = new ArrayList<>();

        for (int i = 0; i < rows.length; i++) {
            String row = rows[i].trim();
            if (row.isBlank()) {
                continue;
            }

            if (i == 0 && row.toLowerCase().contains("email")) {
                continue;
            }

            String[] parts = row.split(",");
            if (parts.length < 4) {
                skippedRows.add("Row " + (i + 1) + ": expected firstName,lastName,email,role");
                continue;
            }

            String firstName = parts[0].trim();
            String lastName = parts[1].trim();
            String email = parts[2].trim().toLowerCase();
            String roleText = parts[3].trim().toUpperCase();

            if (userRepository.existsByEmail(email)) {
                skippedRows.add("Row " + (i + 1) + ": email already exists");
                continue;
            }

            Role role;
            try {
                role = Role.valueOf(roleText);
            } catch (IllegalArgumentException ex) {
                skippedRows.add("Row " + (i + 1) + ": invalid role");
                continue;
            }

            User user = new User();
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setEmail(email);
            user.setRole(role);
            user.setPassword(passwordEncoder.encode(generateTemporaryPassword(email)));
            user.setEmailVerified(false);
            userRepository.save(user);
            createdEmails.add(email);
        }

        auditLogService.log(adminUserId, "BULK_IMPORT_USERS", null, "Created=" + createdEmails.size() + ", Skipped=" + skippedRows.size());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("createdCount", createdEmails.size());
        result.put("createdEmails", createdEmails);
        result.put("skippedRows", skippedRows);
        return result;
    }

    public void deactivateOwnAccount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        user.setActive(false);
        userRepository.save(user);
        sessionRepository.deleteByUser(user);
        auditLogService.log(userId, "SELF_DEACTIVATE", String.valueOf(userId), "User deactivated own account");
    }

    @Transactional
    public void deleteUser(Long adminUserId, Long targetUserId) {
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + targetUserId));

        // Delete related data first to avoid FK constraints
        sessionRepository.deleteByUser(user);
        otpRecordRepository.deleteByEmail(user.getEmail());
        auditLogRepository.deleteByUserId(targetUserId);

        userRepository.delete(user);

        auditLogService.log(adminUserId, "ADMIN_DELETE_USER", String.valueOf(targetUserId), "User permanently deleted");
    }

    private String sanitize(String value, String fallback, int maxLength) {
        if (value == null) {
            return fallback;
        }

        String sanitized = value.trim();
        if (sanitized.length() > maxLength) {
            throw new RuntimeException("Input exceeds maximum allowed length");
        }

        return sanitized;
    }

    private String generateTemporaryPassword(String email) {
        String seed = email + UUID.randomUUID();
        return "EduRev@" + Integer.toHexString(seed.getBytes(StandardCharsets.UTF_8).length) + "1";
    }
}
