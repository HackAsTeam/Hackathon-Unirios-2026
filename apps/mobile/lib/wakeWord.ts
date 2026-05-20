import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import { requestSTTPermission } from './stt';

// Cobre variações de STT pt-BR para "dillo"
const WAKE_PATTERNS = [
  /\b(?:hey|ei|oi|ey|e)\s+[db]ill?[aoue][ns]?\b/i,
  /\b[db]ill?[aoue][ns]?\b/i,
];

function matchesWakeWord(text: string): boolean {
  return WAKE_PATTERNS.some((p) => p.test(text));
}

type WakeCallback = () => void;
type Mode = 'onnx' | 'stt';

let _active = false;
let _mode: Mode = 'stt';
let _onDetected: WakeCallback | null = null;
let _restartTimer: ReturnType<typeof setTimeout> | null = null;
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

  ExpoSpeechRecognitionModule.start({ lang: 'pt-BR', interimResults: true, continuous: false, maxAlternatives: 1 });

  _subs.push(ExpoSpeechRecognitionModule.addListener('result', (e) => {
    const text = e.results?.[0]?.transcript ?? '';
    if (matchesWakeWord(text)) {
      _active = false;
      _cleanupStt();
      try { ExpoSpeechRecognitionModule.stop(); } catch {}
      _onDetected?.();
    }
  }));

  _subs.push(ExpoSpeechRecognitionModule.addListener('end', () => {
    _cleanupStt();
    if (_active) _restartTimer = setTimeout(_loopStt, 300);
  }));

  _subs.push(ExpoSpeechRecognitionModule.addListener('error', (e) => {
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

export async function startWakeWordDetection(onDetected: WakeCallback): Promise<boolean> {
  if (_active) return true;

  const granted = await requestSTTPermission();
  if (!granted) {
    console.warn('[WakeWord] permissão de microfone negada');
    return false;
  }

  _active = true;
  _onDetected = onDetected;

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
