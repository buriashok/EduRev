package com.edtech.backend.controller;

import com.edtech.backend.model.Course;
import com.edtech.backend.security.UserPrincipal;
import com.edtech.backend.service.AiRecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    @Autowired
    private AiRecommendationService recommendationService;

    @GetMapping
    public List<Course> getRecommendations(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        Long userId = userPrincipal == null ? null : userPrincipal.getId();
        return recommendationService.getRecommendationsForUser(userId);
    }
}
