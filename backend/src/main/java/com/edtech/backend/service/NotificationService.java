package com.edtech.backend.service;

import com.edtech.backend.model.Notification;
import com.edtech.backend.model.NotificationType;
import com.edtech.backend.model.User;
import com.edtech.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Transactional
    public Notification createNotification(User user, String title, String message, NotificationType type, String link) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setLink(link);
        return notificationRepository.save(notification);
    }

    public Page<Notification> getUserNotifications(User user, Pageable pageable) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user, pageable);
    }

    public Page<Notification> getUserNotifications(User user, NotificationType type, Boolean unreadOnly, Pageable pageable) {
        boolean unread = Boolean.TRUE.equals(unreadOnly);

        if (type != null && unreadOnly != null) {
            return notificationRepository.findByUserAndTypeAndIsReadOrderByCreatedAtDesc(user, type, !unread, pageable);
        }

        if (type != null) {
            return notificationRepository.findByUserAndTypeOrderByCreatedAtDesc(user, type, pageable);
        }

        if (unreadOnly != null) {
            return notificationRepository.findByUserAndIsReadOrderByCreatedAtDesc(user, !unread, pageable);
        }

        return getUserNotifications(user, pageable);
    }

    public long getUnreadCount(User user) {
        return notificationRepository.countByUserAndIsRead(user, false);
    }

    @Transactional
    public void markAsRead(Long id, User user) {
        notificationRepository.findByIdAndUser(id, user).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    @Transactional
    public void markAllAsRead(User user) {
        Page<Notification> unread = notificationRepository.findByUserOrderByCreatedAtDesc(user, Pageable.unpaged());
        unread.getContent().forEach(n -> {
            if (!n.isRead()) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        });
    }

    @Transactional
    public void deleteNotification(Long id, User user) {
        notificationRepository.findByIdAndUser(id, user).ifPresent(notificationRepository::delete);
    }

    @Transactional
    public long deleteReadNotifications(User user) {
        return notificationRepository.deleteByUserAndIsRead(user, true);
    }
}
