package com.edtech.backend.repository;

import com.edtech.backend.model.EduRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EduRequestRepository extends JpaRepository<EduRequest, Long> {
    List<EduRequest> findByUserId(Long userId);
}
