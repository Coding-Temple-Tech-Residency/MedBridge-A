import { describe, it, expect } from 'vitest';
import { validateLoginForm } from './validation';

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
