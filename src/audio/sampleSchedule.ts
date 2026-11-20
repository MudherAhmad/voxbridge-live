import sample from './workshop.json';

let offset = 0;
export const sampleSchedule = sample.cues.map((cue, index) => {
  offset -= cue.sourceStart - (sample.cues[index - 1]?.dubEnd ?? 0);
  const gap = Math.max(0, cue.sourceEnd - cue.dubStart);
  const entry = { sourceOffset: offset, dubOffset: offset + gap };
  offset += gap;
  return entry;
});

export const sampleDuration = sample.duration + offset;

export function sequentialPeaks(peaks: number[], channel: 'source' | 'dub') {
  return peaks.map((_, index) => {
    const time = (index + 0.5) / peaks.length * sampleDuration;
    for (const [cueIndex, cue] of sample.cues.entries()) {
      const shift = channel === 'source' ? sampleSchedule[cueIndex].sourceOffset : sampleSchedule[cueIndex].dubOffset;
      const originalTime = time - shift;
      if (originalTime >= cue[`${channel}Start`] && originalTime < cue[`${channel}End`]) {
        return peaks[Math.floor(originalTime / sample.duration * peaks.length)] ?? 0;
      }
    }
    return 0;
  });
}
