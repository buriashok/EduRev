# Project Walkthrough: EduRev EdTech Platform

This walkthrough summarizes the state of the platform after our intensive development sprint.

## 🔑 Authentication Flow (OTP)
We implemented a secure, modern authentication system:
- **Registration**: Users choose a role (Student/Instructor).
- **Verification**: A 6-digit OTP is generated and printed to the server console.
- **Login**: High-privileged accounts (Instructors/Admins) require an additional OTP step for security.

## 💳 Enrollment & Payments (Mock Mode)
To ensure development isn't blocked by external API keys, we built a hybrid system:
- **UI**: Uses Stripe Elements for a professional credit card input.
- **Backend**: Detects if the API key is "mock" and bypasses real charges, allowing instant enrollment for testing.

## 🎓 Learning Experience
- **Dashboard**: A personalized view showing enrolled courses and progress bars.
- **Course Player**: A side-by-side view with lesson content and completion tracking.
- **Interactive Quizzes**: A dedicated assessment UI that grades answers in real-time and saves the student's score to the database.

## 🛠️ Tech Stack Recap
- **Frontend**: React (Vite) + CSS Modules + Lucide Icons.
- **Backend**: Spring Boot 3 + Spring Security 6 (JWT) + JPA.
- **Database**: PostgreSQL 16 (Running on port 5433).

---
*Developed with ❤️ by Antigravity*
