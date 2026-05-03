package com.edtech.backend.repository;

import com.edtech.backend.model.StripeEventLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StripeEventLogRepository extends JpaRepository<StripeEventLog, String> {
}
