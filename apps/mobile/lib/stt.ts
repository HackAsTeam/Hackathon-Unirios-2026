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

  const unsubs: (() => void)[] = [];

  unsubs.push(
    ExpoSpeechRecognitionModule.addListener('result', (e) => {
      const text = e.results?.[0]?.transcript ?? '';
      onResult({ transcript: text, isFinal: e.isFinal });
    }),
  );

  unsubs.push(
    ExpoSpeechRecognitionModule.addListener('end', () => {
      unsubs.forEach((u) => u());
      onEnd();
    }),
  );

  unsubs.push(
    ExpoSpeechRecognitionModule.addListener('error', (e) => {
      unsubs.forEach((u) => u());
      onError?.(e.error ?? 'unknown');
    }),
  );

  return () => {
    ExpoSpeechRecognitionModule.stop();
    unsubs.forEach((u) => u());
  };
}

export function stopListening() {
  ExpoSpeechRecognitionModule.stop();
}

export { useSpeechRecognitionEvent };
