package com.edtech.backend.controller;

import com.edtech.backend.model.*;
import com.edtech.backend.repository.*;
import com.edtech.backend.security.UserPrincipal;
import com.edtech.backend.service.CertificateService;
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

    @Autowired
    private CertificateRepository certificateRepository;

    @Autowired
    private CertificateService certificateService;

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
        Certificate certificate = certificateRepository.findByUserAndCourseId(user, courseId).orElse(null);
        int lessonCount = course.getLessons() == null ? 0 : course.getLessons().size();
        int completedCount = progress.getCompletedLessons().size();

        return ResponseEntity.ok(Map.of(
                "completedLessonIds", progress.getCompletedLessons().stream().map(Lesson::getId).collect(Collectors.toSet()),
                "lastAccessed", progress.getLastAccessed(),
                "lessonCount", lessonCount,
                "completedCount", completedCount,
                "courseCompleted", lessonCount > 0 && completedCount >= lessonCount,
                "certificateId", certificate == null ? "" : certificate.getId()
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

        if (lesson.getCourse() == null || !lesson.getCourse().getId().equals(course.getId())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lesson does not belong to this course"));
        }

        if (!user.getEnrolledCourses().contains(course)) {
            return ResponseEntity.status(403).body(Map.of("message", "Enroll in this course before tracking progress"));
        }

        CourseProgress progress = progressRepository.findByUserAndCourse(user, course)
                .orElseThrow(() -> new RuntimeException("Progress not initialized for this course"));

        boolean newlyCompleted = progress.getCompletedLessons().add(lesson);
        progressRepository.save(progress);

        int xpGained = newlyCompleted ? 50 : 0;
        if (newlyCompleted) {
            awardXp(user, xpGained);
            userRepository.save(user);
        }

        Object certificateId = null;
        if (!course.getLessons().isEmpty() && progress.getCompletedLessons().size() >= course.getLessons().size()) {
            try {
                Certificate certificate = certificateService.issueCertificate(user, course);
                certificateId = certificate.getId();
            } catch (Exception ex) {
                throw new RuntimeException("Lesson completed, but certificate generation failed");
            }
        }

        return ResponseEntity.ok(Map.of(
            "message", "Lesson marked as complete",
            "xpGained", xpGained,
            "newTotalXp", user.getXp(),
            "newLevel", user.getLevel(),
            "courseCompleted", certificateId != null,
            "certificateId", certificateId == null ? "" : certificateId
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
