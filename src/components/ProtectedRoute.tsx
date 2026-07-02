import { Navigate, Outlet } from 'react-router-dom';
import { getAccessToken } from '@/features/auth/authToken';

const ProtectedRoute: React.FC = () => {
  const token = getAccessToken();
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
