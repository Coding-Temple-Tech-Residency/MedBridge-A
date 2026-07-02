import { Navigate, Outlet } from 'react-router-dom';
import { getAccessToken } from '@/features/auth/authToken';

const PublicRoute: React.FC = () => {
  const token = getAccessToken();
  return token ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export default PublicRoute;
