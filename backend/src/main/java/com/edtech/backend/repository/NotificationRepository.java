package com.edtech.backend.repository;

import com.edtech.backend.model.Notification;
import com.edtech.backend.model.NotificationType;
import com.edtech.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    Page<Notification> findByUserAndTypeOrderByCreatedAtDesc(User user, NotificationType type, Pageable pageable);
    Page<Notification> findByUserAndIsReadOrderByCreatedAtDesc(User user, boolean isRead, Pageable pageable);
    Page<Notification> findByUserAndTypeAndIsReadOrderByCreatedAtDesc(User user, NotificationType type, boolean isRead, Pageable pageable);
    long countByUserAndIsRead(User user, boolean isRead);
    Optional<Notification> findByIdAndUser(Long id, User user);
    long deleteByUserAndIsRead(User user, boolean isRead);
}
