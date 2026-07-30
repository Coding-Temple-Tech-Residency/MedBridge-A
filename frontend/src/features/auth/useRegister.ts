import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { messageForStatus, toApiError } from '@/api/errors';
import { registerApi } from './api';

type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export function useRegister() {
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (input: RegisterInput) => {
      return registerApi({
        email: input.email,
        password: input.password,
      });
    },
    onMutate: () => setFormError(null),
    onError: (err: unknown) => {
      const apiError = toApiError(err);
      const message = messageForStatus(
        apiError.status,
        {
          409: 'An account with this email already exists.',
          500: 'Server error. Please try again in a moment.',
        },
        'Something went wrong. Please try again.',
      );

      setFormError(message);
    },
  });

  return {
    register: mutation.mutate,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    formError,
  };
}
