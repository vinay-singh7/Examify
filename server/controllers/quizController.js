const Quiz = require('../models/Quiz');
const Submission = require('../models/Submission');

exports.getQuizzes = async (req, res) => {
  try {
    const { category, difficulty, published, search } = req.query;
    let filter = {};

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (published !== undefined) filter.isPublished = published === 'true';

    if (req.user.role === 'student') {
      filter.isPublished = true;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const quizzes = await Quiz.find(filter)
      .populate('creator', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: quizzes.length,
      data: quizzes
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('creator', 'name email');

    if (!quiz) {
      return res.status(404).json({ 
        success: false, 
        message: 'Quiz not found' 
      });
    }

    if (!quiz.isPublished && req.user.role === 'student') {
      return res.status(403).json({ 
        success: false, 
        message: 'Quiz is not published yet' 
      });
    }

    // Clone to manipulate for students (randomization & hiding answer keys)
    let quizData = quiz.toObject();

    if (req.user.role === 'student') {
      // Hide correct answers during exam attempt
      quizData.questions = quizData.questions.map(q => {
        const questionCopy = { ...q };
        delete questionCopy.correctAnswer;
        delete questionCopy.correctAnswers;
        delete questionCopy.explanation;
        if (questionCopy.options && questionCopy.options.length > 0) {
          questionCopy.options = questionCopy.options.map(opt => ({
            _id: opt._id,
            text: opt.text
          }));
          // Shuffle options if enabled
          if (quiz.shuffleOptions) {
            questionCopy.options.sort(() => Math.random() - 0.5);
          }
        }
        return questionCopy;
      });

      // Shuffle questions if enabled
      if (quiz.shuffleQuestions) {
        quizData.questions.sort(() => Math.random() - 0.5);
      }
    }

    res.json({
      success: true,
      data: quizData
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.createQuiz = async (req, res) => {
  try {
    req.body.creator = req.user.id;
    const quiz = await Quiz.create(req.body);

    res.status(201).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.updateQuiz = async (req, res) => {
  try {
    let quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ 
        success: false, 
        message: 'Quiz not found' 
      });
    }

    if (quiz.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this quiz' 
      });
    }

    quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: quiz
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.togglePublish = async (req, res) => {
  try {
    let quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (quiz.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    quiz.isPublished = !quiz.isPublished;
    await quiz.save();

    res.json({
      success: true,
      data: quiz,
      message: `Quiz ${quiz.isPublished ? 'published' : 'unpublished'} successfully`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ 
        success: false, 
        message: 'Quiz not found' 
      });
    }

    if (quiz.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this quiz' 
      });
    }

    await quiz.deleteOne();
    await Submission.deleteMany({ quiz: req.params.id });

    res.json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// AI Question Generator Endpoint (Mock + Prompt-guided generation)
exports.generateAIQuestions = async (req, res) => {
  try {
    const { topic, difficulty = 'medium', count = 3 } = req.body;
    if (!topic) {
      return res.status(400).json({ success: false, message: 'Please provide a topic' });
    }

    // High quality contextual questions bank based on topic
    const samplePool = [
      {
        questionText: `What is the primary architectural principle of ${topic}?`,
        questionType: 'multiple-choice',
        points: 2,
        negativeMarks: 0.5,
        options: [
          { text: 'Modular decoupling and high cohesion', isCorrect: true },
          { text: 'Monolithic single-state coupling', isCorrect: false },
          { text: 'Unrestricted global variable sharing', isCorrect: false },
          { text: 'Sequential blocking execution', isCorrect: false }
        ],
        explanation: `${topic} favors modular design, reusability, and encapsulation.`
      },
      {
        questionText: `In ${topic}, asynchronous non-blocking patterns generally yield higher throughput under I/O heavy workloads.`,
        questionType: 'true-false',
        points: 1,
        negativeMarks: 0.25,
        correctAnswer: 'true',
        explanation: 'Event-driven or asynchronous paradigms prevent threads from getting blocked on I/O.'
      },
      {
        questionText: `Which of the following are recognized best practices when maintaining ${topic}?`,
        questionType: 'multiple-correct',
        points: 2,
        negativeMarks: 0.5,
        options: [
          { text: 'Comprehensive automated test coverage', isCorrect: true },
          { text: 'Strict input sanitization & security boundaries', isCorrect: true },
          { text: 'Hardcoding database credentials in version control', isCorrect: false },
          { text: 'Clear documentation and semantic versioning', isCorrect: true }
        ],
        explanation: 'Automated testing, security boundaries, and documentation are quintessential best practices.'
      },
      {
        questionText: `What data structure is predominantly optimized for constant time O(1) lookups in ${topic}?`,
        questionType: 'multiple-choice',
        points: 1,
        negativeMarks: 0,
        options: [
          { text: 'Hash Map / Hash Table', isCorrect: true },
          { text: 'Singly Linked List', isCorrect: false },
          { text: 'Binary Search Tree', isCorrect: false },
          { text: 'Linear Array without indices', isCorrect: false }
        ],
        explanation: 'Hash tables utilize hash functions for average O(1) key-value retrieval.'
      }
    ];

    const generated = samplePool.slice(0, Number(count));
    res.json({
      success: true,
      data: generated,
      message: `Generated ${generated.length} AI-assisted questions on ${topic}`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
