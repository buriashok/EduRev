package com.edtech.backend.repository;

import com.edtech.backend.model.User;
import com.edtech.backend.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByGoogleId(String googleId);
    Boolean existsByEmail(String email);
    long countByIsActiveTrue();
    long countByRole(Role role);
    List<User> findAllByOrderByCreatedAtDesc();

    @org.springframework.data.jpa.repository.Query(value = "SELECT COUNT(*) FROM enrollments", nativeQuery = true)
    long countTotalEnrollments();

    @org.springframework.data.jpa.repository.Query(value = "SELECT COUNT(*) FROM enrollments WHERE user_id = :userId", nativeQuery = true)
    long countEnrollmentsByUserId(Long userId);

    List<User> findAllByOrderByXpDesc();
}
