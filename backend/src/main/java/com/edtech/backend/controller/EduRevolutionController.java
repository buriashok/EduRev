package com.edtech.backend.controller;

import com.edtech.backend.model.Certificate;
import com.edtech.backend.model.EduRequest;
import com.edtech.backend.model.User;
import com.edtech.backend.repository.CertificateRepository;
import com.edtech.backend.repository.EduRequestRepository;
import com.edtech.backend.repository.UserRepository;
import com.edtech.backend.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/edu-revolution")
public class EduRevolutionController {

    @Autowired
    private EduRequestRepository eduRequestRepository;

    @Autowired
    private CertificateRepository certificateRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/requests")
    public List<EduRequest> getMyRequests(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return eduRequestRepository.findByUserId(userPrincipal.getId());
    }

    @PostMapping("/requests")
    public ResponseEntity<EduRequest> createRequest(@RequestBody EduRequest request, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User user = userRepository.findById(userPrincipal.getId()).get();
        request.setUser(user);
        request.setStatus("PENDING");
        return ResponseEntity.ok(eduRequestRepository.save(request));
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
