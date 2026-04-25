package com.edtech.backend.controller;

import com.edtech.backend.model.LiveClass;
import com.edtech.backend.model.User;
import com.edtech.backend.repository.LiveClassRepository;
import com.edtech.backend.repository.UserRepository;
import com.edtech.backend.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/live-classes")
public class LiveClassController {

    @Autowired
    private LiveClassRepository liveClassRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/upcoming")
    public List<LiveClass> getUpcomingClasses() {
        return liveClassRepository.findByStartTimeAfterOrderByStartTimeAsc(LocalDateTime.now());
    }

    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<LiveClass> scheduleClass(@RequestBody LiveClass liveClass, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User instructor = userRepository.findById(userPrincipal.getId()).orElseThrow();
        liveClass.setInstructor(instructor);
        return ResponseEntity.ok(liveClassRepository.save(liveClass));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LiveClass> getClassById(@PathVariable Long id) {
        return liveClassRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<?> joinLiveClass(@PathVariable Long id) {
        return liveClassRepository.findById(id)
                .map(liveClass -> ResponseEntity.ok().body(java.util.Map.of(
                        "meetingLink", liveClass.getMeetingLink(),
                        "title", liveClass.getTitle(),
                        "startsAt", liveClass.getStartTime()
                )))
                .orElse(ResponseEntity.notFound().build());
    }
}
