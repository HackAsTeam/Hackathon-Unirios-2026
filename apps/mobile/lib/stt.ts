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
  ExpoSpeechRecognitionModule.start({
    lang: 'pt-BR',
    interimResults: true,
    maxAlternatives: 1,
    continuous: false,
  });

  const subs: { remove: () => void }[] = [];

  subs.push(
    ExpoSpeechRecognitionModule.addListener('result', (e) => {
      const text = e.results?.[0]?.transcript ?? '';
      onResult({ transcript: text, isFinal: e.isFinal });
    }),
  );

  subs.push(
    ExpoSpeechRecognitionModule.addListener('end', () => {
      subs.forEach((s) => s.remove());
      onEnd();
    }),
  );

  subs.push(
    ExpoSpeechRecognitionModule.addListener('error', (e) => {
      subs.forEach((s) => s.remove());
      onError?.(e.error ?? 'unknown');
    }),
  );

  return () => {
    ExpoSpeechRecognitionModule.stop();
    subs.forEach((s) => s.remove());
  };
}

export function stopListening() {
  ExpoSpeechRecognitionModule.stop();
}

export { useSpeechRecognitionEvent };
