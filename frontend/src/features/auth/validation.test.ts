import { describe, it, expect } from 'vitest';
import { validateLoginForm, validateRegisterForm, validateUploadFile } from './validation';

describe('validateLoginForm', () => {
  it('passes with a valid email and password', () => {
    const errors = validateLoginForm({ email: 'pat@example.com', password: 'hunter2!' });
    expect(errors).toEqual({});
  });

  it('flags an empty email', () => {
    const errors = validateLoginForm({ email: '', password: 'hunter2!' });
    expect(errors.email).toBeDefined();
  });

  it('flags a malformed email', () => {
    const errors = validateLoginForm({ email: 'not-an-email', password: 'hunter2!' });
    expect(errors.email).toBeDefined();
  });

  it('flags an empty password', () => {
    const errors = validateLoginForm({ email: 'pat@example.com', password: '' });
    expect(errors.password).toBeDefined();
  });
});

describe('validateRegisterForm', () => {
  it('passes with valid fields', () => {
    const errors = validateRegisterForm({
      name: 'Pat Jones',
      email: 'pat@example.com',
      password: 'hunter2!x',
      confirm: 'hunter2!x',
    });

    expect(errors).toEqual({});
  });

  it('flags required fields and mismatched passwords', () => {
    const errors = validateRegisterForm({
      name: '',
      email: 'bad-email',
      password: 'short',
      confirm: 'different',
    });

    expect(errors.name).toBeDefined();
    expect(errors.email).toBeDefined();
    expect(errors.password).toBeDefined();
    expect(errors.confirm).toBeDefined();
  });
});

describe('validateUploadFile', () => {
  const options = {
    allowedExtensions: ['pdf', 'txt'],
    maxSizeBytes: 5 * 1024 * 1024,
    maxSizeMb: 5,
  };

  it('returns null for a valid file', () => {
    const file = new File(['hello'], 'report.pdf', { type: 'application/pdf' });
    expect(validateUploadFile(file, options)).toBeNull();
  });

  it('returns an error for invalid extension', () => {
    const file = new File(['hello'], 'report.exe', { type: 'application/octet-stream' });
    expect(validateUploadFile(file, options)).toContain('Unsupported file type');
  });
});
