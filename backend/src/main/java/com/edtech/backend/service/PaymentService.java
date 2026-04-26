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

        if ("mock".equalsIgnoreCase(stripeSecretKey)) {
            System.out.println("MOCK PAYMENT: Generating dummy secret for Course " + courseId);
            Map<String, String> response = new HashMap<>();
            response.put("clientSecret", "mock_secret_" + System.currentTimeMillis());
            return response;
        }

        // Convert BigDecimal price to cents (Stripe requirement)
        long amount = course.getPrice().multiply(new BigDecimal(100)).longValue();

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amount)
                .setCurrency("inr")
                .putMetadata("userId", String.valueOf(userId))
                .putMetadata("courseId", String.valueOf(courseId))
                .build();

        PaymentIntent intent = PaymentIntent.create(params);

        Map<String, String> response = new HashMap<>();
        response.put("clientSecret", intent.getClientSecret());
        return response;
    }

    @Transactional
    public void confirmEnrollment(Long userId, Long courseId, String paymentIntentId) {
        if (paymentRepository.existsByStripePaymentIntentId(paymentIntentId)) {
            System.out.println("Payment already processed for intent: " + paymentIntentId);
            return;
        }

        User user = userRepository.findById(userId).orElseThrow();
        Course course = courseRepository.findById(courseId).orElseThrow();

        if (!user.getEnrolledCourses().contains(course)) {
            user.getEnrolledCourses().add(course);
            userRepository.save(user);

            Payment payment = new Payment();
            payment.setUser(user);
            payment.setCourse(course);
            payment.setAmount(course.getPrice());
            payment.setStripePaymentIntentId(paymentIntentId);
            payment.setStatus("SUCCEEDED");
            paymentRepository.save(payment);

            notificationService.createNotification(user, "Enrollment Successful", 
                "You have successfully enrolled in: " + course.getTitle() + ". Happy learning!", 
                NotificationType.SUCCESS, "/course/" + course.getId());
        }
    }

    public String getWebhookSecret() {
        return webhookSecret;
    }
}
