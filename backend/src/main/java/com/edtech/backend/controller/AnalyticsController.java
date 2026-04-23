package com.edtech.backend.controller;

import com.edtech.backend.security.UserPrincipal;
import com.edtech.backend.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> getAdminStats() {
        return analyticsService.getAdminAnalytics();
    }

    @GetMapping("/instructor")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public Map<String, Object> getInstructorStats(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return analyticsService.getInstructorAnalytics(userPrincipal.getId());
    }
}
