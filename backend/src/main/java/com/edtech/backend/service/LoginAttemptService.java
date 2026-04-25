package com.edtech.backend.service;

import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {

    private static final int MAX_ATTEMPTS = 5;
    private static final Duration WINDOW = Duration.ofMinutes(15);

    private final Map<String, List<LocalDateTime>> failedAttempts = new ConcurrentHashMap<>();

    public boolean isBlocked(String key) {
        List<LocalDateTime> attempts = prune(key);
        return attempts.size() >= MAX_ATTEMPTS;
    }

    public void recordFailure(String key) {
        List<LocalDateTime> attempts = failedAttempts.computeIfAbsent(key, unused -> new ArrayList<>());
        attempts.add(LocalDateTime.now());
        prune(key);
    }

    public void clearFailures(String key) {
        failedAttempts.remove(key);
    }

    private List<LocalDateTime> prune(String key) {
        List<LocalDateTime> attempts = failedAttempts.computeIfAbsent(key, unused -> new ArrayList<>());
        LocalDateTime threshold = LocalDateTime.now().minus(WINDOW);
        attempts.removeIf(timestamp -> timestamp.isBefore(threshold));
        return attempts;
    }
}
