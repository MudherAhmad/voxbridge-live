import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchingIndices, updateLiveMatches } from '../src/audio/glossary.ts';

const pairs = [{ termSv: 'invändig rengöring' }, { termSv: 'arbetsordern' }, { termSv: 'receptionen' }];

test('the glossary matches whole terms despite case, whitespace and Unicode normalization', () => {
  const phrase = 'RECEPTIONEN: invändig\t\nrengöring enligt ARBETSORDERN.'.normalize('NFD');
  assert.deepEqual(matchingIndices(phrase, pairs), [2, 0, 1]);
});

test('the glossary rejects substrings within longer Swedish words or numbers', () => {
  assert.deepEqual(matchingIndices('arbetsorderna, receptionens, X2receptionen, invändig rengöringen', pairs), []);
});

test('live matches stay unique and retain their first-heard order', () => {
  const first = updateLiveMatches([], 'Receptionen öppnar.', pairs);
  const second = updateLiveMatches(first, 'Arbetsordern gäller invändig rengöring vid receptionen.', pairs);
  assert.deepEqual(second, [2, 1, 0]);
  assert.strictEqual(updateLiveMatches(second, 'Receptionen igen.', pairs), second);
});
