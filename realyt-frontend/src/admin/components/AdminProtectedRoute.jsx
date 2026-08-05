import { Navigate, Outlet } from 'react-router-dom';

export default function AdminProtectedRoute() {
  const token = localStorage.getItem('realyt_admin_token') || localStorage.getItem('realyt_client_token');
  const userStr = localStorage.getItem('realyt_admin_user') || localStorage.getItem('realyt_client_user');

  let isAdmin = false;
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user && (user.role === 'ADMIN' || user.role === 'ROLE_ADMIN')) {
        isAdmin = true;
      }
    } catch {
      isAdmin = false;
    }
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
