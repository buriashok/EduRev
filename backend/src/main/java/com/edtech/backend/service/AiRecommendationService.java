package com.edtech.backend.service;

import com.edtech.backend.model.Course;
import com.edtech.backend.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AiRecommendationService {

    @Autowired
    private CourseRepository courseRepository;

    public List<Course> getRecommendationsForUser(Long userId) {
        // Mock logic: return a few courses that the user hasn't enrolled in,
        // or just some featured courses for now.
        // In Phase 4/5 we will integrate with Gemini API.
        return courseRepository.findAll().stream()
                .limit(3)
                .collect(Collectors.toList());
    }
}
