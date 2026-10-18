const Submission = require('../models/Submission');
const Quiz = require('../models/Quiz');

exports.getSubmissions = async (req, res) => {
  try {
    let filter = {};
    
    if (req.user.role === 'student') {
      filter.user = req.user.id;
    }

    if (req.query.quizId) {
      filter.quiz = req.query.quizId;
    }

    if (req.query.userId && req.user.role !== 'student') {
      filter.user = req.query.userId;
    }

    const submissions = await Submission.find(filter)
      .populate('user', 'name email role')
      .populate('quiz', 'title category difficulty totalPoints passingScore')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.getSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('user', 'name email role')
      .populate('quiz');

    if (!submission) {
      return res.status(404).json({ 
        success: false, 
        message: 'Submission not found' 
      });
    }

    if (submission.user._id.toString() !== req.user.id && 
        req.user.role === 'student') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view this submission' 
      });
    }

    res.json({
      success: true,
      data: submission
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.createSubmission = async (req, res) => {
  try {
    const { quizId, answers } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ 
        success: false, 
        message: 'Quiz not found' 
      });
    }

    const existingSubmissions = await Submission.countDocuments({
      user: req.user.id,
      quiz: quizId,
      status: { $in: ['submitted', 'graded', 'auto-submitted-cheat'] }
    });

    if (existingSubmissions >= quiz.attempts) {
      return res.status(400).json({ 
        success: false, 
        message: `Maximum allowed attempts (${quiz.attempts}) reached for this quiz.` 
      });
    }

    const submission = await Submission.create({
      user: req.user.id,
      quiz: quizId,
      answers: answers || [],
      startTime: new Date(),
      status: 'in-progress'
    });

    res.status(201).json({
      success: true,
      data: submission
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ 
        success: false, 
        message: 'Submission not found' 
      });
    }

    if (submission.user.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    const quiz = await Quiz.findById(submission.quiz);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Associated quiz not found' });
    }

    const now = new Date();
    submission.endTime = now;
    
    // Server-side time check with 30s grace buffer
    const elapsedSeconds = Math.floor((now - submission.startTime) / 1000);
    const maxAllowedSeconds = (quiz.timeLimit * 60) + 45; // 45s grace network buffer
    submission.timeTaken = elapsedSeconds;

    if (req.body.tabSwitches !== undefined) {
      submission.tabSwitches = req.body.tabSwitches;
    }

    if (req.body.isCheatingAutoSubmit) {
      submission.status = 'auto-submitted-cheat';
      submission.feedback = `Exam automatically submitted due to security policy violations (Tab switch warning limit reached: ${submission.tabSwitches}).`;
    } else {
      submission.status = 'submitted';
    }
    
    if (req.body.answers) {
      submission.answers = req.body.answers;
    }

    submission.calculateScore(quiz);
    await submission.save();

    await submission.populate('quiz');

    res.json({
      success: true,
      data: submission
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.gradeSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ 
        success: false, 
        message: 'Submission not found' 
      });
    }

    const { answers, feedback } = req.body;
    if (answers) submission.answers = answers;
    if (feedback) submission.feedback = feedback;

    const quiz = await Quiz.findById(submission.quiz);
    submission.calculateScore(quiz);
    submission.status = 'graded';
    
    await submission.save();

    res.json({
      success: true,
      data: submission
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Global / Quiz-specific Leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const { quizId } = req.query;
    let match = { status: { $in: ['submitted', 'graded'] } };
    if (quizId) {
      match.quiz = new (require('mongoose').Types.ObjectId)(quizId);
    }

    const leaders = await Submission.find(match)
      .populate('user', 'name email role')
      .populate('quiz', 'title category difficulty totalPoints')
      .sort({ score: -1, timeTaken: 1, createdAt: 1 })
      .limit(25);

    res.json({
      success: true,
      data: leaders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin Class Analytics, averages and ranks
exports.getAdminAnalytics = async (req, res) => {
  try {
    const totalQuizzes = await Quiz.countDocuments();
    const publishedQuizzes = await Quiz.countDocuments({ isPublished: true });
    const allSubmissions = await Submission.find({ status: { $in: ['submitted', 'graded', 'auto-submitted-cheat'] } })
      .populate('user', 'name email')
      .populate('quiz', 'title category totalPoints passingScore');

    const totalSubmissions = allSubmissions.length;
    const passedSubmissions = allSubmissions.filter(s => s.isPassed).length;
    const passRate = totalSubmissions > 0 ? ((passedSubmissions / totalSubmissions) * 100).toFixed(1) : 0;

    const avgScore = totalSubmissions > 0 
      ? (allSubmissions.reduce((a, b) => a + (b.percentage || 0), 0) / totalSubmissions).toFixed(1)
      : 0;

    // Rank submissions by score descending
    const rankedSubmissions = [...allSubmissions].sort((a, b) => b.score - a.score);

    res.json({
      success: true,
      data: {
        totalQuizzes,
        publishedQuizzes,
        totalSubmissions,
        passedSubmissions,
        passRate,
        averageScore: avgScore,
        submissions: rankedSubmissions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
