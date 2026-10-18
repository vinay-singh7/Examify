import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    completedQuizzes: 0,
    averageScore: 0,
  });
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [quizzesRes, submissionsRes] = await Promise.all([
        api.get('/api/quizzes'),
        api.get('/api/submissions'),
      ]);

      const submissions = submissionsRes.data.data || [];
      const completedSubmissions = submissions.filter(
        (s) => s.status === 'submitted' || s.status === 'graded'
      );

      const avgScore =
        completedSubmissions.length > 0
          ? completedSubmissions.reduce((acc, s) => acc + (s.percentage || 0), 0) /
            completedSubmissions.length
          : 0;

      setStats({
        totalQuizzes: quizzesRes.data.count || 0,
        completedQuizzes: completedSubmissions.length,
        averageScore: avgScore.toFixed(1),
      });

      setRecentSubmissions(submissions.slice(0, 6));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading your personalized dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title-area">
          <h1>Welcome back, {user?.name}! 👋</h1>
          <p className="dashboard-subtitle">
            Role: <span className="role-badge">{user?.role}</span>
          </p>
        </div>
        <div className="dashboard-actions">
          <Link to="/quizzes" className="btn btn-primary">
            🔍 Explore Quizzes
          </Link>
          {(user?.role === 'teacher' || user?.role === 'admin') && (
            <Link to="/create-quiz" className="btn btn-success">
              ➕ Create New Quiz
            </Link>
          )}
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-box icon-blue">📚</div>
          <div className="stat-info">
            <h3>{stats.totalQuizzes}</h3>
            <p>Active Quizzes</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-box icon-green">✅</div>
          <div className="stat-info">
            <h3>{stats.completedQuizzes}</h3>
            <p>Completed Exams</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-box icon-purple">📈</div>
          <div className="stat-info">
            <h3>{stats.averageScore}%</h3>
            <p>Overall Accuracy</p>
          </div>
        </div>
      </div>

      <div className="recent-submissions">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Recent Activity & Submissions</h2>
          <Link to="/quizzes" style={{ color: 'var(--primary-light)', fontSize: '14px', textDecoration: 'none' }}>
            View All Tests →
          </Link>
        </div>

        {recentSubmissions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '16px', marginBottom: '16px' }}>You haven't attempted any quizzes yet.</p>
            <Link to="/quizzes" className="btn btn-secondary">Start Your First Quiz Now</Link>
          </div>
        ) : (
          <div className="submissions-list">
            {recentSubmissions.map((submission) => (
              <div key={submission._id} className="submission-item">
                <div className="submission-info">
                  <h3>{submission.quiz?.title || 'Quiz Session'}</h3>
                  <p>📁 {submission.quiz?.category || 'General'} • Attempted {new Date(submission.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="submission-score">
                  {submission.status === 'in-progress' ? (
                    <span className="badge badge-medium">In Progress</span>
                  ) : (
                    <>
                      <span className="score">{(submission.percentage || 0).toFixed(1)}%</span>
                      <span
                        className={`badge ${
                          submission.isPassed ? 'badge-success' : 'badge-danger'
                        }`}
                      >
                        {submission.grade || (submission.isPassed ? 'PASS' : 'FAIL')}
                      </span>
                    </>
                  )}
                </div>
                <Link to={`/results/${submission._id}`} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                  Review Results →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
