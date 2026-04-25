package com.edtech.backend.controller;

import com.edtech.backend.security.UserPrincipal;
import com.edtech.backend.service.PaymentService;
import com.stripe.exception.StripeException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/create-intent/{courseId}")
    public ResponseEntity<?> createPaymentIntent(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long courseId
    ) throws StripeException {
        return ResponseEntity.ok(paymentService.createPaymentIntent(userPrincipal.getId(), courseId));
    }

    @PostMapping("/confirm/{courseId}")
    public ResponseEntity<?> confirmPayment(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long courseId,
            @RequestBody Map<String, String> payload
    ) {
        String paymentIntentId = payload.get("paymentIntentId");
        paymentService.confirmEnrollment(userPrincipal.getId(), courseId, paymentIntentId);
        return ResponseEntity.ok(Map.of("message", "Enrollment confirmed"));
    }
}
