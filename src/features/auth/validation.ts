type LoginFields = { email: string; password: string };
type LoginErrors = { email?: string; password?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// NOTE: If Zari exports a shared validator from FE-04, prefer importing that
// so both forms validate identically. This is the login-only fallback.
export function validateLoginForm({ email, password }: LoginFields): LoginErrors {
  const errors: LoginErrors = {};

  if (!email.trim()) {
    errors.email = "Email is required.";
  } else if (!EMAIL_RE.test(email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  }

  return errors;
}
