import { expect, test } from '@playwright/test';

test('packaged audio finishes every Swedish sentence before Arabic and plays through the end', async ({ page }, testInfo) => {
  test.setTimeout(50000);
  const errors = [];
  const media = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {
    if (/workshop-(sv|ar)\.wav$/.test(response.url()) && response.ok()) media.push(response.url());
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Dubbing studio' })).toBeVisible();
  expect((await page.locator('.timeline').boundingBox()).y).toBeLessThan(200);
  await expect(page.locator('p[lang="ar"]')).toHaveAttribute('dir', 'rtl');
  await page.screenshot({ path: testInfo.outputPath('desktop.png') });
  await page.evaluate(() => {
    window.samplePlayback = { order: [], overlapped: false };
    const lanes = document.querySelector('.lanes');
    const observer = new MutationObserver(() => {
      const sv = lanes.querySelector('.original').classList.contains('on-air');
      const ar = lanes.querySelector('.dub').classList.contains('on-air');
      window.samplePlayback.overlapped ||= sv && ar;
      const active = sv ? 'sv' : ar ? 'ar' : null;
      if (active && window.samplePlayback.order.at(-1) !== active) window.samplePlayback.order.push(active);
    });
    observer.observe(lanes, { attributes: true, subtree: true, attributeFilter: ['class'] });
  });
  await page.getByRole('button', { name: 'Play workshop sample' }).click();
  await expect(page.locator('.state')).toHaveText('Playing sample');
  expect(new Set(media).size).toBe(2);
  expect(await page.evaluate(() => performance.getEntriesByType('resource').filter(entry => entry.name.endsWith('.wav')).every(entry => entry.initiatorType === 'fetch'))).toBe(true);
  await expect(page.locator('.lane.dub')).toHaveClass(/on-air/, { timeout: 10000 });
  await expect(page.locator('.mix-level strong')).toHaveText('40%');
  await page.screenshot({ path: testInfo.outputPath('arabic-playback.png') });
  await expect(page.locator('p[lang="sv"]')).toContainText('arbetsordern', { timeout: 12000 });
  await expect(page.locator('p[lang="ar"] mark')).toBeVisible();
  await expect(page.locator('.status')).toContainText('Workshop sample complete', { timeout: 32000 });
  expect(await page.evaluate(() => window.samplePlayback)).toEqual({ order: ['sv', 'ar', 'sv', 'ar', 'sv', 'ar'], overlapped: false });
  expect(errors).toEqual([]);
});

test('mobile layout fits the viewport and the sample can be paused and reset', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Play workshop sample' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await expect(page.locator('.clock small')).toBeHidden();
  expect((await page.locator('.timeline').boundingBox()).y).toBeLessThan(220);
  await page.screenshot({ path: testInfo.outputPath('mobile.png'), fullPage: true });
  await page.getByRole('button', { name: 'Play workshop sample' }).click();
  await expect(page.locator('.state')).toHaveText('Playing sample');
  await page.getByRole('button', { name: 'Pause sample' }).click();
  await expect(page.locator('.state')).toHaveText('Paused');
  await page.getByRole('button', { name: 'Reset sample' }).click();
  await expect(page.locator('.clock')).toContainText('00:00');
});

