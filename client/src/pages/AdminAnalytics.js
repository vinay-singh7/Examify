import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Dashboard.css';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/api/submissions/analytics');
      setAnalytics(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!analytics || !analytics.submissions) return;
    const headers = ['Rank', 'Student Name', 'Email', 'Quiz Title', 'Score', 'Total Points', 'Percentage', 'Grade', 'Passed', 'Date'];
    const rows = analytics.submissions.map((s, index) => [
      index + 1,
      s.user?.name || 'N/A',
      s.user?.email || 'N/A',
      s.quiz?.title || 'N/A',
      s.score,
      s.quiz?.totalPoints || 0,
      `${s.percentage}%`,
      s.grade,
      s.isPassed ? 'YES' : 'NO',
      new Date(s.createdAt).toLocaleDateString()
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.map(x => `"${x}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Exam_Results_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="loading">Compiling institution analytics...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title-area">
          <h1>Institution Analytics & Grade Book</h1>
          <p className="dashboard-subtitle">Class averages, participant rankings, and submission audits</p>
        </div>
        <button onClick={downloadCSV} className="btn btn-primary">
          📥 Export CSV Gradebook
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-box icon-blue">📊</div>
          <div className="stat-info">
            <h3>{analytics.totalSubmissions}</h3>
            <p>Total Exams Attempted</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-box icon-green">🏆</div>
          <div className="stat-info">
            <h3>{analytics.passRate}%</h3>
            <p>Overall Pass Rate</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-box icon-purple">📈</div>
          <div className="stat-info">
            <h3>{analytics.averageScore}%</h3>
            <p>Class Average Score</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-box icon-blue">📝</div>
          <div className="stat-info">
            <h3>{analytics.publishedQuizzes} / {analytics.totalQuizzes}</h3>
            <p>Active Live Quizzes</p>
          </div>
        </div>
      </div>

      <div className="recent-submissions">
        <h2>Ranked Submissions & Student Performance</h2>
        <div className="submissions-list">
          {analytics.submissions?.map((s, idx) => (
            <div key={s._id} className="submission-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  width: '32px',
                  color: idx === 0 ? '#fbbf24' : idx === 1 ? '#94a3b8' : idx === 2 ? '#b45309' : 'var(--text-muted)'
                }}>
                  #{idx + 1}
                </span>
                <div className="submission-info">
                  <h3>{s.user?.name} <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>({s.user?.email})</span></h3>
                  <p>Exam: <strong>{s.quiz?.title}</strong> • Time: {s.timeTaken ? `${Math.floor(s.timeTaken / 60)}m ${s.timeTaken % 60}s` : 'N/A'}</p>
                </div>
              </div>

              <div className="submission-score">
                <span className="score">{s.percentage}%</span>
                <span className={`badge ${s.isPassed ? 'badge-success' : 'badge-danger'}`}>
                  {s.grade || (s.isPassed ? 'PASS' : 'FAIL')}
                </span>
                {s.status === 'auto-submitted-cheat' && (
                  <span className="badge badge-danger">Tab Cheating</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
