import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { arabicVoices, createLiveSpeech, liveSpeechSupport } from './audio/liveSpeech';
import { openTabCapture } from './audio/tabCapture';
import { initialFrame, prepareSample } from './audio/samplePlayer';
import { defaultPlayback, loadSample, sampleVoiceUrl, voiceOptions } from './audio/sampleVoices';
import type { ChannelPlayback, SampleChannel, VoiceStyle } from './audio/sampleVoices';
import type { MixSettings } from './audio/timeline';
import { defaultMix } from './audio/timeline';
import sample from './audio/workshop.json';
import { sampleDuration, sequentialPeaks } from './audio/sampleSchedule';
import voicePeaks from './audio/voices/peaks.json';

const duration = sampleDuration;
const sampleRates = [0.75, 0.9, 1, 1.1, 1.25, 1.5];
const sampleChannels = [{ id: 'source', language: 'Swedish' }, { id: 'dub', language: 'Arabic' }] as const;
const nativeLiveAvailable = liveSpeechSupport();
const mobileBrowser = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const captureAvailable = !mobileBrowser && typeof navigator.mediaDevices?.getDisplayMedia === 'function';
const idleStatus = captureAvailable
  ? 'Play the bundled workshop sample or share a desktop browser tab.'
  : 'Play the sample on this device. For live tab audio, open VoxBridge in Chrome on a computer.';

function timecode(seconds: number) {
  const whole = Math.floor(seconds);
  return `${String(Math.floor(whole / 60)).padStart(2, '0')}:${String(whole % 60).padStart(2, '0')}`;
}

function highlight(text: string, term: string): ReactNode {
  const index = text.indexOf(term);
  if (index === -1) return text;
  return <>{text.slice(0, index)}<mark>{term}</mark>{text.slice(index + term.length)}</>;
}

function Wave({ peaks, progress }: { peaks: number[]; progress: number }) {
  return <div className="wave" aria-hidden="true">
    {peaks.map((peak, index) => (
      <i key={index} className={index / peaks.length <= progress ? 'played' : ''}
        style={{ height: `${Math.max(3, peak * 100)}%` }} />
    ))}
  </div>;
}

