import { create } from 'zustand';

export type VoiceCommandStatus = 'idle' | 'listening' | 'processing' | 'done' | 'error';

export interface ScreenContext {
  screen: string;
  [key: string]: unknown;
}

export interface VoiceCommandResponse {
  type: 'COMMAND' | 'UNKNOWN' | 'ERROR';
  command?: string;
  payload?: Record<string, unknown>;
  speak: string;
}

interface VoiceCommandState {
  status: VoiceCommandStatus;
  transcript: string;
  lastCommand: VoiceCommandResponse | null;
  currentContext: ScreenContext | null;
  setStatus: (status: VoiceCommandStatus) => void;
  setTranscript: (transcript: string) => void;
  setLastCommand: (cmd: VoiceCommandResponse | null) => void;
  setContext: (ctx: ScreenContext | null) => void;
  reset: () => void;
}

export const useVoiceCommandStore = create<VoiceCommandState>((set) => ({
  status: 'idle',
  transcript: '',
  lastCommand: null,
  currentContext: null,
  setStatus: (status) => set({ status }),
  setTranscript: (transcript) => set({ transcript }),
  setLastCommand: (lastCommand) => set({ lastCommand }),
  setContext: (currentContext) => set({ currentContext }),
  reset: () => set({ status: 'idle', transcript: '', lastCommand: null }),
}));
