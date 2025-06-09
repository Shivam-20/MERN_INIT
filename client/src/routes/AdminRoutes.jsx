import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminLayout from '../layouts/AdminLayout';
import UsersPage from '../pages/admin/UsersPage';
import UserEditPage from '../pages/admin/UserEditPage';
import UserCreatePage from '../pages/admin/UserCreatePage';
import DashboardPage from '../pages/admin/DashboardPage';

const AdminRoutes = () => {
  const { user, loading } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
  }


  // Redirect to home if not an admin
  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <AdminLayout>
      <Routes>
        <Route index element={<DashboardPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="users/new" element={<UserCreatePage />} />
        <Route path="users/:userId/edit" element={<UserEditPage />} />
        {/* Add more admin routes here as needed */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminRoutes;
