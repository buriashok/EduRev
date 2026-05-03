package com.edtech.backend.dto;

import com.edtech.backend.model.Certificate;

import java.time.LocalDateTime;

public class CertificateResponse {
    private Long id;
    private String uniqueId;
    private LocalDateTime issuedAt;
    private String qrCodePath;
    private String verificationUrl;
    private Long courseId;
    private String courseTitle;
    private String studentName;
    private String instructorName;
    private boolean valid;

    public static CertificateResponse from(Certificate certificate, String verificationUrl) {
        CertificateResponse response = new CertificateResponse();
        response.setId(certificate.getId());
        response.setUniqueId(certificate.getUniqueId());
        response.setIssuedAt(certificate.getIssuedAt());
        response.setQrCodePath(certificate.getQrCodePath());
        response.setVerificationUrl(verificationUrl);
        response.setCourseId(certificate.getCourse().getId());
        response.setCourseTitle(certificate.getCourse().getTitle());
        response.setStudentName(certificate.getUser().getFirstName() + " " + certificate.getUser().getLastName());
        response.setInstructorName(certificate.getCourse().getInstructor().getFirstName() + " " + certificate.getCourse().getInstructor().getLastName());
        response.setValid(true);
        return response;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUniqueId() { return uniqueId; }
    public void setUniqueId(String uniqueId) { this.uniqueId = uniqueId; }
    public LocalDateTime getIssuedAt() { return issuedAt; }
    public void setIssuedAt(LocalDateTime issuedAt) { this.issuedAt = issuedAt; }
    public String getQrCodePath() { return qrCodePath; }
    public void setQrCodePath(String qrCodePath) { this.qrCodePath = qrCodePath; }
    public String getVerificationUrl() { return verificationUrl; }
    public void setVerificationUrl(String verificationUrl) { this.verificationUrl = verificationUrl; }
    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
    public String getCourseTitle() { return courseTitle; }
    public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public String getInstructorName() { return instructorName; }
    public void setInstructorName(String instructorName) { this.instructorName = instructorName; }
    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }
}
