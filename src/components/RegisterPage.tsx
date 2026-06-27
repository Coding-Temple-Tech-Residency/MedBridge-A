import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from './UI/Button';
import Input from './UI/Input';
import Card from './UI/Card';

const REGISTER_ERRORS = {
  nameRequired: 'Full name is required.',
  emailRequired: 'Email is required.',
  emailInvalid: 'Please enter a valid email address.',
  passwordRequired: 'Password is required.',
  passwordTooShort: 'Password must be at least 8 characters.',
  confirmRequired: 'Please confirm your password.',
  passwordMismatch: 'Passwords do not match.',
  duplicateEmail: 'An account with this email already exists.',
  serverError: 'Something went wrong. Please try again.',
};

const REGISTER_SUCCESS = 'Account created successfully! Redirecting to sign in...';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmError('');

    let hasErrors = false;

    if (!name.trim()) {
      setNameError(REGISTER_ERRORS.nameRequired);
      hasErrors = true;
    }

    if (!email.trim()) {
      setEmailError(REGISTER_ERRORS.emailRequired);
      hasErrors = true;
    }

    if (!password.trim()) {
      setPasswordError(REGISTER_ERRORS.passwordRequired);
      hasErrors = true;
    }

    if (!confirm.trim()) {
      setConfirmError(REGISTER_ERRORS.confirmRequired);
      hasErrors = true;
    }

    if (hasErrors) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError(REGISTER_ERRORS.emailInvalid);
      return;
    }

    if (password.length < 8) {
      setPasswordError(REGISTER_ERRORS.passwordTooShort);
      return;
    }

    if (password !== confirm) {
      setConfirmError(REGISTER_ERRORS.passwordMismatch);
      return;
    }

    setLoading(true);
    // TODO: Replace mock registration with POST /api/auth/register
    // after the backend authentication endpoint is implemented.

    setTimeout(() => {
      if (email.toLowerCase() === 'taken@example.com') {
        setLoading(false);
        setEmailError(REGISTER_ERRORS.duplicateEmail);
        return;
      }

      if (email.toLowerCase() === 'server@example.com') {
        setLoading(false);
        setError(REGISTER_ERRORS.serverError);
        return;
      }

      setSuccess(REGISTER_SUCCESS);

      setTimeout(() => {
        navigate('/login');
      }, 1500);
    }, 800);
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
          <h2 className="text-2xl font-bold text-[#1E3A2F] mb-1">Create an account</h2>
          <p className="text-gray-500 text-sm mb-7">Start understanding your health today</p>

          <form onSubmit={handleSubmit} noValidate>
            <Input
              id="name"
              label="Full name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError('');
              }}
              placeholder="Jane Smith"
              error={nameError}
              className="mb-5"
            />

            <Input
              id="email"
              label="Email address"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError('');
              }}
              placeholder="you@example.com"
              error={emailError}
              className="mb-5"
            />

            <Input
              id="password"
              label="Password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError('');
              }}
              placeholder="At least 8 characters"
              error={passwordError}
              className="mb-5"
            />
            <Input
              id="confirm"
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                setConfirmError('');
              }}
              placeholder="••••••••"
              error={confirmError}
              className="mb-6"
            />

            {success && (
              <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {success}
              </div>
            )}

            {error && (
              <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 shadow-md hover:shadow-lg"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[#2E7D55] font-semibold hover:underline">
              Sign in
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

export default RegisterPage;