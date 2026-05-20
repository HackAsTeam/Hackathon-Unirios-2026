import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import { requestSTTPermission } from './stt';

// Variações do nome "Dillo" reconhecidas pelo STT pt-BR:
//   prefixo: d ou dj
//   vogal:   i, í ou ii
//   consoante: l ou ll
//   final:   o, u, ou, uu, ô
const _DILLO = /dj?[ií]{1,2}ll?(?:ou|uu|[ouô])/;

// Prefixos de ativação reconhecidos
const _PREFIX = /(?:hey|[ôo]i|e[ih]?)\s+/;

const WAKE_PATTERNS = [
  new RegExp(`\\b${_PREFIX.source}${_DILLO.source}\\b`, 'i'),  // "Oi Dillo", "Hey Dillou" etc
  new RegExp(`\\b${_DILLO.source}\\b`, 'i'),                    // "Dillo" isolado
];

// "Dillo, <comando>" ou "Oi Dillo, <comando>" — captura tudo após o wake word
const INLINE_CMD_RE = new RegExp(
  `^(?:${_PREFIX.source})?${_DILLO.source}[,\\.\\s]+(.+)`,
  'i',
);

function _extractInlineCommand(text: string): string | null {
  const m = INLINE_CMD_RE.exec(text.trim());
  return m?.[1].trim() ?? null;
}

function matchesWakeWord(text: string): boolean {
  return WAKE_PATTERNS.some((p) => p.test(text));
}

type WakeCallback = () => void;
type InlineCommandCallback = (transcript: string) => void;
type Mode = 'onnx' | 'stt';

let _active = false;
let _mode: Mode = 'stt';
let _onDetected: WakeCallback | null = null;
let _onInlineCommand: InlineCommandCallback | null = null;
let _restartTimer: ReturnType<typeof setTimeout> | null = null;
let _sttLastTranscript = '';
const _subs: { remove: () => void }[] = [];

// Referências para cleanup do modo ONNX
let _stopStream: (() => void) | null = null;
let _destroyPipeline: (() => void) | null = null;
let _THRESHOLD = 0.5;

// ─── STT fallback ─────────────────────────────────────────────────────────────

function _cleanupStt() {
  _subs.forEach((s) => s.remove());
  _subs.length = 0;
  if (_restartTimer) { clearTimeout(_restartTimer); _restartTimer = null; }
}

function _loopStt() {
  if (!_active || _mode !== 'stt') return;
  _cleanupStt();
  _sttLastTranscript = '';

  ExpoSpeechRecognitionModule.start({ lang: 'pt-BR', interimResults: true, continuous: false, maxAlternatives: 1 });

  _subs.push(ExpoSpeechRecognitionModule.addListener('result', (e) => {
    const text = e.results?.[0]?.transcript ?? '';
    const isFinal = e.isFinal ?? false;
    console.log(`[WakeWord][STT] "${text}" (final=${isFinal})`);
    _sttLastTranscript = text;
    if (!isFinal) return;  // aguarda resultado final para decidir

    const inlineCmd = _extractInlineCommand(text);
    if (inlineCmd) {
      _active = false;
      _cleanupStt();
      try { ExpoSpeechRecognitionModule.stop(); } catch {}
      _onInlineCommand?.(inlineCmd);
      return;
    }
    if (matchesWakeWord(text)) {
      _active = false;
      _cleanupStt();
      try { ExpoSpeechRecognitionModule.stop(); } catch {}
      _onDetected?.();
    }
  }));

  _subs.push(ExpoSpeechRecognitionModule.addListener('end', () => {
    const text = _sttLastTranscript;
    _sttLastTranscript = '';
    _cleanupStt();
    if (!_active) return;

    // Fallback: isFinal pode não ter disparado, processar o último transcript
    const inlineCmd = _extractInlineCommand(text);
    if (inlineCmd) {
      _active = false;
      _onInlineCommand?.(inlineCmd);
      return;
    }
    if (matchesWakeWord(text)) {
      _active = false;
      _onDetected?.();
      return;
    }
    _restartTimer = setTimeout(_loopStt, 300);
  }));

  _subs.push(ExpoSpeechRecognitionModule.addListener('error', (e) => {
    _sttLastTranscript = '';
    _cleanupStt();
    if (_active && e.error !== 'aborted') _restartTimer = setTimeout(_loopStt, 1000);
  }));
}

// ─── ONNX chunk callback ───────────────────────────────────────────────────────

async function _onChunk(samples: Float32Array) {
  if (!_active || _mode !== 'onnx') return;
  const { processChunk } = await import('./openWakeWordPipeline');
  const score = await processChunk(samples);
  if (score >= _THRESHOLD) {
    console.log(`[WakeWord] ONNX detectado! score=${score.toFixed(3)}`);
    const cb = _onDetected;
    _active = false;
    _onDetected = null;
    _stopStream?.();
    _destroyPipeline?.();
    cb?.();
  }
}

// ─── API pública ───────────────────────────────────────────────────────────────

export async function startWakeWordDetection(
  onDetected: WakeCallback,
  onInlineCommand?: InlineCommandCallback,
): Promise<boolean> {
  if (_active) return true;

  const granted = await requestSTTPermission();
  if (!granted) {
    console.warn('[WakeWord] permissão de microfone negada');
    return false;
  }

  _active = true;
  _onDetected = onDetected;
  _onInlineCommand = onInlineCommand ?? null;

  // Tenta ONNX primeiro; cai para STT se módulo nativo não estiver disponível
  try {
    const [pipeline, audio] = await Promise.all([
      import('./openWakeWordPipeline'),
      import('./audioStream'),
    ]);
    await pipeline.initPipeline();

    _mode = 'onnx';
    _THRESHOLD = pipeline.DETECTION_THRESHOLD;
    _stopStream = audio.stopStream;
    _destroyPipeline = pipeline.destroyPipeline;

    console.log('[WakeWord] usando WebSocket pipeline (Hey_dilo.onnx no servidor) — diga "Oi Dillo"');
    audio.startStream(_onChunk);
  } catch {
    console.warn('[WakeWord] ONNX indisponível, usando STT fallback — diga "Hey Dillo"');
    _mode = 'stt';
    _loopStt();
  }

  return true;
}

export function stopWakeWordDetection() {
  if (!_active) return;
  console.log('[WakeWord] detecção pausada');
  _active = false;
  _onDetected = null;
  _onInlineCommand = null;

  if (_mode === 'onnx') {
    _stopStream?.();
    _destroyPipeline?.();
  } else {
    _cleanupStt();
    try { ExpoSpeechRecognitionModule.stop(); } catch {}
  }
}

export function isWakeWordDetectionActive() {
  return _active;
}
