package com.edtech.backend.controller;

import com.edtech.backend.model.Course;
import com.edtech.backend.model.CourseStatus;
import com.edtech.backend.model.User;
import com.edtech.backend.repository.CourseRepository;
import com.edtech.backend.repository.UserRepository;
import com.edtech.backend.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<Course> getAllCourses(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        // Admins can see all, others only APPROVED
        if (userPrincipal != null && userPrincipal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return courseRepository.findAll();
        }
        return courseRepository.findByStatus(CourseStatus.APPROVED);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Course> updateCourseStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload
    ) {
        return courseRepository.findById(id).map(course -> {
            CourseStatus status = CourseStatus.valueOf(payload.get("status"));
            course.setStatus(status);
            return ResponseEntity.ok(courseRepository.save(course));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/recommendations")
    public List<Course> getRecommendations() {
        // Recommendations should only be from approved courses
        List<Course> all = courseRepository.findByStatus(CourseStatus.APPROVED);
        return all.subList(0, Math.min(all.size(), 3));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return courseRepository.findById(id).map(course -> {
            // Check if course is approved OR user is admin OR user is the instructor
            boolean isAdmin = userPrincipal != null && userPrincipal.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            boolean isInstructor = userPrincipal != null && course.getInstructor().getId().equals(userPrincipal.getId());
            
            if (course.getStatus() == CourseStatus.APPROVED || isAdmin || isInstructor) {
                return ResponseEntity.ok(course);
            }
            return ResponseEntity.status(403).<Course>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Course> createCourse(@RequestBody Course course, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User instructor = userRepository.findById(userPrincipal.getId()).orElseThrow();
        course.setInstructor(instructor);
        
        // Admins can auto-approve their own courses, instructors are pending
        boolean isAdmin = userPrincipal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        course.setStatus(isAdmin ? CourseStatus.APPROVED : CourseStatus.PENDING);
        
        if (course.getLessons() != null) {
            course.getLessons().forEach(lesson -> lesson.setCourse(course));
        }
        return ResponseEntity.ok(courseRepository.save(course));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Course> updateCourse(@PathVariable Long id, @RequestBody Course courseDetails, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return courseRepository.findById(id).map(course -> {
            course.setTitle(courseDetails.getTitle());
            course.setDescription(courseDetails.getDescription());
            course.setPrice(courseDetails.getPrice());
            course.setDifficulty(courseDetails.getDifficulty());
            course.setDuration(courseDetails.getDuration());
            if (courseDetails.getLessons() != null) {
                course.getLessons().clear();
                courseDetails.getLessons().forEach(lesson -> {
                    lesson.setCourse(course);
                    course.getLessons().add(lesson);
                });
            }
            return ResponseEntity.ok(courseRepository.save(course));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        return courseRepository.findById(id).map(course -> {
            courseRepository.delete(course);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
