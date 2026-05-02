package com.edtech.backend.repository;

import com.edtech.backend.model.Session;
import com.edtech.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {
    List<Session> findByUserAndIsActiveTrue(User user);
    Optional<Session> findByIdAndUser(Long id, User user);
    Optional<Session> findByRefreshToken(String refreshToken);
    List<Session> findTop5ByUserOrderByLastActiveDesc(User user);
    void deleteByRefreshToken(String refreshToken);
    void deleteByUser(User user);
    long countByIsActiveTrue();
}
