import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { useAuthStore } from '../store/auth';
import type { PendingAttemptItem } from '../types/pending';

export function useTeacherPendingAttempts() {
  const token = useAuthStore((s) => s.token);
  return useQuery<PendingAttemptItem[]>({
    queryKey: ['teacher-pending-attempts'],
    queryFn: () => apiFetch<PendingAttemptItem[]>('/attempts/teacher/pending', { token: token! }),
    enabled: !!token,
    staleTime: 30_000,
  });
}
