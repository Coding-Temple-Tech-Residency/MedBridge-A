/**
 * React Query key factories for auth-related queries.
 *
 * Using factory functions (rather than plain string arrays) keeps keys
 * consistent and makes targeted cache invalidation straightforward:
 *
 *   queryClient.invalidateQueries({ queryKey: authKeys.all });
 *   queryClient.invalidateQueries({ queryKey: authKeys.currentUser() });
 */
export const authKeys = {
  all: ['auth'] as const,
  currentUser: () => [...authKeys.all, 'currentUser'] as const,
} as const;
