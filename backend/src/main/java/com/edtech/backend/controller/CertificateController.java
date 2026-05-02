package com.edtech.backend.controller;

import com.edtech.backend.model.Certificate;
import com.edtech.backend.model.User;
import com.edtech.backend.repository.CertificateRepository;
import com.edtech.backend.repository.UserRepository;
import com.edtech.backend.security.UserPrincipal;
import com.edtech.backend.service.CertificateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/certificates")
public class CertificateController {

    @Autowired
    private CertificateRepository certificateRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CertificateService certificateService;

    @GetMapping("/my")
    public ResponseEntity<List<Certificate>> getMyCertificates(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        User user = userRepository.findById(userPrincipal.getId()).orElseThrow();
        return ResponseEntity.ok(certificateRepository.findByUser(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Certificate> getCertificate(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Certificate certificate = certificateRepository.findById(id).orElseThrow();
        
        boolean isAdmin = userPrincipal.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
        if (!certificate.getUser().getId().equals(userPrincipal.getId()) && !isAdmin) {
             return ResponseEntity.status(403).build();
        }
        
        return ResponseEntity.ok(certificate);
    }

    @GetMapping("/verify/{uniqueId}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<Map<String, Object>> verifyCertificate(@PathVariable String uniqueId) {
        return certificateService.verifyCertificate(uniqueId)
                .map(certificate -> ResponseEntity.ok(toVerificationDto(certificate)))
                .orElse(ResponseEntity.notFound().build());
    }

    private Map<String, Object> toVerificationDto(Certificate certificate) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("valid", true);
        dto.put("uniqueId", certificate.getUniqueId());
        dto.put("issuedAt", certificate.getIssuedAt());
        dto.put("studentName", certificate.getUser().getFirstName() + " " + certificate.getUser().getLastName());
        dto.put("courseTitle", certificate.getCourse().getTitle());
        dto.put("instructorName", certificate.getCourse().getInstructor().getFirstName() + " " + certificate.getCourse().getInstructor().getLastName());
        dto.put("qrCodePath", certificate.getQrCodePath());
        return dto;
    }
}
