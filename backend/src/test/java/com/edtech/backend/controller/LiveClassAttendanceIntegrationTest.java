package com.edtech.backend.controller;

import com.edtech.backend.model.Course;
import com.edtech.backend.model.LiveClass;
import com.edtech.backend.model.User;
import com.edtech.backend.model.Role;
import com.edtech.backend.repository.LiveClassRepository;
import com.edtech.backend.repository.UserRepository;
import com.edtech.backend.repository.CourseRepository;
import com.edtech.backend.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class LiveClassAttendanceIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private LiveClassRepository liveClassRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private User student;
    private User instructor;
    private LiveClass liveClass;
    private String studentToken;
    private String instructorToken;

    @BeforeEach
    public void setup() {
        // Create Instructor
        instructor = new User();
        instructor.setFirstName("John");
        instructor.setLastName("Doe");
        instructor.setEmail("instructor_" + System.currentTimeMillis() + "@test.com");
        instructor.setPassword("password");
        instructor.setRole(Role.INSTRUCTOR);
        userRepository.save(instructor);

        instructorToken = "Bearer " + jwtTokenProvider.generateTokenFromUserId(instructor.getId());

        // Create Student
        student = new User();
        student.setFirstName("Jane");
        student.setLastName("Smith");
        student.setEmail("student_" + System.currentTimeMillis() + "@test.com");
        student.setPassword("password");
        student.setRole(Role.STUDENT);
        userRepository.save(student);

        studentToken = "Bearer " + jwtTokenProvider.generateTokenFromUserId(student.getId());

        // Create Course
        Course course = new Course();
        course.setTitle("Test Course");
        course.setDescription("Test Description");
        course.setDifficulty("BEGINNER");
        course.setDuration("120 minutes");
        course.setPrice(java.math.BigDecimal.ZERO);
        course.setInstructor(instructor);
        courseRepository.save(course);

        // Create Live Class
        liveClass = new LiveClass();
        liveClass.setTitle("Test Live Class");
        liveClass.setCourse(course);
        liveClass.setInstructor(instructor);
        liveClass.setMeetingLink("https://zoom.us/test");
        liveClass.setStartTime(LocalDateTime.now().plusDays(1));
        liveClass.setEndTime(LocalDateTime.now().plusDays(1).plusHours(1));
        liveClassRepository.save(liveClass);
    }

    @Test
    public void testJoinLiveClassWithoutRegistration() throws Exception {
        mockMvc.perform(post("/api/live-classes/" + liveClass.getId() + "/join")
                .header("Authorization", studentToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Register for this live class before joining."));
    }

    @Test
    public void testRegistrationAndAutoAttendanceFlow() throws Exception {
        // 1. Student Registers
        mockMvc.perform(post("/api/live-classes/" + liveClass.getId() + "/register")
                .header("Authorization", studentToken))
                .andExpect(status().isOk());

        // Verify registration
        LiveClass updatedClass = liveClassRepository.findById(liveClass.getId()).orElseThrow();
        assertTrue(updatedClass.getRegisteredUsers().stream().anyMatch(u -> u.getId().equals(student.getId())));
        assertFalse(updatedClass.getAttendedUsers().stream().anyMatch(u -> u.getId().equals(student.getId())));

        // 2. Student Joins Class (should mark attendance)
        mockMvc.perform(post("/api/live-classes/" + liveClass.getId() + "/join")
                .header("Authorization", studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.meetingLink").value("https://zoom.us/test"));

        // Verify attendance
        updatedClass = liveClassRepository.findById(liveClass.getId()).orElseThrow();
        assertTrue(updatedClass.getAttendedUsers().stream().anyMatch(u -> u.getId().equals(student.getId())));
    }

    @Test
    public void testInstructorCanViewAttendance() throws Exception {
        // Student registers and joins
        mockMvc.perform(post("/api/live-classes/" + liveClass.getId() + "/register")
                .header("Authorization", studentToken));
        mockMvc.perform(post("/api/live-classes/" + liveClass.getId() + "/join")
                .header("Authorization", studentToken));

        // Instructor requests attendance
        mockMvc.perform(get("/api/live-classes/" + liveClass.getId() + "/attendance")
                .header("Authorization", instructorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(student.getId()))
                .andExpect(jsonPath("$[0].email").value(student.getEmail()));
    }

    @Test
    public void testStudentCannotViewAttendance() throws Exception {
        mockMvc.perform(get("/api/live-classes/" + liveClass.getId() + "/attendance")
                .header("Authorization", studentToken))
                .andExpect(status().is4xxClientError());
    }
}
