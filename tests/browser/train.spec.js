import { test, expect } from '@playwright/test';
const path = '/member/games/kereta-pola/';
async function targetName(page, index = 1) { return page.locator(`[data-slot="${index}"] img`).getAttribute('alt'); }
async function checkLayout(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.locator('img').evaluateAll(imgs => imgs.every(img => img.complete && img.naturalWidth > 0))).toBe(true);
}
for (const width of [320, 390, 1280]) for (const theme of ['Buah ceria', 'Bentuk berwarna']) {
  test(`train ${theme} full journey and retry at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 1280 ? 950 : 844 });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(path);
    await page.getByRole('button', { name: new RegExp(theme) }).click();
    await checkLayout(page);
    await page.screenshot({ path: `test-results/train-start-${theme}-${width}.png`, fullPage: true, animations: 'disabled' });
    await page.getByRole('button', { name: 'Mulai perjalanan' }).click();
    await expect(page.locator('.rail-choice')).toHaveCount(2);
    await page.getByRole('button', { name: `Pilih ${await targetName(page, 0)}`, exact: true }).click();
    await expect(page.locator('#rail-feedback')).toContainText('Belum pas');
    await expect(page.locator('#rail-feedback')).toContainText('bergantian');
    await expect(page.locator('[data-slot="0"]')).toHaveClass(/rail-highlight/);
    await page.getByRole('button', { name: 'Hentikan bantuan' }).click();
    await expect(page.locator('.rail-highlight')).toHaveCount(0);
    for (let i = 0; i < 5; i++) {
      await expect(page.locator('.rail-play-heading .rail-eyebrow')).toContainText(`PERJALANAN ${i + 1} DARI 5`);
      await checkLayout(page);
      if (!i) await page.screenshot({ path: `test-results/train-play-${theme}-${width}.png`, fullPage: true, animations: 'disabled' });
      await page.getByRole('button', { name: `Pilih ${await targetName(page)}`, exact: true }).click();
      await expect(page.locator('#rail-feedback')).toContainText('Pas sekali');
      await expect(page.locator('.rail-choice').first()).toBeDisabled();
      await expect(page.locator('.rail-arrival')).toBeVisible();
      await page.getByRole('button', { name: i === 4 ? 'Selesai' : 'Stasiun berikutnya' }).click();
    }
    await expect(page.getByRole('heading', { name: /penjelajah kecil/ })).toBeVisible();
    await expect(page.locator('.rail-finish-stations>span')).toHaveCount(5);
    await page.screenshot({ path: `test-results/train-finish-${theme}-${width}.png`, fullPage: true, animations: 'disabled' });
    await page.getByRole('button', { name: 'Main lagi' }).click();
    await expect(page.locator('.rail-play-heading .rail-eyebrow')).toContainText('PERJALANAN 1 DARI 5');
    await page.getByRole('button', { name: 'Mulai ulang' }).click();
    await expect(page.locator('.rail-question')).toBeVisible();
    await page.getByRole('button', { name: 'Pilih muatan', exact: false }).click();
    await expect(page.getByRole('heading', { name: /Satu pola kecil/ })).toBeVisible();
    expect(errors).toEqual([]);
  });
}
test('visual guide without audio, cancellation, keyboard, reduced motion and hub entry', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    Object.defineProperty(window, 'speechSynthesis', { value: undefined });
    Object.defineProperty(window, 'localStorage', { get() { throw Error('blocked'); } });
  });
  await page.goto('/');
  await page.getByRole('link', { name: 'Main Kereta Pola' }).click();
  await page.getByRole('button', { name: 'Mulai perjalanan' }).focus(); await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Dengarkan pola' }).click();
  await expect(page.locator('#rail-audio')).toContainText('belum tersedia');
  await expect(page.locator('[data-slot="1"]')).toHaveClass(/rail-highlight/);
  await page.getByRole('button', { name: 'Suara nyala' }).click();
  await expect(page.locator('.rail-highlight')).toHaveCount(0);
  await page.getByRole('button', { name: `Pilih ${await targetName(page)}`, exact: true }).click();
  await expect(page.locator('.rail-arrival')).toBeVisible();
  await page.getByRole('link', { name: 'Semua permainan' }).click();
  await expect(page.getByRole('heading', { name: /Hari ini/ })).toBeVisible();
  await page.getByRole('link', { name: 'Main Kereta Pola' }).click();
  await expect(page.getByRole('heading', { name: /Satu pola kecil/ })).toBeVisible();
});
test('guide matches spoken items with highlighted wagons and cancels on reset', async ({ page }) => {
  await page.addInitScript(() => {
    window.calls = [];
    localStorage.setItem('anakhebat-games:settings:v1', JSON.stringify({ sound: true }));
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: class { constructor(text) { this.text = text; } } });
    Object.defineProperty(window, 'speechSynthesis', { value: {
      getVoices: () => [{ lang: 'id-ID' }], cancel() {},
      speak(message) { window.calls.push({ text: message.text, step: document.querySelector('.rail-highlight')?.dataset.slot }); setTimeout(() => message.onend?.(), 150); },
    } });
  });
  await page.goto(path);
  await page.getByRole('button', { name: 'Mulai perjalanan' }).click();
  await page.getByRole('button', { name: 'Lihat polanya' }).click();
  await expect(page.locator('#rail-guide-status')).toContainText('Setelah apel');
  const spoken = await page.evaluate(() => window.calls.filter(c => c.step !== undefined));
  expect(spoken.slice(0, 3)).toEqual([{ text: 'apel', step: '0' }, { text: 'pisang', step: '1' }, { text: 'apel', step: '2' }]);
  await page.getByRole('button', { name: 'Mulai ulang' }).click();
  await expect(page.locator('.rail-highlight')).toHaveCount(0);
  await expect(page.locator('.rail-question')).toBeVisible();
});
