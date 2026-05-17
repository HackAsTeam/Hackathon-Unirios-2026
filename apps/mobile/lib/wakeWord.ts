import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import { requestSTTPermission } from './stt';

// Covers STT variations of "dillo" in pt-BR:
// dillo, dila, dilu, dile, dilos, dilo, dilu
const WAKE_PATTERNS = [
  /\b(?:hey|ei|oi|ey|e)\s+dill?[aoue]s?\b/i,
  /\bdill?[aoue]s?\b/i, // fallback: "dillo"/"dilu" sem saudação
];

function matchesWakeWord(text: string): boolean {
  return WAKE_PATTERNS.some((p) => p.test(text));
}

type WakeCallback = () => void;

let _active = false;
let _onDetected: WakeCallback | null = null;
let _restartTimer: ReturnType<typeof setTimeout> | null = null;
const _subs: { remove: () => void }[] = [];

function _cleanup() {
  _subs.forEach((s) => s.remove());
  _subs.length = 0;
  if (_restartTimer) { clearTimeout(_restartTimer); _restartTimer = null; }
}

function _loop() {
  if (!_active) return;

  _cleanup();

  ExpoSpeechRecognitionModule.start({
    lang: 'pt-BR',
    interimResults: true,
    continuous: false,
    maxAlternatives: 1,
  });

  _subs.push(
    ExpoSpeechRecognitionModule.addListener('result', (e) => {
      const text = e.results?.[0]?.transcript ?? '';
      console.log(`[WakeWord] ouvi: "${text}" (final: ${e.isFinal})`);
      if (matchesWakeWord(text)) {
        console.log('[WakeWord] wake word detectado! ativando assistente...');
        _active = false;
        _cleanup();
        try { ExpoSpeechRecognitionModule.stop(); } catch {}
        _onDetected?.();
      }
    }),
  );

  _subs.push(
    ExpoSpeechRecognitionModule.addListener('end', () => {
      console.log('[WakeWord] sessão STT encerrada, reiniciando loop...');
      _cleanup();
      if (_active) _restartTimer = setTimeout(_loop, 300);
    }),
  );

  _subs.push(
    ExpoSpeechRecognitionModule.addListener('error', (e) => {
      if (e.error !== 'aborted') {
        console.warn(`[WakeWord] erro STT: ${e.error}, reiniciando em 1s...`);
      }
      _cleanup();
      if (_active && e.error !== 'aborted') {
        _restartTimer = setTimeout(_loop, 1000);
      }
    }),
  );
}

export async function startWakeWordDetection(onDetected: WakeCallback): Promise<boolean> {
  if (_active) return true;

  const granted = await requestSTTPermission();
  if (!granted) {
    console.warn('[WakeWord] permissão de microfone negada');
    return false;
  }

  console.log('[WakeWord] iniciando detecção — diga "Hey Dillo"');
  _active = true;
  _onDetected = onDetected;
  _loop();
  return true;
}

export function stopWakeWordDetection() {
  if (!_active) return; // evita spam de log quando já está parado
  console.log('[WakeWord] detecção pausada');
  _active = false;
  _onDetected = null;
  _cleanup();
  try { ExpoSpeechRecognitionModule.stop(); } catch {}
}

export function isWakeWordDetectionActive() {
  return _active;
}
