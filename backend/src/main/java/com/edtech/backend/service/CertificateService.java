package com.edtech.backend.service;

import com.edtech.backend.model.Certificate;
import com.edtech.backend.model.Course;
import com.edtech.backend.model.User;
import com.edtech.backend.repository.CertificateRepository;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.file.FileSystems;
import java.nio.file.Path;
import java.util.UUID;

@Service
public class CertificateService {

    @Autowired
    private CertificateRepository certificateRepository;

    public Certificate issueCertificate(User user, Course course) throws Exception {
        String uniqueId = UUID.randomUUID().toString();
        String verificationUrl = "https://edurev.com/verify/" + uniqueId;
        
        // Generate QR Code
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(verificationUrl, BarcodeFormat.QR_CODE, 200, 200);
        
        // In a real app, save to S3 or a local storage service
        // For now, we just mock the path
        String qrCodePath = "certificates/qr-" + uniqueId + ".png";
        
        Certificate certificate = new Certificate();
        certificate.setUniqueId(uniqueId);
        certificate.setUser(user);
        certificate.setCourse(course);
        certificate.setQrCodePath(qrCodePath);
        
        return certificateRepository.save(certificate);
    }
}
