package com.edtech.backend.service;

import com.edtech.backend.model.Role;
import com.edtech.backend.repository.CourseRepository;
import com.edtech.backend.repository.LiveClassRepository;
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

    public Map<String, Object> getAdminAnalytics() {
        Map<String, Object> stats = new HashMap<>();
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByIsActiveTrue();
        long totalCourses = courseRepository.count();
        long activeStudents = userRepository.countByRole(Role.STUDENT);
        long activeSessions = sessionRepository.countByIsActiveTrue();
        long frozenAccounts = Math.max(0, totalUsers - activeUsers);

        stats.put("totalRevenue", 15400.50);
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
        stats.put("courseRevenue", 4200.00);
        stats.put("enrolledStudents", 320);
        stats.put("averageRating", 4.8);
        stats.put("courseCount", courses);
        return stats;
    }
}
