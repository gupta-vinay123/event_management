import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';

import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import AdminNavbar from './components/Admin/AdminNavbar';
import UserFooter from './components/User/UserFooter';

// Public pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp';          
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import Support from './pages/Support';

// User pages (require login)
import UserDashboard from './pages/UserDashboard';
import EventListView from './pages/EventListView';
import EventDetailsView from './pages/EventDetailsView';

// Admin pages (require login + admin role)
import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AddEvent from './pages/Admin/AddEvent';
import EventList from './pages/Admin/EventList';
import EditEvent from './pages/Admin/EditEvent';
import UserList from './pages/Admin/UserList';
import Report from './pages/Admin/Report';

// Admin Layout Helper
const AdminLayout = ({ children }) => (
  <div className="min-h-screen bg-[#050505] pl-64">
    <AdminNavbar />
    <div className="p-8">{children}</div>
  </div>
);

// User Layout Helper
const UserLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen bg-[#050505]">
    <div className="flex-grow">{children}</div>
    <UserFooter />
  </div>
);

function App() {
    return (
        <Router>
            <Routes>
                {/* ── Public routes ────────────────────────────────────── */}
                <Route path="/"            element={<LandingPage />} />
                <Route path="/login"       element={<Login />} />
                <Route path="/register"    element={<Register />} />
                <Route path="/verify-otp"  element={<VerifyOtp />} />   
                <Route path="/admin-login" element={<AdminLogin />} />

                {/* ── User routes (must be logged in) ──────────────────── */}
                <Route path="/home" element={
                    <ProtectedRoute>
                        <UserLayout><UserDashboard /></UserLayout>
                    </ProtectedRoute>
                } />
                <Route path="/events" element={
                    <ProtectedRoute>
                        <UserLayout><EventListView /></UserLayout>
                    </ProtectedRoute>
                } />
                <Route path="/event/:id" element={
                    <ProtectedRoute>
                        <EventDetailsView />
                    </ProtectedRoute>
                } />
                <Route path="/aboutus" element={
                    <ProtectedRoute>
                        <UserLayout><AboutUs /></UserLayout>
                    </ProtectedRoute>
                } />
                <Route path="/contactus" element={
                    <ProtectedRoute>
                        <UserLayout><ContactUs /></UserLayout>
                    </ProtectedRoute>
                } />
                <Route path="/support" element={
                    <ProtectedRoute>
                        <UserLayout><Support /></UserLayout>
                    </ProtectedRoute>
                } />

                {/* ── Admin routes ──────────────────────────────────────── */}
                <Route path="/admin/dashboard" element={
                    <ProtectedRoute requiredRole="admin">
                        <AdminLayout><AdminDashboard /></AdminLayout>
                    </ProtectedRoute>
                } />
                <Route path="/admin/add-event" element={
                    <ProtectedRoute requiredRole="admin">
                        <AdminLayout><AddEvent /></AdminLayout>
                    </ProtectedRoute>
                } />
                <Route path="/admin/events" element={
                    <ProtectedRoute requiredRole="admin">
                        <AdminLayout><EventList /></AdminLayout>
                    </ProtectedRoute>
                } />
                <Route path="/admin/edit-event/:id" element={
                    <ProtectedRoute requiredRole="admin">
                        <AdminLayout><EditEvent /></AdminLayout>
                    </ProtectedRoute>
                } />
                <Route path="/admin/users" element={
                    <ProtectedRoute requiredRole="admin">
                        <AdminLayout><UserList /></AdminLayout>
                    </ProtectedRoute>
                } />
                <Route path="/admin/reports" element={
                    <ProtectedRoute requiredRole="admin">
                        <AdminLayout><Report /></AdminLayout>
                    </ProtectedRoute>
                } />
            </Routes>
        </Router>
    );
}

export default App;
