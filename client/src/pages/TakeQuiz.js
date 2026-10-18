import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import './TakeQuiz.css';

const TakeQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const submissionId = location.state?.submissionId;

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tabSwitchWarnings, setTabSwitchWarnings] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleSubmit = useCallback(async (isCheating = false, currentSwitches = tabSwitchWarnings) => {
    if (submitting) return;
    setSubmitting(true);

    const formattedAnswers = Object.keys(answers).map((questionId) => ({
      questionId,
      answer: answers[questionId],
    }));

    try {
      await api.put(`/api/submissions/${submissionId}/submit`, {
        answers: formattedAnswers,
        tabSwitches: currentSwitches,
        isCheatingAutoSubmit: isCheating
      });
      navigate(`/results/${submissionId}`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz. Please try again.');
      setSubmitting(false);
    }
  }, [answers, submissionId, submitting, navigate, tabSwitchWarnings]);

  // Request Fullscreen
  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(() => {});
    }
  };

  // Anti-cheating & Tab switch tracking (Auto submit after 3 warnings)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchWarnings((prev) => {
          const newCount = prev + 1;
          const maxAllowed = quiz?.maxTabSwitches || 3;
          if (newCount >= maxAllowed) {
            alert(`Maximum security warnings (${maxAllowed}) exceeded! Your test is being automatically submitted.`);
            handleSubmit(true, newCount);
          } else {
            setShowWarningModal(true);
          }
          return newCount;
        });
      }
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    // Prevent Copy-Paste and Right Click during exam
    const handleContextMenu = (e) => e.preventDefault();
    const handleCopyPaste = (e) => {
      e.preventDefault();
      alert('Copy/Paste is disabled during active exam session for academic integrity.');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    document.addEventListener('cut', handleCopyPaste);

    // Warn before closing tab/window
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'You have an ongoing exam session! Progress may be lost.';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      document.removeEventListener('cut', handleCopyPaste);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [quiz, handleSubmit]);

  const fetchQuiz = async () => {
    try {
      const res = await api.get(`/api/quizzes/${id}`);
      setQuiz(res.data.data);
      setTimeLeft(res.data.data.timeLimit * 60);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!submissionId) {
      navigate(`/quizzes/${id}`);
      return;
    }
    fetchQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, submissionId, navigate]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && quiz && !loading) {
      handleSubmit(false);
    }
  }, [timeLeft, quiz, loading, handleSubmit]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleMultipleCorrectToggle = (questionId, optionText) => {
    setAnswers((prev) => {
      const current = Array.isArray(prev[questionId]) ? prev[questionId] : [];
      if (current.includes(optionText)) {
        return { ...prev, [questionId]: current.filter(t => t !== optionText) };
      } else {
        return { ...prev, [questionId]: [...current, optionText] };
      }
    });
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="loading">Initializing proctored examination room...</div>;
  }

  if (!quiz) {
    return <div className="loading">Quiz session not found</div>;
  }

  const question = quiz.questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round(((currentQuestion + 1) / quiz.questions.length) * 100);

  return (
    <div className="take-quiz" style={{ userSelect: 'none' }}>
      {/* Proctor Warnings */}
      {tabSwitchWarnings > 0 && (
        <div className="proctor-banner">
          <span>⚠️ <strong>Security Violation:</strong> Tab switch detected ({tabSwitchWarnings}/3 warnings). At 3 warnings, exam auto-submits!</span>
          {showWarningModal && (
            <button 
              className="btn btn-secondary" 
              style={{ padding: '4px 10px', fontSize: '12px' }}
              onClick={() => setShowWarningModal(false)}
            >
              Acknowledge
            </button>
          )}
        </div>
      )}

      {/* Force Fullscreen Reminder */}
      {!isFullscreen && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.15)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          color: '#fbbf24',
          padding: '10px 16px',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>🛡️ Fullscreen exam mode recommended to avoid accidental tab triggers.</span>
          <button onClick={enterFullscreen} className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '13px' }}>
            Enter Fullscreen
          </button>
        </div>
      )}

      <div className="quiz-header-bar">
        <div>
          <h2>{quiz.title}</h2>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Exam Mode Active • {quiz.questions.length} Questions {quiz.negativeMarking ? '• ⚠️ Negative Marking Active' : ''}
          </span>
        </div>
        <div className={`timer-box ${timeLeft < 120 ? 'timer-critical' : ''}`}>
          <span>⏱️</span>
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="quiz-progress-section">
        <div className="progress-track">
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
        <div className="progress-labels">
          <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
          <span>{answeredCount} Answered ({Math.round((answeredCount / quiz.questions.length) * 100)}%)</span>
        </div>
      </div>

      <div className="question-box">
        <div className="question-meta-bar">
          <span className="question-badge">
            Question #{currentQuestion + 1} • {question.questionType?.replace('-', ' ')}
          </span>
          <span className="points-badge">
            Worth: <strong>{question.points || 1} Pt(s)</strong> {question.negativeMarks ? `( -${question.negativeMarks} on wrong )` : ''}
          </span>
        </div>

        <h3 className="question-prompt">{question.questionText}</h3>

        <div className="options-container">
          {question.questionType === 'multiple-choice' && (
            question.options?.map((option, index) => {
              const isSelected = answers[question._id] === option.text;
              return (
                <div
                  key={index}
                  className={`modern-option ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleAnswerChange(question._id, option.text)}
                >
                  <div className="custom-radio">
                    <div className="custom-radio-inner" />
                  </div>
                  <span className="option-text">{option.text}</span>
                </div>
              );
            })
          )}

          {question.questionType === 'true-false' && (
            <>
              {['true', 'false'].map((val) => {
                const isSelected = String(answers[question._id]).toLowerCase() === val;
                return (
                  <div
                    key={val}
                    className={`modern-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleAnswerChange(question._id, val)}
                  >
                    <div className="custom-radio">
                      <div className="custom-radio-inner" />
                    </div>
                    <span className="option-text" style={{ textTransform: 'capitalize' }}>{val}</span>
                  </div>
                );
              })}
            </>
          )}

          {question.questionType === 'multiple-correct' && (
            question.options?.map((option, index) => {
              const userList = Array.isArray(answers[question._id]) ? answers[question._id] : [];
              const isChecked = userList.includes(option.text);
              return (
                <div
                  key={index}
                  className={`modern-option ${isChecked ? 'selected' : ''}`}
                  onClick={() => handleMultipleCorrectToggle(question._id, option.text)}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    readOnly
                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                  />
                  <span className="option-text">{option.text}</span>
                </div>
              );
            })
          )}

          {question.questionType === 'short-answer' && (
            <textarea
              className="form-control"
              rows="4"
              value={answers[question._id] || ''}
              onChange={(e) => handleAnswerChange(question._id, e.target.value)}
              placeholder="Write your comprehensive answer here..."
              style={{ fontSize: '15px' }}
            ></textarea>
          )}
        </div>

        <div className="nav-controls">
          <button
            className="btn btn-secondary"
            onClick={() => setCurrentQuestion(currentQuestion - 1)}
            disabled={currentQuestion === 0}
          >
            ← Previous Question
          </button>

          {currentQuestion < quiz.questions.length - 1 ? (
            <button
              className="btn btn-primary"
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
            >
              Next Question →
            </button>
          ) : (
            <button
              className="btn btn-success btn-large"
              onClick={() => handleSubmit(false)}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : '🚀 Final Submit Quiz'}
            </button>
          )}
        </div>
      </div>

      <div className="navigator-card">
        <h4>Interactive Question Palette (Click to jump)</h4>
        <div className="question-grid-pills">
          {quiz.questions.map((q, index) => {
            const isAnswered = !!answers[q._id];
            const isCurrent = index === currentQuestion;
            return (
              <button
                key={q._id || index}
                className={`grid-pill ${isAnswered ? 'answered' : ''} ${isCurrent ? 'current' : ''}`}
                onClick={() => setCurrentQuestion(index)}
                title={`Question ${index + 1} (${isAnswered ? 'Answered' : 'Unanswered'})`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TakeQuiz;
