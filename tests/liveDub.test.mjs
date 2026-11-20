import { test } from 'node:test';
import assert from 'node:assert/strict';
import fc from 'fast-check';
import { createDubbingQueue, recentSegments } from '../src/audio/dubbingQueue.ts';

test('the caption history retains at most three segments in chronological order', () => {
  fc.assert(fc.property(fc.array(fc.string()), input => {
    let history = [];
    for (const [index, segment] of input.entries()) {
      history = recentSegments(history, segment);
      assert.deepEqual(history, input.slice(Math.max(0, index - 2), index + 1));
    }
  }));
});

test('dub playback is serial and accelerates when three or more are waiting', async () => {
  await fc.assert(fc.asyncProperty(fc.array(fc.string(), { minLength: 1, maxLength: 7 }), async input => {
    const starts = [];
    const completions = [];
    let resolve;
    let count = 0;
    const queue = createDubbingQueue(async (text, rate) => {
      count++;
      assert.equal(count, 1);
      starts.push({ text, rate });
      await new Promise(ready => { resolve = ready; });
      count--;
      completions.push(text);
    }, () => {}, error => { throw error; });
    input.forEach(queue.enqueue);
    for (const _ of input) {
      resolve();
      await new Promise(ready => setImmediate(ready));
    }
    assert.deepEqual(completions, input);
    assert.deepEqual(starts.map(({rate}) => rate), input.map((_, index) => index > 0 && input.length - index > 2 ? 1.25 : 1));
  }));
});

test('switching to captions cancels active audio and discards pending speech', async () => {
  const actuallySpoken = [];
  const states = [];
  const queue = createDubbingQueue((text, _, signal, onStart) => {
    actuallySpoken.push(text);
    onStart();
    return new Promise(resolve => signal.addEventListener('abort', resolve, { once: true }));
  }, speaking => states.push(speaking), assert.fail);
  queue.enqueue('first');
  queue.enqueue('second');
  queue.clear();
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(actuallySpoken, ['first']);
  assert.deepEqual(states, [true, false]);
});