export function Studio() {
  const [mode, setMode] = useState<'ready' | 'loading' | 'sample' | 'paused' | 'opening' | 'capture'>('ready');
  const [status, setStatus] = useState(idleStatus);
  const [time, setTime] = useState(0);
  const [mixSettings, setMixSettings] = useState(defaultMix);
  const [samplePlayback, setSamplePlayback] = useState(defaultPlayback);
  const [sampleFrame, setSampleFrame] = useState(initialFrame);
  const { original, arabic, duck, voice } = mixSettings;
  const controls = useRef(mixSettings);
  const stopCurrent = useRef<() => void>(() => {});
  const samplePlayer = useRef<ReturnType<typeof prepareSample> | null>(null);
  const sampleAnimation = useRef(0);
  const canvas = useRef<HTMLCanvasElement>(null);
  const capturedAudio = useRef<Awaited<ReturnType<typeof openTabCapture>> | null>(null);
  const liveSpeech = useRef<ReturnType<typeof createLiveSpeech> | null>(null);
  const speakingNow = useRef(false);
  const [liveEnabled, setLiveEnabled] = useState(false);
  const [liveVoices, setLiveVoices] = useState(arabicVoices);
  const [liveVoice, setLiveVoice] = useState("");
  const [liveSpeaking, setLiveSpeaking] = useState(false);
  const [canDuck, setCanDuck] = useState(false);
  const [draft, setDraft] = useState('');
  const [translatedLine, setTranslatedLine] = useState<{sv: string; ar: string} | null>(null);

  useEffect(() => () => stopCurrent.current(), []);
  useEffect(() => {
    const update = () => setLiveVoices(arabicVoices());
    window.speechSynthesis?.addEventListener?.("voiceschanged", update);
    return () => window.speechSynthesis?.removeEventListener?.("voiceschanged", update);
  }, []);

  useEffect(() => {
    void loadSample(sampleVoiceUrl('source', samplePlayback.source.style)).catch(() => {});
    void loadSample(sampleVoiceUrl('dub', samplePlayback.dub.style)).catch(() => {});
  }, [samplePlayback.source.style, samplePlayback.dub.style]);

  function endSession(message: string, rewind = true) {
    stopCurrent.current();
    stopCurrent.current = () => {};
    setMode('ready');
    if (rewind) {
      setTime(0);
      setSampleFrame(initialFrame);
    }
    setStatus(message);
  }

  function followSample(playback: ReturnType<typeof prepareSample>) {
    setMode('sample');
    setStatus('Playing the workshop sample.');
    function tick() {
      try {
        const position = playback.frame();
        setSampleFrame(position);
        if (position.ended) {
          endSession('Workshop sample complete. Replay it to compare original and dubbed audio.', false);
          return;
        }
        sampleAnimation.current = requestAnimationFrame(tick);
      } catch (error) {
        endSession(error instanceof Error ? error.message : 'A workshop audio track could not play. Try starting the sample again.');
      }
    }
    tick();
  }

  function pauseSample() {
    const playback = samplePlayer.current;
    if (!playback) return;
    cancelAnimationFrame(sampleAnimation.current);
    playback.pause();
    try {
      setSampleFrame(playback.frame());
      setMode('paused');
      setStatus('Sample paused. Resume to continue from this position.');
    } catch {
      endSession('A workshop audio track could not play. Try starting the sample again.');
    }
  }

  function resumeSample() {
    const playback = samplePlayer.current;
    if (!playback) return;
    playback.resume();
    followSample(playback);
  }

  async function playSample() {
    setMode('loading');
    setSampleFrame(initialFrame);
    setStatus('Loading the workshop sample…');
    let player: ReturnType<typeof prepareSample> | undefined;
    try {
      const playback = prepareSample(controls.current, samplePlayback);
      player = playback;
      samplePlayer.current = playback;
      stopCurrent.current = () => {
        cancelAnimationFrame(sampleAnimation.current);
        playback.stop();
        samplePlayer.current = null;
      };
      await playback.start();
      if (samplePlayer.current !== playback) return;
      playback.mix(controls.current);
      followSample(playback);
    } catch {
      if (!player || samplePlayer.current === player) endSession('The sample could not start. Tap Play again to retry.');
    }
  }

  async function capture() {
    stopCurrent.current();
    const request = new AbortController();
    let frame = 0;
    let audio: Awaited<ReturnType<typeof openTabCapture>> | undefined;
    stopCurrent.current = () => {
      request.abort();
      cancelAnimationFrame(frame);
      liveSpeech.current?.stop();
      liveSpeech.current = null;
      capturedAudio.current = null;
      audio?.close();
    };
    setTime(0);
    setSampleFrame(initialFrame);
    setLiveEnabled(false);
    setLiveSpeaking(false);
    speakingNow.current = false;
    setCanDuck(false);
    setDraft('');
    setTranslatedLine(null);
    setMode('opening');
    setStatus('Choose a browser tab and enable Share tab audio.');
    try {
      audio = await openTabCapture(request.signal, controls.current.original / 100);
      const { analyser, stream } = audio;
      const samples = new Uint8Array(analyser.fftSize);
      const start = performance.now();
      for (const track of stream.getTracks()) {
        track.addEventListener('ended', () => endSession('Tab sharing ended.'), { once: true, signal: request.signal });
      }
      if (stream.getTracks().some(track => track.readyState === 'ended')) {
        endSession('Tab sharing ended.');
        return;
      }
      capturedAudio.current = audio;
      setCanDuck(audio.canDuck);
      audio.setGain(controls.current.original / 100);
      setMode('capture');
      setStatus(nativeLiveAvailable
        ? 'Enable live dubbing to send tab audio to the browser speech recognition service, which may process audio online.'
        : 'Receiving tab audio. Live translation requires desktop Chrome with its Translator API enabled.');
      function draw() {
        const plot = canvas.current;
        const ctx = plot?.getContext('2d');
        if (plot && ctx) {
          analyser.getByteTimeDomainData(samples);
          ctx.clearRect(0, 0, plot.width, plot.height);
          ctx.beginPath();
          for (let index = 0; index < samples.length; index++) {
            const x = index * plot.width / (samples.length - 1);
            const y = samples[index] * plot.height / 256;
            if (index === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = '#ffbf69';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        setTime((performance.now() - start) / 1000);
        frame = requestAnimationFrame(draw);
      }
      frame = requestAnimationFrame(draw);
    } catch (error) {
      if (request.signal.aborted) return;
      const message = error instanceof DOMException && error.name === 'NotAllowedError'
        ? 'Tab sharing was cancelled or declined.'
        : error instanceof Error ? error.message : 'Tab sharing could not start.';
      endSession(message);
    }
  }

  function enableLiveDubbing() {
    const audio = capturedAudio.current;
    if (!audio || liveSpeech.current) return;
    const settings = controls.current;
    const session = createLiveSpeech(audio.track, settings.voice ? settings.arabic / 100 : 0, {
      progress: setStatus,
      transcript: setDraft,
      translated: history => setTranslatedLine(history[history.length - 1]),
      speaking(speaking) {
        speakingNow.current = speaking;
        setLiveSpeaking(speaking);
        const { original, duck } = controls.current;
        audio.setGain(original / 100 * (speaking ? 1 - duck / 100 : 1));
      },
      failed(message) {
        liveSpeech.current = null;
        setLiveEnabled(false);
        setStatus(message);
      },
    });
    session.setVoice(liveVoice);
    liveSpeech.current = session;
    setLiveEnabled(true);
    void session.start();
  }

  function changePlayback(channel: SampleChannel, update: Partial<ChannelPlayback>) {
    setSamplePlayback(previous => ({ ...previous, [channel]: { ...previous[channel], ...update } }));
    if (update.rate !== undefined) samplePlayer.current?.rate(channel, update.rate);
    if (update.style !== undefined) samplePlayer.current?.voiceStyle(channel, update.style);
  }

  function changeMix(update: Partial<MixSettings>) {
    const settings = { ...controls.current, ...update };
    controls.current = settings;
    setMixSettings(settings);
    const dubEnabled = settings.voice && settings.arabic > 0;
    samplePlayer.current?.mix(settings);
    if (mode === 'capture') {
      liveSpeech.current?.setVolume(dubEnabled ? settings.arabic / 100 : 0);
      const ducked = speakingNow.current && dubEnabled;
      capturedAudio.current?.setGain(settings.original / 100 * (ducked ? 1 - settings.duck / 100 : 1));
    }
  }

  const capturing = mode === 'capture';
  const opening = mode === 'opening';
  const sharing = capturing || opening;
  const playing = mode === 'sample';
  const paused = mode === 'paused';
  const loading = mode === 'loading';
  const sampleBusy = loading || playing || paused;
  const clockTime = sharing ? time : sampleFrame.position;
  const progress = sampleFrame.position / duration;
  const sourceStyle = samplePlayer.current?.currentStyle('source') ?? samplePlayback.source.style;
  const dubStyle = samplePlayer.current?.currentStyle('dub') ?? samplePlayback.dub.style;
  const sourceWave = useMemo(() => sequentialPeaks(sourceStyle === 'original' ? sample.peaks.source : voicePeaks.source[sourceStyle], 'source'), [sourceStyle]);
  const dubWave = useMemo(() => sequentialPeaks(dubStyle === 'original' ? sample.peaks.dub : voicePeaks.dub[dubStyle], 'dub'), [dubStyle]);
  const line = sample.lines[sampleFrame.segment];
  const dubEnabled = voice && arabic > 0;
  const ducking = capturing && canDuck && liveSpeaking;
  const mix = original / 100 * (ducking ? 1 - duck / 100 : 1);
  const state = capturing ? 'Receiving audio' : playing ? 'Playing sample' : opening ? 'Waiting for tab' : loading ? 'Loading sample' : paused ? 'Paused' : 'Ready';

  return (
    <div className="shell">
      <header className="top">
        <a className="brand" href="./"><span className="mark" aria-hidden="true"><b /><b /><b /><b /><b /></span>VoxBridge <strong>Live</strong></a>
        <span className="pair"><span>Swedish</span><b aria-hidden="true">→</b><span>Arabic</span></span>
      </header>
      <main>
        <section className="studio" aria-labelledby="studio-title">
          <header className="studio-head">
            <div>
              <h1 id="studio-title">Dubbing studio</h1>
              <div className="studio-context">
                <span>{sharing ? 'Desktop tab capture' : 'Bundled workshop sample'}</span>
                <span className={'state' + (playing || capturing ? ' active' : '')}><i aria-hidden="true" />{state}</span>
                <button type="button" className="reset-sample" disabled={!paused && !playing} onClick={() => endSession('Sample reset to the beginning.')}>Reset sample</button>
              </div>
            </div>
            <div className="actions">
              <button className="primary" type="button" disabled={sharing}
                onClick={playing ? pauseSample : paused ? resumeSample : loading ? () => endSession('Sample loading cancelled.') : playSample}>
                <span aria-hidden="true">{playing ? 'Ⅱ' : loading ? '×' : '▶'}</span> {playing ? 'Pause sample' : paused ? 'Resume sample' : loading ? 'Cancel loading' : 'Play workshop sample'}
              </button>
              <button className="secondary" type="button" disabled={opening || !captureAvailable} onClick={capturing ? () => endSession('Tab capture stopped.') : capture}>
                {capturing ? 'Stop capture' : opening ? 'Choose a tab…' : captureAvailable ? 'Capture tab audio' : 'Capture on desktop'}
              </button>
            </div>
          </header>
          <div className="timeline">
            <div className="ruler">
              <span className="clock">{timecode(clockTime)}{!sharing && <small> / {timecode(duration)}</small>}</span>
              {!sharing && <div aria-hidden="true"><span>00:00</span><span>{timecode(duration / 3)}</span><span>{timecode(duration * 2 / 3)}</span><span>{timecode(duration)}</span></div>}
            </div>
            <div className="lanes">
              {!sharing && <div className="playhead" style={{ '--progress': `${progress * 100}%` } as CSSProperties} aria-hidden="true" />}
              <div className={'lane original' + (sampleFrame.sourceActive || capturing ? ' on-air' : '')}>
                <div className="lane-label"><strong>Swedish</strong><small>01 / Original</small></div>
                <div className="signal">{sharing
                  ? <canvas ref={canvas} width={900} height={90} aria-label="Live input waveform" />
                  : <Wave peaks={sourceWave} progress={progress} />}</div>
              </div>
              <div className={'lane dub' + ((capturing ? liveSpeaking : sampleFrame.dubActive && dubEnabled) ? ' on-air' : '')}>
                <div className="lane-label"><strong>Arabic</strong><small>02 / Dub</small></div>
                <div className="signal">{sharing ? <span className="muted">{liveSpeaking ? 'Arabic voice playing' : liveEnabled ? 'Waiting for Swedish speech' : 'Live dubbing idle'}</span> : <Wave peaks={dubWave} progress={progress} />}</div>
              </div>
            </div>
          </div>
          {capturing && nativeLiveAvailable && !liveEnabled && <div className="live-start"><button type="button" className="primary" onClick={enableLiveDubbing}>Enable live dubbing</button></div>}
          {!opening && <div className="mix">
            {(!capturing || canDuck && liveEnabled) && <div className="mix-presets" role="group" aria-label="Listening mode">
              <button type="button" aria-pressed={original === defaultMix.original && arabic === defaultMix.arabic && voice}
                onClick={() => changeMix({ original: defaultMix.original, arabic: defaultMix.arabic, voice: true })}>Balanced mix</button>
              <button type="button" aria-pressed={original === 0 && dubEnabled}
                onClick={() => changeMix({ original: 0, arabic: arabic || defaultMix.arabic, voice: true })}>Arabic only</button>
              <button type="button" aria-pressed={original > 0 && !dubEnabled}
                onClick={() => changeMix({ original: original || defaultMix.original, arabic: 0 })}>Swedish only</button>
            </div>}
            <span className="mix-level">{capturing && !canDuck ? 'Original volume controlled by source tab' : <>Original mix <strong>{Math.round(mix * 100)}%</strong></>}</span>
            <label className="voice"><input type="checkbox" checked={voice} onChange={event => changeMix({ voice: event.target.checked })} disabled={capturing && !liveEnabled} /> Arabic voice</label>
            <details className="audio-tuning">
              <summary>Audio tuning</summary>
              <div className="tuning-controls">
                {capturing && liveEnabled && <label>Live Arabic voice
                  <select value={liveVoice} onChange={event => {
                    setLiveVoice(event.target.value);
                    liveSpeech.current?.setVoice(event.target.value);
                  }}>
                    <option value="">Browser default</option>
                    {liveVoices.map(voice => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name}</option>)}
                  </select>
                </label>}
                {!sharing && <div className="sample-options">
                  {sampleChannels.map(({ id, language }) => (
                    <fieldset className={'track-options ' + id} key={id}>
                      <legend>{language} playback</legend>
                      <label>Speed
                        <select aria-label={`${language} speed`} value={samplePlayback[id].rate}
                          onChange={event => changePlayback(id, { rate: Number(event.target.value) })}>
                          {sampleRates.map(rate => <option key={rate} value={rate}>{rate === 1 ? '1.00× Normal' : `${rate.toFixed(2)}×`}</option>)}
                        </select>
                      </label>
                      <label>Voice style
                        <select aria-label={`${language} voice style`} value={samplePlayback[id].style} title="Changes apply at the next phrase"
                          onChange={event => changePlayback(id, { style: event.target.value as VoiceStyle })}>
                          {voiceOptions.filter(option => id === 'dub' || option.id === 'original' || option.id === 'alternate' || option.id === 'youthful').map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
                        </select>
                      </label>
                    </fieldset>
                  ))}
                </div>}
                <label className="fader original-control"><span>Original volume</span><input type="range" min="0" max="100" value={original} onChange={event => changeMix({ original: Number(event.target.value) })} disabled={capturing && !canDuck} /><span className="fader-value" aria-hidden="true">{original}%</span></label>
                <label className="fader arabic-control"><span>Arabic volume</span><input type="range" min="0" max="100" value={arabic} onChange={event => changeMix({ arabic: Number(event.target.value) })} disabled={!voice || capturing && !liveEnabled} /><span className="fader-value" aria-hidden="true">{arabic}%</span></label>
                {capturing && <label className="fader original-control"><span>Original ducking</span><input type="range" min="0" max="100" value={duck} onChange={event => changeMix({ duck: Number(event.target.value) })} disabled={!dubEnabled || capturing && (!canDuck || !liveEnabled)} /><span className="fader-value" aria-hidden="true">{duck}%</span></label>}
              </div>
            </details>
          </div>}
          <div className="status" role="status">{status}</div>
        </section>

        <section className="captions" aria-label="Bilingual captions">
          <article><h2>Original <span>SV</span></h2><p lang="sv">{sharing ? translatedLine?.sv || draft || '—' : highlight(line.sv, line.termSv)}</p></article>
          <article className="arabic"><h2>Translation <span>AR</span></h2><p lang="ar" dir="rtl">{sharing ? translatedLine?.ar || '—' : highlight(line.ar, line.termAr)}</p></article>
        </section>
      </main>
    </div>
  );
}
