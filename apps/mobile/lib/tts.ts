import { Audio } from 'expo-av';

const TTS_URL = process.env.EXPO_PUBLIC_TTS_URL;

let _sound: Audio.Sound | null = null;

export async function speak(text: string): Promise<void> {
  await stopSpeaking();

  if (!TTS_URL) {
    console.warn('[TTS] EXPO_PUBLIC_TTS_URL not set');
    return;
  }

  try {
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
    await _sound.stopAsync();
    await _sound.unloadAsync();
    _sound = null;
  }
}

export async function isSpeaking(): Promise<boolean> {
  if (!_sound) return false;
  const status = await _sound.getStatusAsync();
  return status.isLoaded && status.isPlaying;
}
