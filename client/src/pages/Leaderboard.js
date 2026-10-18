import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Dashboard.css';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get('/api/submissions/leaderboard');
      setLeaders(res.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading global leaderboard standings...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title-area">
          <h1>🏆 Hall of Fame & Global Leaderboard</h1>
          <p className="dashboard-subtitle">Top scholars ranked by score accuracy and completion speed</p>
        </div>
      </div>

      <div className="recent-submissions">
        {leaders.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            No submissions recorded yet. Be the first on the podium!
          </p>
        ) : (
          <div className="submissions-list">
            {leaders.map((leader, i) => (
              <div key={leader._id} className="submission-item" style={{
                borderLeft: i === 0 ? '4px solid #fbbf24' : i === 1 ? '4px solid #94a3b8' : i === 2 ? '4px solid #b45309' : '1px solid var(--border-glass)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                  <div style={{
                    fontSize: '22px',
                    fontWeight: 800,
                    width: '36px',
                    textAlign: 'center',
                    color: i === 0 ? '#fbbf24' : i === 1 ? '#cbd5e1' : i === 2 ? '#d97706' : 'var(--text-muted)'
                  }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </div>
                  <div className="submission-info">
                    <h3>{leader.user?.name}</h3>
                    <p>Exam: <strong>{leader.quiz?.title}</strong> • Time: {Math.floor((leader.timeTaken || 0) / 60)}m {(leader.timeTaken || 0) % 60}s</p>
                  </div>
                </div>

                <div className="submission-score">
                  <span className="score">{leader.percentage}%</span>
                  <span className={`badge ${leader.isPassed ? 'badge-success' : 'badge-danger'}`}>
                    {leader.grade || 'PASS'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
