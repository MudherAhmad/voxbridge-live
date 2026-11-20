import type { MixSettings } from './timeline';
import { cachedSample, createSampleMedia, loadSample, sampleVoiceUrl } from './sampleVoices';
import type { ChannelPlayback, SampleChannel, SamplePlayback, VoiceStyle } from './sampleVoices';
import sample from './workshop.json';
import { sampleDuration, sampleSchedule } from './sampleSchedule';

export const initialFrame = { segment: 0, position: 0, sourceActive: false, dubActive: false, ended: false };

export function prepareSample(initialMix: MixSettings, playback: SamplePlayback) {
  const context = typeof AudioContext === 'function' ? new AudioContext() : undefined;
  const lanes = {
    source: createLane('source', playback.source),
    dub: createLane('dub', playback.dub),
  };
  const { source, dub } = lanes;
  let settings = initialMix;
  let started = false;
  let stopped = false;
  let paused = false;
  let segment = 0;
  let position = 0;
  let error: unknown;
  let arabicStarted = false;
  let sourceDone = false;
  let dubDone = false;
  let observedMedia: HTMLAudioElement | undefined;
  let observedTime = -1;
  let lastProgress = 0;
  let recovered = false;
  let bufferedPlayback = Boolean(context);

  function createLane(channel: SampleChannel, options: ChannelPlayback) {
    const media = createSampleMedia(channel, options);
    const gain = context?.createGain();
    if (context && gain) {
      gain.gain.value = 0;
      context.createMediaElementSource(media).connect(gain).connect(context.destination);
    } else {
      media.muted = true;
    }
    return { media, gain, target: -1, style: options.style, selected: options.style };
  }

  function play(media: HTMLAudioElement) {
    void media.play().catch(reason => {
      if (!stopped && (reason as DOMException)?.name !== 'AbortError') error = reason;
    });
  }

  function setGain(lane: typeof source, target: number) {
    if (lane.target === target) return;
    lane.target = target;
    if (!context || !lane.gain) {
      lane.media.volume = target;
      lane.media.muted = target === 0;
      return;
    }
    const now = context.currentTime;
    lane.gain.gain.cancelScheduledValues(now);
    lane.gain.gain.setTargetAtTime(target, now, 0.018);
  }

  function applyMix() {
    const { original, arabic, voice } = settings;
    const dubLevel = voice ? arabic / 100 : 0;
    setGain(source, original / 100);
    setGain(dub, dubLevel);
  }

  function dubIsPlaying() {
    return arabicStarted && !dubDone && !dub.media.paused && !dub.media.seeking &&
      dub.media.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;
  }

  function positionLane(channel: SampleChannel, time: number) {
    const lane = lanes[channel];
    const asset = sampleVoiceUrl(channel, lane.selected);
    const local = cachedSample(asset);
    if (lane.style !== lane.selected && (local || !bufferedPlayback)) {
      const rate = lane.media.playbackRate;
      lane.media.src = bufferedPlayback ? local! : asset;
      lane.media.dataset.voiceAsset = asset;
      lane.media.defaultPlaybackRate = rate;
      lane.media.playbackRate = rate;
      lane.style = lane.selected;
    }
    if (Math.abs(lane.media.currentTime - time) > 0.015) lane.media.currentTime = time;
  }

  function beginSegment() {
    const cue = sample.cues[segment];
    sourceDone = dubDone = arabicStarted = false;
    positionLane('source', cue.sourceStart);
    positionLane('dub', cue.dubStart);
    play(source.media);
  }

  function advance() {
    if (!started || stopped || paused || segment >= sample.cues.length) return;
    const cue = sample.cues[segment];
    if (!sourceDone && !source.media.seeking && (source.media.currentTime >= cue.sourceEnd || source.media.ended)) {
      sourceDone = true;
      source.media.pause();
    }
    if (!arabicStarted && sourceDone) {
      arabicStarted = true;
      positionLane('dub', cue.dubStart);
      play(dub.media);
    }
    const dubEnd = segment === sample.cues.length - 1 ? sample.duration : cue.dubEnd;
    if (arabicStarted && !dubDone && !dub.media.seeking && (dub.media.currentTime >= dubEnd || dub.media.ended)) {
      dubDone = true;
      dub.media.pause();
    }
    if (sourceDone && dubDone) {
      segment++;
      if (segment < sample.cues.length) beginSegment();
    }
    applyMix();
  }

  function checkProgress() {
    if (paused || stopped || segment >= sample.cues.length) return;
    const media = arabicStarted ? dub.media : source.media;
    const now = performance.now();
    if (observedMedia !== media) {
      observedMedia = media;
      observedTime = -1;
      recovered = false;
    }
    if (media.currentTime > observedTime + 0.005) {
      observedTime = media.currentTime;
      lastProgress = now;
    } else if (now - lastProgress > 6500) {
      if (recovered) throw Error('The sample stopped loading audio. Check the connection and try again.');
      recovered = true;
      lastProgress = now;
      const rate = media.playbackRate;
      const resumeAt = observedTime;
      media.load();
      media.defaultPlaybackRate = rate;
      media.playbackRate = rate;
      media.currentTime = resumeAt;
      play(media);
    }
  }

  function watchError() {
    if (started && !stopped) error = Error('A workshop audio track could not play.');
  }

  for (const { media } of Object.values(lanes)) {
    media.addEventListener('timeupdate', advance);
    media.addEventListener('ended', advance);
    media.addEventListener('error', watchError);
  }

  return {
    async start() {
      const resume = context?.resume();
      const assets = [sampleVoiceUrl('source', source.style), sampleVoiceUrl('dub', dub.style)];
      const cached = assets.map(cachedSample);
      const audio = !bufferedPlayback ? assets : cached.every(Boolean) ? cached : await Promise.all(assets.map(loadSample));
      if (stopped) return;
      source.media.src = audio[0]!;
      dub.media.src = audio[1]!;
      try {
        await Promise.all([resume, source.media.play(), dub.media.play()]);
      } catch (reason) {
        if (stopped || !(reason instanceof DOMException) || reason.name !== 'NotSupportedError') throw reason;
        // Some native media backends can decode WAV only from a normal URL.
        bufferedPlayback = false;
        source.media.pause();
        dub.media.pause();
        source.media.src = assets[0];
        dub.media.src = assets[1];
        await Promise.all([resume, source.media.play(), dub.media.play()]);
      }
      if (stopped) return;
      source.media.pause();
      dub.media.pause();
      started = true;
      beginSegment();
      applyMix();
    },
    frame() {
      if (error) throw error;
      advance();
      const cue = sample.cues[segment];
      if (!cue) return { ...initialFrame, segment: sample.cues.length - 1, position: sampleDuration, ended: true };
      checkProgress();
      const timing = sampleSchedule[segment];
      const cursor = arabicStarted
        ? Math.max(cue.dubStart, dub.media.currentTime) + timing.dubOffset
        : Math.min(cue.sourceEnd, source.media.currentTime) + timing.sourceOffset;
      position = Math.max(position, cursor);
      return {
        segment,
        position,
        sourceActive: !sourceDone && !source.media.paused && source.media.currentTime >= cue.sourceStart,
        dubActive: dubIsPlaying(),
        ended: false,
      };
    },
    pause() {
      paused = true;
      source.media.pause();
      dub.media.pause();
      applyMix();
    },
    resume() {
      if (!paused || stopped || segment >= sample.cues.length) return;
      paused = false;
      lastProgress = performance.now();
      if (!sourceDone) play(source.media);
      if (arabicStarted && !dubDone) play(dub.media);
      applyMix();
    },
    mix(next: MixSettings) { settings = next; if (started) applyMix(); },
    rate(channel: SampleChannel, next: number) { lanes[channel].media.playbackRate = next; },
    voiceStyle(channel: SampleChannel, style: VoiceStyle) {
      lanes[channel].selected = style;
      void loadSample(sampleVoiceUrl(channel, style)).catch(() => {});
    },
    currentStyle(channel: SampleChannel) { return lanes[channel].style; },
    stop() {
      stopped = true;
      for (const { media } of Object.values(lanes)) {
        media.removeEventListener('timeupdate', advance);
        media.removeEventListener('ended', advance);
        media.removeEventListener('error', watchError);
        media.pause();
        media.removeAttribute('src');
        media.load();
      }
      if (context && context.state !== 'closed') void context.close();
    },
  };
}
