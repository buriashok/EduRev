package com.edtech.backend.controller;

import com.edtech.backend.model.User;
import com.edtech.backend.repository.UserRepository;
import com.edtech.backend.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai")
public class AiChatController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.edtech.backend.repository.AiChatMessageRepository aiChatMessageRepository;

    @GetMapping("/history")
    public ResponseEntity<List<Map<String, Object>>> getChatHistory(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        User user = userRepository.findById(userPrincipal.getId()).orElseThrow();
        List<Map<String, Object>> history = aiChatMessageRepository.findByUserOrderByCreatedAtAsc(user)
                .stream()
                .map(this::toMessageDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(history);
    }

    @PostMapping("/chat")
    public ResponseEntity<?> getAiResponse(
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        String message = request.get("message");
        String context = request.get("context");

        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Message is required."));
        }

        String normalizedMessage = message.trim();
        if (normalizedMessage.length() > 1000) {
            return ResponseEntity.badRequest().body(Map.of("message", "Message must be 1000 characters or fewer."));
        }
        
        User user = userRepository.findById(userPrincipal.getId()).orElseThrow();

        // 1. Save user message
        com.edtech.backend.model.AiChatMessage userMsg = new com.edtech.backend.model.AiChatMessage();
        userMsg.setUser(user);
        userMsg.setContent(normalizedMessage);
        userMsg.setFromUser(true);
        userMsg.setContext(context);
        aiChatMessageRepository.save(userMsg);
        
        // 2. Generate response
        String response = generateSmartResponse(normalizedMessage, context, user);

        // 3. Save bot response
        com.edtech.backend.model.AiChatMessage botMsg = new com.edtech.backend.model.AiChatMessage();
        botMsg.setUser(user);
        botMsg.setContent(response);
        botMsg.setFromUser(false);
        botMsg.setContext(context);
        aiChatMessageRepository.save(botMsg);
        
        Map<String, Object> result = new HashMap<>();
        result.put("response", response);
        result.put("sender", "EduBot");
        result.put("timestamp", java.time.LocalDateTime.now());
        
        return ResponseEntity.ok(result);
    }

    private Map<String, Object> toMessageDto(com.edtech.backend.model.AiChatMessage message) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", message.getId());
        dto.put("content", message.getContent());
        dto.put("fromUser", message.isFromUser());
        dto.put("context", message.getContext());
        dto.put("createdAt", message.getCreatedAt());
        return dto;
    }

    private String generateSmartResponse(String message, String context, User user) {
        String normalized = message.toLowerCase();
        String firstName = user.getFirstName() == null ? "there" : user.getFirstName();
        String role = user.getRole() == null ? "STUDENT" : user.getRole().name();
        
        if (normalized.contains("hello") || normalized.contains("hi")) {
            return "Hi " + firstName + "! I'm EduBot. I can help with learning plans, course questions, quiz preparation, live-session planning, and role-specific platform tasks.";
        }
        
        if (normalized.contains("summarize") || normalized.contains("summary")) {
            if (context != null && !context.isEmpty()) {
                return "For " + context + ", focus your summary on three parts: the core concept, the practical workflow, and the common mistakes. If you paste lesson text, I can turn it into a tighter study note.";
            }
            return "I'd be happy to summarize! Could you please select a lesson first so I have the right context?";
        }
        
        if (normalized.contains("help") || normalized.contains("explain")) {
            return "Start with the smallest unclear term, then connect it to an example. In " + (context != null ? context : "your current page") + ", tell me the exact concept or question and I will break it into steps.";
        }

        if (normalized.contains("quiz")) {
            return "For quiz prep, make a two-column review: facts you can recall instantly and topics that still need examples. Practice the weak column first, then retry under a short timer.";
        }

        if ("INSTRUCTOR".equals(role)) {
            return "As an instructor, a practical next step is to turn this into a short objective, one example, one checkpoint question, and one follow-up activity. I can draft that structure if you share the topic.";
        }

        if ("ADMIN".equals(role)) {
            return "From an admin view, check the affected users, course state, recent audit activity, and any notification impact. I can help convert this into an operations checklist.";
        }

        return "Good question, " + firstName + ". In " + (context != null ? context : "your course") + ", the best approach is to connect the idea to a concrete example, test yourself once, then revisit any missed step.";
    }
}
