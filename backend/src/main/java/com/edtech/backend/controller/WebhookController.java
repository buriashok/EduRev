package com.edtech.backend.controller;

import com.edtech.backend.service.PaymentService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/webhooks")
public class WebhookController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/stripe")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader
    ) {
        String endpointSecret = paymentService.getWebhookSecret();
        Event event;

        try {
            if ("whsec_mock_secret".equals(endpointSecret)) {
                // For development with mock secret, we can skip signature verification
                // In production, this should NEVER happen with a real whsec_
                System.out.println("WARNING: Skipping Stripe signature verification in MOCK mode");
                event = com.stripe.net.ApiResource.GSON.fromJson(payload, Event.class);
            } else {
                event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
            }
        } catch (SignatureVerificationException e) {
            System.err.println("Webhook signature verification failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        } catch (Exception e) {
            System.err.println("Error parsing webhook payload: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid payload");
        }

        // Handle the event
        switch (event.getType()) {
            case "payment_intent.succeeded":
                PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElseThrow();
                handlePaymentSuccess(paymentIntent);
                break;
            case "payment_intent.payment_failed":
                // Log failure or notify user
                System.out.println("Payment failed for intent: " + event.getId());
                break;
            default:
                System.out.println("Unhandled event type: " + event.getType());
        }

        return ResponseEntity.ok("Success");
    }

    private void handlePaymentSuccess(PaymentIntent paymentIntent) {
        Map<String, String> metadata = paymentIntent.getMetadata();
        if (metadata != null && metadata.containsKey("userId") && metadata.containsKey("courseId")) {
            Long userId = Long.parseLong(metadata.get("userId"));
            Long courseId = Long.parseLong(metadata.get("courseId"));
            paymentService.confirmEnrollment(userId, courseId, paymentIntent.getId());
        } else {
            System.err.println("Missing metadata in PaymentIntent: " + paymentIntent.getId());
        }
    }
}
