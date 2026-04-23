package com.edtech.backend.service;

import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class AnalyticsService {

    public Map<String, Object> getAdminAnalytics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRevenue", 15400.50);
        stats.put("activeStudents", 1250);
        stats.put("totalCourses", 45);
        stats.put("completionRate", "78%");
        return stats;
    }

    public Map<String, Object> getInstructorAnalytics(Long instructorId) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("courseRevenue", 4200.00);
        stats.put("enrolledStudents", 320);
        stats.put("averageRating", 4.8);
        return stats;
    }
}
