import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCoaches from './pages/admin/AdminCoaches';
import AdminCourses from './pages/admin/AdminCourses';
import AdminReservations from './pages/admin/AdminReservations';
import AdminUsers from './pages/admin/AdminUsers';
import CoachDashboard from './pages/coach/CoachDashboard';
import CoachReservations from './pages/coach/CoachReservations';
import CoachAvailability from './pages/coach/CoachAvailability';
import CoachProfile from './pages/coach/CoachProfile';
import ClientDashboard from './pages/client/ClientDashboard';
import CoachesList from './pages/client/CoachesList';
import CoachDetail from './pages/client/CoachDetail';
import CoursesList from './pages/client/CoursesList';
import MyReservations from './pages/client/MyReservations';
import MyProfile from './pages/client/MyProfile';
import Layout from './components/layout/Layout';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-loading"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const RoleRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-loading"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'coach') return <Navigate to="/coach" replace />;
  return <Navigate to="/client" replace />;
};

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a1d24', color: '#e8e9ec', border: '1px solid #2a2d36', fontFamily: 'DM Sans, sans-serif', fontSize: '14px' }, success: { iconTheme: { primary: '#22c55e', secondary: '#1a1d24' } }, error: { iconTheme: { primary: '#ef4444', secondary: '#1a1d24' } } }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<RoleRedirect />} />
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Layout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="coaches" element={<AdminCoaches />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="reservations" element={<AdminReservations />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
        <Route path="/coach" element={<ProtectedRoute roles={['coach']}><Layout /></ProtectedRoute>}>
          <Route index element={<CoachDashboard />} />
          <Route path="reservations" element={<CoachReservations />} />
          <Route path="availability" element={<CoachAvailability />} />
          <Route path="profile" element={<CoachProfile />} />
        </Route>
        <Route path="/client" element={<ProtectedRoute roles={['client']}><Layout /></ProtectedRoute>}>
          <Route index element={<ClientDashboard />} />
          <Route path="coaches" element={<CoachesList />} />
          <Route path="coaches/:id" element={<CoachDetail />} />
          <Route path="courses" element={<CoursesList />} />
          <Route path="reservations" element={<MyReservations />} />
          <Route path="profile" element={<MyProfile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);
export default App;
