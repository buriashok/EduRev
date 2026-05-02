import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Navigate, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Public/Home/Home';
import Login from './pages/Public/Login/Login';
import ResetPassword from './pages/Public/Login/ResetPassword';
import VerifyEmail from './pages/Public/Login/VerifyEmail';
import Register from './pages/Public/Register/Register';
import Courses from './pages/Public/Courses/Courses';
import CreateCourse from './pages/Instructor/CreateCourse';
import Quiz from './pages/Student/Quiz/Quiz';
import LiveClasses from './pages/Student/LiveClasses/LiveClasses';
import LiveClassDetail from './pages/Student/LiveClasses/LiveClassDetail';
import Forum from './pages/Student/Forum/Forum';
import Dashboard from './pages/Student/Dashboard/Dashboard';
import Checkout from './pages/Public/Checkout/Checkout';
import Settings from './pages/Shared/Settings/Settings';
import SessionManager from './pages/Shared/Settings/SessionManager';
import AdminDashboard from './pages/Admin/AdminDashboard';
import CourseView from './pages/Public/Courses/CourseView';
import Certificate from './pages/Student/Certificate/Certificate';
import Leaderboard from './pages/Student/Leaderboard/Leaderboard';
import { useAuth } from './context/AuthContext';
import Maintenance from './pages/Shared/Maintenance/Maintenance';
import Notifications from './pages/Shared/Notifications/Notifications';
import { adminApi } from './services/api';

const RoleHome = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Home />;
  if (user.role === 'INSTRUCTOR') return <Navigate to="/dashboard" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  return <Home />;
};

import RoleLayout from './components/Layout/RoleLayout';

import StudentRoster from './pages/Instructor/StudentRoster';
import MyLiveSessions from './pages/Instructor/MyLiveSessions';
import UserManagement from './pages/Admin/UserManagement';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await adminApi.getSettings();
        setMaintenanceMode(res.data.maintenanceMode === 'true');
      } catch {
        console.error('Failed to fetch platform status');
      } finally {
        setLoadingSettings(false);
      }
    };
    checkStatus();
  }, []);

  if (!authLoading && !loadingSettings && maintenanceMode && user?.role !== 'ADMIN' && location.pathname !== '/maintenance' && location.pathname !== '/login') {
    return <Navigate to="/maintenance" replace />;
  }

  return (
    <RoleLayout>
      <Routes>
        <Route path="/" element={<RoleHome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/register" element={<Register />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/instructor/create-course" element={<RequireRole roles={['INSTRUCTOR', 'ADMIN']}><CreateCourse /></RequireRole>} />
        <Route path="/instructor/students" element={<RequireRole roles={['INSTRUCTOR', 'ADMIN']}><StudentRoster /></RequireRole>} />
        <Route path="/instructor/live-sessions" element={<RequireRole roles={['INSTRUCTOR', 'ADMIN']}><MyLiveSessions /></RequireRole>} />
        <Route path="/instructor/live-classes/:id" element={<RequireRole roles={['INSTRUCTOR', 'ADMIN']}><LiveClassDetail /></RequireRole>} />
        <Route path="/quiz/:quizId" element={<Quiz />} />
        <Route path="/live-classes" element={<LiveClasses />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/admin/dashboard" element={<RequireRole roles={['ADMIN']}><AdminDashboard /></RequireRole>} />
        <Route path="/admin/users" element={<RequireRole roles={['ADMIN']}><UserManagement /></RequireRole>} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
        <Route path="/settings/sessions" element={<RequireAuth><SessionManager /></RequireAuth>} />
        <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/learn/:courseId" element={<RequireAuth><CourseView /></RequireAuth>} />
        <Route path="/certificate/:id" element={<RequireAuth><Certificate /></RequireAuth>} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/maintenance" element={<Maintenance />} />
      </Routes>
    </RoleLayout>
  );
}

function RequireAuth({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return user ? children : <Navigate to="/login" replace />;
}

function RequireRole({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return roles.includes(user.role) ? children : <Navigate to="/dashboard" replace />;
}

export default App;
