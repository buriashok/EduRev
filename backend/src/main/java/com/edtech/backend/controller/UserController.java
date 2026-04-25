package com.edtech.backend.controller;

import com.edtech.backend.dto.AdminUserUpdateRequest;
import com.edtech.backend.dto.BulkUserImportRequest;
import com.edtech.backend.model.AuditLog;
import com.edtech.backend.model.User;
import com.edtech.backend.model.Course;
import com.edtech.backend.model.Session;
import jakarta.servlet.http.HttpServletResponse;
import com.edtech.backend.security.UserPrincipal;
import com.edtech.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return userService.getUserById(userPrincipal.getId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/me/courses")
    public ResponseEntity<List<Course>> getMyCourses(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return userService.getUserById(userPrincipal.getId())
                .map(user -> ResponseEntity.ok(user.getEnrolledCourses()))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal UserPrincipal userPrincipal, @RequestBody User userDetails) {
        User updatedUser = userService.updateUser(userPrincipal.getId(), userDetails);
        return ResponseEntity.ok(updatedUser);
    }

    @GetMapping("/me/sessions")
    public ResponseEntity<List<Session>> getMySessions(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(userService.getActiveSessions(userPrincipal.getId()));
    }

    @DeleteMapping("/me/sessions/{sessionId}")
    public ResponseEntity<?> revokeSession(@AuthenticationPrincipal UserPrincipal userPrincipal, @PathVariable Long sessionId) {
        userService.revokeSession(userPrincipal.getId(), sessionId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/me/password")
    public ResponseEntity<User> updatePassword(@AuthenticationPrincipal UserPrincipal userPrincipal, @RequestBody Map<String, String> payload) {
        String currentPassword = payload.get("currentPassword");
        String newPassword = payload.get("newPassword");
        if (newPassword == null || newPassword.trim().length() < 8) {
            throw new RuntimeException("New password must be at least 8 characters long");
        }
        return ResponseEntity.ok(userService.updatePassword(userPrincipal.getId(), currentPassword, newPassword.trim()));
    }

    @GetMapping("/me/export")
    public ResponseEntity<Map<String, Object>> exportMyData(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(userService.exportUserData(userPrincipal.getId()));
    }

    @GetMapping("/me/login-history")
    public ResponseEntity<List<AuditLog>> getMyLoginHistory(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(userService.getLoginHistory(userPrincipal.getId()));
    }

    @PostMapping("/me/deactivate")
    public ResponseEntity<?> deactivateMyAccount(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        userService.deactivateOwnAccount(userPrincipal.getId());
        return ResponseEntity.ok(Map.of("message", "Account deactivated"));
    }

    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsersForAdmin() {
        return ResponseEntity.ok(userService.getAllUsersForAdmin());
    }

    @PatchMapping("/admin/users/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> adminUpdateUser(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long userId,
            @RequestBody AdminUserUpdateRequest request
    ) {
        return ResponseEntity.ok(userService.adminUpdateUser(userPrincipal.getId(), userId, request));
    }

    @PostMapping("/admin/users/{userId}/force-logout")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> forceLogoutUser(@AuthenticationPrincipal UserPrincipal userPrincipal, @PathVariable Long userId) {
        userService.forceLogoutUser(userPrincipal.getId(), userId);
        return ResponseEntity.ok(Map.of("message", "All sessions revoked"));
    }

    @PostMapping("/admin/users/{userId}/impersonate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> impersonateUser(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long userId,
            HttpServletResponse response
    ) {
        Map<String, String> tokens = userService.impersonateUser(userPrincipal.getId(), userId);
        applyCookie(response, "edurev_access", tokens.get("accessToken"), Duration.ofHours(8));
        applyCookie(response, "edurev_refresh", tokens.get("refreshToken"), Duration.ofHours(8));
        return ResponseEntity.ok(tokens);
    }

    @GetMapping("/admin/audit-logs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLog>> getRecentAuditLogs() {
        return ResponseEntity.ok(userService.getRecentAuditLogs());
    }

    @PostMapping("/admin/import")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> bulkImportUsers(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody BulkUserImportRequest request
    ) {
        return ResponseEntity.ok(userService.importUsersFromCsv(userPrincipal.getId(), request.getCsvContent()));
    }

    @DeleteMapping("/admin/users/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@AuthenticationPrincipal UserPrincipal userPrincipal, @PathVariable Long userId) {
        userService.deleteUser(userPrincipal.getId(), userId);
        return ResponseEntity.ok(Map.of("message", "User permanently deleted"));
    }

    private void applyCookie(HttpServletResponse response, String name, String value, Duration duration) {
        ResponseCookie cookie = ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(duration)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
