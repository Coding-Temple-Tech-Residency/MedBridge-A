/**
 * Application-wide QueryClient singleton.
 *
 * Default behaviour applied to every query and mutation:
 *
 *  Queries
 *  -------
 *  staleTime  5 min  — data is considered fresh for 5 minutes after it was
 *                      fetched; no background refetch during that window.
 *  gcTime    10 min  — inactive cached data is kept for 10 minutes before
 *                      being garbage-collected.
 *  retry           — never retry on 4xx (client errors); retry up to 2 times
 *                    on network / 5xx failures.
 *  refetchOnWindowFocus false — health data should not silently refresh when
 *                               the user tabs back in.
 *
 *  Mutations
 *  ---------
 *  retry    false   — mutations are not retried automatically; a failed
 *                     network write should surface to the user immediately.
 */

import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '../api/errors';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
