package com.edtech.backend.service;

import com.edtech.backend.model.Role;
import com.edtech.backend.repository.CourseRepository;
import com.edtech.backend.repository.CourseReviewRepository;
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

    @Autowired
    private CourseReviewRepository courseReviewRepository;

    public Map<String, Object> getAdminAnalytics() {
        Map<String, Object> stats = new HashMap<>();
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByIsActiveTrue();
        long totalCourses = courseRepository.count();
        long activeStudents = userRepository.countByRole(Role.STUDENT);
        long activeSessions = sessionRepository.countByIsActiveTrue();
        long frozenAccounts = Math.max(0, totalUsers - activeUsers);
        
        java.math.BigDecimal totalRevenueValue = paymentRepository.sumTotalSucceededRevenue();
        double totalRevenue = totalRevenueValue != null ? totalRevenueValue.doubleValue() : 0.0;
        long totalEnrollments = paymentRepository.findByStatus("SUCCEEDED").size();

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
        
        java.math.BigDecimal instructorRevenueValue = paymentRepository.sumSucceededRevenueByInstructor(instructorId);
        double totalRevenue = instructorRevenueValue != null ? instructorRevenueValue.doubleValue() : 0.0;
        long enrolledStudents = paymentRepository.countSucceededEnrollmentsByInstructor(instructorId);

        stats.put("courseRevenue", totalRevenue);
        stats.put("enrolledStudents", enrolledStudents);
        Double averageRating = courseReviewRepository.averageRatingByInstructorId(instructorId);
        stats.put("averageRating", averageRating == null ? 0.0 : Math.round(averageRating * 10.0) / 10.0);
        stats.put("courseCount", courses);
        return stats;
    }
}
