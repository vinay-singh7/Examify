import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './QuizDetail.css';

const QuizDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const res = await api.get(`/api/quizzes/${id}`);
      setQuiz(res.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      setError(error.response?.data?.message || 'Failed to load quiz');
      setLoading(false);
    }
  };

  const startQuiz = async () => {
    try {
      const res = await api.post('/api/submissions', {
        quizId: id,
        answers: [],
      });
      navigate(`/quizzes/${id}/take`, { state: { submissionId: res.data.data._id } });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to start quiz');
    }
  };

  if (loading) {
    return <div className="loading">Loading quiz...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="alert alert-error">{error}</div>
        <button onClick={() => navigate('/quizzes')} className="btn btn-secondary">
          Back to Quizzes
        </button>
      </div>
    );
  }

  if (!quiz) {
    return <div className="loading">Quiz not found</div>;
  }

  return (
    <div className="quiz-detail">
      <div className="quiz-detail-header card">
        <div className="quiz-title-section">
          <h1>{quiz.title}</h1>
          <span className={`badge badge-${quiz.difficulty}`}>{quiz.difficulty}</span>
        </div>
        <p className="quiz-description">{quiz.description}</p>

        <div className="quiz-info-grid">
          <div className="info-item">
            <span className="info-label">Category:</span>
            <span className="info-value">{quiz.category}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Questions:</span>
            <span className="info-value">{quiz.questions.length}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Time Limit:</span>
            <span className="info-value">{quiz.timeLimit} minutes</span>
          </div>
          <div className="info-item">
            <span className="info-label">Total Points:</span>
            <span className="info-value">{quiz.totalPoints}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Passing Score:</span>
            <span className="info-value">{quiz.passingScore}%</span>
          </div>
          <div className="info-item">
            <span className="info-label">Attempts Allowed:</span>
            <span className="info-value">{quiz.attempts}</span>
          </div>
        </div>

        <div className="quiz-actions">
          <button onClick={startQuiz} className="btn btn-success btn-large">
            Start Quiz
          </button>
          <button onClick={() => navigate('/quizzes')} className="btn btn-secondary">
            Back to List
          </button>
        </div>
      </div>

      <div className="quiz-questions-preview card">
        <h2>Question Overview</h2>
        <div className="questions-summary">
          {quiz.questions.map((question, index) => (
            <div key={question._id} className="question-preview">
              <div className="question-number">Question {index + 1}</div>
              <div className="question-type">
                Type: {question.questionType.replace('-', ' ')}
              </div>
              <div className="question-points">Points: {question.points}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizDetail;
