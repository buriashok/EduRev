package com.edtech.backend.repository;

import com.edtech.backend.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    boolean existsByStripePaymentIntentId(String stripePaymentIntentId);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(p.amount) FROM Payment p")
    java.math.BigDecimal sumTotalRevenue();

    @org.springframework.data.jpa.repository.Query("SELECT SUM(p.amount) FROM Payment p JOIN p.course c WHERE c.instructor.id = :instructorId")
    java.math.BigDecimal sumRevenueByInstructor(Long instructorId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(p) FROM Payment p JOIN p.course c WHERE c.instructor.id = :instructorId")
    long countEnrollmentsByInstructor(Long instructorId);
}
