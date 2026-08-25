import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'admin') {
    return <Navigate to="/dashboard/admin" replace />;
  }

  if (user.role === 'landlord') {
    return <Navigate to="/dashboard/landlord" replace />;
  }

  return <Navigate to="/dashboard/tenant" replace />;
}