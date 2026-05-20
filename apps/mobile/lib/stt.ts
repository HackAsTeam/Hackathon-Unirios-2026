import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

export type STTResult = {
  transcript: string;
  isFinal: boolean;
};

export async function requestSTTPermission(): Promise<boolean> {
  const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
  return result.granted;
}

export function startListening(
  onResult: (result: STTResult) => void,
  onEnd: () => void,
  onError?: (error: string) => void,
) {
  console.log('[STT] start()');
  ExpoSpeechRecognitionModule.start({
    lang: 'pt-BR',
    interimResults: true,
    maxAlternatives: 1,
    continuous: false,
  });

  const subs: { remove: () => void }[] = [];

  subs.push(
    ExpoSpeechRecognitionModule.addListener('start', () => {
      console.log('[STT] evento: start (reconhecimento iniciado)');
    }),
  );

  subs.push(
    ExpoSpeechRecognitionModule.addListener('audiostart', () => {
      console.log('[STT] evento: audiostart (captura de áudio ativa)');
    }),
  );

  subs.push(
    ExpoSpeechRecognitionModule.addListener('result', (e) => {
      const text = e.results?.[0]?.transcript ?? '';
      console.log(`[STT] evento: result "${text}" (isFinal=${e.isFinal})`);
      onResult({ transcript: text, isFinal: e.isFinal });
    }),
  );

  subs.push(
    ExpoSpeechRecognitionModule.addListener('end', () => {
      console.log('[STT] evento: end');
      subs.forEach((s) => s.remove());
      onEnd();
    }),
  );

  subs.push(
    ExpoSpeechRecognitionModule.addListener('error', (e) => {
      console.log(`[STT] evento: error "${e.error}"`);
      subs.forEach((s) => s.remove());
      onError?.(e.error ?? 'unknown');
    }),
  );

  return () => {
    console.log('[STT] stop() chamado externamente');
    ExpoSpeechRecognitionModule.stop();
    subs.forEach((s) => s.remove());
  };
}

export function stopListening() {
  ExpoSpeechRecognitionModule.stop();
}

export { useSpeechRecognitionEvent };
