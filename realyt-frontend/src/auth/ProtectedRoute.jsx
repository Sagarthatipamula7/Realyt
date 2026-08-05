import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

export default function ProtectedRoute({ role, children }) {
  const auth = useAuth();

  if (!auth.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (role && auth.user?.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
