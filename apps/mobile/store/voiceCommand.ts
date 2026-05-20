import { create } from 'zustand';

export type VoiceCommandStatus = 'idle' | 'listening' | 'processing' | 'done' | 'error';

export interface ScreenContext {
  screen: string;
  role?: 'teacher' | 'student';
  classroomId?: string;
  subjectId?: string;
  activityId?: string;
  attemptId?: string;
  classroomCount?: number;
  hasEnrollments?: boolean;
  screenDescription?: string;
}

export interface VoiceCommandResponse {
  type: 'COMMAND' | 'CONFIRM' | 'UNKNOWN' | 'ERROR';
  command?: string;
  payload?: Record<string, unknown>;
  speak: string;
}

export interface PendingActivityCandidate {
  activityId: string;
  activityTitle: string;
}

interface VoiceCommandState {
  status: VoiceCommandStatus;
  transcript: string;
  lastCommand: VoiceCommandResponse | null;
  currentContext: ScreenContext | null;
  pendingConfirmAction: string | null;
  pendingActivityPick: PendingActivityCandidate[] | null;
  setStatus: (status: VoiceCommandStatus) => void;
  setTranscript: (transcript: string) => void;
  setLastCommand: (cmd: VoiceCommandResponse | null) => void;
  setContext: (ctx: ScreenContext | null) => void;
  setPendingConfirmAction: (action: string | null) => void;
  setPendingActivityPick: (candidates: PendingActivityCandidate[] | null) => void;
  reset: () => void;
}

export const useVoiceCommandStore = create<VoiceCommandState>((set) => ({
  status: 'idle',
  transcript: '',
  lastCommand: null,
  currentContext: null,
  pendingConfirmAction: null,
  pendingActivityPick: null,
  setStatus: (status) => set({ status }),
  setTranscript: (transcript) => set({ transcript }),
  setLastCommand: (lastCommand) => set({ lastCommand }),
  setContext: (currentContext) => set({ currentContext }),
  setPendingConfirmAction: (pendingConfirmAction) => set({ pendingConfirmAction }),
  setPendingActivityPick: (pendingActivityPick) => set({ pendingActivityPick }),
  // `pendingActivityPick` é deliberadamente preservado: o overlay chama reset()
  // antes de re-escutar numa resposta CONFIRM (a desambiguação de atividade).
  // O dispatcher limpa o pick explicitamente ao resolvê-lo ou descartá-lo.
  reset: () => set({ status: 'idle', transcript: '', lastCommand: null }),
}));
