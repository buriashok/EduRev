package com.edtech.backend.repository;

import com.edtech.backend.model.Course;
import com.edtech.backend.model.CourseReview;
import com.edtech.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseReviewRepository extends JpaRepository<CourseReview, Long> {
    List<CourseReview> findByCourseOrderByUpdatedAtDesc(Course course);
    Optional<CourseReview> findByCourseAndUser(Course course, User user);

    @Query("SELECT AVG(r.rating) FROM CourseReview r WHERE r.course.id = :courseId")
    Double averageRatingByCourseId(Long courseId);

    @Query("SELECT COUNT(r) FROM CourseReview r WHERE r.course.id = :courseId")
    long countByCourseId(Long courseId);

    @Query("SELECT AVG(r.rating) FROM CourseReview r WHERE r.course.instructor.id = :instructorId")
    Double averageRatingByInstructorId(Long instructorId);
}
