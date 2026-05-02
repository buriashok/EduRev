package com.edtech.backend.controller;

import com.edtech.backend.model.LiveClass;
import com.edtech.backend.model.NotificationType;
import com.edtech.backend.model.User;
import com.edtech.backend.repository.LiveClassRepository;
import com.edtech.backend.repository.UserRepository;
import com.edtech.backend.security.UserPrincipal;
import com.edtech.backend.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/live-classes")
public class LiveClassController {

    @Autowired
    private LiveClassRepository liveClassRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/upcoming")
    public List<LiveClass> getUpcomingClasses() {
        return liveClassRepository.findByStartTimeAfterOrderByStartTimeAsc(LocalDateTime.now());
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public List<LiveClass> getMyClasses(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return liveClassRepository.findAll();
        }
        return liveClassRepository.findByInstructorIdOrderByStartTimeDesc(userPrincipal.getId());
    }

    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<LiveClass> scheduleClass(@RequestBody LiveClass liveClass, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User instructor = userRepository.findById(userPrincipal.getId()).orElseThrow();
        liveClass.setInstructor(instructor);
        if (liveClass.getEndTime() == null && liveClass.getStartTime() != null) {
            liveClass.setEndTime(liveClass.getStartTime().plusHours(1));
        }
        LiveClass saved = liveClassRepository.save(liveClass);
        notificationService.createNotification(
                instructor,
                "Live Session Scheduled",
                "Your live session \"" + saved.getTitle() + "\" has been scheduled.",
                NotificationType.SUCCESS,
                "/instructor/live-sessions"
        );
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/register")
    public ResponseEntity<?> registerForClass(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return liveClassRepository.findById(id).map(liveClass -> {
            User user = userRepository.findById(userPrincipal.getId()).orElseThrow();
            
            if (liveClass.getRegisteredUsers().size() >= liveClass.getMaxCapacity()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Class is at maximum capacity"));
            }

            boolean alreadyRegistered = liveClass.getRegisteredUsers().stream()
                    .anyMatch(registeredUser -> registeredUser.getId().equals(user.getId()));
            if (alreadyRegistered) {
                return ResponseEntity.ok(Map.of("message", "Already registered"));
            }
            
            liveClass.getRegisteredUsers().add(user);
            liveClassRepository.save(liveClass);
            
            notificationService.createNotification(
                user,
                "Registered for " + liveClass.getTitle(),
                "You have successfully registered for the live class. We will remind you before it starts!",
                NotificationType.INFO,
                "/live-classes"
            );

            if (liveClass.getInstructor() != null) {
                notificationService.createNotification(
                    liveClass.getInstructor(),
                    "New Live Session Registration",
                    user.getFirstName() + " " + user.getLastName() + " registered for " + liveClass.getTitle() + ".",
                    NotificationType.INFO,
                    "/instructor/live-sessions"
                );
            }
            
            return ResponseEntity.ok(Map.of("message", "Successfully registered"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/registrations")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getRegistrations(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return liveClassRepository.findById(id).map(liveClass -> {
            if (!liveClass.getInstructor().getId().equals(userPrincipal.getId()) && 
                !userPrincipal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                return ResponseEntity.status(403).build();
            }
            return ResponseEntity.ok(liveClass.getRegisteredUsers());
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/complete")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> completeClass(@PathVariable Long id, @RequestBody Map<String, String> payload, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return liveClassRepository.findById(id).map(liveClass -> {
            if (!liveClass.getInstructor().getId().equals(userPrincipal.getId()) && 
                !userPrincipal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                return ResponseEntity.status(403).build();
            }
            
            liveClass.setCompleted(true);
            liveClass.setRecordingUrl(payload.get("recordingUrl"));
            liveClassRepository.save(liveClass);
            
            liveClass.getRegisteredUsers().forEach(user -> {
                notificationService.createNotification(
                    user,
                    "Recording Available: " + liveClass.getTitle(),
                    "The recording for the live class you registered for is now available to watch.",
                    NotificationType.INFO,
                    "/live-classes"
                );
            });
            
            return ResponseEntity.ok(liveClass);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LiveClass> getClassById(@PathVariable Long id) {
        return liveClassRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<?> joinLiveClass(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return liveClassRepository.findById(id)
                .map(liveClass -> {
                    boolean isInstructor = liveClass.getInstructor() != null
                            && liveClass.getInstructor().getId().equals(userPrincipal.getId());
                    boolean isAdmin = userPrincipal.getAuthorities().stream()
                            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
                    boolean isRegistered = liveClass.getRegisteredUsers().stream()
                            .anyMatch(user -> user.getId().equals(userPrincipal.getId()));

                    if (!isInstructor && !isAdmin && !isRegistered) {
                        return ResponseEntity.status(403).body(Map.of("message", "Register for this live class before joining."));
                    }

                    return ResponseEntity.ok().body(Map.of(
                        "meetingLink", liveClass.getMeetingLink(),
                        "title", liveClass.getTitle(),
                        "startsAt", liveClass.getStartTime(),
                        "recordingUrl", liveClass.getRecordingUrl() != null ? liveClass.getRecordingUrl() : ""
                    ));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
