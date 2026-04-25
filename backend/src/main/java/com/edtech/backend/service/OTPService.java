package com.edtech.backend.service;

import com.edtech.backend.model.OTPRecord;
import com.edtech.backend.repository.OTPRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class OTPService {

    @Autowired
    private OTPRecordRepository otpRecordRepository;

    @Autowired
    private EmailService emailService;

    public String generateOTP(String email, OTPRecord.OTPPurpose purpose) {
        // Remove existing OTPs for this email and purpose
        otpRecordRepository.findByEmailAndPurpose(email, purpose).ifPresent(otpRecordRepository::delete);

        String otp = String.format("%06d", new Random().nextInt(999999));
        
        OTPRecord record = new OTPRecord();
        record.setEmail(email);
        record.setOtpCode(otp);
        record.setPurpose(purpose);
        record.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        
        otpRecordRepository.save(record);
        
        System.out.println("DEBUG: Generated OTP for " + email + " [" + purpose + "]: " + otp);
        
        try {
            emailService.sendOTPEmail(email, otp);
        } catch (Exception e) {
            System.err.println("Failed to send OTP email: " + e.getMessage());
        }
        
        return otp;
    }

    public boolean verifyOTP(String email, String otp, OTPRecord.OTPPurpose purpose) {
        return otpRecordRepository.findByEmailAndPurpose(email, purpose)
                .map(record -> {
                    boolean isValid = record.getOtpCode().equals(otp) && record.getExpiresAt().isAfter(LocalDateTime.now());
                    if (isValid) {
                        otpRecordRepository.delete(record);
                    }
                    return isValid;
                })
                .orElse(false);
    }
}
