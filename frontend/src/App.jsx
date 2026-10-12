import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout
import Layout from './components/layout/Layout';

// Pages - Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/auth/Profile';

// Pages - Main
import Dashboard from './pages/Dashboard';

// Pages - Career
import CareerGoals from './pages/career/CareerGoals';
import CareerRecommendations from './pages/career/CareerRecommendations';
import CareerChatbot from './pages/career/CareerChatbot';
import SkillGap from './pages/career/SkillGap';
import LearningRoadmap from './pages/career/LearningRoadmap';

// Pages - Resume
import ResumeBuilder from './pages/resume/ResumeBuilder';
import ResumeUpload from './pages/resume/ResumeUpload';

// Pages - Interview
import MockInterview from './pages/interview/MockInterview';
import InterviewSession from './pages/interview/InterviewSession';

// Pages - Jobs
import JobTracker from './pages/jobs/JobTracker';

// Pages - Admin
import AdminDashboard from './pages/admin/AdminDashboard';

// Protected Route
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="spinner" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

// App Routes
function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />

      {/* Protected Routes (all wrapped in Layout) */}
      <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />

      {/* Career */}
      <Route path="/career/goals" element={<ProtectedRoute><Layout><CareerGoals /></Layout></ProtectedRoute>} />
      <Route path="/career/recommendations" element={<ProtectedRoute><Layout><CareerRecommendations /></Layout></ProtectedRoute>} />
      <Route path="/career/chatbot" element={<ProtectedRoute><Layout><CareerChatbot /></Layout></ProtectedRoute>} />

      {/* Skills */}
      <Route path="/skills/gap" element={<ProtectedRoute><Layout><SkillGap /></Layout></ProtectedRoute>} />
      <Route path="/skills/roadmap" element={<ProtectedRoute><Layout><LearningRoadmap /></Layout></ProtectedRoute>} />

      {/* Resume */}
      <Route path="/resume/builder" element={<ProtectedRoute><Layout><ResumeBuilder /></Layout></ProtectedRoute>} />
      <Route path="/resume/upload" element={<ProtectedRoute><Layout><ResumeUpload /></Layout></ProtectedRoute>} />

      {/* Interview */}
      <Route path="/interview" element={<ProtectedRoute><Layout><MockInterview /></Layout></ProtectedRoute>} />
      <Route path="/interview/:id" element={<ProtectedRoute><Layout><InterviewSession /></Layout></ProtectedRoute>} />

      {/* Jobs */}
      <Route path="/jobs" element={<ProtectedRoute><Layout><JobTracker /></Layout></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute adminOnly><Layout><AdminDashboard /></Layout></ProtectedRoute>} />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              fontSize: '0.875rem',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
