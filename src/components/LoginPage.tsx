import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from './UI/Button';
import Input from './UI/Input';
import Card from './UI/Card';
import { useLogin } from '@/features/auth/useLogin';
import { validateLoginForm } from '@/features/auth/validation';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const { login, isPending, formError } = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateLoginForm({ email, password });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    login({ email, password });
  };

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
            className="h-28 w-auto mb-4 drop-shadow-md select-none"
            style={{ mixBlendMode: 'multiply' }}
          />
        </div>

        {/* Card */}
        <Card className="p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-[#1E3A2F] mb-1">Welcome back</h2>
          <p className="text-gray-500 text-sm mb-7">Sign in to access your health companion</p>

          <form onSubmit={handleSubmit} noValidate>
            <Input
              id="email"
              label="Email address"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              error={fieldErrors.email}
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
              error={fieldErrors.password}
              className="mb-6"
            />

            {/* Generic server/auth error — intentionally non-specific (FE-5 AC) */}
            {formError && (
              <div
                role="alert"
                className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3"
              >
                {formError}
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
}

export default LoginPage;