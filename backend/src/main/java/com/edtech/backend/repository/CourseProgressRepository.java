package com.edtech.backend.repository;

import com.edtech.backend.model.Course;
import com.edtech.backend.model.CourseProgress;
import com.edtech.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CourseProgressRepository extends JpaRepository<CourseProgress, Long> {
    Optional<CourseProgress> findByUserAndCourse(User user, Course course);
}
