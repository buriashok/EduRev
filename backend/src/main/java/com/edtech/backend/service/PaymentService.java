package com.edtech.backend.service;

import com.edtech.backend.model.Course;
import com.edtech.backend.model.Payment;
import com.edtech.backend.model.User;
import com.edtech.backend.repository.CourseRepository;
import com.edtech.backend.repository.PaymentRepository;
import com.edtech.backend.repository.UserRepository;
import com.edtech.backend.model.NotificationType;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class PaymentService {

    @Value("${stripe.api.key}")
    private String stripeSecretKey;

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private NotificationService notificationService;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    @Transactional
    public Map<String, String> createPaymentIntent(Long userId, Long courseId) throws StripeException {
        User user = userRepository.findById(userId).orElseThrow();
        Course course = courseRepository.findById(courseId).orElseThrow();

        if (paymentRepository.existsByUserAndCourseAndStatus(user, course, "SUCCEEDED")
                || user.getEnrolledCourses().contains(course)) {
            throw new RuntimeException("You are already enrolled in this course.");
        }

        BigDecimal amount = course.getPrice() == null ? BigDecimal.ZERO : course.getPrice();
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            String freeIntentId = "free_" + UUID.randomUUID();
            confirmEnrollmentInternal(user, course, freeIntentId, "INR");
            Map<String, String> response = new HashMap<>();
            response.put("clientSecret", "free_enrollment");
            response.put("paymentIntentId", freeIntentId);
            return response;
        }

        if ("mock".equalsIgnoreCase(stripeSecretKey)) {
            String mockIntentId = "mock_pi_" + UUID.randomUUID();
            createPendingPayment(user, course, mockIntentId, "INR");
            Map<String, String> response = new HashMap<>();
            response.put("clientSecret", "mock_secret_" + mockIntentId);
            response.put("paymentIntentId", mockIntentId);
            return response;
        }

        // Convert BigDecimal price to cents (Stripe requirement)
        long stripeAmount = amount.multiply(new BigDecimal(100)).longValue();

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(stripeAmount)
                .setCurrency("inr")
                .putMetadata("userId", String.valueOf(userId))
                .putMetadata("courseId", String.valueOf(courseId))
                .build();

        PaymentIntent intent = PaymentIntent.create(params);
        createPendingPayment(user, course, intent.getId(), "INR");

        Map<String, String> response = new HashMap<>();
        response.put("clientSecret", intent.getClientSecret());
        response.put("paymentIntentId", intent.getId());
        return response;
    }

    @Transactional
    public void confirmEnrollment(Long userId, Long courseId, String paymentIntentId) {
        if (paymentIntentId == null || paymentIntentId.isBlank()) {
            throw new RuntimeException("Payment intent is required.");
        }

        Payment existingPayment = paymentRepository.findByStripePaymentIntentId(paymentIntentId).orElse(null);
        if (existingPayment != null && "SUCCEEDED".equals(existingPayment.getStatus())) {
            return;
        }

        User user = userRepository.findById(userId).orElseThrow();
        Course course = courseRepository.findById(courseId).orElseThrow();

        if (existingPayment != null
                && (!existingPayment.getUser().getId().equals(userId) || !existingPayment.getCourse().getId().equals(courseId))) {
            throw new RuntimeException("Payment intent does not match this enrollment.");
        }

        if (!"mock".equalsIgnoreCase(stripeSecretKey) && !paymentIntentId.startsWith("free_")) {
            try {
                PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);
                if (!"succeeded".equals(intent.getStatus())) {
                    throw new RuntimeException("Payment has not succeeded yet.");
                }
            } catch (StripeException ex) {
                throw new RuntimeException("Unable to verify payment with Stripe.");
            }
        }

        confirmEnrollmentInternal(user, course, paymentIntentId, "INR");
    }

    @Transactional
    public void markPaymentFailed(String paymentIntentId) {
        if (paymentIntentId == null || paymentIntentId.isBlank()) {
            return;
        }

        paymentRepository.findByStripePaymentIntentId(paymentIntentId).ifPresent(payment -> {
            payment.setStatus("FAILED");
            paymentRepository.save(payment);
            notificationService.createNotification(
                    payment.getUser(),
                    "Payment Failed",
                    "Your payment for " + payment.getCourse().getTitle() + " could not be completed.",
                    NotificationType.WARNING,
                    "/checkout"
            );
        });
    }

    private Payment createPendingPayment(User user, Course course, String paymentIntentId, String currency) {
        Payment payment = new Payment();
        payment.setUser(user);
        payment.setCourse(course);
        payment.setAmount(course.getPrice());
        payment.setCurrency(currency);
        payment.setStripePaymentIntentId(paymentIntentId);
        payment.setStatus("PENDING");
        return paymentRepository.save(payment);
    }

    private void confirmEnrollmentInternal(User user, Course course, String paymentIntentId, String currency) {
        if (!user.getEnrolledCourses().contains(course)) {
            user.getEnrolledCourses().add(course);
            userRepository.save(user);
        }

        Payment payment = paymentRepository.findByStripePaymentIntentId(paymentIntentId)
                .orElseGet(() -> {
                    Payment created = new Payment();
                    created.setUser(user);
                    created.setCourse(course);
                    created.setStripePaymentIntentId(paymentIntentId);
                    return created;
                });
            payment.setUser(user);
            payment.setCourse(course);
            payment.setAmount(course.getPrice());
            payment.setCurrency(currency);
            payment.setStatus("SUCCEEDED");
        paymentRepository.save(payment);

        notificationService.createNotification(user, "Enrollment Successful",
                "You have successfully enrolled in: " + course.getTitle() + ". Happy learning!",
                NotificationType.SUCCESS, "/learn/" + course.getId());

        if (course.getInstructor() != null) {
            notificationService.createNotification(
                    course.getInstructor(),
                    "New Student Enrollment",
                    user.getFirstName() + " " + user.getLastName() + " enrolled in " + course.getTitle() + ".",
                    NotificationType.SUCCESS,
                    "/instructor/students"
            );
        }
    }

    public String getWebhookSecret() {
        return webhookSecret;
    }
}
