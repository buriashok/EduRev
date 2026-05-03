package com.edtech.backend.service;

import com.edtech.backend.dto.CertificateResponse;
import com.edtech.backend.model.Certificate;
import com.edtech.backend.model.Course;
import com.edtech.backend.model.CourseProgress;
import com.edtech.backend.model.Lesson;
import com.edtech.backend.model.NotificationType;
import com.edtech.backend.model.User;
import com.edtech.backend.repository.CertificateRepository;
import com.edtech.backend.repository.CourseProgressRepository;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;

@Service
public class CertificateService {

    @Autowired
    private CertificateRepository certificateRepository;

    @Autowired
    private CourseProgressRepository progressRepository;

    @Autowired
    private NotificationService notificationService;

    @Value("${app.public-url:http://localhost:5173}")
    private String publicUrl;

    public Certificate issueCertificate(User user, Course course) throws Exception {
        Optional<Certificate> existing = certificateRepository.findByUserAndCourseId(user, course.getId());
        if (existing.isPresent()) {
            return existing.get();
        }

        String uniqueId = UUID.randomUUID().toString();
        String verificationUrl = publicUrl.replaceAll("/$", "") + "/verify/" + uniqueId;
        
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(verificationUrl, BarcodeFormat.QR_CODE, 200, 200);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
        String qrCodeDataUrl = "data:image/png;base64," + Base64.getEncoder().encodeToString(outputStream.toByteArray());
        
        Certificate certificate = new Certificate();
        certificate.setUniqueId(uniqueId);
        certificate.setUser(user);
        certificate.setCourse(course);
        certificate.setQrCodePath(qrCodeDataUrl);
        
        Certificate saved = certificateRepository.save(certificate);
        notificationService.createNotification(
                user,
                "Certificate Issued",
                "Your certificate for " + course.getTitle() + " is ready.",
                NotificationType.SUCCESS,
                "/certificate/" + saved.getId()
        );
        return saved;
    }

    public Certificate issueCertificateForCompletedCourse(User user, Course course) throws Exception {
        validateCourseCompleted(user, course);
        return issueCertificate(user, course);
    }

    public Optional<Certificate> verifyCertificate(String uniqueId) {
        if (uniqueId == null || uniqueId.isBlank()) {
            return Optional.empty();
        }
        return certificateRepository.findByUniqueId(uniqueId.trim());
    }

    public CertificateResponse toResponse(Certificate certificate) {
        return CertificateResponse.from(certificate, buildVerificationUrl(certificate.getUniqueId()));
    }

    public String buildVerificationUrl(String uniqueId) {
        return publicUrl.replaceAll("/$", "") + "/verify/" + uniqueId;
    }

    private void validateCourseCompleted(User user, Course course) {
        if (course.getLessons() == null || course.getLessons().isEmpty()) {
            throw new RuntimeException("This course does not have lessons to certify yet.");
        }

        if (!user.getEnrolledCourses().contains(course)) {
            throw new RuntimeException("Enroll in this course before requesting a certificate.");
        }

        CourseProgress progress = progressRepository.findByUserAndCourse(user, course)
                .orElseThrow(() -> new RuntimeException("Complete all lessons before requesting a certificate."));

        long completedCount = progress.getCompletedLessons().stream()
                .map(Lesson::getId)
                .distinct()
                .count();

        if (completedCount < course.getLessons().size()) {
            throw new RuntimeException("Complete all lessons before requesting a certificate.");
        }
    }
}
