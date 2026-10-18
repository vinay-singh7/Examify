import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import QuizList from './pages/QuizList';
import QuizDetail from './pages/QuizDetail';
import TakeQuiz from './pages/TakeQuiz';
import CreateQuiz from './pages/CreateQuiz';
import Results from './pages/Results';
import Leaderboard from './pages/Leaderboard';
import AdminAnalytics from './pages/AdminAnalytics';
import './App.css';

function MainLayout() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <div className="App">
      <Navbar />
      <div className={isLandingPage ? "landing-container-full" : "container"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/quizzes"
            element={
              <PrivateRoute>
                <QuizList />
              </PrivateRoute>
            }
          />
          <Route
            path="/quizzes/:id"
            element={
              <PrivateRoute>
                <QuizDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/quizzes/:id/take"
            element={
              <PrivateRoute>
                <TakeQuiz />
              </PrivateRoute>
            }
          />
          <Route
            path="/create-quiz"
            element={
              <PrivateRoute roles={['teacher', 'admin']}>
                <CreateQuiz />
              </PrivateRoute>
            }
          />
          <Route
            path="/results/:id"
            element={
              <PrivateRoute>
                <Results />
              </PrivateRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <PrivateRoute>
                <Leaderboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin-analytics"
            element={
              <PrivateRoute roles={['teacher', 'admin']}>
                <AdminAnalytics />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <MainLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;
