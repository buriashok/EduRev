package com.edtech.backend.controller;

import com.edtech.backend.model.Course;
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

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    @GetMapping("/recommendations")
    public List<Course> getRecommendations() {
        // Simple mock recommendation: return first 3 courses
        List<Course> all = courseRepository.findAll();
        return all.subList(0, Math.min(all.size(), 3));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable Long id) {
        return courseRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Course> createCourse(@RequestBody Course course, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User instructor = userRepository.findById(userPrincipal.getId()).orElseThrow();
        course.setInstructor(instructor);
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
