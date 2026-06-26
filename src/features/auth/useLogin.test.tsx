import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLogin } from './useLogin';
import { apiClient } from '@/api/client';
import { getAccessToken, setAccessToken } from './authToken';

const navigateMock = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
}));
vi.mock('@/api/client', () => ({
  apiClient: { post: vi.fn() },
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setAccessToken(null);
  });

  it('stores the token and redirects to the dashboard on success', async () => {
    (apiClient.post as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { access_token: 'jwt-123', user: { id: 'u1', role: 'patient' } },
    });

    const { result } = renderHook(() => useLogin(), { wrapper });
    act(() => result.current.login({ email: 'pat@example.com', password: 'hunter2!' }));

    await waitFor(() => expect(getAccessToken()).toBe('jwt-123'));
    expect(navigateMock).toHaveBeenCalledWith('/dashboard', { replace: true });
    expect(result.current.formError).toBeNull();
  });

  it('shows a generic error and does not store a token on 401', async () => {
    (apiClient.post as ReturnType<typeof vi.fn>).mockRejectedValue({
      response: { status: 401 },
    });

    const { result } = renderHook(() => useLogin(), { wrapper });
    act(() => result.current.login({ email: 'pat@example.com', password: 'wrong' }));

    await waitFor(() =>
      expect(result.current.formError).toBe('Invalid email or password.'),
    );
    expect(getAccessToken()).toBeNull();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('shows a fallback error on a non-401 failure', async () => {
    (apiClient.post as ReturnType<typeof vi.fn>).mockRejectedValue({
      response: { status: 500 },
    });

    const { result } = renderHook(() => useLogin(), { wrapper });
    act(() => result.current.login({ email: 'pat@example.com', password: 'hunter2!' }));

    await waitFor(() =>
      expect(result.current.formError).toBe('Something went wrong. Please try again.'),
    );
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
