package com.edtech.backend.repository;

import com.edtech.backend.model.Payment;
import com.edtech.backend.model.Course;
import com.edtech.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    boolean existsByStripePaymentIntentId(String stripePaymentIntentId);
    java.util.Optional<Payment> findByStripePaymentIntentId(String stripePaymentIntentId);
    boolean existsByUserAndCourseAndStatus(User user, Course course, String status);
    java.util.List<Payment> findByStatus(String status);
    java.util.Optional<Payment> findTopByUserAndCourseOrderByCreatedAtDesc(User user, Course course);
    java.util.List<Payment> findByUserOrderByCreatedAtDesc(User user);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = 'SUCCEEDED'")
    java.math.BigDecimal sumTotalSucceededRevenue();

    @org.springframework.data.jpa.repository.Query("SELECT SUM(p.amount) FROM Payment p JOIN p.course c WHERE c.instructor.id = :instructorId AND p.status = 'SUCCEEDED'")
    java.math.BigDecimal sumSucceededRevenueByInstructor(Long instructorId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(p) FROM Payment p JOIN p.course c WHERE c.instructor.id = :instructorId AND p.status = 'SUCCEEDED'")
    long countSucceededEnrollmentsByInstructor(Long instructorId);
}
