const express = require('express');
const {
  getQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  togglePublish,
  generateAIQuestions
} = require('../controllers/quizController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getQuizzes)
  .post(authorize('teacher', 'admin'), createQuiz);

router.post('/ai-generate', authorize('teacher', 'admin'), generateAIQuestions);

router
  .route('/:id')
  .get(getQuiz)
  .put(authorize('teacher', 'admin'), updateQuiz)
  .delete(authorize('teacher', 'admin'), deleteQuiz);

router.put('/:id/toggle-publish', authorize('teacher', 'admin'), togglePublish);

module.exports = router;
