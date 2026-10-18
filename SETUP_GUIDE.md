# Online Quiz & Exam System - Setup Guide

## Prerequisites

Make sure you have the following installed on your system:
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** (comes with Node.js)

## Installation Steps

### 1. Install Backend Dependencies

```bash
npm install
```

### 2. Install Frontend Dependencies

```bash
cd client
npm install
cd ..
```

### 3. Setup MongoDB

**Option A: Local MongoDB**
1. Start MongoDB service:
   ```bash
   # macOS (using Homebrew)
   brew services start mongodb-community
   
   # Windows
   # MongoDB runs as a service automatically after installation
   
   # Linux
   sudo systemctl start mongod
   ```

2. Verify MongoDB is running:
   ```bash
   mongosh
   # or
   mongo
   ```

**Option B: MongoDB Atlas (Cloud)**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env` file with your connection string

### 4. Environment Variables

The `.env` file is already created. If you need to modify it:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/quiz-exam-system
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_2024
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

**Important:** Change `JWT_SECRET` to a secure random string in production!

## Running the Application

### Option 1: Run Both Frontend and Backend Together (Recommended)

```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend React app on `http://localhost:3000`

### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run client
```

## Testing the Application

### 1. Open your browser and go to:
```
http://localhost:3000
```

### 2. Register a New User

**Student Account:**
- Click "Register"
- Fill in the form
- Select "Student" as role
- Submit

**Teacher Account:**
- Register again with a different email
- Select "Teacher" as role
- Submit

### 3. Create a Quiz (Teacher Account)

1. Login as teacher
2. Click "Create Quiz"
3. Fill in quiz details:
   - Title: "Sample Math Quiz"
   - Description: "Basic math questions"
   - Category: "Mathematics"
   - Difficulty: "Easy"
   - Time Limit: 15 minutes
   - Passing Score: 60%
   
4. Add questions:
   - Multiple Choice: "What is 2 + 2?"
     - Options: 3, 4 (correct), 5, 6
   - True/False: "2 + 2 = 5"
     - Correct: False
     
5. Click "Create Quiz"

### 4. Take a Quiz (Student Account)

1. Logout and login as student
2. Go to "Quizzes"
3. Click on a quiz
4. Click "Start Quiz"
5. Answer questions
6. Submit quiz
7. View results

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Quizzes
- `GET /api/quizzes` - Get all quizzes
- `GET /api/quizzes/:id` - Get quiz by ID
- `POST /api/quizzes` - Create quiz (teacher/admin)
- `PUT /api/quizzes/:id` - Update quiz (teacher/admin)
- `DELETE /api/quizzes/:id` - Delete quiz (admin)

### Submissions
- `GET /api/submissions` - Get user submissions
- `GET /api/submissions/:id` - Get submission by ID
- `POST /api/submissions` - Start a quiz
- `PUT /api/submissions/:id/submit` - Submit quiz answers
- `PUT /api/submissions/:id/grade` - Grade submission (teacher/admin)

### Users
- `GET /api/users` - Get all users (admin/teacher)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin)

## Testing with Postman/Thunder Client

### 1. Register a User
```json
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student"
}
```

### 2. Login
```json
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

Copy the `token` from the response.

### 3. Get Quizzes
```
GET http://localhost:5000/api/quizzes
Authorization: Bearer YOUR_TOKEN_HERE
```

## Project Structure

```
online-quiz-exam-system/
├── client/                     # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   ├── Navbar.js
│   │   │   └── PrivateRoute.js
│   │   ├── context/           # Context API
│   │   │   └── AuthContext.js
│   │   ├── pages/             # Page components
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── QuizList.js
│   │   │   ├── QuizDetail.js
│   │   │   ├── TakeQuiz.js
│   │   │   ├── CreateQuiz.js
│   │   │   └── Results.js
│   │   ├── App.js
│   │   └── App.css
│   └── package.json
├── server/                     # Express backend
│   ├── config/
│   │   └── db.js              # Database connection
│   ├── controllers/           # Route controllers
│   │   ├── authController.js
│   │   ├── quizController.js
│   │   ├── submissionController.js
│   │   └── userController.js
│   ├── middleware/            # Custom middleware
│   │   └── auth.js            # JWT authentication
│   ├── models/                # Mongoose models
│   │   ├── User.js
│   │   ├── Quiz.js
│   │   └── Submission.js
│   ├── routes/                # API routes
│   │   ├── authRoutes.js
│   │   ├── quizRoutes.js
│   │   ├── submissionRoutes.js
│   │   └── userRoutes.js
│   └── server.js              # Entry point
├── .env                       # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Make sure MongoDB is running:
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Start MongoDB
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Linux
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Change the port in `.env` file or kill the process:
```bash
# Find process on port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### JWT Token Error
```
Error: jwt malformed
```
**Solution:** Clear localStorage in browser and login again.

### CORS Error
```
Access to XMLHttpRequest has been blocked by CORS policy
```
**Solution:** Make sure CORS is enabled in `server/server.js` (already configured).

## Features Implemented

✅ User Authentication (JWT)
✅ Role-based Access (Student, Teacher, Admin)
✅ Create/Edit/Delete Quizzes
✅ Multiple Question Types (MCQ, True/False, Short Answer)
✅ Timed Exams
✅ Auto-grading for MCQ and True/False
✅ Manual grading for Short Answer
✅ Results and Analytics
✅ Quiz History
✅ Responsive Design

## Future Enhancements

- [ ] Image upload for questions
- [ ] Quiz categories management
- [ ] Advanced analytics and charts
- [ ] Export results to PDF
- [ ] Email notifications
- [ ] Quiz templates
- [ ] Question bank
- [ ] Randomize questions
- [ ] Plagiarism detection
- [ ] Video proctoring

## Support

If you encounter any issues:
1. Check the console for errors (Browser DevTools)
2. Check server logs in the terminal
3. Verify MongoDB is running
4. Check `.env` configuration
5. Clear browser cache and localStorage

## Production Deployment

### Backend (Node.js)
- Deploy to Heroku, Railway, Render, or AWS
- Set environment variables
- Use production MongoDB (MongoDB Atlas)

### Frontend (React)
- Build: `cd client && npm run build`
- Deploy to Netlify, Vercel, or serve from Express

### Environment Variables for Production
- Change `JWT_SECRET` to a secure random string
- Update `MONGODB_URI` to production database
- Set `NODE_ENV=production`
- Update `CLIENT_URL` to your production domain

## License

MIT License - feel free to use this project for learning and development.
