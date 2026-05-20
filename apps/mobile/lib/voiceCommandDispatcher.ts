import { router } from 'expo-router';
import { apiFetch } from './api';
import { speak } from './tts';
import { signOutFromGoogle } from './googleAuth';
import { landingRouteForRole } from './routes';
import { useAccessibilityStore } from '../store/acessibility';
import { useAuthStore } from '../store/auth';
import { useOnboardingStore } from '../store/onboarding';
import { useVoiceCommandStore } from '../store/voiceCommand';
import type { ScreenContext, VoiceCommandResponse } from '../store/voiceCommand';

// ─── Tier 1: local keyword matching ──────────────────────────────────────────

const LOCAL_PATTERNS: Array<{ pattern: RegExp; handler: (match: RegExpMatchArray) => VoiceCommandResponse | Promise<VoiceCommandResponse> }> = [
  // ── Navigation ────────────────────────────────────────────────────────────
  {
    // Must be before GO_BACK so "voltar para o início" routes to home, not back
    pattern: /\b(início|inicio|home|tela inicial)\b/i,
    handler: () => {
      const onboardingRole = useOnboardingStore.getState().role;
      const authRole = useAuthStore.getState().role;
      const role = onboardingRole ?? authRole;
      router.push(landingRouteForRole(role));
      return { type: 'COMMAND', command: 'GO_HOME', speak: 'Indo para o início.' };
    },
  },
  {
    pattern: /\b(volta|voltar|back)\b/i,
    handler: () => {
      router.back();
      return { type: 'COMMAND', command: 'GO_BACK', speak: 'Voltando.' };
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
    pattern: /\b(resultado|resultados|notas|minhas notas)\b/i,
    handler: () => {
      router.push('/(app)/(tabs)/results');
      return { type: 'COMMAND', command: 'NAVIGATE_TO', speak: 'Abrindo resultados.' };
    },
  },
  {
    // Anchored so action phrases like "listar atividades pendentes" fall through to tier2
    pattern: /^(?:(?:ir\s+para|abrir?|ver|acessar?|mostrar?)\s+)?(?:(?:as\s+|minhas\s+)?(?:pendências?|pendencias?)|atividades?\s+pendentes?)$/i,
    handler: () => {
      router.push('/(app)/(tabs)/pendencias');
      return { type: 'COMMAND', command: 'NAVIGATE_TO', speak: 'Abrindo pendências.' };
    },
  },
  {
    // "entra na matéria de X" / "abrir matéria X" / "ir para matéria X" — navigates by name inside a classroom
    pattern: /\b(?:entr[ae]r?\s+(?:na|em)\s+|abrir?\s+(?:a\s+)?|ir\s+para\s+(?:a\s+)?|ver\s+(?:a\s+)?|acessar?\s+(?:a\s+)?)mat[eé]ria\s+(?:de\s+)?(.+)/i,
    handler: (match) => {
      const name = match[1].trim();
      return { type: 'COMMAND', command: 'NAVIGATE_TO_SUBJECT', payload: { name }, speak: `Abrindo matéria ${name}.` };
    },
  },
  {
    // "entra na turma X" / "abrir turma X" / "ir para turma X" / "ver turma X" — navigates by name
    pattern: /\b(?:entr[ae]r?\s+(?:na|em)\s+|abrir?\s+(?:a\s+)?|ir\s+para\s+(?:a\s+)?|ver\s+(?:a\s+)?|acessar?\s+(?:a\s+)?)turma\s+(.+)/i,
    handler: (match) => {
      const name = match[1].trim();
      return { type: 'COMMAND', command: 'NAVIGATE_TO_CLASSROOM', payload: { name }, speak: `Abrindo turma ${name}.` };
    },
  },
  {
    // Anchored so action phrases like "criar turma chamada X" fall through to tier2
    pattern: /^(?:(?:ver|abrir?|mostrar?|ir para|acessar?|listar?)\s+)?(?:as\s+|minhas\s+)?turmas?$|^sala de aula$/i,
    handler: () => {
      const onboardingRole = useOnboardingStore.getState().role;
      const authRole = useAuthStore.getState().role;
      const role = onboardingRole ?? authRole;
      router.push(landingRouteForRole(role));
      return { type: 'COMMAND', command: 'GO_HOME', speak: 'Indo para o início.' };
    },
  },

  // ── Confirmation (must come before sign-out) ──────────────────────────────
  {
    pattern: /^(confirmar?|sim|yes|pode|ok|confirmo)\b/i,
    handler: async () => {
      const pending = useVoiceCommandStore.getState().pendingConfirmAction;
      if (!pending) {
        return { type: 'UNKNOWN', speak: 'Não há nada para confirmar.' };
      }
      useVoiceCommandStore.getState().setPendingConfirmAction(null);
      if (pending === 'SIGN_OUT') {
        await Promise.all([useAuthStore.getState().signOut(), signOutFromGoogle()]);
        router.replace('/(auth)/sign-in');
        return { type: 'COMMAND', command: 'SIGN_OUT', speak: 'Até logo!' };
      }
      return { type: 'UNKNOWN', speak: 'Ação desconhecida.' };
    },
  },

  // ── Sign out (two-step confirmation) ─────────────────────────────────────
  {
    pattern: /\b(sair|deslogar|desconectar|sign out|log ?out)\b/i,
    handler: () => {
      useVoiceCommandStore.getState().setPendingConfirmAction('SIGN_OUT');
      return {
        type: 'CONFIRM',
        command: 'SIGN_OUT',
        speak: 'Tem certeza que quer sair? Diga confirmar para continuar.',
      };
    },
  },

  // ── Question navigation ───────────────────────────────────────────────────
  {
    pattern: /\b(pr[oó]xima\s+(quest[aã]o|pergunta)|passar?\s+(para\s+)?a?\s*pr[oó]xima|avan[cç]ar?\s*(quest[aã]o|pergunta)?|ir\s+para\s+(a\s+)?pr[oó]xima)\b/i,
    handler: () => ({
      type: 'COMMAND',
      command: 'NEXT_QUESTION',
      speak: 'Indo para a próxima questão.',
    }),
  },
  {
    pattern: /\b(quest[aã]o\s+anterior|pergunta\s+anterior|voltar\s+(quest[aã]o|pergunta)|quest[aã]o\s+de\s+antes|ir\s+para\s+(a\s+)?anterior)\b/i,
    handler: () => ({
      type: 'COMMAND',
      command: 'PREV_QUESTION',
      speak: 'Voltando para a questão anterior.',
    }),
  },

  // ── Submit answer ─────────────────────────────────────────────────────────
  {
    pattern: /\b(enviar?\s+resposta|submeter?\s+resposta|mandar?\s+resposta|enviar?)\b/i,
    handler: () => ({
      type: 'COMMAND',
      command: 'SUBMIT_ANSWER',
      speak: 'Enviando resposta.',
    }),
  },

  // ── Select alternative (MCQ) ─────────────────────────────────────────────
  {
    // Matches: "alternativa A", "letra B", "marcar alternativa C", "escolho a letra D", etc.
    pattern: /\b(?:alternativa|letra|opção)\s+([abcd])\b/i,
    handler: (match) => {
      const letter = match[1].toUpperCase();
      return {
        type: 'COMMAND',
        command: 'SELECT_ALTERNATIVE',
        payload: { optionLetter: letter, questionIndex: 0 },
        speak: `Alternativa ${letter} selecionada.`,
      };
    },
  },

  // ── Font size ─────────────────────────────────────────────────────────────
  {
    pattern: /\b(aumentar? (a |a |a)?fonte|fonte maior|texto maior|letra maior|aumentar? texto)\b/i,
    handler: () => {
      useAccessibilityStore.getState().increaseFontSize();
      const s = useAccessibilityStore.getState().fontSizeScale;
      return { type: 'COMMAND', command: 'ACCESSIBILITY_UPDATE', speak: `Fonte aumentada para ${Math.round(s * 100)} por cento.` };
    },
  },
  {
    pattern: /\b(diminuir? (a |a |a)?fonte|fonte menor|texto menor|letra menor|reduzir? texto|diminuir? texto)\b/i,
    handler: () => {
      useAccessibilityStore.getState().decreaseFontSize();
      const s = useAccessibilityStore.getState().fontSizeScale;
      return { type: 'COMMAND', command: 'ACCESSIBILITY_UPDATE', speak: `Fonte diminuída para ${Math.round(s * 100)} por cento.` };
    },
  },
  {
    pattern: /\b(fonte normal|tamanho padrão|resetar? fonte|fonte padrão)\b/i,
    handler: () => {
      useAccessibilityStore.getState().setFontSizeScale(1.0);
      return { type: 'COMMAND', command: 'ACCESSIBILITY_UPDATE', speak: 'Tamanho de fonte padrão restaurado.' };
    },
  },

  // ── High contrast ─────────────────────────────────────────────────────────
  {
    pattern: /\b(ativar?|ligar?|habilitar?) (o |o |o )?alto contraste\b/i,
    handler: () => {
      useAccessibilityStore.getState().setHighContrast(true);
      return { type: 'COMMAND', command: 'ACCESSIBILITY_UPDATE', speak: 'Alto contraste ativado.' };
    },
  },
  {
    pattern: /\b(desativar?|desligar?|desabilitar?) (o |o |o )?alto contraste\b/i,
    handler: () => {
      useAccessibilityStore.getState().setHighContrast(false);
      return { type: 'COMMAND', command: 'ACCESSIBILITY_UPDATE', speak: 'Alto contraste desativado.' };
    },
  },
  {
    pattern: /\b(alternar?|toggle|mudar) (o |o |o )?contraste\b/i,
    handler: () => {
      useAccessibilityStore.getState().toggleHighContrast();
      const on = useAccessibilityStore.getState().highContrast;
      return { type: 'COMMAND', command: 'ACCESSIBILITY_UPDATE', speak: `Alto contraste ${on ? 'ativado' : 'desativado'}.` };
    },
  },

  // ── Reduced motion ────────────────────────────────────────────────────────
  {
    pattern: /\b(ativar?|ligar?|habilitar?) (o |o |o )?(movimento reduzido|menos animações?|reduzir? animações?|reduzir? movimento)\b/i,
    handler: () => {
      useAccessibilityStore.getState().setReducedMotion(true);
      return { type: 'COMMAND', command: 'ACCESSIBILITY_UPDATE', speak: 'Animações reduzidas ativadas.' };
    },
  },
  {
    pattern: /\b(desativar?|desligar?|desabilitar?) (o |o |o )?(movimento reduzido|animações?|restaurar? animações?)\b/i,
    handler: () => {
      useAccessibilityStore.getState().setReducedMotion(false);
      return { type: 'COMMAND', command: 'ACCESSIBILITY_UPDATE', speak: 'Animações restauradas.' };
    },
  },

  // ── Default response format ───────────────────────────────────────────────
  {
    pattern: /\b(formato padrão (texto|escrito?)|responder (por |em )?texto|formato texto)\b/i,
    handler: () => {
      useAccessibilityStore.getState().setDefaultResponseFormat('text');
      return { type: 'COMMAND', command: 'ACCESSIBILITY_UPDATE', speak: 'Formato padrão definido como texto.' };
    },
  },
  {
    pattern: /\b(formato padrão áudio|formato padrão audio|responder (por |em )?áudio|responder (por |em )?audio|formato áudio|formato audio)\b/i,
    handler: () => {
      useAccessibilityStore.getState().setDefaultResponseFormat('audio');
      return { type: 'COMMAND', command: 'ACCESSIBILITY_UPDATE', speak: 'Formato padrão definido como áudio.' };
    },
  },
  {
    pattern: /\b(formato padrão múltipla escolha|responder múltipla escolha|formato quiz|múltipla escolha)\b/i,
    handler: () => {
      useAccessibilityStore.getState().setDefaultResponseFormat('quiz');
      return { type: 'COMMAND', command: 'ACCESSIBILITY_UPDATE', speak: 'Formato padrão definido como múltipla escolha.' };
    },
  },
];

async function tryLocalDispatch(transcript: string): Promise<VoiceCommandResponse | null> {
  const t = transcript.trim().toLowerCase();
  for (const { pattern, handler } of LOCAL_PATTERNS) {
    const match = t.match(pattern);
    if (match) return handler(match);
  }
  return null;
}

// ─── Tier 2: AI via backend ───────────────────────────────────────────────────

async function dispatchToAI(
  transcript: string,
  context: ScreenContext,
  token: string,
): Promise<VoiceCommandResponse> {
  const payload = { transcript, screen: context.screen, context };
  console.log('[Dispatcher] tier2 → enviando para AI:', JSON.stringify(payload));
  try {
    const result = await apiFetch<VoiceCommandResponse>('/voice-commands', {
      method: 'POST',
      token,
      body: payload,
    });
    console.log('[Dispatcher] tier2 ← resposta AI:', JSON.stringify(result));
    return result;
  } catch (err) {
    console.error('[Dispatcher] tier2 ← erro na chamada API:', err);
    return {
      type: 'ERROR',
      speak: 'Não consegui processar o comando. Tente novamente.',
    };
  }
}

// ─── Post-process AI navigation/global commands ───────────────────────────────

function postProcessAI(
  result: VoiceCommandResponse,
  onScreenAction?: (cmd: VoiceCommandResponse) => void,
): VoiceCommandResponse | null {
  if (result.type !== 'COMMAND') return null;
  switch (result.command) {
    case 'GO_BACK':
      router.back();
      break;
    case 'GO_HOME': {
      const onboardingRole = useOnboardingStore.getState().role;
      const authRole = useAuthStore.getState().role;
      const role = onboardingRole ?? authRole;
      router.push(landingRouteForRole(role));
      break;
    }
    case 'NAVIGATE_TO': {
      const route = result.payload?.route as string | undefined;
      if (route) router.push(route as Parameters<typeof router.push>[0]);
      break;
    }
    case 'OPEN_RESULTS':
      router.push('/(app)/(tabs)/results');
      break;
    case 'NAVIGATE_TO_CLASSROOM_AND_INVITE': {
      const classroomId = result.payload?.classroomId as string | undefined;
      if (classroomId) {
        router.push(`/teacher/classroom/${classroomId}` as Parameters<typeof router.push>[0]);
        return { type: 'COMMAND', command: 'GENERATE_INVITE_LINK', speak: result.speak };
      }
      break;
    }
    default:
      onScreenAction?.(result);
      break;
  }
  return null;
}

// ─── Public dispatcher ────────────────────────────────────────────────────────

export async function dispatch(
  transcript: string,
  context: ScreenContext | null,
  token: string | null,
  onScreenAction?: (cmd: VoiceCommandResponse) => void,
): Promise<VoiceCommandResponse> {
  console.log(`[Dispatcher] transcript: "${transcript}" | tela: ${context?.screen ?? '(sem contexto)'} | token: ${token ? 'ok' : 'AUSENTE'}`);

  const local = await tryLocalDispatch(transcript);
  if (local) {
    console.log('[Dispatcher] tier1 → match local:', local.command);
    speak(local.speak);
    return local;
  }
  console.log('[Dispatcher] tier1 → sem match, escalando para tier2');

  if (!token) {
    console.warn('[Dispatcher] token ausente — abortando antes do tier2');
    const r: VoiceCommandResponse = { type: 'UNKNOWN', speak: 'Não entendi. Pode repetir?' };
    speak(r.speak);
    return r;
  }

  const result = await dispatchToAI(transcript, context ?? { screen: 'home' }, token);

  let delegatedToScreen = false;
  const override = postProcessAI(result, (cmd) => {
    delegatedToScreen = true;
    onScreenAction?.(cmd);
  });
  const final = override ?? result;

  if (!delegatedToScreen) {
    speak(final.speak);
  }
  return final;
}
