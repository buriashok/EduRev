package com.edtech.backend.config;

import com.edtech.backend.model.Course;
import com.edtech.backend.model.LiveClass;
import com.edtech.backend.model.Role;
import com.edtech.backend.model.User;
import com.edtech.backend.repository.CourseRepository;
import com.edtech.backend.repository.LiveClassRepository;
import com.edtech.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;

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
    public void run(String... args) throws Exception {
        // 1. Create Default Admin if not exists
        if (userRepository.findByEmail("admin@edurev.com").isEmpty()) {
            User admin = new User();
            admin.setFirstName("System");
            admin.setLastName("Admin");
            admin.setEmail("admin@edurev.com");
            admin.setPassword(passwordEncoder.encode("password123"));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
            System.out.println(">>> Default Admin created: admin@edurev.com / password123");
        }

        // 2. Seed Sample Courses if database is empty
        if (courseRepository.count() == 0) {
            Course c1 = new Course();
            c1.setTitle("Mastering Full-Stack Java");
            c1.setDescription("Complete guide to Spring Boot and React development.");
            c1.setPrice(new BigDecimal("99.99"));
            c1.setDifficulty("INTERMEDIATE");
            c1.setDuration("20 hours");
            c1.setInstructor(userRepository.findByEmail("admin@edurev.com").get());
            
            Course c2 = new Course();
            c2.setTitle("Modern UI/UX Design");
            c2.setDescription("Learn the principles of glassmorphism and modern web aesthetics.");
            c2.setPrice(new BigDecimal("49.99"));
            c2.setDifficulty("BEGINNER");
            c2.setDuration("12 hours");
            c2.setInstructor(userRepository.findByEmail("admin@edurev.com").get());

            courseRepository.saveAll(Arrays.asList(c1, c2));
            System.out.println(">>> Sample courses seeded.");
        }

        // 3. Seed Live Class if empty
        if (liveClassRepository.count() == 0) {
            LiveClass lc = new LiveClass();
            lc.setTitle("Mastering Spring Security & JWT");
            lc.setStartTime(LocalDateTime.now().plusDays(1));
            lc.setEndTime(LocalDateTime.now().plusDays(1).plusHours(2));
            lc.setInstructor(userRepository.findByEmail("admin@edurev.com").get());
            lc.setMeetingLink("https://meet.google.com/abc-defg-hij");
            liveClassRepository.save(lc);
            System.out.println(">>> Sample live class seeded.");
        }
    }
}
