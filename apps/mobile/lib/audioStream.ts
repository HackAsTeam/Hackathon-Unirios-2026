import { AudioRecorder, AudioManager } from 'react-native-audio-api';

export const CHUNK_SAMPLES = 1280; // 80 ms @ 16 kHz — frame size esperado pelo openWakeWord

type ChunkCallback = (samples: Float32Array) => void;

let _recorder: AudioRecorder | null = null;

export function startStream(onChunk: ChunkCallback): void {
  AudioManager.setAudioSessionActivity(true).catch(() => {});

  _recorder = new AudioRecorder();
  _recorder.onAudioReady(
    { sampleRate: 16000, bufferLength: CHUNK_SAMPLES, channelCount: 1 },
    ({ buffer, numFrames }) => {
      onChunk(buffer.getChannelData(0).slice(0, numFrames));
    }
  );
  _recorder.start();
}

export function stopStream(): void {
  _recorder?.clearOnAudioReady();
  _recorder?.stop();
  _recorder = null;
  AudioManager.setAudioSessionActivity(false).catch(() => {});
}
