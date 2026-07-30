import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/api/client';
import { messageForStatus, toApiError } from '@/api/errors';
import { setAccessToken } from './authToken';

type LoginInput = { email: string; password: string };
// access_token matches the snake_case shape returned by POST /api/v1/auth/login
type LoginResponse = { access_token: string; user: { id: string; role: string } };

export function useLogin() {
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (input: LoginInput) => {
      const res = await apiClient.post<LoginResponse>('/api/v1/auth/login', input);
      return res.data;
    },
    onMutate: () => setFormError(null),
    onSuccess: (data) => {
      setAccessToken(data.access_token); // in-memory; refresh token rides in HttpOnly cookie
      // Avoid cross-user carryover of chat context from previous sessions.
      sessionStorage.removeItem('latest_document_id');
      navigate('/dashboard', { replace: true });
    },
    onError: (err: unknown) => {
      const apiError = toApiError(err);
      const message = messageForStatus(
        apiError.status,
        {
          401: 'Invalid email or password.',
          500: 'Server error. Please try again in a moment.',
        },
        'Something went wrong. Please try again.',
      );

      setFormError(message);
    },
  });

  return {
    login: mutation.mutate,
    isPending: mutation.isPending,
    formError,
  };
}