test('missing shared audio reports the recovery instruction', async ({ page }) => {
  await page.addInitScript(() => {
    navigator.mediaDevices.getDisplayMedia = async () => new MediaStream();
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Capture tab audio' }).click();
  await expect(page.locator('.status')).toContainText('enable Share tab audio');
  await expect(page.getByRole('button', { name: 'Capture tab audio' })).toBeEnabled();
});

test('switching to capture closes the sample and releases shared tracks when stopped', async ({ page }) => {
  await page.addInitScript(() => {
    navigator.mediaDevices.getDisplayMedia = async () => {
      const context = new AudioContext();
      const stream = context.createMediaStreamDestination().stream;
      window.testTrack = stream.getAudioTracks()[0];
      window.testTrack.addEventListener('ended', () => void context.close());
      return stream;
    };
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Play workshop sample' }).click();
  await expect(page.locator('.state')).toHaveText('Playing sample');
  await page.getByRole('button', { name: 'Capture tab audio' }).click();
  await expect(page.locator('.state')).toHaveText('Receiving audio');
  await expect(page.getByRole('button', { name: 'Play workshop sample' })).toBeDisabled();
  await page.getByRole('button', { name: 'Stop capture' }).click();
  await expect(page.locator('.status')).toHaveText('Tab capture stopped.');
  expect(await page.evaluate(() => window.testTrack.readyState)).toBe('ended');
});

test('live capture wires finalized tab speech to Arabic captions, voice and ducking', async ({ page }) => {
  await page.addInitScript(() => {
    navigator.mediaDevices.getDisplayMedia = async options => {
      window.captureOptions = options;
      const context = new AudioContext();
      const stream = context.createMediaStreamDestination().stream;
      window.testTrack = stream.getAudioTracks()[0];
      Object.defineProperty(window.testTrack, 'getSettings', { value: () => ({ suppressLocalAudioPlayback: true }) });
      return stream;
    };
    Object.defineProperty(window, 'Translator', { value: {
      async create({ sourceLanguage, targetLanguage }) {
        window.languagePair = [sourceLanguage, targetLanguage];
        return {
          async translate() { return '\u0623\u0645\u0631 \u0627\u0644\u0639\u0645\u0644'; },
          destroy() { window.translatorDestroyed = true; },
        };
      },
    } });
    const Recognition = class {
      start(track) { window.recognizer = this; window.usedSharedTrack = track === window.testTrack; }
      abort() { window.recognitionAborted = true; }
    };
    Object.defineProperty(window, 'SpeechRecognition', { value: Recognition });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: class { constructor(text) { this.text = text; } } });
    Object.defineProperty(window, 'speechSynthesis', { value: {
      getVoices() { return [{ lang: 'ar-SA', voiceURI: 'default-ar', name: 'Default Arabic' }, { lang: 'ar-IQ', voiceURI: 'other-ar', name: 'Alternate Arabic' }]; },
      speak(utterance) { window.spoken = utterance; },
      cancel() { window.voiceCancelled = true; },
    } });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Capture tab audio' }).click();
  await expect(page.locator('.status')).toContainText('may process audio online');
  await page.getByRole('button', { name: 'Enable live dubbing' }).click();
  await expect(page.locator('.status')).toContainText('Listening to the shared tab');
  expect(await page.evaluate(() => ({
    track: window.usedSharedTrack,
    pair: window.languagePair,
    suppression: window.captureOptions.audio.suppressLocalAudioPlayback,
  }))).toEqual({ track: true, pair: ['sv', 'ar'], suppression: true });
  await page.getByText('Audio tuning', { exact: true }).click();
  await page.getByRole('slider', { name: 'Arabic volume' }).fill('25');
  await page.evaluate(() => window.recognizer.onresult({
    resultIndex: 0,
    results: [{ isFinal: true, 0: { transcript: 'Arbetsordern' } }],
  }));
  await expect(page.locator('p[lang="sv"]')).toHaveText('Arbetsordern');
  await expect(page.locator('p[lang="ar"]')).toHaveText('\u0623\u0645\u0631 \u0627\u0644\u0639\u0645\u0644');
  expect(await page.evaluate(() => window.spoken.text)).toBe('\u0623\u0645\u0631 \u0627\u0644\u0639\u0645\u0644');
  await expect(page.locator('.mix-level strong')).toHaveText('4%');
  await page.getByRole('combobox', { name: 'Live Arabic voice' }).selectOption('other-ar');
  expect(await page.evaluate(() => window.spoken.voice.voiceURI)).toBe('default-ar');
  await page.evaluate(() => {
    window.spoken.onend();
    window.recognizer.onresult({ resultIndex: 0, results: [{ isFinal: true, 0: { transcript: 'Nästa mening' } }] });
  });
  await expect.poll(() => page.evaluate(() => window.spoken.voice.voiceURI)).toBe('other-ar');
  await page.getByRole('checkbox', { name: 'Arabic voice' }).uncheck();
  await expect(page.locator('.mix-level')).toContainText('40%');
  expect(await page.evaluate(() => window.voiceCancelled)).toBe(true);
  await page.getByRole('button', { name: 'Stop capture' }).click();
  expect(await page.evaluate(() => [window.recognitionAborted, window.translatorDestroyed, window.testTrack.readyState])).toEqual([true, true, 'ended']);
});


test('workshop faders independently mute each Web Audio track', async ({ page }) => {
  await page.addInitScript(() => {
    const createGain = AudioContext.prototype.createGain;
    window.sampleGainTargets = [];
    AudioContext.prototype.createGain = function () {
      const node = createGain.call(this);
      const targets = [];
      window.sampleGainTargets.push(targets);
      const setTarget = node.gain.setTargetAtTime.bind(node.gain);
      node.gain.setTargetAtTime = (gain, time, constant) => {
        targets.push(gain);
        return setTarget(gain, time, constant);
      };
      return node;
    };
  });
  await page.goto('/');
  await page.getByText('Audio tuning', { exact: true }).click();
  const original = page.getByRole('slider', { name: 'Original volume' });
  const arabic = page.getByRole('slider', { name: 'Arabic volume' });
  await original.fill('0');
  await arabic.fill('65');
  await page.getByRole('button', { name: 'Play workshop sample' }).click();
  await expect(page.locator('.state')).toHaveText('Playing sample');
  expect(await page.evaluate(() => window.sampleGainTargets.map(values => values.at(-1)))).toEqual([0, 0.65]);
  await arabic.fill('0');
  await original.fill('35');
  expect(await page.evaluate(() => window.sampleGainTargets.map(values => values.at(-1)))).toEqual([0.35, 0]);
  await expect(page.locator('.mix-level strong')).toHaveText('35%');
  const arabicOnly = page.getByRole('button', { name: 'Arabic only' });
  const swedishOnly = page.getByRole('button', { name: 'Swedish only' });
  const balanced = page.getByRole('button', { name: 'Balanced mix' });
  await expect(swedishOnly).toHaveAttribute('aria-pressed', 'true');
  await arabicOnly.click();
  await expect(arabicOnly).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => window.sampleGainTargets.map(values => values.at(-1)))).toEqual([0, 1]);
  await swedishOnly.click();
  expect(await page.evaluate(() => window.sampleGainTargets.map(values => values.at(-1)))).toEqual([0.4, 0]);
  await balanced.click();
  await expect(balanced).toHaveAttribute('aria-pressed', 'true');
  await expect(original).toHaveValue('40');
  await expect(arabic).toHaveValue('100');
  await page.getByRole('button', { name: 'Pause sample' }).click();
});

test('each language uses its selected voice style and independent speed', async ({ page }) => {
  await page.addInitScript(() => {
    const play = HTMLMediaElement.prototype.play;
    window.sampleMedia = {};
    HTMLMediaElement.prototype.play = function () {
      const id = this.dataset.voiceAsset.includes('workshop-sv') ? 'sv' : 'ar';
      window.sampleMedia[id] = this;
      return play.call(this);
    };
  });
  await page.goto('/');
  await page.getByText('Audio tuning', { exact: true }).click();
  const swedishSpeed = page.getByRole('combobox', { name: 'Swedish speed' });
  const arabicSpeed = page.getByRole('combobox', { name: 'Arabic speed' });
  const swedishVoice = page.getByRole('combobox', { name: 'Swedish voice style' });
  const arabicVoice = page.getByRole('combobox', { name: 'Arabic voice style' });
  await expect(swedishVoice.locator('option')).toHaveCount(3);
  await expect(arabicVoice.locator('option')).toHaveCount(5);
  await swedishVoice.selectOption('alternate');
  await arabicVoice.selectOption('alternate');
  await swedishSpeed.selectOption('0.75');
  await arabicSpeed.selectOption('0.9');
  await page.getByRole('button', { name: 'Play workshop sample' }).click();
  await expect(page.locator('.state')).toHaveText('Playing sample');
  expect(await page.evaluate(() => ({
    sv: [window.sampleMedia.sv.dataset.voiceAsset.split('/').at(-1), window.sampleMedia.sv.playbackRate, window.sampleMedia.sv.preservesPitch],
    ar: [window.sampleMedia.ar.dataset.voiceAsset.split('/').at(-1), window.sampleMedia.ar.playbackRate, window.sampleMedia.ar.preservesPitch],
  }))).toEqual({ sv: ['workshop-sv-alternate.wav', 0.75, true], ar: ['workshop-ar-alternate.wav', 0.9, true] });

  const sourceStart = await page.evaluate(() => window.sampleMedia.sv.currentTime);
  await swedishSpeed.selectOption('1.5');
  expect(await page.evaluate(() => [window.sampleMedia.sv.playbackRate, window.sampleMedia.ar.playbackRate])).toEqual([1.5, 0.9]);
  await expect(page.locator('.lane.dub')).toHaveClass(/on-air/, { timeout: 10000 });
  await arabicSpeed.selectOption('0.75');
  expect(await page.evaluate(() => [window.sampleMedia.sv.playbackRate, window.sampleMedia.ar.playbackRate])).toEqual([1.5, 0.75]);
  expect(await page.evaluate(() => window.sampleMedia.sv.currentTime)).toBeGreaterThan(sourceStart);
  await expect(page.getByRole('slider', { name: 'Original volume' })).toHaveValue('40');
  await expect(page.getByRole('slider', { name: 'Arabic volume' })).toHaveValue('100');
  await expect(swedishVoice).toBeEnabled();
  await page.getByRole('button', { name: 'Pause sample' }).click();
  await swedishVoice.selectOption('youthful');
  expect(await page.evaluate(() => window.sampleMedia.sv.dataset.voiceAsset)).toContain('workshop-sv-alternate.wav');
  await page.getByRole('button', { name: 'Resume sample' }).click();
  await expect.poll(() => page.evaluate(() => window.sampleMedia.sv.dataset.voiceAsset)).toContain('workshop-sv-youthful.wav');
  await expect(page.locator('p[lang="sv"]')).toContainText('arbetsordern', { timeout: 12000 });
  await page.getByRole('button', { name: 'Pause sample' }).click();
  await expect(swedishSpeed).toHaveValue('1.5');
  await expect(arabicVoice).toHaveValue('alternate');
});

test('one shared playhead moves before the dub and resumes both tracks in place', async ({ page }) => {
  await page.addInitScript(() => {
    const play = HTMLMediaElement.prototype.play;
    window.sampleTracks = new Set();
    HTMLMediaElement.prototype.play = function () {
      window.sampleTracks.add(this);
      return play.call(this);
    };
  });
  await page.goto('/');
  const head = page.locator('.lanes > .playhead');
  await expect(head).toHaveCount(1);
  const position = () => head.evaluate(node => Number.parseFloat(node.style.getPropertyValue('--progress')));
  const trackPositions = () => page.evaluate(() => Array.from(window.sampleTracks, track => track.currentTime));
  await page.getByRole('button', { name: 'Play workshop sample' }).click();
  await expect.poll(position).toBeGreaterThan(2);
  await expect(page.locator('.lane.dub')).not.toHaveClass(/on-air/);
  await page.getByRole('button', { name: 'Pause sample' }).click();
  await expect(page.locator('.state')).toHaveText('Paused');
  const pausedBeforeDub = await position();
  const positionsBeforeDub = await trackPositions();
  expect(pausedBeforeDub).toBeGreaterThan(2);
  expect(await page.evaluate(() => Array.from(window.sampleTracks).every(track => track.paused))).toBe(true);
  await page.waitForFunction(saved => Array.from(window.sampleTracks).every((track, index) =>
    track.paused && track.currentTime === saved[index]), positionsBeforeDub);
  await page.getByRole('button', { name: 'Resume sample' }).click();
  await expect.poll(position).toBeGreaterThan(pausedBeforeDub);
  await expect(page.locator('.lane.dub')).toHaveClass(/on-air/, { timeout: 8000 });
  expect(await position()).toBeLessThan(pausedBeforeDub + 28);
  await page.getByRole('button', { name: 'Pause sample' }).click();
  const pausedDuringDub = await position();
  const pausedTracks = await trackPositions();
  await expect(page.locator('.playhead')).toHaveAttribute('style', new RegExp(String(pausedDuringDub)));
  expect(await page.evaluate(() => Array.from(window.sampleTracks).every(track => track.paused))).toBe(true);
  await page.getByRole('button', { name: 'Resume sample' }).click();
  await expect.poll(position).toBeGreaterThan(pausedDuringDub);
  const resumedTracks = await trackPositions();
  expect(resumedTracks[1]).toBeGreaterThan(pausedTracks[1]);
  expect(resumedTracks).toHaveLength(2);
  await page.getByRole('button', { name: 'Reset sample' }).click();
  await expect.poll(position).toBe(0);
  await expect(page.getByRole('button', { name: 'Play workshop sample' })).toBeVisible();
});

for (const width of [390, 1280]) {
  test(`layout stays fixed through playback and mixer changes at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 720 });
    await page.goto('/');
    const tuning = page.getByText('Audio tuning', { exact: true });
    const volume = page.getByRole('slider', { name: 'Original volume' });
    await expect(page.locator('.status')).toContainText('Play the bundled');
    await expect(volume).toBeHidden();
    const geometry = () => page.evaluate(() => [...document.querySelectorAll('.studio-head, .actions, .timeline, .mix-presets, .mix-level, .captions')].map(node => {
      const { x, y, width, height } = node.getBoundingClientRect();
      return [x, y, width, height];
    }));
    const initial = await geometry();
    await page.getByRole('button', { name: 'Play workshop sample' }).click();
    await expect(page.locator('.state')).toHaveText('Playing sample');
    expect(await geometry()).toEqual(initial);
    await page.getByRole('button', { name: 'Pause sample' }).click();
    await expect(page.locator('.state')).toHaveText('Paused');
    expect(await geometry()).toEqual(initial);
    await page.getByRole('button', { name: 'Resume sample' }).click();
    expect(await geometry()).toEqual(initial);
    await tuning.click();
    await volume.scrollIntoViewIfNeeded();
    const tuningOpen = await geometry();
    await volume.fill('100');
    expect(await geometry()).toEqual(tuningOpen);
    await volume.fill('0');
    expect(await geometry()).toEqual(tuningOpen);
  });
}

test('capture cancellation only appears after rejection and clears when playing the sample', async ({ page }) => {
  await page.addInitScript(() => {
    navigator.mediaDevices.getDisplayMedia = async () => { throw new DOMException('Permission denied', 'NotAllowedError'); };
  });
  await page.goto('/');
  await expect(page.locator('.status')).not.toContainText('cancelled');
  await page.getByRole('button', { name: 'Capture tab audio' }).click();
  await expect(page.locator('.status')).toHaveText('Tab sharing was cancelled or declined.');
  await page.getByRole('button', { name: 'Play workshop sample' }).click();
  await expect(page.locator('.status')).not.toContainText('cancelled');
});

test('iPhone shows the desktop-only capture instruction and keeps sample playback available', async ({ browser }) => {
  const page = await browser.newPage({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_1 like Mac OS X) AppleWebKit/605.1.15 Version/26.1 Mobile/15E148 Safari/604.1', viewport: { width: 390, height: 844 } });
  try {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Capture on desktop' })).toBeDisabled();
    await expect(page.locator('.status')).toContainText('Chrome on a computer');
    await page.getByRole('button', { name: 'Play workshop sample' }).click();
    await expect(page.locator('.state')).toHaveText('Playing sample');
  } finally { await page.close(); }
});
