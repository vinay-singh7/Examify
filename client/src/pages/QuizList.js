import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './QuizList.css';

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
  });

  useEffect(() => {
    fetchQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchQuizzes = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);

      const res = await api.get(
        `/api/quizzes?${params.toString()}`
      );
      setQuizzes(res.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredQuizzes = quizzes.filter((q) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      q.title.toLowerCase().includes(term) ||
      (q.description && q.description.toLowerCase().includes(term)) ||
      (q.category && q.category.toLowerCase().includes(term))
    );
  });

  if (loading) {
    return <div className="loading">Fetching examinations & quizzes...</div>;
  }

  return (
    <div className="quiz-list">
      <div className="quiz-list-header">
        <div>
          <h1>Explore Quizzes & Exams</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginTop: '4px' }}>
            Sharpen your knowledge or test your skills under timed conditions
          </p>
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="form-control"
            placeholder="Search quizzes by title or topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Category:</label>
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="form-control"
          >
            <option value="">All Categories</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Science">Science</option>
            <option value="History">History</option>
            <option value="Geography">Geography</option>
            <option value="English">English</option>
            <option value="Programming">Programming</option>
            <option value="General Knowledge">General Knowledge</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Difficulty:</label>
          <select
            name="difficulty"
            value={filters.difficulty}
            onChange={handleFilterChange}
            className="form-control"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {filteredQuizzes.length === 0 ? (
        <div className="no-quizzes">
          <h3>No matching quizzes found</h3>
          <p style={{ marginTop: '8px' }}>
            Try tweaking your search term or filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-2">
          {filteredQuizzes.map((quiz) => (
            <div key={quiz._id} className="quiz-card card">
              <div>
                <div className="quiz-header">
                  <h3>{quiz.title}</h3>
                  <span className={`badge badge-${quiz.difficulty}`}>
                    {quiz.difficulty}
                  </span>
                </div>
                <p className="quiz-description">{quiz.description}</p>
                <div className="quiz-meta">
                  <span>📁 {quiz.category}</span>
                  <span>❓ {quiz.questions?.length || 0} Questions</span>
                  <span>⏱️ {quiz.timeLimit} Minutes</span>
                  <span>🏆 {quiz.totalPoints || (quiz.questions ? quiz.questions.reduce((a, b) => a + (b.points || 1), 0) : 0)} Pts</span>
                </div>
              </div>

              <div className="quiz-footer">
                <span className="passing-score">
                  Passing: <strong>{quiz.passingScore}%</strong>
                </span>
                <Link to={`/quizzes/${quiz._id}`} className="btn btn-primary" style={{ padding: '9px 18px', fontSize: '14px' }}>
                  Start Quiz →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizList;
