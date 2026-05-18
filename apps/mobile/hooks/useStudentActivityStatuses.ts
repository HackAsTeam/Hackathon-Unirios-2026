import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { useAuthStore } from '../store/auth';
import type { StudentActivityStatus } from '../types/pending';

export function useStudentActivityStatuses() {
  const token = useAuthStore((s) => s.token);
  return useQuery<StudentActivityStatus[]>({
    queryKey: ['student-activity-statuses'],
    queryFn: () => apiFetch<StudentActivityStatus[]>('/activities/my-status', { token: token! }),
    enabled: !!token,
    staleTime: 30_000,
  });
}
