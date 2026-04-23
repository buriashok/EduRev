import React, { useState } from 'react';
import { CheckCircle2, XCircle, ChevronRight, RotateCcw } from 'lucide-react';
import styles from './Quiz.module.css';

const MOCK_QUIZ = {
  title: "Java Fundamentals Quiz",
  questions: [
    { text: "What is the size of 'int' in Java?", options: ["8-bit", "16-bit", "32-bit", "64-bit"], correct: 2 },
    { text: "Which keyword is used to inherit a class?", options: ["implements", "extends", "inherits", "using"], correct: 1 },
    { text: "Is Java a pure object-oriented language?", options: ["Yes", "No"], correct: 1 }
  ]
};

const Quiz = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const handleNext = () => {
    if (selectedOption === MOCK_QUIZ.questions[currentStep].correct) {
      setScore(score + 1);
    }

    if (currentStep + 1 < MOCK_QUIZ.questions.length) {
      setCurrentStep(currentStep + 1);
      setSelectedOption(null);
    } else {
      setIsFinished(true);
    }
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setSelectedOption(null);
    setScore(0);
    setIsFinished(false);
  };

  if (isFinished) {
    return (
      <div className={styles.quizPage}>
        <div className={`glass-panel ${styles.quizCard} ${styles.resultCard} animate-fade-in`}>
          <h2 style={{fontSize: '2rem'}}>Quiz Completed!</h2>
          <div className={styles.score}>{Math.round((score / MOCK_QUIZ.questions.length) * 100)}%</div>
          <p style={{color: 'var(--color-text-muted)'}}>You got {score} out of {MOCK_QUIZ.questions.length} questions correct.</p>
          <div style={{display: 'flex', gap: '1rem', justifyContent: 'center'}}>
            <button className="btn-secondary" onClick={resetQuiz} style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <RotateCcw size={18} /> Retake
            </button>
            <button className="btn-primary" onClick={() => window.history.back()}>Back to Course</button>
          </div>
        </div>
      </div>
    );
  }

  const question = MOCK_QUIZ.questions[currentStep];

  return (
    <div className={styles.quizPage}>
      <div className={`glass-panel ${styles.quizCard} animate-fade-in`}>
        <div className={styles.progress}>
          <div className={styles.progressBar} style={{width: `${((currentStep + 1) / MOCK_QUIZ.questions.length) * 100}%`}}></div>
        </div>
        
        <div style={{textAlign: 'center'}}>
          <p style={{color: 'var(--color-primary)', fontWeight: '600', marginBottom: '0.5rem'}}>Question {currentStep + 1} of {MOCK_QUIZ.questions.length}</p>
          <h2 className={styles.questionText}>{question.text}</h2>
        </div>

        <div className={styles.optionsGrid}>
          {question.options.map((option, index) => (
            <button 
              key={index} 
              className={`${styles.optionBtn} ${selectedOption === index ? styles.selected : ''}`}
              onClick={() => setSelectedOption(index)}
            >
              {option}
            </button>
          ))}
        </div>

        <button 
          className="btn-primary" 
          disabled={selectedOption === null}
          onClick={handleNext}
          style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: 'var(--space-md)'}}
        >
          {currentStep === MOCK_QUIZ.questions.length - 1 ? 'Finish Quiz' : 'Next Question'} <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Quiz;
