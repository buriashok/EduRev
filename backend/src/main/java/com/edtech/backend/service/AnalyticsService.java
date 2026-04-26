package com.edtech.backend.service;

import com.edtech.backend.model.Role;
import com.edtech.backend.repository.CourseRepository;
import com.edtech.backend.repository.LiveClassRepository;
import com.edtech.backend.repository.PaymentRepository;
import com.edtech.backend.repository.SessionRepository;
import com.edtech.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AnalyticsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private LiveClassRepository liveClassRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    public Map<String, Object> getAdminAnalytics() {
        Map<String, Object> stats = new HashMap<>();
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByIsActiveTrue();
        long totalCourses = courseRepository.count();
        long activeStudents = userRepository.countByRole(Role.STUDENT);
        long activeSessions = sessionRepository.countByIsActiveTrue();
        long frozenAccounts = Math.max(0, totalUsers - activeUsers);
        
        java.math.BigDecimal totalRevenueCents = paymentRepository.sumTotalRevenue();
        double totalRevenue = totalRevenueCents != null ? totalRevenueCents.doubleValue() / 100.0 : 0.0;
        long totalEnrollments = paymentRepository.count();

        stats.put("totalRevenue", totalRevenue);
        stats.put("totalEnrollments", totalEnrollments);
        stats.put("activeStudents", activeStudents);
        stats.put("totalCourses", totalCourses);
        stats.put("completionRate", totalUsers == 0 ? "0%" : Math.round((activeUsers * 100.0) / totalUsers) + "%");
        stats.put("totalUsers", totalUsers);
        stats.put("activeSessions", activeSessions);
        stats.put("frozenAccounts", frozenAccounts);
        stats.put("upcomingLiveClasses", liveClassRepository.count());
        return stats;
    }

    public Map<String, Object> getInstructorAnalytics(Long instructorId) {
        Map<String, Object> stats = new HashMap<>();
        long courses = courseRepository.findByInstructorId(instructorId).size();
        
        java.math.BigDecimal instructorRevenueCents = paymentRepository.sumRevenueByInstructor(instructorId);
        double totalRevenue = instructorRevenueCents != null ? instructorRevenueCents.doubleValue() / 100.0 : 0.0;
        long enrolledStudents = paymentRepository.countEnrollmentsByInstructor(instructorId);

        stats.put("courseRevenue", totalRevenue);
        stats.put("enrolledStudents", enrolledStudents);
        stats.put("averageRating", 4.5); // Rating system can be implemented later
        stats.put("courseCount", courses);
        return stats;
    }
}
