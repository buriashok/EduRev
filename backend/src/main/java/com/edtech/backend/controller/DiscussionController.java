package com.edtech.backend.controller;

import com.edtech.backend.model.Discussion;
import com.edtech.backend.model.Message;
import com.edtech.backend.model.User;
import com.edtech.backend.repository.DiscussionRepository;
import com.edtech.backend.repository.MessageRepository;
import com.edtech.backend.repository.UserRepository;
import com.edtech.backend.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/discussions")
public class DiscussionController {

    @Autowired
    private DiscussionRepository discussionRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;
    
    @GetMapping
    public List<Discussion> getAllDiscussions() {
        return discussionRepository.findAll();
    }

    @GetMapping("/course/{courseId}")
    public List<Discussion> getDiscussionsByCourse(@PathVariable Long courseId) {
        return discussionRepository.findByCourseId(courseId);
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Discussion> createDiscussion(@RequestBody Discussion discussion, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User author = userRepository.findById(userPrincipal.getId()).orElseThrow();
        discussion.setAuthor(author);
        return ResponseEntity.ok(discussionRepository.save(discussion));
    }

    @GetMapping("/{id}/messages")
    public List<Message> getMessages(@PathVariable Long id) {
        return messageRepository.findByDiscussionIdOrderByCreatedAtAsc(id);
    }

    @PostMapping("/{id}/messages")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Message> postMessage(@PathVariable Long id, @RequestBody Message message, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return discussionRepository.findById(id).map(discussion -> {
            User author = userRepository.findById(userPrincipal.getId()).orElseThrow();
            message.setAuthor(author);
            message.setDiscussion(discussion);
            return ResponseEntity.ok(messageRepository.save(message));
        }).orElse(ResponseEntity.notFound().build());
    }
}
