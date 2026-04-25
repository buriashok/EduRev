package com.edtech.backend.repository;

import com.edtech.backend.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByUserIdOrderByTimestampDesc(Long userId);
    List<AuditLog> findByTargetIdOrderByTimestampDesc(String targetId);
    List<AuditLog> findTop50ByOrderByTimestampDesc();
    void deleteByUserId(Long userId);
}
