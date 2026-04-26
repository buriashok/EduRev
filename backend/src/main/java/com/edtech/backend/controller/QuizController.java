package com.edtech.backend.controller;

import com.edtech.backend.model.*;
import com.edtech.backend.repository.*;
import java.util.Optional;
import com.edtech.backend.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuizResultRepository quizResultRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CertificateRepository certificateRepository;

    @Autowired
    private com.edtech.backend.service.NotificationService notificationService;

    @GetMapping("/{id}")
    public ResponseEntity<Quiz> getQuizById(@PathVariable Long id) {
        return quizRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/lesson/{lessonId}")
    public ResponseEntity<Quiz> getQuizByLesson(@PathVariable Long lessonId) {
        return quizRepository.findByLessonId(lessonId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{quizId}/submit")
    public ResponseEntity<?> submitQuiz(
            @PathVariable Long quizId,
            @RequestBody List<Integer> answers,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        Quiz quiz = quizRepository.findById(quizId).orElseThrow();
        User user = userRepository.findById(userPrincipal.getId()).orElseThrow();

        int score = 0;
        List<Question> questions = quiz.getQuestions();
        
        for (int i = 0; i < Math.min(questions.size(), answers.size()); i++) {
            if (questions.get(i).getCorrectAnswerIndex() == answers.get(i)) {
                score++;
            }
        }

        boolean passed = (double) score / questions.size() >= 0.7; // 70% to pass

        QuizResult result = new QuizResult();
        result.setQuiz(quiz);
        result.setUser(user);
        result.setScore(score);
        result.setTotalQuestions(questions.size());
        result.setPassed(passed);
        quizResultRepository.save(result);

        // Issue Certificate if passed
        boolean certificateEarned = false;
        if (passed) {
            // Award XP
            awardXp(user, 100);
            userRepository.save(user);

            Optional<Certificate> existing = certificateRepository.findByUserAndCourseId(user, quiz.getLesson().getCourse().getId());
            if (existing.isEmpty()) {
                Certificate cert = new Certificate();
                cert.setUser(user);
                cert.setCourse(quiz.getLesson().getCourse());
                cert.setUniqueId("CERT-" + System.currentTimeMillis() + "-" + user.getId());
                certificateRepository.save(cert);
                certificateEarned = true;
                
                notificationService.createNotification(user, "Certificate Earned!", 
                    "Congratulations! You've earned a certificate for: " + quiz.getLesson().getCourse().getTitle(), 
                    NotificationType.SUCCESS, "/profile");
            } else {
                notificationService.createNotification(user, "Quiz Passed", 
                    "You passed the quiz for: " + quiz.getLesson().getTitle() + "!", 
                    NotificationType.SUCCESS, null);
            }
        }

        return ResponseEntity.ok(Map.of(
            "score", score,
            "total", questions.size(),
            "passed", passed,
            "certificateEarned", certificateEarned,
            "xpGained", passed ? 100 : 0,
            "newTotalXp", user.getXp(),
            "newLevel", user.getLevel(),
            "message", passed ? "Congratulations! You passed and earned 100 XP!" : "Keep studying and try again!"
        ));
    }

    private void awardXp(User user, int amount) {
        user.setXp(user.getXp() + amount);
        int newLevel = (int) (user.getXp() / 1000) + 1;
        if (newLevel > user.getLevel()) {
            user.setLevel(newLevel);
        }
    }
}
