type Speak = (text: string, rate: number, signal: AbortSignal, onStart: () => void) => Promise<void>;

export function createDubbingQueue(speak: Speak, onSpeaking: (speaking: boolean) => void, onError: (error: unknown) => void) {
  const pending: string[] = [];
  let active: AbortController | undefined;
  let running = false;

  async function drain() {
    if (running) return;
    running = true;
    while (pending.length) {
      const rate = pending.length > 2 ? 1.25 : 1;
      const text = pending.shift()!;
      const current = new AbortController();
      active = current;
      try {
        await speak(text, rate, current.signal, () => {
          if (!current.signal.aborted) onSpeaking(true);
        });
      } catch (error) {
        if (!current.signal.aborted) onError(error);
      } finally {
        active = undefined;
        if (!current.signal.aborted) onSpeaking(false);
      }
    }
    running = false;
  }

  return {
    enqueue(text: string) {
      pending.push(text);
      if (pending.length > 6) pending.shift();
      void drain();
    },
    clear() {
      pending.length = 0;
      active?.abort();
      onSpeaking(false);
    },
  };
}

export function recentSegments<T>(history: readonly T[], next: T): T[] {
  return [...history.slice(-2), next];
}
