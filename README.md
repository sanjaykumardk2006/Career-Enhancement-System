# 🚀 CareerAI - Career Enhancement System

An AI-powered full-stack MERN application for career guidance, resume building, mock interviews, and job tracking.

## 🏗️ Project Structure

```
Career Enhancement System/
├── backend/                    # Node.js + Express API
│   ├── config/db.js            # MongoDB Atlas connection
│   ├── controllers/            # Business logic
│   │   ├── authController.js   # Registration, login, profile
│   │   ├── careerController.js # AI recommendations, chatbot, roadmap
│   │   ├── resumeController.js # Resume CRUD + AI analysis
│   │   ├── interviewController.js # AI mock interview
│   │   └── jobController.js    # Job tracker + admin stats
│   ├── middleware/authMiddleware.js  # JWT auth guard
│   ├── models/                 # Mongoose schemas
│   │   ├── User.js
│   │   ├── Resume.js
│   │   ├── Interview.js
│   │   ├── JobApplication.js
│   │   └── LearningRoadmap.js
│   ├── routes/                 # Express route definitions
│   ├── utils/
│   │   ├── geminiClient.js     # Google Gemini AI utility
│   │   └── generateToken.js    # JWT token generator
│   ├── server.js               # Express entry point
│   ├── package.json
│   └── .env                    # Environment variables (configure this!)
└── frontend/                   # React + Vite frontend
    ├── public/                 # Static assets
    ├── src/
    │   ├── assets/             # Images & static media
    │   ├── components/layout/  # Sidebar, Layout
    │   ├── context/AuthContext.jsx # Global auth state
    │   ├── hooks/              # Custom React hooks
    │   ├── pages/
    │   │   ├── auth/           # Login, Register, Profile
    │   │   ├── career/         # Goals, Recommendations, Chatbot, SkillGap, Roadmap
    │   │   ├── resume/         # Builder, Upload
    │   │   ├── interview/      # MockInterview, InterviewSession
    │   │   ├── jobs/           # JobTracker
    │   │   └── admin/          # AdminDashboard
    │   ├── services/api.js     # Axios API service
    │   ├── App.jsx             # Router + protected routes
    │   └── main.jsx            # Frontend entry point
    ├── index.html              # HTML entry point
    ├── vite.config.js          # Vite config & API proxy
    └── package.json
```

## ⚡ Quick Setup

### 1. Configure the Backend

Edit `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/careerAI
JWT_SECRET=your_super_secret_key_here
GEMINI_API_KEY=your_google_gemini_api_key
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

**Get your keys:**
- 🍃 MongoDB: [cloud.mongodb.com](https://cloud.mongodb.com) → Create free cluster → Get connection string
- 🤖 Gemini AI: [aistudio.google.com](https://aistudio.google.com) → Get API Key

### 2. Start the Backend

```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

### 3. Start the Frontend

```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

*(Alternatively, from the root folder you can run `npm run dev:backend` or `npm run dev:frontend`)*

## 🎯 Features (18 Modules)

| Epic | Module | Description |
|------|---------|-------------|
| **User Auth** | Student Registration | Sign up with name, email, password |
| | Student Login | Login with JWT authentication |
| | Manage Profile | Edit personal info, skills, career goal |
| **AI Career Guidance** | Career Goal Selection | Choose from 16 preset career paths |
| | AI Career Recommendation | Gemini AI analyzes your profile & suggests career paths |
| | AI Career Chatbot | Context-aware conversational career advisor |
| **Resume Management** | Resume Builder | 7-section resume builder (Personal, Education, Experience...) |
| | Resume Upload | Drag & drop PDF/DOC upload |
| | AI Resume Analysis | Gemini AI scores resume & gives improvement tips |
| **Skill Gap & Learning** | Skill Gap Analysis | AI compares your skills vs target role requirements |
| | Personalized Learning Roadmap | AI generates phased learning plan with real resources |
| | Learning Progress Tracking | Mark topics complete, track % progress |
| **AI Mock Interview** | Start AI Mock Interview | AI generates role-specific interview questions |
| | Submit Interview Answers | Answer questions with navigation |
| | Interview Feedback | Per-question AI scoring + overall feedback |
| **Job Tracking & Admin** | Job Application Tracker | Track applications with status pipeline |
| | Application Status Tracking | Filter by status, timeline history |
| | Admin Dashboard | Platform stats, Recharts visualization |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6 |
| State | React Context API |
| Styling | Vanilla CSS (custom dark design system) |
| HTTP Client | Axios |
| Charts | Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + bcryptjs |
| AI | Google Gemini 1.5 Flash |
| File Upload | Multer |

## 🔐 Default Demo Accounts (Create via Register)

After running, register any account. To create an admin:
- Register normally, then in MongoDB Atlas change `role: "student"` → `role: "admin"` for that user document.
