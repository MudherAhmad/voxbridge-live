import { expect, test } from '@playwright/test';

test.use({ launchOptions: { ignoreDefaultArgs: ['--mute-audio'], args: ['--auto-select-tab-capture-source-by-title=VoxBridge Capture Fixture'] } });

test.describe('native Chrome tab sharing', () => {

  test('captures a real tab signal and releases it when stopped', async ({ page, context }) => {
    const source = await context.newPage();
    await source.goto('/');
    await source.evaluate(() => {
      document.title = 'VoxBridge Capture Fixture';
      const button = document.createElement('button');
      button.textContent = 'Play capture fixture';
      button.onclick = async () => {
        const audio = new AudioContext();
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();
        gain.gain.value = 0.13;
        oscillator.connect(gain).connect(audio.destination);
        oscillator.start();
        await audio.resume();
      };
      document.body.replaceChildren(button);
    });
    await source.getByRole('button', { name: 'Play capture fixture' }).click();
    await page.goto('/');
    await page.bringToFront();
    await page.getByRole('button', { name: 'Capture tab audio' }).click();
    await expect(page.locator('.state')).toHaveText('Receiving audio');
    await expect.poll(() => page.locator('canvas').evaluate(canvas => {
      const ctx = canvas.getContext('2d');
      const {data} = ctx.getImageData(0, 0, canvas.width, canvas.height / 2 - 2);
      return data.some((value, index) => index % 4 === 3 && value > 0);
    })).toBe(true);
    await page.getByRole('button', { name: 'Stop capture' }).click();
    await expect(page.locator('.status')).toHaveText('Tab capture stopped.');
    await source.close();
  });
});
