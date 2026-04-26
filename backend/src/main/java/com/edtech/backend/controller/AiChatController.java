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
import java.util.ArrayList;

@RestController
@RequestMapping("/api/ai")
public class AiChatController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.edtech.backend.repository.AiChatMessageRepository aiChatMessageRepository;

    @GetMapping("/history")
    public ResponseEntity<List<com.edtech.backend.model.AiChatMessage>> getChatHistory(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        User user = userRepository.findById(userPrincipal.getId()).orElseThrow();
        return ResponseEntity.ok(aiChatMessageRepository.findByUserOrderByCreatedAtAsc(user));
    }

    @PostMapping("/chat")
    public ResponseEntity<?> getAiResponse(
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        String message = request.get("message");
        String context = request.get("context");
        
        User user = userRepository.findById(userPrincipal.getId()).orElseThrow();

        // 1. Save user message
        com.edtech.backend.model.AiChatMessage userMsg = new com.edtech.backend.model.AiChatMessage();
        userMsg.setUser(user);
        userMsg.setContent(message);
        userMsg.setFromUser(true);
        userMsg.setContext(context);
        aiChatMessageRepository.save(userMsg);
        
        // 2. Generate response
        String response = generateSmartResponse(message, context, user.getFirstName());

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

    private String generateSmartResponse(String message, String context, String userName) {
        message = message.toLowerCase();
        
        if (message.contains("hello") || message.contains("hi")) {
            return "Hi " + userName + "! I'm EduBot, your personal learning assistant. How can I help you master your current course today?";
        }
        
        if (message.contains("summarize") || message.contains("summary")) {
            if (context != null && !context.isEmpty()) {
                return "Based on your current lesson, the key takeaways are: \n1. Fundamental concepts of the topic.\n2. Best practices for implementation.\n3. Common pitfalls to avoid.\n\nWould you like me to dive deeper into any of these points?";
            }
            return "I'd be happy to summarize! Could you please select a lesson first so I have the right context?";
        }
        
        if (message.contains("help") || message.contains("explain")) {
            return "Of course! I'm scanning the lesson content for '" + (context != null ? context : "your course") + "'. \n\nTypically, this area involves understanding core architecture and logic flow. Is there a specific line of code or concept that's confusing?";
        }

        if (message.contains("quiz")) {
            return "Feeling ready for the quiz? Remember to review the diagrams in the lesson body first. They usually contain the trickiest answers!";
        }

        return "That's a great question, " + userName + ". In the context of " + (context != null ? context : "Computer Science") + ", this often relates to system efficiency and scalability. Should I explain the theory behind it or show you a code example?";
    }
}
