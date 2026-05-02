package com.edtech.backend.service;

import com.edtech.backend.model.LiveClass;
import com.edtech.backend.model.NotificationType;
import com.edtech.backend.repository.LiveClassRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class LiveClassReminderService {

    private static final Logger logger = LoggerFactory.getLogger(LiveClassReminderService.class);

    @Autowired
    private LiveClassRepository liveClassRepository;

    @Autowired
    private NotificationService notificationService;

    // Run every 10 minutes
    @Scheduled(fixedRate = 600000)
    public void sendReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime soon = now.plusMinutes(30);

        logger.info("Checking for upcoming live classes starting between {} and {}", now, soon);

        // Find classes starting in the next 30 minutes that aren't completed
        List<LiveClass> upcoming = liveClassRepository.findByStartTimeBetweenAndReminderSentAtIsNull(now, soon);

        for (LiveClass lc : upcoming) {
            if (lc.isCompleted()) continue;

            logger.info("Sending reminders for class: {}", lc.getTitle());
            
            lc.getRegisteredUsers().forEach(user -> {
                notificationService.createNotification(
                    user,
                    "Live Class Starting Soon!",
                    "Your registered class '" + lc.getTitle() + "' starts at " + lc.getStartTime() + ". Get ready!",
                    NotificationType.INFO,
                    "/live-classes"
                );
            });
            lc.setReminderSentAt(now);
            liveClassRepository.save(lc);
        }
    }
}
