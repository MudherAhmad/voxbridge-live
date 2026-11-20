import { test } from 'node:test';
import assert from 'node:assert/strict';
import fc from 'fast-check';
import { activeCue, sequenceCues, sourceMix } from '../src/audio/timeline.ts';

const clips = fc.array(fc.record({
  source: fc.double({ min: 0.05, max: 60, noNaN: true }),
  dub: fc.double({ min: 0.05, max: 60, noNaN: true }),
}), { minLength: 1, maxLength: 35 });

test('sample scheduling preserves playback order without overlapping cues', () => {
  fc.assert(fc.property(clips, input => {
    const cues = sequenceCues(input);
    for (const [index, cue] of cues.entries()) {
      assert.ok(cue.sourceStart < cue.dubStart);
      assert.ok(cue.dubStart < cue.sourceEnd);
      assert.ok(cue.sourceEnd < cue.dubEnd);
      if (index > 0) assert.ok(cue.sourceStart >= cues[index - 1].dubEnd);
      assert.equal(activeCue(cues, cue.dubStart, 'dub'), index);
    }
  }));
});

test('ducking is limited to overlap and can be disabled', () => {
  fc.assert(fc.property(clips, fc.integer({ min: 0, max: 100 }), (input, duck) => {
    const cues = sequenceCues(input);
    for (const cue of cues) {
      assert.equal(sourceMix(cues, cue.sourceStart, duck, true), 1);
      assert.equal(sourceMix(cues, cue.dubStart, duck, true), 1 - duck / 100);
      assert.equal(sourceMix(cues, cue.dubStart, duck, false), 1);
      assert.equal(sourceMix(cues, cue.sourceEnd, duck, true), 1);
    }
  }));
});
