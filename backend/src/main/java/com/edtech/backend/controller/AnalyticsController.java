package com.edtech.backend.controller;

import com.edtech.backend.repository.*;
import com.edtech.backend.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.edtech.backend.service.AnalyticsService analyticsService;

    @GetMapping("/admin")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAdminStats() {
        return ResponseEntity.ok(analyticsService.getAdminAnalytics());
    }

    @GetMapping("/instructor")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getInstructorStats(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(analyticsService.getInstructorAnalytics(userPrincipal.getId()));
    }

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CertificateRepository certificateRepository;

    @Autowired
    private QuizResultRepository quizResultRepository;

    @GetMapping("/platform")
    public ResponseEntity<?> getPlatformStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalCourses", courseRepository.count());
        stats.put("totalEnrollments", userRepository.countTotalEnrollments());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/user")
    public ResponseEntity<?> getUserStats(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        Long userId = userPrincipal.getId();
        Map<String, Object> stats = new HashMap<>();
        
        long enrollments = userRepository.countEnrollmentsByUserId(userId);
        long certificates = certificateRepository.findByUserId(userId).size();
        
        // Calculate average quiz score
        Double avgScore = quizResultRepository.findAverageScoreByUserId(userId);
        
        stats.put("coursesEnrolled", enrollments);
        stats.put("certificatesEarned", certificates);
        stats.put("averageScore", avgScore != null ? Math.round(avgScore * 100.0) : 0.0);
        
        return ResponseEntity.ok(stats);
    }
}
