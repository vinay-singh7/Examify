const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  answer: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  isCorrect: {
    type: Boolean
  },
  pointsEarned: {
    type: Number,
    default: 0
  }
});

const submissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  answers: [answerSchema],
  score: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F', ''],
    default: ''
  },
  status: {
    type: String,
    enum: ['in-progress', 'submitted', 'graded', 'auto-submitted-cheat'],
    default: 'in-progress'
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  timeTaken: {
    type: Number
  },
  tabSwitches: {
    type: Number,
    default: 0
  },
  feedback: {
    type: String
  },
  isPassed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

submissionSchema.methods.calculateScore = function(quiz) {
  let totalPoints = 0;
  let earnedPoints = 0;

  this.answers.forEach((answer) => {
    const question = quiz.questions.id(answer.questionId);
    if (question) {
      const qPoints = question.points || 1;
      const negMarks = question.negativeMarks || 0;
      totalPoints += qPoints;
      
      if (question.questionType === 'multiple-choice') {
        const selectedOption = question.options.find(opt => opt.text === answer.answer);
        if (selectedOption && selectedOption.isCorrect) {
          answer.isCorrect = true;
          answer.pointsEarned = qPoints;
          earnedPoints += qPoints;
        } else {
          answer.isCorrect = false;
          answer.pointsEarned = -negMarks;
          earnedPoints -= negMarks;
        }
      } else if (question.questionType === 'true-false') {
        if (String(answer.answer).toLowerCase() === String(question.correctAnswer).toLowerCase()) {
          answer.isCorrect = true;
          answer.pointsEarned = qPoints;
          earnedPoints += qPoints;
        } else {
          answer.isCorrect = false;
          answer.pointsEarned = -negMarks;
          earnedPoints -= negMarks;
        }
      } else if (question.questionType === 'multiple-correct') {
        // answer.answer should be array
        const userSelected = Array.isArray(answer.answer) ? answer.answer : [answer.answer];
        const correctOpts = question.options.filter(o => o.isCorrect).map(o => o.text);
        const isMatch = correctOpts.length === userSelected.length &&
          correctOpts.every(val => userSelected.includes(val));
        
        if (isMatch) {
          answer.isCorrect = true;
          answer.pointsEarned = qPoints;
          earnedPoints += qPoints;
        } else {
          answer.isCorrect = false;
          answer.pointsEarned = -negMarks;
          earnedPoints -= negMarks;
        }
      } else if (question.questionType === 'short-answer') {
        if (question.correctAnswer && String(answer.answer).trim().toLowerCase() === String(question.correctAnswer).trim().toLowerCase()) {
          answer.isCorrect = true;
          answer.pointsEarned = qPoints;
          earnedPoints += qPoints;
        } else {
          // Default to 0 or negative marking
          answer.isCorrect = false;
          answer.pointsEarned = 0;
        }
      }
    }
  });

  earnedPoints = Math.max(0, earnedPoints); // Avoid negative overall total
  this.score = Number(earnedPoints.toFixed(2));
  this.percentage = totalPoints > 0 ? Number(((earnedPoints / totalPoints) * 100).toFixed(2)) : 0;
  this.isPassed = this.percentage >= quiz.passingScore;
  
  if (this.percentage >= 90) this.grade = 'A+';
  else if (this.percentage >= 85) this.grade = 'A';
  else if (this.percentage >= 80) this.grade = 'B+';
  else if (this.percentage >= 75) this.grade = 'B';
  else if (this.percentage >= 70) this.grade = 'C+';
  else if (this.percentage >= 60) this.grade = 'C';
  else if (this.percentage >= 50) this.grade = 'D';
  else this.grade = 'F';
};

module.exports = mongoose.model('Submission', submissionSchema);
