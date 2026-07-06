import { Navigate, Outlet } from 'react-router-dom';
// ...existing code...
import { AuthContext } from '../features/auth/AuthContext'; // adjust ../ levels as needed
// ...existing code...const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
