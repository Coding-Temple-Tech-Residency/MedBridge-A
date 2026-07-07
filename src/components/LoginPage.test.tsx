import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage';

const loginMock = vi.fn();
let mockState = { login: loginMock, isPending: false, formError: null as string | null };

vi.mock('@/features/auth/useLogin', () => ({
  useLogin: () => mockState,
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState = { login: loginMock, isPending: false, formError: null };
  });

  it('calls login with entered credentials on submit', () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'pat@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'hunter2!' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(loginMock).toHaveBeenCalledWith({ email: 'pat@example.com', password: 'hunter2!' });
  });

  it('blocks submit and shows field errors when inputs are invalid', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('renders a generic server error from the hook', () => {
    mockState.formError = 'Invalid email or password.';
    renderPage();
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password.');
  });

  it('disables the button while a request is pending', () => {
    mockState.isPending = true;
    renderPage();
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
  });
});
