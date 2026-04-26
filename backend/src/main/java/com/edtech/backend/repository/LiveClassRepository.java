package com.edtech.backend.repository;

import com.edtech.backend.model.LiveClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LiveClassRepository extends JpaRepository<LiveClass, Long> {
    List<LiveClass> findByStartTimeAfterOrderByStartTimeAsc(LocalDateTime time);
    List<LiveClass> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);
    List<LiveClass> findByCourseId(Long courseId);
}
