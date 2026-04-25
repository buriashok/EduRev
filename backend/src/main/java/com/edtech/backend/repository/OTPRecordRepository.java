package com.edtech.backend.repository;

import com.edtech.backend.model.OTPRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OTPRecordRepository extends JpaRepository<OTPRecord, Long> {
    Optional<OTPRecord> findByEmailAndOtpCodeAndIsUsedFalse(String email, String otpCode);
    Optional<OTPRecord> findTopByEmailAndPurposeOrderByExpiresAtDesc(String email, OTPRecord.OTPPurpose purpose);
    Optional<OTPRecord> findByEmailAndPurpose(String email, OTPRecord.OTPPurpose purpose);
    void deleteByEmail(String email);
}
