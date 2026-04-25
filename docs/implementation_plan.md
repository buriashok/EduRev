# Implementation Plan: Interactive Quiz System

The next major feature is the **Quiz Assessment System**. This will allow instructors to test student knowledge after lessons and allow students to track their mastery.

## User Review Required
> [!NOTE]
> I will be adding a "Quiz" section to the course player. Should quizzes be mandatory to unlock the next lesson, or optional? (Default: Optional but tracked).

## Proposed Changes

### 1. Backend: Assessment API
#### [NEW] [QuizController.java](file:///x:/Project24/EduRev/backend/src/main/java/com/edtech/backend/controller/QuizController.java)
- `GET /api/quizzes/lesson/{lessonId}`: Fetch quiz for a specific lesson.
- `POST /api/quizzes/{quizId}/submit`: Grade a student's submission and return the score.

#### [NEW] [QuizResult.java](file:///x:/Project24/EduRev/backend/src/main/java/com/edtech/backend/model/QuizResult.java)
- New entity to store student scores, attempts, and completion status.

### 2. Frontend: Interactive Quiz UI
#### [MODIFY] [Quiz.jsx](file:///x:/Project24/EduRev/frontend/src/pages/Quiz/Quiz.jsx)
- Transform the placeholder into a premium, interactive component.
- Features:
    - **Dynamic Questions**: Multi-choice selection.
    - **Progress Indicator**: "Question 3 of 10".
    - **Score Summary**: Modern results screen with confetti (if score > 80%).
    - **Integration**: Links back to the course player upon completion.

#### [MODIFY] [CourseView.jsx](file:///x:/Project24/EduRev/frontend/src/pages/Courses/CourseView.jsx)
- Add a "Take Quiz" button at the end of lessons that have a quiz.

### 3. Data Seeding
#### [MODIFY] [DataInitializer.java](file:///x:/Project24/EduRev/backend/src/main/java/com/edtech/backend/config/DataInitializer.java)
- Add sample quiz questions to the "Mastering Full-Stack Java" course to make testing easier.

## Verification Plan

### Manual Verification
1.  Navigate to a lesson with a quiz.
2.  Complete the quiz and verify the score calculation.
3.  Ensure the "Quiz Result" is saved and visible (mock or real).
