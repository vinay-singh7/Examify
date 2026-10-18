import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './CreateQuiz.css';

const CreateQuiz = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Programming',
    difficulty: 'medium',
    timeLimit: 30,
    passingScore: 60,
    attempts: 1,
    negativeMarking: false,
    shuffleQuestions: true,
    shuffleOptions: true,
    isPublished: true,
  });

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: '',
    questionType: 'multiple-choice',
    points: 1,
    negativeMarks: 0,
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ],
    correctAnswer: 'true',
    explanation: '',
  });

  const [aiTopic, setAiTopic] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setCurrentQuestion({
      ...currentQuestion,
      [name]: value,
    });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index].text = value;
    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions,
    });
  };

  const handleCorrectOptionChange = (index) => {
    const newOptions = currentQuestion.options.map((opt, i) => ({
      ...opt,
      isCorrect: currentQuestion.questionType === 'multiple-correct' ? (i === index ? !opt.isCorrect : opt.isCorrect) : i === index,
    }));
    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions,
    });
  };

  const addOption = () => {
    setCurrentQuestion({
      ...currentQuestion,
      options: [...currentQuestion.options, { text: '', isCorrect: false }],
    });
  };

  const removeOption = (index) => {
    if (currentQuestion.options.length <= 2) {
      alert('At least 2 options are required');
      return;
    }
    const newOptions = currentQuestion.options.filter((_, i) => i !== index);
    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions,
    });
  };

  const addQuestion = () => {
    if (!currentQuestion.questionText.trim()) {
      alert('Please enter question text');
      return;
    }

    if (currentQuestion.questionType === 'multiple-choice' || currentQuestion.questionType === 'multiple-correct') {
      const hasCorrect = currentQuestion.options.some((opt) => opt.isCorrect);
      if (!hasCorrect) {
        alert('Please select at least one correct option');
        return;
      }
      const hasEmpty = currentQuestion.options.some((opt) => !opt.text.trim());
      if (hasEmpty) {
        alert('Please fill out all option texts');
        return;
      }
    }

    setQuestions([...questions, { ...currentQuestion }]);
    setCurrentQuestion({
      questionText: '',
      questionType: 'multiple-choice',
      points: 1,
      negativeMarks: 0,
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
      correctAnswer: 'true',
      explanation: '',
    });
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  // AI Question Generation
  const handleAIGenerate = async () => {
    if (!aiTopic.trim()) {
      alert('Please enter a topic for AI generation (e.g. Node.js, Organic Chemistry, World War II)');
      return;
    }
    setAiLoading(true);
    try {
      const res = await api.post('/api/quizzes/ai-generate', {
        topic: aiTopic,
        difficulty: formData.difficulty,
        count: 3
      });
      if (res.data.data) {
        setQuestions([...questions, ...res.data.data]);
        alert(`Successfully auto-generated and added ${res.data.data.length} questions from AI!`);
        setAiTopic('');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to generate AI questions. Check server connection.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (questions.length === 0) {
      alert('Please add at least one question to the quiz');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/quizzes', {
        ...formData,
        questions,
      });
      alert('Quiz created successfully!');
      navigate('/quizzes');
    } catch (err) {
      console.error(err);
      alert('Failed to create quiz: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-quiz">
      <div className="dashboard-header">
        <div className="dashboard-title-area">
          <h1>Create & Configure Examination</h1>
          <p className="dashboard-subtitle">Build customized assessments with anti-cheat controls and AI authoring</p>
        </div>
      </div>

      {/* AI Assistance Card */}
      <div className="card" style={{ borderLeft: '4px solid var(--accent)' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>🤖 AI Smart Question Generator</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '14px' }}>
          Type any subject or topic, and our algorithm will generate high-caliber questions, complete with explanations and negative marks.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="form-control"
            style={{ flex: 1, minWidth: '240px' }}
            placeholder="e.g. Data Structures, Modern Physics, Microeconomics..."
            value={aiTopic}
            onChange={(e) => setAiTopic(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAIGenerate}
            disabled={aiLoading}
          >
            {aiLoading ? 'Generating Questions...' : '✨ Generate with AI'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="card">
          <h2>1. General Settings & Parameters</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Quiz Title</label>
              <input
                type="text"
                name="title"
                className="form-control"
                value={formData.title}
                onChange={handleFormChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Category / Subject</label>
              <select
                name="category"
                className="form-control"
                value={formData.category}
                onChange={handleFormChange}
              >
                <option value="Programming">Programming</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Science">Science</option>
                <option value="History">History</option>
                <option value="Geography">Geography</option>
                <option value="English">English</option>
                <option value="General Knowledge">General Knowledge</option>
              </select>
            </div>

            <div className="form-group">
              <label>Difficulty Tier</label>
              <select
                name="difficulty"
                className="form-control"
                value={formData.difficulty}
                onChange={handleFormChange}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="form-group">
              <label>Time Limit (Minutes)</label>
              <input
                type="number"
                name="timeLimit"
                className="form-control"
                value={formData.timeLimit}
                onChange={handleFormChange}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label>Passing Score (%)</label>
              <input
                type="number"
                name="passingScore"
                className="form-control"
                value={formData.passingScore}
                onChange={handleFormChange}
                min="0"
                max="100"
                required
              />
            </div>

            <div className="form-group">
              <label>Max Allowed Attempts</label>
              <input
                type="number"
                name="attempts"
                className="form-control"
                value={formData.attempts}
                onChange={handleFormChange}
                min="1"
                max="10"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Comprehensive Description</label>
            <textarea
              name="description"
              className="form-control"
              rows="3"
              value={formData.description}
              onChange={handleFormChange}
              required
            ></textarea>
          </div>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginTop: '14px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="negativeMarking"
                checked={formData.negativeMarking}
                onChange={handleFormChange}
              />
              <span>Enable Negative Marking</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="shuffleQuestions"
                checked={formData.shuffleQuestions}
                onChange={handleFormChange}
              />
              <span>Randomize Questions Order</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="shuffleOptions"
                checked={formData.shuffleOptions}
                onChange={handleFormChange}
              />
              <span>Randomize Options Order</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleFormChange}
              />
              <span>Publish Immediately</span>
            </label>
          </div>
        </div>

        {/* Add Question Section */}
        <div className="card">
          <h2>2. Manual Question Authoring</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Question Type</label>
              <select
                name="questionType"
                className="form-control"
                value={currentQuestion.questionType}
                onChange={handleQuestionChange}
              >
                <option value="multiple-choice">Single Choice (MCQ)</option>
                <option value="multiple-correct">Multiple Correct Answers</option>
                <option value="true-false">True / False</option>
                <option value="short-answer">Short Answer</option>
              </select>
            </div>

            <div className="form-group">
              <label>Marks / Points</label>
              <input
                type="number"
                name="points"
                className="form-control"
                value={currentQuestion.points}
                onChange={handleQuestionChange}
                min="1"
              />
            </div>

            <div className="form-group">
              <label>Negative Marks (Deduction on wrong)</label>
              <input
                type="number"
                name="negativeMarks"
                className="form-control"
                value={currentQuestion.negativeMarks}
                onChange={handleQuestionChange}
                min="0"
                step="0.25"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Question Text</label>
            <textarea
              name="questionText"
              className="form-control"
              rows="3"
              value={currentQuestion.questionText}
              onChange={handleQuestionChange}
              placeholder="Enter question statement..."
            ></textarea>
          </div>

          {/* Options for MCQ & Multiple Correct */}
          {(currentQuestion.questionType === 'multiple-choice' || currentQuestion.questionType === 'multiple-correct') && (
            <div className="options-section">
              <label>Options (Mark correct answer checkbox)</label>
              {currentQuestion.options.map((opt, i) => (
                <div key={i} className="option-input">
                  <input
                    type="text"
                    className="form-control"
                    placeholder={`Option ${i + 1}`}
                    value={opt.text}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                  />
                  <label className="correct-checkbox">
                    <input
                      type="checkbox"
                      checked={opt.isCorrect}
                      onChange={() => handleCorrectOptionChange(i)}
                    />
                    <span>Correct</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => removeOption(i)}
                    className="btn btn-danger btn-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button type="button" onClick={addOption} className="btn btn-secondary btn-sm" style={{ marginTop: '8px' }}>
                + Add Option
              </button>
            </div>
          )}

          {currentQuestion.questionType === 'true-false' && (
            <div className="form-group" style={{ marginTop: '14px' }}>
              <label>Correct Answer</label>
              <select
                name="correctAnswer"
                className="form-control"
                value={currentQuestion.correctAnswer}
                onChange={handleQuestionChange}
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </div>
          )}

          {currentQuestion.questionType === 'short-answer' && (
            <div className="form-group" style={{ marginTop: '14px' }}>
              <label>Expected Answer (Case-insensitive check)</label>
              <input
                type="text"
                name="correctAnswer"
                className="form-control"
                value={currentQuestion.correctAnswer || ''}
                onChange={handleQuestionChange}
                placeholder="Exact text or formula..."
              />
            </div>
          )}

          <div className="form-group" style={{ marginTop: '14px' }}>
            <label>Educational Explanation (Optional)</label>
            <input
              type="text"
              name="explanation"
              className="form-control"
              value={currentQuestion.explanation}
              onChange={handleQuestionChange}
              placeholder="Why is this answer correct? Shown during review."
            />
          </div>

          <button
            type="button"
            onClick={addQuestion}
            className="btn btn-primary"
            style={{ marginTop: '12px' }}
          >
            + Append Question to Test
          </button>
        </div>

        {/* Questions list */}
        <div className="card">
          <h2>3. Test Manifest ({questions.length} Questions Configured)</h2>
          {questions.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No questions added yet. Use manual authoring or AI Generator above.</p>
          ) : (
            <div className="questions-list">
              {questions.map((q, idx) => (
                <div key={idx} className="question-item">
                  <div className="question-item-content">
                    <h4>#{idx + 1}: {q.questionText}</h4>
                    <p>
                      Type: <strong>{q.questionType}</strong> • Worth: <strong>{q.points} pt(s)</strong> {q.negativeMarks ? `• Penalty: -${q.negativeMarks}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeQuestion(idx)}
                    className="btn btn-danger btn-sm"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ textAlign: 'right' }}>
          <button type="submit" className="btn btn-success btn-large" disabled={loading}>
            {loading ? 'Creating Examination...' : '🚀 Finalize & Save Examination'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateQuiz;
