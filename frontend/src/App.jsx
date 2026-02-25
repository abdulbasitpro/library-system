import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Existing pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Catalog from './pages/Catalog';
import Transactions from './pages/Transactions';
import ManageBooks from './pages/ManageBooks';
import ManageUsers from './pages/ManageUsers';
import Profile from './pages/Profile';

// New Phase 1 pages
import Wishlist      from './pages/Wishlist';
import ReadingHistory from './pages/ReadingHistory';
import Reservations  from './pages/Reservations';
import Fines         from './pages/Fines';
import BookRequests  from './pages/BookRequests';
import Messages      from './pages/Messages';
import Analytics     from './pages/Analytics';
import ImportBooks   from './pages/ImportBooks';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            {/* ── General (all logged-in users) ── */}
            <Route path="/dashboard"      element={<Dashboard />} />
            <Route path="/catalog"        element={<Catalog />} />
            <Route path="/transactions"   element={<Transactions />} />
            <Route path="/profile"        element={<Profile />} />
            <Route path="/wishlist"       element={<Wishlist />} />
            <Route path="/reading-history" element={<ReadingHistory />} />
            <Route path="/reservations"   element={<Reservations />} />
            <Route path="/fines"          element={<Fines />} />
            <Route path="/book-requests"  element={<BookRequests />} />
            <Route path="/messages"       element={<Messages />} />

            {/* ── Admin Only Routes ── */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin/analytics" element={<Analytics />} />
              <Route path="/admin/import"    element={<ImportBooks />} />
              <Route path="/admin/books"     element={<ManageBooks />} />
              <Route path="/admin/users"     element={<ManageUsers />} />
            </Route>
          </Route>
        </Route>

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
