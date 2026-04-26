package com.edtech.backend.controller;

import com.edtech.backend.model.*;
import com.edtech.backend.repository.*;
import com.edtech.backend.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/progress")
public class CourseProgressController {

    @Autowired
    private CourseProgressRepository progressRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @GetMapping("/{courseId}")
    public ResponseEntity<?> getProgress(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long courseId
    ) {
        User user = userRepository.findById(userPrincipal.getId()).orElseThrow();
        Course course = courseRepository.findById(courseId).orElseThrow();

        CourseProgress progress = progressRepository.findByUserAndCourse(user, course)
                .orElseGet(() -> {
                    CourseProgress newProgress = new CourseProgress();
                    newProgress.setUser(user);
                    newProgress.setCourse(course);
                    return progressRepository.save(newProgress);
                });

        return ResponseEntity.ok(Map.of(
                "completedLessonIds", progress.getCompletedLessons().stream().map(Lesson::getId).collect(Collectors.toSet()),
                "lastAccessed", progress.getLastAccessed()
        ));
    }

    @PostMapping("/{courseId}/lessons/{lessonId}/complete")
    public ResponseEntity<?> completeLesson(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long courseId,
            @PathVariable Long lessonId
    ) {
        User user = userRepository.findById(userPrincipal.getId()).orElseThrow();
        Course course = courseRepository.findById(courseId).orElseThrow();
        Lesson lesson = lessonRepository.findById(lessonId).orElseThrow();

        CourseProgress progress = progressRepository.findByUserAndCourse(user, course)
                .orElseThrow(() -> new RuntimeException("Progress not initialized for this course"));

        progress.getCompletedLessons().add(lesson);
        progressRepository.save(progress);

        // Award XP
        awardXp(user, 50);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
            "message", "Lesson marked as complete",
            "xpGained", 50,
            "newTotalXp", user.getXp(),
            "newLevel", user.getLevel()
        ));
    }

    private void awardXp(User user, int amount) {
        user.setXp(user.getXp() + amount);
        // Level up logic: Each level requires level * 1000 XP
        int newLevel = (int) (user.getXp() / 1000) + 1;
        if (newLevel > user.getLevel()) {
            user.setLevel(newLevel);
        }
    }
}
