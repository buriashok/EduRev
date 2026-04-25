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
            admin.setActive(true);
            userRepository.save(admin);
        }

        // 2. Seed 20 Courses if empty
        if (courseRepository.count() < 5) {
            seedCourses(admin);
        }

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
            {"Full Stack Java Developer", "Master Spring Boot and React from scratch.", "99.99", "INTERMEDIATE", "40 hours"},
            {"Data Science Bootcamp", "Learn Python, Pandas, and Machine Learning.", "89.99", "BEGINNER", "35 hours"},
            {"Cyber Security Essentials", "Protect networks and learn ethical hacking.", "79.99", "BEGINNER", "25 hours"},
            {"DevOps Mastery with Docker", "Containerize and deploy applications at scale.", "69.99", "INTERMEDIATE", "20 hours"},
            {"Advanced Data Structures", "Master DSA for top-tier coding interviews.", "59.99", "ADVANCED", "30 hours"},
            {"Cloud Architecture (AWS)", "Design scalable systems on Amazon Web Services.", "109.99", "INTERMEDIATE", "30 hours"},
            {"Modern SQL for Analytics", "Write complex queries and optimize databases.", "49.99", "BEGINNER", "15 hours"},
            {"Node.js & Microservices", "Build scalable backend systems with Node.", "74.99", "INTERMEDIATE", "22 hours"},
            {"Python for Automation", "Automate boring tasks with Python scripts.", "39.99", "BEGINNER", "12 hours"},
            {"React Native Mobile Apps", "Build cross-platform apps for iOS and Android.", "84.99", "INTERMEDIATE", "28 hours"},
            {"Kubernetes in Production", "Orchestrate containers like a professional.", "94.99", "ADVANCED", "20 hours"},
            {"Machine Learning with R", "Statistical modeling and predictive analytics.", "79.99", "INTERMEDIATE", "32 hours"},
            {"Ethical Hacking Lab", "Hands-on penetration testing and security.", "89.99", "ADVANCED", "40 hours"},
            {"Frontend Architecture", "Design large-scale React applications.", "64.99", "INTERMEDIATE", "18 hours"},
            {"Database Design & Modeling", "Relational and NoSQL database principles.", "54.99", "BEGINNER", "20 hours"},
            {"Spring Cloud Microservices", "Distributed systems with Spring ecosystem.", "99.99", "ADVANCED", "35 hours"},
            {"JavaScript Deep Dive", "From closures to async/await and beyond.", "44.99", "BEGINNER", "15 hours"},
            {"Docker for Beginners", "Starting your containerization journey.", "29.99", "BEGINNER", "8 hours"},
            {"PowerBI & Data Visualization", "Turn data into stunning visual insights.", "59.99", "BEGINNER", "20 hours"},
            {"Algorithm Design Patterns", "Dynamic programming and greedy algorithms.", "69.99", "ADVANCED", "25 hours"}
        };

        for (String[] data : courseData) {
            Course c = new Course();
            c.setTitle(data[0]);
            c.setDescription(data[1]);
            c.setPrice(new BigDecimal(data[2]));
            c.setDifficulty(data[3]);
            c.setDuration(data[4]);
            c.setInstructor(instructor);
            
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
