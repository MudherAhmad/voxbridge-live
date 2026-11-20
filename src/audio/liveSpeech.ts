import { createDubbingQueue, recentSegments } from './dubbingQueue';

type Transcript = { sv: string; ar: string };
type Translator = { translate(text: string, options: { signal: AbortSignal }): Promise<string>; destroy(): void };
type RecognitionResult = { isFinal: boolean; 0: { transcript: string } };
type Recognition = EventTarget & {
  lang: string; continuous: boolean; interimResults: boolean;
  start(track: MediaStreamTrack): void; abort(): void;
  onresult: ((event: { resultIndex: number; results: ArrayLike<RecognitionResult> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};
type Browser = Window & {
  Translator?: { create(options: {
    sourceLanguage: string; targetLanguage: string; signal: AbortSignal; monitor(target: EventTarget): void;
  }): Promise<Translator> };
  SpeechRecognition?: new () => Recognition;
  webkitSpeechRecognition?: new () => Recognition;
};

const browser = window as Browser;

export function arabicVoices() {
  return window.speechSynthesis?.getVoices().filter(voice => /^ar(?:-|$)/i.test(voice.lang)) ?? [];
}

function speakArabic(text: string, rate: number, signal: AbortSignal, volume: number, voiceURI: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const synth = window.speechSynthesis;
    const voices = arabicVoices();
    const voice = voices.find(item => item.voiceURI === voiceURI) ?? voices[0];
    if (!voice) {
      reject(Error('No Arabic speech voice is available. Live Arabic subtitles remain enabled.'));
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    utterance.rate = rate;
    utterance.volume = volume;
    const cancel = () => finish(undefined, true);
    const timer = window.setTimeout(() => finish(Error('Arabic speech timed out. Live subtitles remain enabled.'), true), 20000);
    function finish(error?: Error, interrupt = false) {
      clearTimeout(timer);
      signal.removeEventListener('abort', cancel);
      utterance.onend = null;
      utterance.onerror = null;
      if (interrupt) synth.cancel();
      if (error) reject(error);
      else resolve();
    }
    utterance.onend = () => finish();
    utterance.onerror = () => finish(Error('Arabic voice could not play. Live subtitles remain enabled.'));
    signal.addEventListener('abort', cancel, { once: true });
    if (signal.aborted) cancel();
    else {
      try { synth.speak(utterance); }
      catch { finish(Error('Arabic voice could not play. Live subtitles remain enabled.')); }
    }
  });
}

export function liveSpeechSupport() {
  const chromium = Number(navigator.userAgent.match(/Chrome\/(\d+)/)?.[1] ?? 0);
  return chromium >= 138 && Boolean(browser.Translator && (browser.SpeechRecognition || browser.webkitSpeechRecognition));
}

export function createLiveSpeech(track: MediaStreamTrack, initialVolume: number, callbacks: {
  progress(message: string): void;
  transcript(sv: string): void;
  translated(history: Transcript[]): void;
  speaking(speaking: boolean): void;
  failed(message: string): void;
}) {
  const controller = new AbortController();
  const { signal } = controller;
  let translator: Translator | undefined;
  let recognition: Recognition | undefined;
  let restart: number | undefined;
  let modelTimer: number | undefined;
  let history: Transcript[] = [];
  let chain = Promise.resolve();
  let volume = initialVolume;
  let voiceURI = "";
  const queue = createDubbingQueue((text, rate, signal) => speakArabic(text, rate, signal, volume, voiceURI), callbacks.speaking, error => {
    callbacks.progress(error instanceof Error ? error.message : 'Arabic voice failed. Live subtitles remain enabled.');
  });

  function stop() {
    if (signal.aborted) return;
    controller.abort();
    clearTimeout(restart);
    clearTimeout(modelTimer);
    if (recognition) {
      recognition.onresult = recognition.onerror = recognition.onend = null;
      recognition.abort();
    }
    translator?.destroy();
    queue.clear();
  }

  function fail(message: string) {
    if (signal.aborted) return;
    stop();
    callbacks.failed(message);
  }

  async function start() {
    const Recognition = browser.SpeechRecognition || browser.webkitSpeechRecognition;
    if (!liveSpeechSupport() || !browser.Translator || !Recognition) {
      fail('Live translation needs desktop Chrome with the Translator API. Tab capture remains available.');
      return;
    }
    const watchDownload = () => {
      clearTimeout(modelTimer);
      modelTimer = window.setTimeout(() => fail('No translation model progress for 30 seconds. Check Chrome’s connection and try again. Tab audio remains available.'), 30000);
    };
    try {
      watchDownload();
      callbacks.progress('Preparing the Swedish-to-Arabic language model…');
      const model = await browser.Translator.create({
        sourceLanguage: 'sv', targetLanguage: 'ar', signal,
        monitor(target) {
          target.addEventListener('downloadprogress', event => {
            if (signal.aborted) return;
            watchDownload();
            callbacks.progress(`Downloading translation model… ${Math.round((event as ProgressEvent).loaded * 100)}%`);
          });
        },
      });
      clearTimeout(modelTimer);
      if (signal.aborted) { model.destroy(); return; }
      translator = model;
      const recognizer = new Recognition();
      recognition = recognizer;
      recognizer.lang = 'sv-SE';
      recognizer.continuous = true;
      recognizer.interimResults = true;
      recognizer.onresult = event => {
        if (signal.aborted) return;
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0].transcript.trim();
          if (!text) continue;
          callbacks.transcript(text);
          if (!result.isFinal) continue;
          chain = chain.then(async () => {
            if (signal.aborted) return;
            const ar = (await model.translate(text, { signal })).trim();
            if (signal.aborted || !ar) return;
            history = recentSegments(history, { sv: text, ar });
            callbacks.translated(history);
            if (volume > 0) queue.enqueue(ar);
          }).catch(() => fail('The browser could not translate this segment. Restart live dubbing to retry.'));
        }
      };
      recognizer.onerror = event => {
        if (event.error !== 'no-speech') fail(`Swedish speech recognition stopped (${event.error}). Tab audio remains available.`);
      };
      const listen = () => {
        if (signal.aborted || track.readyState !== 'live') return;
        try { recognizer.start(track); }
        catch { fail('Chrome could not recognize speech from the shared tab track.'); }
      };
      recognizer.onend = () => { if (!signal.aborted) restart = window.setTimeout(listen, 350); };
      listen();
      if (!signal.aborted) callbacks.progress('Listening to the shared tab for Swedish speech.');
    } catch {
      fail('The Swedish-to-Arabic model could not start. Check Chrome and the connection for its initial download.');
    }
  }

  return { start, stop, setVoice(next: string) { voiceURI = next; }, setVolume(next: number) { volume = next; if (volume === 0) queue.clear(); } };
}
