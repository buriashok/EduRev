import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Courses from './pages/Courses/Courses';
import CreateCourse from './pages/Instructor/CreateCourse';
import Quiz from './pages/Quiz/Quiz';
import LiveClasses from './pages/LiveClasses/LiveClasses';
import Forum from './pages/Forum/Forum';
import Dashboard from './pages/Dashboard/Dashboard';
import Checkout from './pages/Checkout/Checkout';
import EduDashboard from './pages/EduRevolution/EduDashboard';
import Profile from './pages/Profile/Profile';
import Settings from './pages/Settings/Settings';

function App() {
  return (
    <Router>
      <Navbar />
      <main style={{ paddingTop: '80px', minHeight: 'calc(100vh - 100px)' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/instructor/create-course" element={<CreateCourse />} />
          <Route path="/quiz/:quizId" element={<Quiz />} />
          <Route path="/live-classes" element={<LiveClasses />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/edu-revolution" element={<EduDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
