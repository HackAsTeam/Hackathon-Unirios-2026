import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { useAuthStore } from '../store/auth';
import type { AttemptSummary } from '../types/attempt';

export function useMyAttempts() {
  const token = useAuthStore((s) => s.token);
  return useQuery<AttemptSummary[]>({
    queryKey: ['my-attempts'],
    queryFn: () => apiFetch<AttemptSummary[]>('/attempts', { token: token! }),
    enabled: !!token,
    staleTime: 30_000,
  });
}
