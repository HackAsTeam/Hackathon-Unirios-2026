import { apiFetch } from './api';
import { normalizeStr } from './normalize';
import { queryClient } from './queryClient';
import type { StudentActivityStatus } from '../types/pending';

const QUERY_KEY = ['student-activity-statuses'] as const;

export type ActivityCandidate = { activityId: string; activityTitle: string };

export type ActivityResolution =
  | { kind: 'open'; activity: StudentActivityStatus }
  | { kind: 'pick'; subjectName?: string; candidates: ActivityCandidate[] }
  | { kind: 'none' };

function isAvailable(a: StudentActivityStatus): boolean {
  return a.attemptStatus == null || a.attemptStatus === 'InProgress';
}

function fuzzyMatch(haystack: string, needle: string): boolean {
  const h = normalizeStr(haystack);
  const n = normalizeStr(needle);
  if (!h || !n) return false;
  return h.includes(n) || n.includes(h);
}

function toCandidate(a: StudentActivityStatus): ActivityCandidate {
  return { activityId: a.activityId, activityTitle: a.activityTitle };
}

/**
 * Lê as atividades do aluno da cache do React Query; se ausente, busca em
 * `/activities/my-status` e semeia a cache. Permite que o dispatcher de voz
 * (fora da árvore React) resolva atividades sem depender de uma tela montada.
 */
export async function getStudentActivities(
  token: string,
): Promise<StudentActivityStatus[]> {
  const cached = queryClient.getQueryData<StudentActivityStatus[]>(QUERY_KEY);
  if (cached) return cached;

  const fetched = await apiFetch<StudentActivityStatus[]>('/activities/my-status', {
    token,
  });
  queryClient.setQueryData(QUERY_KEY, fetched);
  return fetched;
}

/**
 * Casa um nome falado contra título e matéria. Ordem: título primeiro
 * (um match → abre, vários → desambiguação), depois matéria (atividades
 * disponíveis primeiro).
 */
export function resolveActivityQuery(
  name: string,
  activities: StudentActivityStatus[],
): ActivityResolution {
  const query = normalizeStr(name);
  if (!query) return { kind: 'none' };

  const titleMatches = activities.filter((a) => fuzzyMatch(a.activityTitle, name));
  if (titleMatches.length === 1) {
    return { kind: 'open', activity: titleMatches[0] };
  }
  if (titleMatches.length > 1) {
    return { kind: 'pick', candidates: titleMatches.map(toCandidate) };
  }

  const subjectMatches = activities.filter((a) => fuzzyMatch(a.subjectName, name));
  if (subjectMatches.length === 0) return { kind: 'none' };

  const available = subjectMatches.filter(isAvailable);
  const pool = available.length > 0 ? available : subjectMatches;
  if (pool.length === 1) {
    return { kind: 'open', activity: pool[0] };
  }
  return {
    kind: 'pick',
    subjectName: pool[0].subjectName,
    candidates: pool.map(toCandidate),
  };
}

function joinNatural(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(', ')} e ${items[items.length - 1]}`;
}

/**
 * Monta um resumo falado das atividades, agrupado por matéria. Aceita um
 * filtro opcional por matéria.
 */
export function buildPendingSummary(
  activities: StudentActivityStatus[],
  subjectFilter?: string,
): string {
  const list = subjectFilter
    ? activities.filter((a) => fuzzyMatch(a.subjectName, subjectFilter))
    : activities;

  if (list.length === 0) {
    return subjectFilter
      ? `Você não tem atividades pendentes em ${subjectFilter}.`
      : 'Você não tem atividades pendentes.';
  }

  const bySubject = new Map<string, string[]>();
  for (const a of list) {
    const titles = bySubject.get(a.subjectName) ?? [];
    titles.push(a.activityTitle);
    bySubject.set(a.subjectName, titles);
  }

  const plural = list.length === 1 ? 'atividade pendente' : 'atividades pendentes';
  const sections = [...bySubject.entries()].map(
    ([subject, titles]) => `Em ${subject}: ${joinNatural(titles)}.`,
  );
  return `Você tem ${list.length} ${plural}. ${sections.join(' ')}`;
}
