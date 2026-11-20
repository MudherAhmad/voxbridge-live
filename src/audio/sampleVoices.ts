export const voiceOptions = [
  { id: 'original', label: 'Original voice' },
  { id: 'deep', label: 'Deep adult tone' },
  { id: 'alternate', label: 'Woman (alternate)' },
  { id: 'youthful', label: 'Youthful tone' },
  { id: 'mature', label: 'Mature tone' },
] as const;

export type VoiceStyle = typeof voiceOptions[number]['id'];
export type SampleChannel = 'source' | 'dub';
export type ChannelPlayback = { rate: number; style: VoiceStyle };
export type SamplePlayback = Record<SampleChannel, ChannelPlayback>;

export const defaultPlayback: SamplePlayback = {
  source: { rate: 1, style: 'original' },
  dub: { rate: 1, style: 'original' },
};

const assets: Record<SampleChannel, Record<VoiceStyle, URL>> = {
  source: {
    original: new URL('./workshop-sv.wav', import.meta.url),
    deep: new URL('./voices/workshop-sv-deep.wav', import.meta.url),
    alternate: new URL('./voices/workshop-sv-alternate.wav', import.meta.url),
    youthful: new URL('./voices/workshop-sv-youthful.wav', import.meta.url),
    mature: new URL('./voices/workshop-sv-mature.wav', import.meta.url),
  },
  dub: {
    original: new URL('./workshop-ar.wav', import.meta.url),
    deep: new URL('./voices/workshop-ar-deep.wav', import.meta.url),
    alternate: new URL('./voices/workshop-ar-alternate.wav', import.meta.url),
    youthful: new URL('./voices/workshop-ar-youthful.wav', import.meta.url),
    mature: new URL('./voices/workshop-ar-mature.wav', import.meta.url),
  },
};

export function sampleVoiceUrl(channel: SampleChannel, style: VoiceStyle) { return assets[channel][style].href; }

export function createSampleMedia(channel: SampleChannel, { rate, style }: ChannelPlayback) {
  const media = new Audio();
  media.dataset.voiceAsset = sampleVoiceUrl(channel, style);
  media.preservesPitch = true;
  media.defaultPlaybackRate = rate;
  media.playbackRate = rate;
  return media;
}

const downloaded = new Map<string, string>();
const pending = new Map<string, Promise<string>>();

export function cachedSample(url: string) { return downloaded.get(url); }

export function loadSample(url: string) {
  const ready = cachedSample(url);
  if (ready) return Promise.resolve(ready);
  const loading = pending.get(url);
  if (loading) return loading;
  const request = fetch(url, { signal: AbortSignal.timeout(30000) }).then(async response => {
    if (!response.ok) throw Error('Could not download sample audio.');
    const blob = new Blob([await response.arrayBuffer()], { type: 'audio/wav' });
    if (!blob.size) throw Error('Sample audio was empty.');
    const local = URL.createObjectURL(blob);
    downloaded.set(url, local);
    return local;
  }).finally(() => pending.delete(url));
  pending.set(url, request);
  return request;
}
