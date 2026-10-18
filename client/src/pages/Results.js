import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Results.css';

const Results = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchSubmission = async () => {
    try {
      const res = await api.get(`/api/submissions/${id}`);
      setSubmission(res.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching submission:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Generating your performance report...</div>;
  }

  if (!submission) {
    return <div className="loading">Submission records not found</div>;
  }

  const formatTime = (seconds) => {
    if (!seconds) return '0s';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes > 0 ? `${minutes}m ` : ''}${secs}s`;
  };

  const isPassed = submission.isPassed;
  const pct = (submission.percentage || 0).toFixed(1);

  return (
    <div className="results">
      <div className="card results-hero-card">
        <h1>Performance Assessment</h1>
        <div className="results-quiz-name">{submission.quiz?.title || 'Quiz'}</div>

        <div className={`score-visual-circle ${isPassed ? 'circle-pass' : 'circle-fail'}`}>
          <div className="score-pct">{pct}%</div>
          <div className="score-caption">Accuracy</div>
        </div>

        <div>
          <span className={`badge ${isPassed ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '14px', padding: '6px 18px' }}>
            Grade: {submission.grade || (isPassed ? 'Passed' : 'Needs Improvement')}
          </span>
        </div>

        <div style={{ marginTop: '20px', fontSize: '16px', fontWeight: '500' }}>
          {isPassed ? (
            <span style={{ color: '#34d399' }}>🎉 Great job! You met the criteria to pass this examination.</span>
          ) : (
            <span style={{ color: '#f87171' }}>💡 Keep practicing! Review your answers below to level up.</span>
          )}
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '20px', marginBottom: '18px' }}>📊 Test Summary & Breakdown</h2>
        <div className="results-stats-panel">
          <div className="result-stat-tile">
            <div className="result-stat-lbl">Points Scored</div>
            <div className="result-stat-num">{submission.score || 0} / {submission.quiz?.totalPoints || 0}</div>
          </div>
          <div className="result-stat-tile">
            <div className="result-stat-lbl">Total Time Taken</div>
            <div className="result-stat-num">{formatTime(submission.timeTaken)}</div>
          </div>
          <div className="result-stat-tile">
            <div className="result-stat-lbl">Questions Solved</div>
            <div className="result-stat-num">{submission.answers?.length || 0} / {submission.quiz?.questions?.length || 0}</div>
          </div>
          <div className="result-stat-tile">
            <div className="result-stat-lbl">Correct Count</div>
            <div className="result-stat-num">
              {submission.answers?.filter((a) => a.isCorrect).length || 0}
            </div>
          </div>
        </div>
      </div>

      {submission.feedback && (
        <div className="card">
          <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>👨‍🏫 Evaluator Feedback</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{submission.feedback}</p>
        </div>
      )}

      <div className="card">
        <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>📝 Detailed Answer Review</h2>
        <div className="answers-review-container">
          {submission.quiz?.questions?.map((question, index) => {
            const userAnswer = submission.answers?.find((a) => a.questionId === question._id);
            const isCorrect = userAnswer?.isCorrect;

            return (
              <div key={question._id || index} className="review-item-box">
                <div className="review-item-header">
                  <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--primary-light)' }}>
                    Question {index + 1}
                  </span>
                  {userAnswer?.isCorrect !== undefined && (
                    <span className={`review-status-pill ${isCorrect ? 'pill-correct' : 'pill-incorrect'}`}>
                      {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                  )}
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {userAnswer?.pointsEarned || 0} / {question.points || 1} pts
                  </span>
                </div>

                <div className="review-question-title">{question.questionText}</div>

                {userAnswer && (
                  <div className="review-answers-box">
                    <div>
                      <strong>Your Answer: </strong>
                      <span style={{ color: isCorrect ? '#34d399' : '#f87171' }}>
                        {userAnswer.answer?.toString() || '(No answer provided)'}
                      </span>
                    </div>

                    {question.questionType === 'multiple-choice' && !isCorrect && (
                      <div>
                        <strong>Correct Answer: </strong>
                        <span style={{ color: '#34d399' }}>
                          {question.options?.find((opt) => opt.isCorrect)?.text}
                        </span>
                      </div>
                    )}

                    {question.questionType === 'true-false' && !isCorrect && (
                      <div>
                        <strong>Correct Answer: </strong>
                        <span style={{ color: '#34d399', textTransform: 'capitalize' }}>
                          {question.correctAnswer}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {question.explanation && (
                  <div className="review-explanation">
                    💡 <strong>Explanation:</strong> {question.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="results-action-row">
        <button onClick={() => navigate('/quizzes')} className="btn btn-primary btn-large">
          Explore More Quizzes
        </button>
        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary btn-large">
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Results;
