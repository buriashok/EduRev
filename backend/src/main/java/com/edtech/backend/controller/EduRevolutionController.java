package com.edtech.backend.controller;

import com.edtech.backend.model.Certificate;
import com.edtech.backend.model.EduRequest;
import com.edtech.backend.model.NotificationType;
import com.edtech.backend.model.User;
import com.edtech.backend.repository.CertificateRepository;
import com.edtech.backend.repository.EduRequestRepository;
import com.edtech.backend.repository.UserRepository;
import com.edtech.backend.security.UserPrincipal;
import com.edtech.backend.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/edu-revolution")
public class EduRevolutionController {

    @Autowired
    private EduRequestRepository eduRequestRepository;

    @Autowired
    private CertificateRepository certificateRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/requests")
    public List<EduRequest> getMyRequests(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return eduRequestRepository.findByUserId(userPrincipal.getId());
    }

    @PostMapping("/requests")
    public ResponseEntity<EduRequest> createRequest(@RequestBody EduRequest request, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User user = userRepository.findById(userPrincipal.getId()).orElseThrow();
        request.setUser(user);
        request.setStatus("PENDING");
        EduRequest saved = eduRequestRepository.save(request);
        notificationService.createNotification(
                user,
                "EDU-Revolution Request Submitted",
                "Your " + saved.getType() + " request is pending review.",
                NotificationType.INFO,
                "/edu-revolution"
        );
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/admin/requests")
    @PreAuthorize("hasRole('ADMIN')")
    public List<EduRequest> getAllRequests() {
        return eduRequestRepository.findAll();
    }

    @PatchMapping("/admin/requests/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EduRequest> updateRequestStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        return eduRequestRepository.findById(id).map(request -> {
            String status = payload.getOrDefault("status", "PENDING").trim().toUpperCase();
            if (!List.of("PENDING", "APPROVED", "REJECTED").contains(status)) {
                throw new RuntimeException("Invalid request status");
            }
            request.setStatus(status);
            EduRequest saved = eduRequestRepository.save(request);
            notificationService.createNotification(
                    saved.getUser(),
                    "EDU-Revolution Request " + status.toLowerCase(),
                    "Your " + saved.getType() + " request was marked " + status.toLowerCase() + ".",
                    "APPROVED".equals(status) ? NotificationType.SUCCESS : NotificationType.WARNING,
                    "/edu-revolution"
            );
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/certificates")
    public List<Certificate> getMyCertificates(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return certificateRepository.findByUserId(userPrincipal.getId());
    }

    @GetMapping("/certificates/verify/{uniqueId}")
    public ResponseEntity<Certificate> verifyCertificate(@PathVariable String uniqueId) {
        return certificateRepository.findByUniqueId(uniqueId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
