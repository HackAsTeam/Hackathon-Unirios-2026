import { useEffect } from 'react';
import { useVoiceCommandStore, type ScreenContext } from '../store/voiceCommand';

export function useScreenContext(ctx: ScreenContext) {
  const setContext = useVoiceCommandStore((s) => s.setContext);

  useEffect(() => {
    setContext(ctx);
    return () => setContext(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.screen]);
}
