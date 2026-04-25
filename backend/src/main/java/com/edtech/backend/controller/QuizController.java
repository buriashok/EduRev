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
            Optional<Certificate> existing = certificateRepository.findByUserAndCourseId(user, quiz.getLesson().getCourse().getId());
            if (existing.isEmpty()) {
                Certificate cert = new Certificate();
                cert.setUser(user);
                cert.setCourse(quiz.getLesson().getCourse());
                cert.setUniqueId("CERT-" + System.currentTimeMillis() + "-" + user.getId());
                certificateRepository.save(cert);
                certificateEarned = true;
            }
        }

        return ResponseEntity.ok(Map.of(
            "score", score,
            "total", questions.size(),
            "passed", passed,
            "certificateEarned", certificateEarned,
            "message", passed ? "Congratulations! You passed and earned a certificate." : "Keep studying and try again!"
        ));
    }
}
