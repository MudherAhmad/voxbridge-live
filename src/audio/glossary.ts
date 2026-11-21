type GlossaryPair = { termSv: string };

function normalize(text: string) {
  return text.normalize('NFC').replace(/\p{White_Space}+/gu, ' ').trim();
}

export function matchingIndices(text: string, pairs: readonly GlossaryPair[]): number[] {
  const phrase = normalize(text);
  const matches: { index: number; position: number }[] = [];
  for (const [index, pair] of pairs.entries()) {
    const term = normalize(pair.termSv).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const word = new RegExp(`(?<![\\p{L}\\p{M}\\p{N}])${term}(?![\\p{L}\\p{M}\\p{N}])`, 'iu');
    const match = word.exec(phrase);
    if (match) matches.push({ index, position: match.index });
  }
  return matches.sort((a, b) => a.position - b.position).map(match => match.index);
}

export function updateLiveMatches(current: number[], phrase: string, pairs: readonly GlossaryPair[]) {
  const added = matchingIndices(phrase, pairs).filter(index => !current.includes(index));
  return added.length ? [...current, ...added] : current;
}
