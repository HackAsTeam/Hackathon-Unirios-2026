import { Audio } from 'expo-av';
import { AppState } from 'react-native';

const TTS_URL = process.env.EXPO_PUBLIC_TTS_URL;

let _sound: Audio.Sound | null = null;

// Unload any active sound before expo-av's AVManager.onHostDestroy runs,
// preventing the ExoPlayer "wrong thread" crash on hot reload.
AppState.addEventListener('change', (state) => {
  if (state === 'inactive' || state === 'background') {
    stopSpeaking();
  }
});

export async function speak(text: string): Promise<void> {
  await stopSpeaking();

  if (AppState.currentState !== 'active') {
    console.log('[TTS] app em background, pulando playback');
    return;
  }

  if (!TTS_URL) {
    console.warn('[TTS] EXPO_PUBLIC_TTS_URL not set');
    return;
  }

  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
    const url = `${TTS_URL}/tts?text=${encodeURIComponent(text)}`;
    const { sound } = await Audio.Sound.createAsync({ uri: url });
    _sound = sound;
    await sound.playAsync();
  } catch (err) {
    console.error('[TTS] playback error:', err);
  }
}

export async function stopSpeaking(): Promise<void> {
  if (_sound) {
    const s = _sound;
    _sound = null;
    try {
      await s.stopAsync();
      await s.unloadAsync();
    } catch {
      // already released or never fully loaded
    }
  }
}

export async function isSpeaking(): Promise<boolean> {
  if (!_sound) return false;
  try {
    const status = await _sound.getStatusAsync();
    return status.isLoaded && status.isPlaying;
  } catch {
    return false;
  }
}
