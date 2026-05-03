package com.edtech.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "stripe_event_logs")
public class StripeEventLog {

    @Id
    private String eventId;

    @Column(nullable = false)
    private String eventType;

    @Column(nullable = false)
    private String status; // PROCESSED, FAILED

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    private LocalDateTime processedAt;

    public StripeEventLog() {
    }

    public StripeEventLog(String eventId, String eventType, String status) {
        this.eventId = eventId;
        this.eventType = eventType;
        this.status = status;
        this.processedAt = LocalDateTime.now();
    }

    // Getters and setters
    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public LocalDateTime getProcessedAt() {
        return processedAt;
    }

    public void setProcessedAt(LocalDateTime processedAt) {
        this.processedAt = processedAt;
    }
}
