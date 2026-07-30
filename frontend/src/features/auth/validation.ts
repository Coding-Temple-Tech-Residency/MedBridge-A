export type LoginFields = { email: string; password: string };
export type LoginErrors = { email?: string; password?: string };

export type RegisterFields = {
  name: string;
  email: string;
  password: string;
  confirm: string;
};

export type RegisterErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
};

type UploadValidationOptions = {
  allowedExtensions: string[];
  maxSizeBytes: number;
  maxSizeMb: number;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// NOTE: If Zari exports a shared validator from FE-04, prefer importing that
// so both forms validate identically. This is the login-only fallback.
export function validateLoginForm({ email, password }: LoginFields): LoginErrors {
  const errors: LoginErrors = {};

  if (!email.trim()) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_RE.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  }

  return errors;
}

export function validateRegisterForm({
  name,
  email,
  password,
  confirm,
}: RegisterFields): RegisterErrors {
  const errors: RegisterErrors = {};

  if (!name.trim()) {
    errors.name = 'Full name is required.';
  }

  if (!email.trim()) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_RE.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }

  if (!confirm) {
    errors.confirm = 'Please confirm your password.';
  } else if (confirm !== password) {
    errors.confirm = 'Passwords do not match.';
  }

  return errors;
}

export function validateUploadFile(file: File, options: UploadValidationOptions): string | null {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (!extension || !options.allowedExtensions.includes(extension)) {
    return 'Unsupported file type. Please upload a PDF, DOC, DOCX, TXT, JPG, JPEG, or PNG file.';
  }

  if (file.size > options.maxSizeBytes) {
    return `File size exceeds ${options.maxSizeMb} MB. Please upload a smaller file.`;
  }

  return null;
}
