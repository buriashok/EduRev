package com.edtech.backend.repository;

import com.edtech.backend.model.QuizResult;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuizResultRepository extends JpaRepository<QuizResult, Long> {
    List<QuizResult> findByUserId(Long userId);
    List<QuizResult> findByUserIdAndQuizId(Long userId, Long quizId);

    @org.springframework.data.jpa.repository.Query("SELECT AVG(cast(r.score as double) / r.totalQuestions) FROM QuizResult r WHERE r.user.id = :userId")
    Double findAverageScoreByUserId(Long userId);
}
