export const DETECTION_THRESHOLD = 0.5;

let _ws: WebSocket | null = null;
let _detected = false;

function _getWsUrl(): string {
  const ttsUrl = (process.env.EXPO_PUBLIC_TTS_URL ?? '').replace(/\/$/, '');
  return ttsUrl.replace(/^http/, 'ws') + '/ws/wakeword';
}

export async function initPipeline(): Promise<void> {
  const url = _getWsUrl();
  if (!url.startsWith('ws')) throw new Error('[WakeWord] EXPO_PUBLIC_TTS_URL not configured');

  await new Promise<void>((resolve, reject) => {
    const ws = new WebSocket(url);
    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error('[WakeWord] WebSocket connection timeout'));
    }, 5000);

    ws.onopen = () => {
      clearTimeout(timeout);
      _ws = ws;
      _ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data as string);
          if (Array.isArray(data.activations) && data.activations.length > 0) {
            _detected = true;
          }
        } catch {}
      };
      resolve();
    };
    ws.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('[WakeWord] WebSocket connection failed'));
    };
  });
}

export async function processChunk(samples: Float32Array): Promise<number> {
  if (!_ws || _ws.readyState !== WebSocket.OPEN) return 0;

  const int16 = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    int16[i] = Math.max(-32768, Math.min(32767, Math.round(samples[i] * 32767)));
  }
  _ws.send(int16.buffer);

  if (_detected) {
    _detected = false;
    return 1.0;
  }
  return 0;
}

export function destroyPipeline(): void {
  _ws?.close();
  _ws = null;
  _detected = false;
}
