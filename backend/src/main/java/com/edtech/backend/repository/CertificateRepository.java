package com.edtech.backend.repository;

import com.edtech.backend.model.Certificate;
import com.edtech.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CertificateRepository extends JpaRepository<Certificate, Long> {
    List<Certificate> findByUser(User user);
    Optional<Certificate> findByUserAndCourseId(User user, Long courseId);
}
