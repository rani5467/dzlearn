import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Layout/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Courses from './pages/Courses';
import Quizzes from './pages/Quizzes';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import AdminPanel from './pages/Admin/AdminPanel';
import './index.css';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user)             return <Navigate to="/login"     replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/dashboard" replace />;
}

function Spinner() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--bg)' }}>
      <div className="spinner" style={{ width:40, height:40 }} />
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Admin — full page, no Navbar */}
      <Route path="/admin/*" element={<AdminRoute><AdminPanel /></AdminRoute>} />

      {/* All other pages — with Navbar */}
      <Route path="*" element={
        <>
          <Navbar />
          <Routes>
            <Route path="/"            element={<Home />} />
            <Route path="/courses"     element={<Courses />} />
            <Route path="/quizzes"     element={<Quizzes />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/login"       element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register"    element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/dashboard"   element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="*"            element={<Navigate to="/" replace />} />
          </Routes>
        </>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
