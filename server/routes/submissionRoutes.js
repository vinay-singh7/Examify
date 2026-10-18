const express = require('express');
const {
  getSubmissions,
  getSubmission,
  createSubmission,
  submitQuiz,
  gradeSubmission,
  getLeaderboard,
  getAdminAnalytics
} = require('../controllers/submissionController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/leaderboard', getLeaderboard);
router.get('/analytics', authorize('teacher', 'admin'), getAdminAnalytics);

router
  .route('/')
  .get(getSubmissions)
  .post(createSubmission);

router
  .route('/:id')
  .get(getSubmission);

router
  .route('/:id/submit')
  .put(submitQuiz);

router
  .route('/:id/grade')
  .put(authorize('teacher', 'admin'), gradeSubmission);

module.exports = router;
