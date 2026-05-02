package com.edtech.backend.controller;

import com.edtech.backend.model.Course;
import com.edtech.backend.model.CourseReview;
import com.edtech.backend.model.User;
import com.edtech.backend.repository.CourseRepository;
import com.edtech.backend.repository.CourseReviewRepository;
import com.edtech.backend.repository.UserRepository;
import com.edtech.backend.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses/{courseId}/reviews")
public class CourseReviewController {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CourseReviewRepository courseReviewRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<CourseReview>> getReviews(@PathVariable Long courseId) {
        Course course = courseRepository.findById(courseId).orElseThrow();
        return ResponseEntity.ok(courseReviewRepository.findByCourseOrderByUpdatedAtDesc(course));
    }

    @PostMapping
    public ResponseEntity<CourseReview> upsertReview(
            @PathVariable Long courseId,
            @RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        Course course = courseRepository.findById(courseId).orElseThrow();
        User user = userRepository.findById(userPrincipal.getId()).orElseThrow();

        if (!user.getEnrolledCourses().contains(course)) {
            return ResponseEntity.status(403).build();
        }

        int rating = parseRating(payload.get("rating"));
        String comment = payload.get("comment") == null ? "" : payload.get("comment").toString().trim();
        if (comment.length() > 1000) {
            throw new RuntimeException("Review comment must be 1000 characters or fewer");
        }

        CourseReview review = courseReviewRepository.findByCourseAndUser(course, user).orElseGet(() -> {
            CourseReview created = new CourseReview();
            created.setCourse(course);
            created.setUser(user);
            return created;
        });
        review.setRating(rating);
        review.setComment(comment);
        return ResponseEntity.ok(courseReviewRepository.save(review));
    }

    private int parseRating(Object value) {
        int rating;
        if (value instanceof Number number) {
            rating = number.intValue();
        } else {
            rating = Integer.parseInt(String.valueOf(value));
        }

        if (rating < 1 || rating > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }
        return rating;
    }
}
