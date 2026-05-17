import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { useAuthStore } from '../store/auth';
import type { AttemptDetail } from '../types/attempt';

export function useAttemptDetail(attemptId: string) {
  const token = useAuthStore((s) => s.token);
  return useQuery<AttemptDetail>({
    queryKey: ['attempt', attemptId],
    queryFn: () => apiFetch<AttemptDetail>(`/attempts/${attemptId}`, { token: token! }),
    enabled: !!token && !!attemptId,
    staleTime: 30_000,
  });
}
