package com.edtech.backend.controller;

import com.edtech.backend.service.PaymentService;
import com.edtech.backend.model.StripeEventLog;
import com.edtech.backend.repository.StripeEventLogRepository;
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

    @Autowired
    private StripeEventLogRepository stripeEventLogRepository;

    @PostMapping("/stripe")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader
    ) {
        String endpointSecret = paymentService.getWebhookSecret();
        Event event;

        try {
            if (isMockWebhookSecret(endpointSecret)) {
                event = com.stripe.net.ApiResource.GSON.fromJson(payload, Event.class);
            } else {
                if (sigHeader == null || sigHeader.isBlank()) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing Stripe signature");
                }
                event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
            }
        } catch (SignatureVerificationException e) {
            System.err.println("Webhook signature verification failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        } catch (Exception e) {
            System.err.println("Error parsing webhook payload: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid payload");
        }

        // Check Idempotency
        if (stripeEventLogRepository.existsById(event.getId())) {
            System.out.println("Idempotency hit: Event " + event.getId() + " already processed.");
            return ResponseEntity.ok("Success"); // Already processed
        }

        try {
            // Handle the event
            switch (event.getType()) {
                case "payment_intent.succeeded":
                    PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElseThrow();
                    handlePaymentSuccess(paymentIntent);
                    break;
                case "payment_intent.payment_failed":
                    PaymentIntent failedIntent = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElseThrow();
                    paymentService.markPaymentFailed(failedIntent.getId());
                    break;
                default:
                    System.out.println("Unhandled event type: " + event.getType());
            }

            // Save idempotency record
            stripeEventLogRepository.save(new StripeEventLog(event.getId(), event.getType(), "PROCESSED"));

        } catch (Exception e) {
            System.err.println("Error processing webhook logic: " + e.getMessage());
            StripeEventLog errorLog = new StripeEventLog(event.getId(), event.getType(), "FAILED");
            errorLog.setErrorMessage(e.getMessage());
            stripeEventLogRepository.save(errorLog);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing webhook");
        }

        return ResponseEntity.ok("Success");
    }

    private void handlePaymentSuccess(PaymentIntent paymentIntent) {
        Map<String, String> metadata = paymentIntent.getMetadata();
        if (metadata != null && metadata.containsKey("userId") && metadata.containsKey("courseId")) {
            try {
                Long userId = Long.parseLong(metadata.get("userId"));
                Long courseId = Long.parseLong(metadata.get("courseId"));
                paymentService.confirmWebhookEnrollment(userId, courseId, paymentIntent.getId(), paymentIntent.getCurrency());
            } catch (NumberFormatException ex) {
                System.err.println("Invalid metadata in PaymentIntent: " + paymentIntent.getId());
            }
        } else {
            System.err.println("Missing metadata in PaymentIntent: " + paymentIntent.getId());
        }
    }

    private boolean isMockWebhookSecret(String endpointSecret) {
        return endpointSecret == null
                || endpointSecret.isBlank()
                || "whsec_mock_secret".equals(endpointSecret);
    }
}
