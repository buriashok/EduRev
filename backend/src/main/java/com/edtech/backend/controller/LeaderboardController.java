package com.edtech.backend.controller;

import com.edtech.backend.model.User;
import com.edtech.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getLeaderboard() {
        // Return top 20 users by XP
        List<User> topUsers = userRepository.findAllByOrderByXpDesc();
        
        List<Map<String, Object>> result = topUsers.stream()
            .limit(20)
            .map(user -> {
                Map<String, Object> map = new HashMap<>();
                map.put("name", user.getFirstName() + " " + user.getLastName());
                map.put("xp", user.getXp());
                map.put("level", user.getLevel());
                map.put("role", user.getRole());
                return map;
            })
            .collect(Collectors.toList());
            
        return ResponseEntity.ok(result);
    }
}
