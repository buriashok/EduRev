import { useEffect, useState } from 'react';
import { ChevronRight, RotateCcw } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { getErrorMessage, quizApi } from '../../../services/api';
import styles from './Quiz.module.css';

const fallbackQuiz = {
  title: 'Java Fundamentals Quiz',
  questions: [
    { text: "What is the size of 'int' in Java?", options: ['8-bit', '16-bit', '32-bit', '64-bit'], correctAnswerIndex: 2 },
    { text: 'Which keyword is used to inherit a class?', options: ['implements', 'extends', 'inherits', 'using'], correctAnswerIndex: 1 },
    { text: 'Is Java a pure object-oriented language?', options: ['Yes', 'No'], correctAnswerIndex: 1 },
  ],
};

const Quiz = () => {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(fallbackQuiz);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        if (quizId) {
          const response = await quizApi.getById(quizId);
          const questions = (response.data.questions || []).map((question) => ({
            ...question,
            correctAnswerIndex: question.correctAnswerIndex,
          }));

          if (questions.length) {
            setQuiz({ ...response.data, questions });
          }
        }
      } catch (error) {
        setMessage(getErrorMessage(error, 'Using a sample quiz because the requested quiz was not available.'));
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [quizId]);

  const [allAnswers, setAllAnswers] = useState([]);
  const [submissionResult, setSubmissionResult] = useState(null);

  const handleNext = async () => {
    const updatedAnswers = [...allAnswers, selectedOption];
    setAllAnswers(updatedAnswers);

    if (currentStep + 1 < quiz.questions.length) {
      setCurrentStep((value) => value + 1);
      setSelectedOption(null);
      return;
    }

    setLoading(true);
    try {
      const response = await quizApi.submit(quiz.id || quizId, updatedAnswers);
      setSubmissionResult(response.data);
      setIsFinished(true);
    } catch (error) {
      setError(getErrorMessage(error, 'Failed to submit quiz results.'));
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setSelectedOption(null);
    setScore(0);
    setIsFinished(false);
  };

  if (loading) {
    return <div className="flex-center" style={{ minHeight: '320px' }}><div className="spinner" /></div>;
  }

  if (isFinished) {
    return (
      <div className={styles.quizPage}>
        <div className={`glass-panel ${styles.quizCard} ${styles.resultCard} animate-fade-in`}>
          <h2 style={{ fontSize: '2rem' }}>{submissionResult?.passed ? 'Congratulations!' : 'Quiz completed'}</h2>
          <div className={styles.score}>
            {submissionResult ? `${Math.round((submissionResult.score / submissionResult.total) * 100)}%` : '0%'}
          </div>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
            {submissionResult?.message || `You got ${submissionResult?.score} out of ${submissionResult?.total} correct.`}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-secondary" onClick={resetQuiz}>
              <RotateCcw size={18} />
              Retake
            </button>
            <button className="btn-primary" onClick={() => window.history.back()}>Back to Course</button>
          </div>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentStep];

  return (
    <div className={styles.quizPage}>
      <div className={`glass-panel ${styles.quizCard} animate-fade-in`}>
        <div className={styles.progress}>
          <div className={styles.progressBar} style={{ width: `${((currentStep + 1) / quiz.questions.length) * 100}%` }} />
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--color-primary)', fontWeight: 600, marginBottom: '0.5rem' }}>
            {quiz.title} • Question {currentStep + 1} of {quiz.questions.length}
          </p>
          <h2 className={styles.questionText}>{question.text}</h2>
          {message && <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>{message}</p>}
        </div>

        <div className={styles.optionsGrid}>
          {question.options.map((option, index) => (
            <button
              key={option}
              className={`${styles.optionBtn} ${selectedOption === index ? styles.selected : ''}`}
              onClick={() => setSelectedOption(index)}
            >
              {option}
            </button>
          ))}
        </div>

        <button className="btn-primary" disabled={selectedOption === null} onClick={handleNext} style={{ marginTop: 'var(--space-md)' }}>
          {currentStep === quiz.questions.length - 1 ? 'Finish quiz' : 'Next question'}
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Quiz;
