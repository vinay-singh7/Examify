# Examify — Modern Online Quiz & Exam Platform

Examify is a comprehensive, production-ready MERN stack application designed for conducting secure online examinations, assessments, and quizzes with modern Clerk authentication and real-time proctoring features.

---

## ✨ Features

### 🔐 Pure Clerk Authentication
- **100% Clerk Powered**: No vulnerable manual credentials — seamless passwordless, Google, and email OTP sign-ins.
- **Role Selection on Registration**: Built-in Student (`🎓`) and Teacher/Admin (`👨‍🏫`) role selection.
- **Automatic MongoDB Sync**: Clerk user sessions are automatically synchronized with MongoDB Atlas for full compatibility with quiz creation and score tracking.

### 🎓 For Students
- Clean, distraction-free assessment environment.
- Timed exams with live progress indicators.
- Instant score calculation and detailed answers breakdown.
- Global and quiz-specific leaderboards.
- Anti-cheat monitoring (fullscreen violation detection & tab-switch tracker).

### 👨‍🏫 For Teachers & Admins
- Dynamic Quiz Builder supporting Multiple Choice Questions (MCQ) with custom scoring.
- Comprehensive student attempt analytics and performance breakdowns.
- Time limit configurations and negative marking support.
- Student management dashboard.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, React Router v7, `@clerk/react`, Axios, Vanilla CSS with Glassmorphism
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: Clerk Authentication (`@clerk/react`) + JWT backend tokens
- **Deployment**: Render Web Services

---

## 📁 Project Structure

```text
Examify/
├── client/                     # React 19 Frontend
│   ├── public/                 # HTML templates & static icons
│   ├── src/
│   │   ├── components/         # Reusable components (Navbar, ClerkSync, PrivateRoute)
│   │   ├── context/            # AuthContext & state providers
│   │   ├── pages/              # Quiz, Dashboard, Login, Leaderboard pages
│   │   └── services/           # Axios API service
│   └── package.json
├── server/                     # Express.js Backend
│   ├── config/                 # MongoDB database connection
│   ├── controllers/            # Auth, Quiz, User, Submission controllers
│   ├── middleware/             # Auth & Role verification middleware
│   ├── models/                 # User, Quiz, and Submission schemas
│   ├── routes/                 # REST API endpoints
│   └── server.js               # Express application entry & production static serving
├── render.yaml                 # Render Blueprint configuration
├── package.json                # Root package & deployment scripts
└── README.md
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **MongoDB** (Local instance or MongoDB Atlas cluster)
- **Clerk Account** (Free tier at [clerk.com](https://clerk.com))

### 2. Installation
Clone the repository and install all dependencies:
```bash
git clone https://github.com/vinay-singh7/Examify.git
cd Examify
npm run install-all
```

### 3. Environment Setup

Create `.env` in the root directory:
```env
PORT=5001
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:3000
```

Create `client/.env.local`:
```env
REACT_APP_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

### 4. Run Locally
Run both backend (port 5001) and frontend (port 3000) concurrently:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deployment on Render

This project is configured for deployment on [Render](https://render.com) as a single Unified Web Service.

### Quick Deploy via Render Web Service:
1. Link your GitHub repository (`Examify`) on Render.
2. Select **Web Service** with the following settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
3. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `your_mongodb_atlas_uri`
   - `JWT_SECRET`: `your_jwt_secret_key`
   - `REACT_APP_CLERK_PUBLISHABLE_KEY`: `your_clerk_publishable_key`
4. Click **Deploy Web Service**.

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
