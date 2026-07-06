import { createContext, useContext, useEffect, useState } from 'react';
import useNavigate  from 'react-router-dom';
import {
  getAccessToken,
  registerForceLogoutCallback,
  registerTokenChangeCallback,
} from './authToken';

interface AuthContextValue {
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue>({ isAuthenticated: false });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => getAccessToken() !== null);
  const navigate = useNavigate();

  useEffect(() => {
    registerTokenChangeCallback((token) => {
      setIsAuthenticated(token !== null);
    });

    registerForceLogoutCallback(() => {
      setIsAuthenticated(false);
      // Signal to the login page that the session expired (not a manual logout)
      sessionStorage.setItem('session_expired', '1');
      navigate('/login', { replace: true });
    });
  }, [navigate]);

  return <AuthContext.Provider value={{ isAuthenticated }}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
