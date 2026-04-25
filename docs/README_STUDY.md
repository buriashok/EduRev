# EduRev Project: Study Material & Implementation Guide

Welcome! This folder contains all the architectural plans, implementation steps, and walkthroughs we've created during the development of the EduRev platform. Use these to understand the design decisions and technical flows.

## 📂 Folder Structure

- **`implementation_plan.md`**: The technical roadmap for each major feature (Auth, Postgres, Quizzes, etc.).
- **`task.md`**: The live checklist tracking our progress.
- **`walkthrough.md`**: A summary of completed features with details on how they work.

## 🎓 Key Learnings So Far

### 1. Database Migration (Postgres)
We moved from H2 (in-memory) to PostgreSQL for persistence. Key concepts:
- **JDBC URL**: `jdbc:postgresql://localhost:5433/edtech`
- **DDL-Auto**: Set to `update` so Hibernate creates tables automatically.

### 2. OTP Authentication
Instead of simple links, we use 6-digit One-Time Passwords.
- **Backend**: `OTPService` generates and stores codes with expiration.
- **Mock Mode**: Since real emails aren't configured, codes are printed to the terminal.

### 3. Stripe Integration (Mock Mode)
- We use Stripe Elements on the frontend.
- Since the public keys were expired, we implemented a **Mock Mode** in `PaymentService` to bypass the gateway while keeping the enrollment logic.

### 4. Learning Progress
- Tracked via `CourseProgress` and `completed_lessons` join table.
- Real-time progress updates on the dashboard using React hooks.

---
*Keep this folder as a reference for your further studies!*
