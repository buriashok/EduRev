package com.edtech.backend.repository;

import com.edtech.backend.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    boolean existsByStripePaymentIntentId(String stripePaymentIntentId);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(p.amount) FROM Payment p")
    java.math.BigDecimal sumTotalRevenue();
}
