import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from './UI/Button';
import Input from './UI/Input';
import Card from './UI/Card';
import { useRegister } from '@/features/auth/useRegister';
import { validateRegisterForm, type RegisterErrors } from '@/features/auth/validation';

const REGISTER_SUCCESS = 'Account created successfully! Redirecting to sign in...';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isPending, formError } = useRegister();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState<RegisterErrors>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    const nextErrors = validateRegisterForm({
      name,
      email,
      password,
      confirm,
    });

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    register(
      { name: name.trim(), email: email.trim(), password },
      {
        onSuccess: () => {
          setSuccess(REGISTER_SUCCESS);
          window.setTimeout(() => {
            navigate('/login', { replace: true });
          }, 1500);
        },
      },
    );
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
                if (errors.name) {
                  setErrors((current) => ({ ...current, name: undefined }));
                }
              }}
              placeholder="Jane Smith"
              error={errors.name}
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
                if (errors.email) {
                  setErrors((current) => ({ ...current, email: undefined }));
                }
              }}
              placeholder="you@example.com"
              error={errors.email}
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
                if (errors.password) {
                  setErrors((current) => ({ ...current, password: undefined }));
                }
              }}
              placeholder="At least 8 characters"
              error={errors.password}
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
                if (errors.confirm) {
                  setErrors((current) => ({ ...current, confirm: undefined }));
                }
              }}
              placeholder="••••••••"
              error={errors.confirm}
              className="mb-6"
            />

            {success && (
              <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {success}
              </div>
            )}

            {formError && (
              <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {formError}
              </div>
            )}

            <Button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 shadow-md hover:shadow-lg"
            >
              {isPending ? 'Creating account…' : 'Create Account'}
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
