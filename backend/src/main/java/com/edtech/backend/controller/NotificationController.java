package com.edtech.backend.controller;

import com.edtech.backend.model.Notification;
import com.edtech.backend.model.User;
import com.edtech.backend.repository.UserRepository;
import com.edtech.backend.security.UserPrincipal;
import com.edtech.backend.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Page<Notification>> getMyNotifications(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        User user = userRepository.findById(userPrincipal.getId()).orElseThrow();
        return ResponseEntity.ok(notificationService.getUserNotifications(user, pageable));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        User user = userRepository.findById(userPrincipal.getId()).orElseThrow();
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(user)));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        User user = userRepository.findById(userPrincipal.getId()).orElseThrow();
        notificationService.markAsRead(id, user);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        User user = userRepository.findById(userPrincipal.getId()).orElseThrow();
        notificationService.markAllAsRead(user);
        return ResponseEntity.ok().build();
    }
}
