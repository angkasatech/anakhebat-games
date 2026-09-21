import { test, expect } from '@playwright/test';

async function mockVoice(page) {
  await page.addInitScript(() => {
    Math.random = () => 0.999;
    localStorage.setItem('anakhebat-games:settings:v1', JSON.stringify({ sound: true }));
    window.spokenMessages = [];
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: class { constructor(text) { this.text = text; } } });
    Object.defineProperty(window, 'speechSynthesis', { value: {
      getVoices: () => [{ name: 'Test Indonesian', lang: 'id-ID' }],
      cancel: () => {},
      speak: utterance => window.spokenMessages.push(utterance.text),
    } });
  });
}
async function expectSpokenFeedback(page, expected) {
  await expect(page.locator('#feedback')).toHaveText(expected);
  expect(await page.evaluate(() => window.spokenMessages.at(-1))).toBe(expected);
}

for (const [stall, product, unit, group] of [['Buah', 'apel', '', 'buah'], ['Sayur', 'brokoli', '', 'sayur'], ['Lauk', 'telur', 'butir ', 'lauk']]) {
  test(`speech boundary: ${product}, category total, removal, replay and mute`, async ({ page }) => {
    await mockVoice(page);
    await page.goto('/member/games/pasar-mini/');
    await page.getByRole('button', { name: `Lapak ${stall}`, exact: true }).click();
    await page.getByRole('button', { name: 'Mulai', exact: true }).click();
    for (let i = 1; i <= 5; i++) {
      await page.getByRole('button', { name: `Tambah ${product}`, exact: true }).click();
      await expectSpokenFeedback(page, `1 ${unit}${product} dimasukkan ke keranjang. Ada ${i} ${group} di keranjang.`);
    }
    await page.locator('[data-action="remove"]').last().click();
    const removed = `1 ${unit}${product} dikeluarkan dari keranjang. Ada 4 ${group} di keranjang.`;
    await expectSpokenFeedback(page, removed);
    await page.getByRole('button', { name: 'Dengarkan penjelasan' }).click();
    expect(await page.evaluate(() => window.spokenMessages.at(-1))).toBe(removed);
    await page.getByRole('button', { name: 'Suara nyala' }).click();
    const before = await page.evaluate(() => window.spokenMessages.length);
    await page.getByRole('button', { name: `Tambah ${product}`, exact: true }).click();
    expect(await page.evaluate(() => window.spokenMessages.length)).toBe(before);
    await expect(page.locator('#feedback')).toContainText(`Ada 5 ${group}`);
    await page.getByRole('button', { name: 'Suara mati' }).click();
    for (let i = 0; i < 3; i++) await page.getByRole('button', { name: `Tambah ${product}`, exact: true }).click();
    await page.getByRole('button', { name: `Tambah ${product}`, exact: true }).click();
    await expect(page.locator('.basket-fruit')).toHaveCount(8);
    expect(await page.evaluate(() => window.spokenMessages.at(-1))).toContain('Keranjang sudah penuh');
    expect(await page.evaluate(() => window.spokenMessages.at(-1))).not.toContain('dimasukkan');
  });
}

test('same detailed correction in UI and speech for missing, excess and wrong products together', async ({ page }) => {
  await mockVoice(page);
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/member/games/pasar-mini/');
  await page.getByRole('button', { name: 'Mulai', exact: true }).click();
  await expect(page.locator('.speech-bubble h1')).toContainText('satu jeruk');
  await page.getByRole('button', { name: 'Tambah apel', exact: true }).click();
  await page.getByRole('button', { name: 'Pesanan siap' }).click();
  const missing = 'Pesananku belum sesuai. Yuk, coba lagi! Aku meminta 1 jeruk. Ada 1 apel yang tidak dipesan. Keluarkan 1 apel, ya. Masih kurang 1 jeruk. Tambahkan 1 jeruk, ya.';
  await expectSpokenFeedback(page, missing);
  await page.getByRole('button', { name: 'Dengarkan penjelasan' }).click();
  expect(await page.evaluate(() => window.spokenMessages.at(-1))).toBe(missing);
  await page.getByRole('button', { name: 'Tambah jeruk', exact: true }).click();
  await page.getByRole('button', { name: 'Tambah jeruk', exact: true }).click();
  await page.getByRole('button', { name: 'Tambah apel', exact: true }).click();
  await page.getByRole('button', { name: 'Tambah pisang', exact: true }).click();
  await page.getByRole('button', { name: 'Pesanan siap' }).click();
  const excess = 'Pesananku belum sesuai. Yuk, coba lagi! Aku meminta 1 jeruk. Ada 2 apel dan 1 pisang yang tidak dipesan. Keluarkan 2 apel dan 1 pisang, ya. Ada kelebihan 1 jeruk. Keluarkan 1 jeruk, ya.';
  await expectSpokenFeedback(page, excess);
  await expect(page.locator('.visual-order')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/detailed-feedback-320.png', fullPage: true, animations: 'disabled' });
});
