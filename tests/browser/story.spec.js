import { test, expect } from '@playwright/test';
import { stories } from '../../src/games/susun-ceritaku/data.js';
const path = '/member/games/susun-ceritaku/';
async function layout(page) {
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.locator('img').evaluateAll(images => images.every(img => img.complete && img.naturalWidth > 0))).toBe(true);
}
async function fill(page, story) { for (const card of story.cards) await page.getByRole('button', { name: `Pilih ${card.label}`, exact: true }).click(); }
for (const width of [320, 390, 1280]) for (const story of stories) {
  test(`story ${story.id}: full sequence, retry, removal, replay and exit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(path); await page.getByRole('button', { name: new RegExp(story.title) }).click();
    await layout(page);
    await page.screenshot({ path: `test-results/story-start-${story.id}-${width}.png`, fullPage: true });
    await page.getByRole('button', { name: 'Mulai bercerita' }).click();
    await page.getByRole('button', { name: 'Ceritaku siap' }).click();
    await expect(page.locator('#story-feedback')).toContainText('3 tempat kosong');
    for (const card of [...story.cards].reverse()) await page.getByRole('button', { name: `Pilih ${card.label}`, exact: true }).click();
    await page.getByRole('button', { name: 'Ceritaku siap' }).click();
    await expect(page.locator('#story-feedback')).toContainText('Di cerita ini');
    await page.getByRole('button', { name: 'Bantu aku' }).click();
    await expect(page.locator('.story-suggested')).toHaveAttribute('data-id', story.cards[0].id);
    await layout(page);
    await page.screenshot({ path: `test-results/story-wrong-${story.id}-${width}.png`, fullPage: true });
    for (const card of story.cards) await page.getByRole('button', { name: new RegExp(`Keluarkan ${card.label}`) }).click();
    await expect(page.locator('.story-slot.empty')).toHaveCount(3);
    await fill(page, story); await page.getByRole('button', { name: 'Ceritaku siap' }).click();
    await expect(page.getByRole('heading', { name: /pencerita kecil/ })).toBeVisible();
    await expect(page.locator('.story-scenes li')).toHaveCount(3);
    await expect(page.getByText('Sekarang, ceritakan dengan versimu!')).toBeVisible();
    for (const card of story.cards) await expect(page.getByText(card.sentence, { exact: true })).toBeVisible();
    await layout(page); await page.screenshot({ path: `test-results/story-finish-${story.id}-${width}.png`, fullPage: true });
    await page.getByRole('button', { name: 'Susun lagi' }).click(); await expect(page.locator('.story-slot.empty')).toHaveCount(3);
    await fill(page, story); await page.getByRole('button', { name: 'Ceritaku siap' }).click();
    await page.getByRole('button', { name: 'Cerita berikutnya' }).click();
    await expect(page.locator('.story-heading .story-eyebrow')).not.toHaveText(story.title);
    await page.getByRole('button', { name: 'Mulai ulang' }).click(); await expect(page.locator('.story-slot.empty')).toHaveCount(3);
    await page.getByRole('button', { name: 'Pilih cerita', exact: false }).click();
    await expect(page.getByRole('heading', { name: /Tiga gambar/ })).toBeVisible();
    await page.getByRole('link', { name: 'Semua permainan', exact: false }).click();
    await expect(page.getByRole('link', { name: 'Main Susun Ceritaku' })).toBeVisible();
    expect(errors).toEqual([]);
  });
}
test('story fallback, blocked storage, keyboard, reduced motion and no recording', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(window, 'speechSynthesis', { value: undefined }); Object.defineProperty(window, 'localStorage', { get() { throw Error('blocked'); } }); });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(path); await page.getByRole('button', { name: 'Mulai bercerita' }).focus(); await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Dengarkan petunjuk' }).click(); await expect(page.locator('#story-audio')).toContainText('belum tersedia');
  for (const card of stories[0].cards) { await page.getByRole('button', { name: `Pilih ${card.label}`, exact: true }).focus(); await page.keyboard.press('Enter'); }
  await page.getByRole('button', { name: 'Ceritaku siap' }).click();
  await page.getByRole('button', { name: 'Dengarkan cerita' }).click();
  await expect(page.locator('#story-audio')).toContainText('belum tersedia'); await expect(page.locator('.story-reading')).toHaveCount(0);
  await expect(page.getByText('Ayah atau Ibu bisa mendengarkan. Tidak perlu merekam.')).toBeVisible();
});
test('story narration follows highlighted scenes and stops on mute, replay and pagehide', async ({ page }) => {
  await page.addInitScript(() => {
    window.utterances = []; window.cancelCount = 0;
    window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
    Object.defineProperty(window, 'speechSynthesis', { value: { getVoices: () => [{ lang: 'id-ID', name: 'Test Indonesia' }], speak: u => window.utterances.push(u), cancel: () => window.cancelCount++ } });
  });
  await page.goto(path); await page.getByRole('button', { name: 'Mulai bercerita' }).click();
  await fill(page, stories[0]); await page.getByRole('button', { name: 'Ceritaku siap' }).click();
  await page.getByRole('button', { name: 'Dengarkan cerita' }).click();
  for (let i = 0; i < 3; i++) {
    await expect(page.locator(`[data-story-scene="${i}"]`)).toHaveClass(/story-reading/);
    expect(await page.evaluate(() => window.utterances.at(-1).text)).toBe(stories[0].cards[i].sentence);
    await page.evaluate(() => window.utterances.at(-1).onend());
  }
  await expect(page.locator('.story-reading')).toHaveCount(0);
  await page.getByRole('button', { name: 'Dengarkan cerita' }).click();
  await page.getByRole('button', { name: 'Suara nyala' }).click();
  await page.evaluate(() => window.utterances.at(-1).onend()); await expect(page.locator('.story-reading')).toHaveCount(0);
  await page.getByRole('button', { name: 'Dengarkan cerita' }).click();
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide'))); await expect(page.locator('.story-reading')).toHaveCount(0);
  await page.getByRole('button', { name: 'Dengarkan cerita' }).click();
  await page.getByRole('button', { name: 'Susun lagi' }).click();
  await page.evaluate(() => window.utterances.findLast(u => u.onend)?.onend());
  await expect(page.locator('.story-slot.empty')).toHaveCount(3); await expect(page.locator('.story-reading')).toHaveCount(0);
});
