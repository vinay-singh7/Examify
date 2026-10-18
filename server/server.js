const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure DB connects on requests in serverless environments
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Database Connection Failed: ${error.message}. Make sure MONGODB_URI is configured on Vercel environment variables.`
    });
  }
});


const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const quizRoutes = require('./routes/quizRoutes');
const submissionRoutes = require('./routes/submissionRoutes');

// Mount with /api prefix
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/submissions', submissionRoutes);

// Mount without /api prefix as fallback in case Vercel rewrites strip /api
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/quizzes', quizRoutes);
app.use('/submissions', submissionRoutes);


app.get('/', (req, res) => {
  res.json({ message: 'Online Quiz & Exam System API' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: err.message || 'Server Error' 
  });
});

const PORT = process.env.PORT || 5001;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}


module.exports = app;
