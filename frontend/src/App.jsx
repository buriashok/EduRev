import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Navigate, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import ResetPassword from './pages/Login/ResetPassword';
import VerifyEmail from './pages/Login/VerifyEmail';
import Register from './pages/Register/Register';
import Courses from './pages/Courses/Courses';
import CreateCourse from './pages/Instructor/CreateCourse';
import Quiz from './pages/Quiz/Quiz';
import LiveClasses from './pages/LiveClasses/LiveClasses';
import Forum from './pages/Forum/Forum';
import Dashboard from './pages/Dashboard/Dashboard';
import Checkout from './pages/Checkout/Checkout';
import Settings from './pages/Settings/Settings';
import SessionManager from './pages/Settings/SessionManager';
import AdminDashboard from './pages/Admin/AdminDashboard';
import CourseView from './pages/Courses/CourseView';
import Certificate from './pages/Certificate/Certificate';
import Leaderboard from './pages/Leaderboard/Leaderboard';
import AiMentor from './components/AiMentor/AiMentor';
import { useAuth } from './context/AuthContext';
import Maintenance from './pages/Maintenance/Maintenance';
import { adminApi } from './services/api';

const RoleHome = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Home />;
  if (user.role === 'INSTRUCTOR') return <Navigate to="/dashboard" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  return <Home />;
};

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
      } catch (err) {
        console.error('Failed to fetch platform status');
      } finally {
        setLoadingSettings(false);
      }
    };
    checkStatus();
  }, []);

  const hideFooter = location.pathname.startsWith('/dashboard')
    || location.pathname.startsWith('/admin')
    || location.pathname.startsWith('/settings')
    || location.pathname.startsWith('/instructor')
    || location.pathname.startsWith('/learn')
    || location.pathname.startsWith('/maintenance');

  if (!authLoading && !loadingSettings && maintenanceMode && user?.role !== 'ADMIN' && location.pathname !== '/maintenance' && location.pathname !== '/login') {
    return <Navigate to="/maintenance" replace />;
  }

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '80px', minHeight: 'calc(100vh - 100px)' }}>
        <Routes>
          <Route path="/" element={<RoleHome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/register" element={<Register />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/instructor/create-course" element={<RequireRole roles={['INSTRUCTOR', 'ADMIN']}><CreateCourse /></RequireRole>} />
          <Route path="/quiz/:quizId" element={<Quiz />} />
          <Route path="/live-classes" element={<LiveClasses />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/admin/dashboard" element={<RequireRole roles={['ADMIN']}><AdminDashboard /></RequireRole>} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
          <Route path="/settings/sessions" element={<RequireAuth><SessionManager /></RequireAuth>} />
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/learn/:courseId" element={<RequireAuth><CourseView /></RequireAuth>} />
          <Route path="/certificate/:id" element={<RequireAuth><Certificate /></RequireAuth>} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/maintenance" element={<Maintenance />} />
        </Routes>
      </main>
      <AiMentor />
      {location.pathname === '/' && <Footer />}
    </>
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
