package com.edtech.backend.controller;

import com.edtech.backend.model.Certificate;
import com.edtech.backend.model.User;
import com.edtech.backend.repository.CertificateRepository;
import com.edtech.backend.repository.UserRepository;
import com.edtech.backend.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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

    @GetMapping("/my")
    public ResponseEntity<List<Certificate>> getMyCertificates(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        User user = userRepository.findById(userPrincipal.getId()).orElseThrow();
        return ResponseEntity.ok(certificateRepository.findByUser(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Certificate> getCertificate(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Certificate certificate = certificateRepository.findById(id).orElseThrow();
        
        // Ensure user owns this certificate or is admin
        if (!certificate.getUser().getId().equals(userPrincipal.getId())) {
             return ResponseEntity.status(403).build();
        }
        
        return ResponseEntity.ok(certificate);
    }
}
