import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
import Login          from './pages/Login';
import Register       from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword  from './pages/ResetPassword';
import Dashboard      from './pages/Dashboard';
import Catalog        from './pages/Catalog';
import BookDetail     from './pages/BookDetail';
import ManageBooks    from './pages/ManageBooks';
import ManageUsers    from './pages/ManageUsers';
import Transactions   from './pages/Transactions';
import Profile        from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Protected routes — all roles */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard"    element={<Dashboard />} />
            <Route path="/catalog"      element={<Catalog />} />
            <Route path="/books/:id"    element={<BookDetail />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/profile"      element={<Profile />} />

            {/* Admin-only routes */}
            <Route
              path="/admin/books"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ManageBooks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ManageUsers />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Fallback redirect */}
          <Route path="*"  element={<Navigate to="/dashboard" replace />} />
          <Route path="/"  element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
