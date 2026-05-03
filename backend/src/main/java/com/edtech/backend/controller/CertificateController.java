package com.edtech.backend.controller;

import com.edtech.backend.dto.CertificateResponse;
import com.edtech.backend.model.Certificate;
import com.edtech.backend.model.Course;
import com.edtech.backend.model.User;
import com.edtech.backend.repository.CertificateRepository;
import com.edtech.backend.repository.CourseRepository;
import com.edtech.backend.repository.UserRepository;
import com.edtech.backend.security.RoleAccess;
import com.edtech.backend.security.UserPrincipal;
import com.edtech.backend.service.CertificateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/certificates")
public class CertificateController {

    @Autowired
    private CertificateRepository certificateRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CertificateService certificateService;

    @GetMapping("/my")
    public ResponseEntity<List<CertificateResponse>> getMyCertificates(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        User user = userRepository.findById(userPrincipal.getId()).orElseThrow();
        return ResponseEntity.ok(certificateRepository.findByUser(user).stream()
                .map(certificateService::toResponse)
                .toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CertificateResponse> getCertificate(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Certificate certificate = certificateRepository.findById(id).orElseThrow();
        
        boolean isAdmin = RoleAccess.isAdmin(userPrincipal);
        if (!certificate.getUser().getId().equals(userPrincipal.getId()) && !isAdmin) {
             return ResponseEntity.status(403).build();
        }
        
        return ResponseEntity.ok(certificateService.toResponse(certificate));
    }

    @PostMapping("/course/{courseId}/issue")
    public ResponseEntity<CertificateResponse> issueCertificateForCourse(
            @PathVariable Long courseId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) throws Exception {
        User user = userRepository.findById(userPrincipal.getId()).orElseThrow();
        Course course = courseRepository.findById(courseId).orElseThrow();
        Certificate certificate = certificateService.issueCertificateForCompletedCourse(user, course);
        return ResponseEntity.ok(certificateService.toResponse(certificate));
    }

    @GetMapping("/verify/{uniqueId}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<CertificateResponse> verifyCertificate(@PathVariable String uniqueId) {
        return certificateService.verifyCertificate(uniqueId)
                .map(certificate -> ResponseEntity.ok(certificateService.toResponse(certificate)))
                .orElse(ResponseEntity.notFound().build());
    }
}
