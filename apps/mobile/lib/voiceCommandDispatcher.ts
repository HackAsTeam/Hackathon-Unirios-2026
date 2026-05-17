import { router } from 'expo-router';
import { apiFetch } from './api';
import { speak } from './tts';
import type { ScreenContext, VoiceCommandResponse } from '../store/voiceCommand';

// ─── Tier 1: local keyword matching ──────────────────────────────────────────

const LOCAL_PATTERNS: Array<{ pattern: RegExp; handler: () => VoiceCommandResponse }> = [
  {
    pattern: /\b(volta|voltar|back)\b/i,
    handler: () => {
      router.back();
      return { type: 'COMMAND', command: 'GO_BACK', speak: 'Voltando.' };
    },
  },
  {
    pattern: /\b(início|inicio|home|tela inicial)\b/i,
    handler: () => {
      router.push('/(app)/(tabs)');
      return { type: 'COMMAND', command: 'GO_HOME', speak: 'Indo para o início.' };
    },
  },
  {
    pattern: /\b(perfil|profile)\b/i,
    handler: () => {
      router.push('/(app)/(tabs)/profile');
      return { type: 'COMMAND', command: 'NAVIGATE_TO', speak: 'Abrindo perfil.' };
    },
  },
  {
    pattern: /\b(resultado|resultados|notas)\b/i,
    handler: () => {
      router.push('/(app)/(tabs)/results');
      return { type: 'COMMAND', command: 'NAVIGATE_TO', speak: 'Abrindo resultados.' };
    },
  },
];

function tryLocalDispatch(transcript: string): VoiceCommandResponse | null {
  const t = transcript.trim().toLowerCase();
  for (const { pattern, handler } of LOCAL_PATTERNS) {
    if (pattern.test(t)) return handler();
  }
  return null;
}

// ─── Tier 2: AI via backend ───────────────────────────────────────────────────

async function dispatchToAI(
  transcript: string,
  context: ScreenContext,
  token: string,
): Promise<VoiceCommandResponse> {
  try {
    const result = await apiFetch<VoiceCommandResponse>('/voice-commands', {
      method: 'POST',
      token,
      body: { transcript, screen: context.screen, context },
    });
    return result;
  } catch {
    return {
      type: 'ERROR',
      speak: 'Não consegui processar o comando. Tente novamente.',
    };
  }
}

// ─── Public dispatcher ────────────────────────────────────────────────────────

export async function dispatch(
  transcript: string,
  context: ScreenContext | null,
  token: string | null,
  onScreenAction?: (cmd: VoiceCommandResponse) => void,
): Promise<VoiceCommandResponse> {
  const local = tryLocalDispatch(transcript);
  if (local) {
    speak(local.speak);
    return local;
  }

  if (!token || !context) {
    const r: VoiceCommandResponse = { type: 'UNKNOWN', speak: 'Não entendi. Pode repetir?' };
    speak(r.speak);
    return r;
  }

  const result = await dispatchToAI(transcript, context, token);

  if (result.type === 'COMMAND' && onScreenAction) {
    onScreenAction(result);
  }

  speak(result.speak);
  return result;
}
