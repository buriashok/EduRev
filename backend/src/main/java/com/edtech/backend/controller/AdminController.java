package com.edtech.backend.controller;

import com.edtech.backend.model.User;
import com.edtech.backend.repository.UserRepository;
import com.edtech.backend.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    // 1. User Management Extension
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PatchMapping("/users/{id}/toggle-active")
    public ResponseEntity<User> toggleUserActive(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            user.setActive(!user.isActive());
            return ResponseEntity.ok(userRepository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/settings")
    public Map<String, String> getSettings() {
        return PublicSettingsController.platformSettings;
    }

    @PostMapping("/settings")
    public Map<String, String> updateSettings(@RequestBody Map<String, String> newSettings) {
        PublicSettingsController.platformSettings.putAll(newSettings);
        return PublicSettingsController.platformSettings;
    }

    // 3. System Stats
    @GetMapping("/health")
    public Map<String, Object> getSystemHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("memory", Runtime.getRuntime().totalMemory());
        health.put("availableProcessors", Runtime.getRuntime().availableProcessors());
        return health;
    }
}
