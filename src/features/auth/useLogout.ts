import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/api/client';
import { setAccessToken } from './authToken';

export function useLogout() {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await apiClient.post('/api/v1/auth/logout');
    } catch {
      // Always clear the client-side session, even if the server call fails
    } finally {
      setAccessToken(null);
      navigate('/login', { replace: true });
    }
  };

  return logout;
}
