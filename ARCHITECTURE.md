# System Architecture - Online Quiz & Exam System

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT SIDE                          │
│                    (React on Port 3000)                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Home Page  │  │ Auth Pages   │  │  Dashboard   │      │
│  │              │  │ - Login      │  │              │      │
│  │  - Features  │  │ - Register   │  │  - Stats     │      │
│  │  - Info      │  │              │  │  - Recent    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Quiz Pages  │  │ Create Quiz  │  │   Results    │      │
│  │ - List       │  │ (Teacher)    │  │              │      │
│  │ - Detail     │  │              │  │  - Score     │      │
│  │ - Take Quiz  │  │  - Questions │  │  - Review    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │            Context API (AuthContext)                 │    │
│  │  - User State  - Login/Logout  - Token Management   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
└───────────────────────────┬─────────────────────────────────┘
                            │
                   HTTP Requests (Axios)
                     with JWT Token
                            │
┌───────────────────────────┴─────────────────────────────────┐
│                       SERVER SIDE                            │
│                  (Express.js on Port 5000)                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   Middleware Layer                   │    │
│  │  - CORS  - JSON Parser  - JWT Auth  - Authorization │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Auth Routes  │  │ Quiz Routes  │  │ User Routes  │      │
│  │ /api/auth/*  │  │ /api/quizzes*│  │ /api/users/* │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │               │
│  ┌──────┴───────┐  ┌──────┴───────┐  ┌──────┴───────┐      │
│  │    Auth      │  │    Quiz      │  │    User      │      │
│  │  Controller  │  │  Controller  │  │  Controller  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │               │
│  ┌──────────────┐  ┌──────────────┐          │               │
│  │ Submission   │  │              │          │               │
│  │   Routes     │  │              │          │               │
│  │/api/submiss* │  │              │          │               │
│  └──────┬───────┘  │              │          │               │
│         │          │              │          │               │
│  ┌──────┴───────┐  │              │          │               │
│  │ Submission   │  │              │          │               │
│  │  Controller  │  │              │          │               │
│  └──────┬───────┘  │              │          │               │
│         │          │              │          │               │
│         └──────────┴──────────────┴──────────┘               │
│                     │                                         │
│              ┌──────┴───────┐                                │
│              │   Mongoose   │                                │
│              │     ODM      │                                │
│              └──────┬───────┘                                │
│                                                               │
└───────────────────────────┬─────────────────────────────────┘
                            │
                     MongoDB Driver
                            │
┌───────────────────────────┴─────────────────────────────────┐
│                      DATABASE LAYER                          │
│                   (MongoDB on Port 27017)                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Users     │  │   Quizzes    │  │ Submissions  │      │
│  │  Collection  │  │  Collection  │  │  Collection  │      │
│  │              │  │              │  │              │      │
│  │ - _id        │  │ - _id        │  │ - _id        │      │
│  │ - name       │  │ - title      │  │ - user (ref) │      │
│  │ - email      │  │ - questions  │  │ - quiz (ref) │      │
│  │ - password   │  │ - creator    │  │ - answers    │      │
│  │ - role       │  │ - settings   │  │ - score      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow

### 1. Authentication Flow
```
User (Browser)
    │
    ├─► Register/Login (POST /api/auth/register or /login)
    │       │
    │       ├─► Auth Controller
    │       │       │
    │       │       ├─► Validate credentials
    │       │       ├─► Hash password (bcrypt)
    │       │       ├─► Save to MongoDB
    │       │       └─► Generate JWT token
    │       │
    │       └─► Response: { token, user }
    │
    ├─► Store token in localStorage
    │
    └─► Set Authorization header for future requests
```

### 2. Quiz Creation Flow (Teacher)
```
Teacher (Browser)
    │
    ├─► Fill Create Quiz Form
    │       │
    │       ├─► Add questions
    │       ├─► Set options/answers
    │       └─► Configure settings
    │
    ├─► Submit (POST /api/quizzes)
    │       │
    │       ├─► JWT Middleware (verify token)
    │       ├─► Authorize Middleware (check role)
    │       │
    │       ├─► Quiz Controller
    │       │       │
    │       │       ├─► Validate quiz data
    │       │       ├─► Calculate total points
    │       │       └─► Save to MongoDB
    │       │
    │       └─► Response: { quiz }
    │
    └─► Redirect to quiz list
```

### 3. Taking Quiz Flow (Student)
```
Student (Browser)
    │
    ├─► Browse Quizzes (GET /api/quizzes)
    │       │
    │       └─► Display published quizzes
    │
    ├─► View Quiz Detail (GET /api/quizzes/:id)
    │
    ├─► Start Quiz (POST /api/submissions)
    │       │
    │       ├─► Create submission record
    │       ├─► Set status: in-progress
    │       └─► Return submission ID
    │
    ├─► Answer Questions
    │       │
    │       ├─► Track time
    │       ├─► Save answers locally
    │       └─► Question navigator
    │
    ├─► Submit Quiz (PUT /api/submissions/:id/submit)
    │       │
    │       ├─► Submission Controller
    │       │       │
    │       │       ├─► Record answers
    │       │       ├─► Calculate score
    │       │       ├─► Auto-grade MCQ/True-False
    │       │       ├─► Assign grade
    │       │       └─► Update submission
    │       │
    │       └─► Response: { submission with score }
    │
    └─► View Results (GET /api/submissions/:id)
            │
            └─► Display score, answers, review
```

## 🔐 Security Layers

```
Request from Browser
    │
    ├─► CORS Middleware
    │       │
    │       └─► Validates origin
    │
    ├─► JSON Parser
    │       │
    │       └─► Parses request body
    │
    ├─► JWT Auth Middleware
    │       │
    │       ├─► Extract token from header
    │       ├─► Verify token signature
    │       ├─► Check expiration
    │       └─► Attach user to request
    │
    ├─► Authorization Middleware
    │       │
    │       ├─► Check user role
    │       └─► Verify permissions
    │
    └─► Route Handler
            │
            └─► Process request
```

## 📊 Component Hierarchy

```
App
├── AuthProvider (Context)
│   └── Router
│       ├── Navbar
│       │   ├── Logo
│       │   ├── Navigation Links
│       │   └── User Menu
│       │
│       └── Routes
│           ├── Public Routes
│           │   ├── Home
│           │   ├── Login
│           │   └── Register
│           │
│           └── Private Routes
│               ├── Dashboard
│               │   ├── Stats Cards
│               │   ├── Quick Actions
│               │   └── Recent Submissions
│               │
│               ├── Quiz List
│               │   ├── Filters
│               │   └── Quiz Cards
│               │
│               ├── Quiz Detail
│               │   ├── Quiz Info
│               │   ├── Questions Preview
│               │   └── Start Button
│               │
│               ├── Take Quiz
│               │   ├── Timer
│               │   ├── Progress Bar
│               │   ├── Question Display
│               │   ├── Answer Options
│               │   └── Navigation
│               │
│               ├── Create Quiz (Teacher)
│               │   ├── Quiz Details Form
│               │   ├── Question Builder
│               │   └── Questions List
│               │
│               └── Results
│                   ├── Score Display
│                   ├── Statistics
│                   └── Answer Review
```

## 🗄️ Database Relationships

```
┌──────────────────┐
│      User        │
│   (Students,     │◄─┐
│  Teachers, etc)  │  │
└────────┬─────────┘  │
         │            │
         │ creates    │
         │            │
         ▼            │
┌──────────────────┐  │
│      Quiz        │  │
│   (Questions,    │  │
│    Settings)     │  │
└────────┬─────────┘  │
         │            │
         │ taken by   │
         │            │
         ▼            │
┌──────────────────┐  │
│   Submission     │──┘
│   (Answers,      │ belongs to
│    Score)        │
└──────────────────┘

Relationships:
- User → Quiz (One-to-Many: creator)
- User → Submission (One-to-Many: user)
- Quiz → Submission (One-to-Many: quiz)
```

## 🚦 Request/Response Flow

### Example: Student Submits Quiz

```
┌─────────┐                                           ┌─────────┐
│ Browser │                                           │  Server │
└────┬────┘                                           └────┬────┘
     │                                                      │
     │ PUT /api/submissions/123/submit                     │
     │ Authorization: Bearer <token>                       │
     │ { answers: [...] }                                  │
     │─────────────────────────────────────────────────────►│
     │                                                      │
     │                                      ┌───────────────┤
     │                                      │ Verify JWT    │
     │                                      │ Check if user │
     │                                      │ owns submission│
     │                                      └───────────────┤
     │                                                      │
     │                                      ┌───────────────┤
     │                                      │ Get quiz data │
     │                                      │ from MongoDB  │
     │                                      └───────────────┤
     │                                                      │
     │                                      ┌───────────────┤
     │                                      │ Calculate     │
     │                                      │ score for each│
     │                                      │ answer        │
     │                                      └───────────────┤
     │                                                      │
     │                                      ┌───────────────┤
     │                                      │ Compute total │
     │                                      │ percentage &  │
     │                                      │ grade         │
     │                                      └───────────────┤
     │                                                      │
     │                                      ┌───────────────┤
     │                                      │ Update        │
     │                                      │ submission in │
     │                                      │ MongoDB       │
     │                                      └───────────────┤
     │                                                      │
     │ ◄────────────────────────────────────────────────────│
     │ { success: true, data: submission }                 │
     │                                                      │
     ├────────────────────┐                                │
     │ Navigate to        │                                │
     │ Results page       │                                │
     └────────────────────┘                                │
```

## 🎯 Key Design Patterns

### 1. **MVC Pattern**
```
Model (MongoDB Schema)
    ↕
Controller (Business Logic)
    ↕
View (React Components)
```

### 2. **Repository Pattern**
```
Controllers → Models → Database
(Business)  (Schema)  (Storage)
```

### 3. **Middleware Pattern**
```
Request → Middleware Chain → Route Handler
         (Auth, CORS, etc)
```

### 4. **Context Pattern** (Frontend)
```
AuthProvider (State)
    ↓
Components (Consumers)
```

### 5. **Protected Routes Pattern**
```
Route → PrivateRoute → Check Auth → Component
                           ↓
                    Redirect to Login
```

## 📈 Scalability Considerations

### Current Architecture (Monolithic)
```
Frontend ←→ Backend ←→ MongoDB
```

### Future Scalability (Microservices)
```
Frontend ─┬─→ Auth Service ──→ Auth DB
          ├─→ Quiz Service ──→ Quiz DB
          └─→ Analytics Service ──→ Analytics DB
```

### Caching Strategy
```
Request → Check Cache → Return cached data
              ↓
          Cache miss
              ↓
       Fetch from DB → Store in cache → Return data
```

### Load Balancing
```
            Load Balancer
                 │
      ┌──────────┼──────────┐
      ▼          ▼          ▼
   Server 1   Server 2   Server 3
      │          │          │
      └──────────┴──────────┘
              ▼
          MongoDB Replica Set
```

## 🔄 State Management Flow

```
User Action (Click, Input)
    │
    ├─► Local State (useState)
    │       │
    │       └─► Component re-renders
    │
    ├─► Context State (useContext)
    │       │
    │       ├─► All consumers re-render
    │       └─► Persist to localStorage
    │
    └─► API Call
            │
            ├─► Update backend
            └─► Update state on response
```

## 📱 Responsive Design Strategy

```
Desktop (>992px)
├── Full navigation
├── Multi-column layouts
└── Large forms

Tablet (768px - 992px)
├── Condensed navigation
├── 2-column layouts
└── Medium forms

Mobile (<768px)
├── Hamburger menu
├── Single column
└── Stacked forms
```

---

This architecture provides:
- ✅ Separation of concerns
- ✅ Scalability
- ✅ Maintainability
- ✅ Security
- ✅ Performance
- ✅ Testability
