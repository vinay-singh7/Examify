# 🚀 Quick Start Guide - Online Quiz & Exam System

## ⚡ 5-Minute Setup

### Step 1: Install Dependencies (2 minutes)
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client && npm install && cd ..
```

### Step 2: Start MongoDB (30 seconds)
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows - MongoDB runs as a service automatically
```

### Step 3: Start the Application (30 seconds)
```bash
# This starts both frontend (port 3000) and backend (port 5000)
npm run dev
```

### Step 4: Open Browser (10 seconds)
```
http://localhost:3000
```

## 🎯 First-Time Setup

### Create Your First Teacher Account
1. Click "Register"
2. Enter:
   - Name: John Teacher
   - Email: teacher@example.com
   - Password: password123
   - Role: **Teacher**
3. Click Register

### Create Your First Quiz
1. After login, click "Create Quiz"
2. Fill in:
   ```
   Title: Sample Math Quiz
   Description: Basic arithmetic questions
   Category: Mathematics
   Difficulty: Easy
   Time Limit: 15 minutes
   Passing Score: 60%
   Attempts Allowed: 2
   Check "Publish immediately"
   ```

3. Add Question 1 (Multiple Choice):
   ```
   Question: What is 2 + 2?
   Type: Multiple Choice
   Points: 1
   Options:
     - 3
     - 4 ✓ (mark as correct)
     - 5
     - 6
   Explanation: Basic addition
   ```
   Click "Add Question"

4. Add Question 2 (True/False):
   ```
   Question: 10 ÷ 2 = 5
   Type: True/False
   Points: 1
   Correct Answer: True
   Explanation: Basic division
   ```
   Click "Add Question"

5. Add Question 3 (Short Answer):
   ```
   Question: What is the square root of 16?
   Type: Short Answer
   Points: 2
   Explanation: The square root of 16 is 4
   ```
   Click "Add Question"

6. Click "Create Quiz" button

### Create a Student Account
1. Logout (click Logout button)
2. Click "Register"
3. Enter:
   - Name: Jane Student
   - Email: student@example.com
   - Password: password123
   - Role: **Student**
4. Click Register

### Take Your First Quiz
1. Click "Quizzes" in navigation
2. Click on "Sample Math Quiz"
3. Click "Start Quiz"
4. Answer the questions:
   - Q1: Select "4"
   - Q2: Select "True"
   - Q3: Type "4"
5. Click "Submit Quiz"
6. View your results!

## 🎓 Test All Features

### As Teacher:
- ✅ Create quiz
- ✅ Edit quiz
- ✅ View submissions
- ✅ Grade short-answer questions

### As Student:
- ✅ Browse quizzes
- ✅ Take quiz
- ✅ View results
- ✅ Check dashboard
- ✅ Review answers

## 📝 Sample Quiz Templates

### Programming Quiz
```
Title: JavaScript Basics
Category: Programming
Difficulty: Medium
Time: 20 minutes

Q1: Which keyword is used to declare a variable in ES6?
- var
- let ✓
- variable
- declare

Q2: JavaScript is a compiled language.
Answer: False

Q3: What does DOM stand for?
Answer: Document Object Model
```

### General Knowledge Quiz
```
Title: World Capitals
Category: Geography
Difficulty: Easy
Time: 10 minutes

Q1: What is the capital of France?
- London
- Berlin
- Paris ✓
- Rome

Q2: Tokyo is the capital of Japan.
Answer: True

Q3: What is the capital of Australia?
Answer: Canberra
```

## 🐛 Common Issues & Quick Fixes

### Issue: Port 5000 already in use
```bash
# Kill the process
lsof -i :5000
kill -9 <PID>

# Or change port in .env
PORT=5001
```

### Issue: MongoDB not running
```bash
# Start MongoDB
brew services start mongodb-community

# Verify it's running
mongosh
```

### Issue: Can't connect to backend
```
Check:
1. Backend is running on port 5000
2. MongoDB is running
3. .env file exists
4. No firewall blocking
```

### Issue: Login not working
```
1. Clear browser cache and localStorage
2. Check if JWT_SECRET is set in .env
3. Verify MongoDB connection
4. Check console for errors
```

## 📊 Project Status Check

After starting, verify:

✅ Backend running: http://localhost:5000
```json
{"message": "Online Quiz & Exam System API"}
```

✅ Frontend running: http://localhost:3000
```
Should see the home page
```

✅ MongoDB connected:
```
Server logs should show: "MongoDB Connected: localhost"
```

## 🎨 Customization Ideas

### Change Colors
Edit `client/src/App.css`:
```css
.btn-primary {
  background-color: #your-color;
}
```

### Add New Categories
In `client/src/pages/QuizList.js`:
```javascript
<option value="YourCategory">Your Category</option>
```

### Modify Timer
In `client/src/pages/TakeQuiz.js`:
```javascript
setTimeLeft(res.data.data.timeLimit * 60); // Change multiplier
```

## 📱 Mobile Testing

The app is responsive! Test on:
- Chrome DevTools (F12 → Toggle Device Toolbar)
- Real mobile device (use same WiFi)
- Access via: http://YOUR_LOCAL_IP:3000

## 🚀 Next Steps

1. ✅ Complete quick start (you're here!)
2. 📖 Read `SETUP_GUIDE.md` for detailed info
3. 📊 Check `PROJECT_SUMMARY.md` for architecture
4. 🎓 Create more quizzes
5. 🌟 Customize and extend features
6. 🚢 Deploy to production

## 💡 Pro Tips

1. **Use keyboard shortcuts:**
   - Tab: Navigate form fields
   - Enter: Submit forms
   - Arrow keys: Navigate quiz questions

2. **Test different roles:**
   - Create multiple accounts
   - Test permissions
   - Verify access control

3. **Monitor console:**
   - Backend: Server logs in terminal
   - Frontend: Browser DevTools (F12)

4. **Database viewing:**
   ```bash
   mongosh
   use quiz-exam-system
   db.quizzes.find().pretty()
   db.users.find().pretty()
   db.submissions.find().pretty()
   ```

5. **API testing:**
   - Use Postman or Thunder Client
   - Test endpoints directly
   - Verify responses

## 📞 Need Help?

Check these files:
- 📖 `README.md` - Overview and features
- 🔧 `SETUP_GUIDE.md` - Detailed setup
- 📊 `PROJECT_SUMMARY.md` - Architecture
- ❓ Console errors - Check browser DevTools

## ✨ You're Ready!

Your Online Quiz & Exam System is now running!

**Frontend:** http://localhost:3000
**Backend:** http://localhost:5000

Happy coding! 🎉
