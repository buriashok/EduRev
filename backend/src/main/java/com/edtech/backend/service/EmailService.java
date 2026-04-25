package com.edtech.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public void sendEmail(String to, String subject, String body) {
        try {
            if (mailSender == null) {
                System.out.println("Email sender not configured. Skipping...");
                System.out.println("To: " + to + "\nSubject: " + subject + "\nBody: " + body);
                return;
            }
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply@edurev.local");
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception ex) {
            System.out.println("Email delivery skipped: " + subject + " -> " + to);
            System.out.println(body);
        }
    }

    public void sendOTPEmail(String to, String otp) {
        String subject = "Your EduRev Verification Code";
        String body = "Hello,\n\nYour one-time password (OTP) for verification is: " + otp + 
                      "\n\nThis code will expire in 10 minutes.\n\nHappy Learning,\nThe EduRev Team";
        sendEmail(to, subject, body);
    }

    public void sendPasswordResetEmail(String to, String token) {
        String resetUrl = frontendUrl + "/reset-password?email=" + to + "&token=" + token;
        String subject = "Reset your EduRev password";
        String body = "Hello,\n\nUse the link below to reset your password. The link is valid for 1 hour.\n\n"
                + resetUrl
                + "\n\nIf you did not request this, you can safely ignore this email.\n\nThe EduRev Team";
        sendEmail(to, subject, body);
    }

    public void sendVerificationEmail(String to, String token) {
        String verifyUrl = frontendUrl + "/verify-email?email=" + to + "&token=" + token;
        String subject = "Verify your EduRev account";
        String body = "Hello,\n\nPlease verify your EduRev email address using the link below:\n\n"
                + verifyUrl
                + "\n\nThis link helps activate your account for sign in.\n\nThe EduRev Team";
        sendEmail(to, subject, body);
    }
}
