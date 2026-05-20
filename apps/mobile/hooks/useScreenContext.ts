import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useVoiceCommandStore, type ScreenContext } from '../store/voiceCommand';

export function useScreenContext(ctx: ScreenContext) {
  const setContext = useVoiceCommandStore((s) => s.setContext);

  // useFocusEffect fires on focus/blur, not just mount/unmount — needed so
  // tab screens (which stay mounted in background) reset context on tab switch.
  useFocusEffect(
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useCallback(() => {
      setContext(ctx);
      return () => setContext(null);
    }, [ctx.screen, ctx.screenDescription]),
  );
}
