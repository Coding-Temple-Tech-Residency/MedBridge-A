import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/api/client';
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
      navigate('/', { replace: true });
    },
    onError: (err: unknown) => {
      // Never reveal which field was wrong
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        setFormError('Invalid email or password.');
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    },
  });

  return {
    login: mutation.mutate,
    isPending: mutation.isPending,
    formError,
  };
}
