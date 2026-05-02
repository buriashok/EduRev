package com.edtech.backend.controller;

import com.edtech.backend.model.Course;
import com.edtech.backend.model.Payment;
import com.edtech.backend.model.User;
import com.edtech.backend.repository.CourseRepository;
import com.edtech.backend.repository.PaymentRepository;
import com.edtech.backend.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/instructor")
@PreAuthorize("hasRole('INSTRUCTOR')")
public class InstructorController {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @GetMapping("/courses")
    public List<Course> getMyCourses(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return courseRepository.findByInstructorId(userPrincipal.getId());
    }

    @GetMapping("/courses/{courseId}/students")
    public ResponseEntity<List<User>> getCourseStudents(
            @PathVariable Long courseId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        return courseRepository.findById(courseId).map(course -> {
            if (!course.getInstructor().getId().equals(userPrincipal.getId())) {
                return ResponseEntity.status(403).<List<User>>build();
            }
            // In a real app, you'd have an Enrollment table. 
            // For now, we can find students who have paid for this course.
            List<Payment> payments = paymentRepository.findAll().stream()
                    .filter(p -> p.getCourse().getId().equals(courseId))
                    .collect(Collectors.toList());
            
            List<User> students = payments.stream()
                    .map(Payment::getUser)
                    .distinct()
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(students);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/earnings")
    public ResponseEntity<Map<String, Object>> getEarnings(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        java.math.BigDecimal revenueCents = paymentRepository.sumRevenueByInstructor(userPrincipal.getId());
        double revenue = revenueCents != null ? revenueCents.doubleValue() / 100.0 : 0.0;
        
        return ResponseEntity.ok(Map.of(
            "totalRevenue", revenue,
            "currency", "INR"
        ));
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<Course> courses = courseRepository.findByInstructorId(userPrincipal.getId());
        List<Payment> payments = paymentRepository.findAll().stream()
                .filter(p -> p.getCourse().getInstructor().getId().equals(userPrincipal.getId()))
                .collect(Collectors.toList());

        // Top Courses by Enrollment
        List<Map<String, Object>> topCourses = courses.stream()
                .map(c -> {
                    Map<String, Object> map = new java.util.HashMap<>();
                    map.put("title", c.getTitle());
                    map.put("students", payments.stream().filter(p -> p.getCourse().getId().equals(c.getId())).count());
                    return map;
                })
                .sorted((a, b) -> Long.compare((long)b.get("students"), (long)a.get("students")))
                .limit(5)
                .collect(Collectors.toList());

        // Recent Enrollments
        List<Map<String, Object>> recentEnrollments = payments.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(5)
                .map(p -> {
                    Map<String, Object> map = new java.util.HashMap<>();
                    map.put("studentName", p.getUser().getFirstName() + " " + p.getUser().getLastName());
                    map.put("courseTitle", p.getCourse().getTitle());
                    map.put("date", p.getCreatedAt());
                    return map;
                })
                .collect(Collectors.toList());

        Map<String, Object> response = new java.util.HashMap<>();
        response.put("topCourses", topCourses);
        response.put("recentEnrollments", recentEnrollments);
        response.put("totalEnrollments", payments.size());
        response.put("activeCourses", courses.size());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/students")
    public ResponseEntity<List<Map<String, Object>>> getMyStudents(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<Payment> payments = paymentRepository.findAll().stream()
                .filter(p -> p.getCourse().getInstructor().getId().equals(userPrincipal.getId()))
                .collect(Collectors.toList());

        List<Map<String, Object>> students = payments.stream()
                .collect(Collectors.groupingBy(Payment::getUser))
                .entrySet().stream()
                .map(entry -> {
                    User student = entry.getKey();
                    List<String> titles = entry.getValue().stream()
                            .map(p -> p.getCourse().getTitle())
                            .collect(Collectors.toList());
                    
                    Map<String, Object> map = new java.util.HashMap<>();
                    map.put("id", student.getId());
                    map.put("firstName", student.getFirstName());
                    map.put("lastName", student.getLastName());
                    map.put("email", student.getEmail());
                    map.put("createdAt", student.getCreatedAt());
                    map.put("lastLoginAt", student.getLastLoginAt());
                    map.put("enrolledCourseTitles", titles);
                    return map;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(students);
    }
}
