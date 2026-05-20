import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';
import { AppState } from 'react-native';

const TTS_URL = process.env.EXPO_PUBLIC_TTS_URL;

let _player: AudioPlayer | null = null;
let _speaking = false;
let _monitor: ReturnType<typeof setInterval> | null = null;
let _speakGen = 0;

AppState.addEventListener('change', (state) => {
  if (state === 'inactive' || state === 'background') {
    stopSpeaking();
  }
});

function _clearMonitor() {
  if (_monitor) { clearInterval(_monitor); _monitor = null; }
}

function preprocessForSpeech(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/gs, '$1')
    .replace(/\*(.+?)\*/gs, '$1')
    .replace(/(\d)\s*\*\s*(\d)/g, '$1 vezes $2')
    .replace(/\*/g, ' vezes ')
    .replace(/(\d)\s*\+\s*(\d)/g, '$1 mais $2')
    .replace(/(\d)\s*-\s*(\d)/g, '$1 menos $2')
    .replace(/(\d)\s*\/\s*(\d)/g, '$1 dividido por $2')
    .replace(/(\d)\s*=\s*(\d)/g, '$1 igual a $2')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function speak(text: string): Promise<void> {
  stopSpeaking();
  const gen = ++_speakGen;
  text = preprocessForSpeech(text);

  if (!text) return;

  if (AppState.currentState !== 'active') {
    console.log('[TTS] app em background, pulando playback');
    return;
  }

  if (!TTS_URL) {
    console.warn('[TTS] EXPO_PUBLIC_TTS_URL not set');
    return;
  }

  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'duckOthers',
    });
    if (gen !== _speakGen) return;
    const url = `${TTS_URL}/tts?text=${encodeURIComponent(text)}`;
    _speaking = true;
    _player = createAudioPlayer({ uri: url });
    _player.play();

    // Track when playback starts then stops so isSpeaking() stays true during loading
    let started = false;
    _monitor = setInterval(() => {
      if (!_player) { _speaking = false; _clearMonitor(); return; }
      const playing = _player.playing;
      if (playing) started = true;
      if (started && !playing) { _speaking = false; _clearMonitor(); }
    }, 150);
  } catch (err) {
    _speaking = false;
    console.error('[TTS] playback error:', err);
  }
}

export function stopSpeaking(): void {
  _speaking = false;
  _clearMonitor();
  if (_player) {
    try {
      _player.pause();
      _player.remove();
    } catch {}
    _player = null;
  }
}

export function isSpeaking(): boolean {
  return _speaking;
}
