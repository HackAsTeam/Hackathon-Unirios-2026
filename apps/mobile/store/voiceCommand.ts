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
}

export interface VoiceCommandResponse {
  type: 'COMMAND' | 'CONFIRM' | 'UNKNOWN' | 'ERROR';
  command?: string;
  payload?: Record<string, unknown>;
  speak: string;
}

interface VoiceCommandState {
  status: VoiceCommandStatus;
  transcript: string;
  lastCommand: VoiceCommandResponse | null;
  currentContext: ScreenContext | null;
  pendingConfirmAction: string | null;
  setStatus: (status: VoiceCommandStatus) => void;
  setTranscript: (transcript: string) => void;
  setLastCommand: (cmd: VoiceCommandResponse | null) => void;
  setContext: (ctx: ScreenContext | null) => void;
  setPendingConfirmAction: (action: string | null) => void;
  reset: () => void;
}

export const useVoiceCommandStore = create<VoiceCommandState>((set) => ({
  status: 'idle',
  transcript: '',
  lastCommand: null,
  currentContext: null,
  pendingConfirmAction: null,
  setStatus: (status) => set({ status }),
  setTranscript: (transcript) => set({ transcript }),
  setLastCommand: (lastCommand) => set({ lastCommand }),
  setContext: (currentContext) => set({ currentContext }),
  setPendingConfirmAction: (pendingConfirmAction) => set({ pendingConfirmAction }),
  reset: () => set({ status: 'idle', transcript: '', lastCommand: null }),
}));
