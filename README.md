# Online Quiz & Exam System

A comprehensive MERN stack application for conducting online quizzes and examinations.

## Features

### For Students
- User registration and authentication
- Take quizzes and exams
- View results and performance analytics
- Track progress and history
- Timed exams with auto-submission

### For Teachers/Admins
- Create and manage quizzes/exams
- Multiple question types (MCQ, True/False, Short Answer)
- Set time limits and difficulty levels
- Grade and review submissions
- Generate reports and analytics
- Manage students and courses

## Tech Stack

- **Frontend**: React.js, React Router, Axios, Bootstrap/Material-UI
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)

## Project Structure

```
online-quiz-exam-system/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/     # Reusable components
│       ├── pages/          # Page components
│       ├── context/        # Context API for state management
│       ├── services/       # API services
│       ├── utils/          # Utility functions
│       └── App.js
├── server/                 # Express backend
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   └── server.js          # Entry point
├── .env                   # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd online-quiz-exam-system
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your configuration.

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Run the application**
   ```bash
   # Development mode (runs both frontend and backend)
   npm run dev

   # Run backend only
   npm run server

   # Run frontend only
   npm run client
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin)

### Quizzes
- `GET /api/quizzes` - Get all quizzes
- `GET /api/quizzes/:id` - Get quiz by ID
- `POST /api/quizzes` - Create quiz (teacher/admin)
- `PUT /api/quizzes/:id` - Update quiz (teacher/admin)
- `DELETE /api/quizzes/:id` - Delete quiz (admin)

### Submissions
- `GET /api/submissions` - Get user submissions
- `GET /api/submissions/:id` - Get submission by ID
- `POST /api/submissions` - Submit quiz/exam
- `PUT /api/submissions/:id/grade` - Grade submission (teacher/admin)

## Database Models

### User
- name, email, password
- role (student, teacher, admin)
- createdAt, updatedAt

### Quiz
- title, description
- questions (array)
- timeLimit, passingScore
- difficulty, category
- creator, isPublished
- createdAt, updatedAt

### Submission
- user, quiz
- answers (array)
- score, grade
- startTime, endTime, timeTaken
- status (pending, graded)
- feedback

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
