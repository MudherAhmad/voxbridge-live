export type MixSettings = { original: number; arabic: number; duck: number; voice: boolean };

export const defaultMix: MixSettings = { original: 40, arabic: 100, duck: 90, voice: true };

export type Cue = { sourceStart: number; sourceEnd: number; dubStart: number; dubEnd: number };

export function sequenceCues(clips: readonly { source: number; dub: number }[]): Cue[] {
  let start = 0.25;
  return clips.map(({ source, dub }) => {
    const overlap = Math.min(0.9, source / 3, dub / 2);
    const dubStart = start + source - overlap;
    const cue = { sourceStart: start, sourceEnd: start + source, dubStart, dubEnd: dubStart + dub };
    start = cue.dubEnd + 0.35;
    return cue;
  });
}

export function activeCue(cues: readonly Cue[], time: number, channel: 'source' | 'dub') {
  return cues.findIndex(cue => time >= cue[`${channel}Start`] && time < cue[`${channel}End`]);
}

export function sourceMix(cues: readonly Cue[], time: number, duck: number, voice: boolean) {
  return voice && cues.some(cue => time >= cue.dubStart && time < cue.sourceEnd) ? 1 - duck / 100 : 1;
}
