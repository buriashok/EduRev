package com.edtech.backend.service;

import com.edtech.backend.model.AuditLog;
import com.edtech.backend.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private HttpServletRequest request;

    public void log(Long userId, String action, String targetId, String details) {
        AuditLog log = new AuditLog();
        log.setUserId(userId);
        log.setAction(action);
        log.setTargetId(targetId);
        log.setDetails(details);
        log.setIpAddress(request.getRemoteAddr());
        log.setTimestamp(LocalDateTime.now());
        auditLogRepository.save(log);
    }
}
