package com.edtech.backend.config;

import com.edtech.backend.model.*;
import com.edtech.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private LiveClassRepository liveClassRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // 1. Create Default Admin & Instructor
        User admin = userRepository.findByEmail("admin@edurev.com").orElse(null);
        if (admin == null) {
            admin = new User();
            admin.setFirstName("System");
            admin.setLastName("Admin");
            admin.setEmail("admin@edurev.com");
            admin.setPassword(passwordEncoder.encode("password123"));
            admin.setRole(Role.ADMIN);
            admin.setEmailVerified(true);
        }
        admin.setActive(true); // Always ensure default admin is active
        userRepository.save(admin);

        // 2. Seed 20 Courses
        seedCourses(admin);

        // 3. Seed Live Class if empty
        if (liveClassRepository.count() == 0) {
            LiveClass lc = new LiveClass();
            lc.setTitle("Mastering Spring Security & JWT");
            lc.setStartTime(LocalDateTime.now().plusDays(1));
            lc.setEndTime(LocalDateTime.now().plusDays(1).plusHours(2));
            lc.setInstructor(admin);
            lc.setMeetingLink("https://meet.google.com/abc-defg-hij");
            liveClassRepository.save(lc);
        }
    }

    private void seedCourses(User instructor) {
        String[][] courseData = {
            {"Full Stack Java Developer", "Master Spring Boot and React from scratch.", "4999", "INTERMEDIATE", "40 hours"},
            {"Data Science Bootcamp", "Learn Python, Pandas, and Machine Learning.", "3999", "BEGINNER", "35 hours"},
            {"Cyber Security Essentials", "Protect networks and learn ethical hacking.", "3499", "BEGINNER", "25 hours"},
            {"DevOps Mastery with Docker", "Containerize and deploy applications at scale.", "2999", "INTERMEDIATE", "20 hours"},
            {"Advanced Data Structures", "Master DSA for top-tier coding interviews.", "2499", "ADVANCED", "30 hours"},
            {"Cloud Architecture (AWS)", "Design scalable systems on Amazon Web Services.", "5499", "INTERMEDIATE", "30 hours"},
            {"Modern SQL for Analytics", "Write complex queries and optimize databases.", "1999", "BEGINNER", "15 hours"},
            {"Node.js & Microservices", "Build scalable backend systems with Node.", "3299", "INTERMEDIATE", "22 hours"},
            {"Python for Automation", "Automate boring tasks with Python scripts.", "1499", "BEGINNER", "12 hours"},
            {"React Native Mobile Apps", "Build cross-platform apps for iOS and Android.", "3799", "INTERMEDIATE", "28 hours"},
            {"Kubernetes in Production", "Orchestrate containers like a professional.", "4499", "ADVANCED", "20 hours"},
            {"Machine Learning with R", "Statistical modeling and predictive analytics.", "3499", "INTERMEDIATE", "32 hours"},
            {"Ethical Hacking Lab", "Hands-on penetration testing and security.", "3999", "ADVANCED", "40 hours"},
            {"Frontend Architecture", "Design large-scale React applications.", "2799", "INTERMEDIATE", "18 hours"},
            {"Database Design & Modeling", "Relational and NoSQL database principles.", "2299", "BEGINNER", "20 hours"},
            {"Spring Cloud Microservices", "Distributed systems with Spring ecosystem.", "4999", "ADVANCED", "35 hours"},
            {"JavaScript Deep Dive", "From closures to async/await and beyond.", "1899", "BEGINNER", "15 hours"},
            {"Docker for Beginners", "Starting your containerization journey.", "999", "BEGINNER", "8 hours"},
            {"PowerBI & Data Visualization", "Turn data into stunning visual insights.", "2499", "BEGINNER", "20 hours"},
            {"Algorithm Design Patterns", "Dynamic programming and greedy algorithms.", "2999", "ADVANCED", "25 hours"}
        };

        for (String[] data : courseData) {
            if (courseRepository.findByTitle(data[0]).isPresent()) continue;
            
            Course c = new Course();
            c.setTitle(data[0]);
            c.setDescription(data[1]);
            c.setPrice(new BigDecimal(data[2]));
            c.setDifficulty(data[3]);
            c.setDuration(data[4]);
            c.setInstructor(instructor);
            c.setStatus(CourseStatus.APPROVED);
            
            // Add Sample Lesson
            Lesson l = new Lesson();
            l.setTitle("Getting Started with " + data[0]);
            String imageUrl = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop";
            l.setContent("Welcome to this comprehensive course on " + data[0] + ". In this lesson, we cover the core fundamentals and environment setup.\n\n<img src=\"" + imageUrl + "\" alt=\"Course Visual\" style=\"width:100%; border-radius:12px; margin:20px 0;\" />\n\nPractice is the key to mastering these concepts.");
            l.setOrderIndex(0);
            l.setCourse(c);

            // Add Sample Quiz
            Quiz q = new Quiz();
            q.setTitle(data[0] + " Quiz #1");
            q.setLesson(l);

            Question qu = new Question();
            qu.setText("What is the primary goal of " + data[0] + "?");
            qu.setOptions(Arrays.asList("To build software", "To analyze data", "To secure systems", "All of the above"));
            qu.setCorrectAnswerIndex(3);
            qu.setQuiz(q);
            q.setQuestions(Arrays.asList(qu));
            
            l.setQuiz(q);
            c.setLessons(Arrays.asList(l));

            courseRepository.save(c);
        }
        System.out.println(">>> 20 Professional Courses seeded successfully.");
    }
}
