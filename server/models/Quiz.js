const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true
  },
  questionType: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'multiple-correct', 'short-answer'],
    required: true
  },
  options: [{
    text: String,
    isCorrect: Boolean
  }],
  correctAnswer: String, // For true-false or single text match
  correctAnswers: [String], // For multiple-correct
  points: {
    type: Number,
    default: 1
  },
  negativeMarks: {
    type: Number,
    default: 0
  },
  explanation: String
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  category: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  questions: [questionSchema],
  timeLimit: {
    type: Number,
    required: true,
    default: 30
  },
  passingScore: {
    type: Number,
    required: true,
    default: 60
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  attempts: {
    type: Number,
    default: 1
  },
  shuffleQuestions: {
    type: Boolean,
    default: true
  },
  shuffleOptions: {
    type: Boolean,
    default: true
  },
  negativeMarking: {
    type: Boolean,
    default: false
  },
  forceFullscreen: {
    type: Boolean,
    default: true
  },
  maxTabSwitches: {
    type: Number,
    default: 3
  }
}, {
  timestamps: true
});

quizSchema.pre('save', function(next) {
  this.totalPoints = this.questions.reduce((total, q) => total + (q.points || 1), 0);
  next();
});

module.exports = mongoose.model('Quiz', quizSchema);
