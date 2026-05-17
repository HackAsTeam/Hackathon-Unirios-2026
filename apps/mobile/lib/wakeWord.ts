import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import { requestSTTPermission } from './stt';

// Matches "hey/ei/oi dillo" and variations the STT might produce in pt-BR
const WAKE_PATTERNS = [
  /\b(?:hey|ei|oi|ey|e)\s+dill?[oa]s?\b/i,
  /\bdill[oa]\b/i, // fallback: just "dillo" alone
];

function matchesWakeWord(text: string): boolean {
  return WAKE_PATTERNS.some((p) => p.test(text));
}

type WakeCallback = () => void;

let _active = false;
let _onDetected: WakeCallback | null = null;
let _restartTimer: ReturnType<typeof setTimeout> | null = null;
const _unsubs: (() => void)[] = [];

function _cleanup() {
  _unsubs.forEach((u) => u());
  _unsubs.length = 0;
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

  _unsubs.push(
    ExpoSpeechRecognitionModule.addListener('result', (e) => {
      const text = e.results?.[0]?.transcript ?? '';
      if (matchesWakeWord(text)) {
        // Stop first, then fire callback so STT is free for the overlay
        _active = false;
        _cleanup();
        try { ExpoSpeechRecognitionModule.stop(); } catch {}
        _onDetected?.();
      }
    }),
  );

  _unsubs.push(
    ExpoSpeechRecognitionModule.addListener('end', () => {
      _cleanup();
      if (_active) _restartTimer = setTimeout(_loop, 300);
    }),
  );

  _unsubs.push(
    ExpoSpeechRecognitionModule.addListener('error', (e) => {
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
  if (!granted) return false;

  _active = true;
  _onDetected = onDetected;
  _loop();
  return true;
}

export function stopWakeWordDetection() {
  _active = false;
  _onDetected = null;
  _cleanup();
  try { ExpoSpeechRecognitionModule.stop(); } catch {}
}

export function isWakeWordDetectionActive() {
  return _active;
}
