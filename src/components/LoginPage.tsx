import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from './UI/Button';
import Input from './UI/Input';
import Card from './UI/Card';
import { useLogin } from '@/features/auth/useLogin';
import { validateLoginForm } from '@/features/auth/validation';

const LoginPage: React.FC = () => {
  const { login, isPending, formError } = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clientError, setClientError] = useState('');
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('session_expired') === '1') {
      setSessionExpired(true);
      sessionStorage.removeItem('session_expired');
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClientError('');
    setSessionExpired(false);

    const errors = validateLoginForm({ email, password });
    const firstError = errors.email ?? errors.password;
    if (firstError) {
      setClientError(firstError);
      return;
    }

    login({ email: email.trim(), password });
  };

  const displayError = clientError || formError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3C936A] via-[#57A97F] to-[#83CDA6] flex items-center justify-center p-6">
      {/* Decorative circles */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-[#D4A843]/10 pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="/logo.png"
            alt="MedBridge logo"
            className="h-52 w-auto drop-shadow-lg select-none"
            style={{ mixBlendMode: 'multiply' }}
          />
        </div>

        {/* Card */}
        <Card className="p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-[#1E3A2F] mb-1">Welcome back</h2>
          <p className="text-gray-500 text-sm mb-7">Sign in to access your health companion</p>

          {sessionExpired && (
            <div
              role="status"
              className="mb-5 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl px-4 py-3"
            >
              Your session has expired. Please sign in again.
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <Input
              id="email"
              label="Email address"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mb-5"
            />

            <Input
              id="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mb-6"
            />

            {displayError && (
              <div
                role="alert"
                className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3"
              >
                {displayError}
              </div>
            )}

            <Button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 shadow-md hover:shadow-lg"
            >
              {isPending ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#2E7D55] font-semibold hover:underline">
              Sign up
            </Link>
          </p>

          <p className="text-center text-xs text-gray-400 mt-4">
            For informational purposes only. Always consult a qualified healthcare provider.
          </p>
        </Card>
      </div>
    </div>
  );
};

export { LoginPage };
export default LoginPage;
