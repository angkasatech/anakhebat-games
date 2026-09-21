import { test, expect } from '@playwright/test';
const numbers = { satu: 1, dua: 2, tiga: 3, empat: 4, lima: 5 };
async function fillOrder(page) {
  const order = await page.locator('.speech-bubble h1').innerText();
  const [, number, , product] = order.match(/Aku mau (\w+) (?:(butir|ekor|potong) )?(\w+)/);
  for (let i = 0; i < numbers[number]; i++) await page.getByRole('button', { name: `Tambah ${product}`, exact: true }).click();
  return { product, count: numbers[number] };
}
async function completeSession(page) {
  for (let i = 0; i < 5; i++) {
    await fillOrder(page);
    await page.getByRole('button', { name: 'Pesanan siap' }).click();
    await page.getByRole('button', { name: i === 4 ? 'Selesai' : 'Teman berikutnya' }).click();
  }
}
async function assertLayout(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.locator('img').evaluateAll(imgs => imgs.every(img => img.complete && img.naturalWidth > 0))).toBe(true);
}
for (const width of [390, 1280]) for (const stall of ['Buah', 'Sayur', 'Lauk']) {
  test(`${stall}: full session, correction and replay at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto('/member/games/pasar-mini/');
    await page.getByRole('button', { name: `Lapak ${stall}`, exact: true }).click();
    await expect(page.locator('.catalog-preview img')).toHaveCount(6);
    await assertLayout(page);
    await page.screenshot({ path: `test-results/start-${stall}-${width}.png`, fullPage: true, animations: 'disabled' });
    await page.getByRole('button', { name: 'Mulai', exact: true }).click();
    await expect(page.locator('.session-label')).toContainText('Mulai kecil');
    await expect(page.locator('.speech-bubble h1')).toContainText('satu');
    const choices = await page.locator('[data-action="add"]').evaluateAll(els => els.map(el => el.dataset.value));
    expect(choices).toHaveLength(3);
    await page.getByRole('button', { name: 'Pesanan siap' }).click();
    await expect(page.locator('#feedback')).toContainText('Tambahkan');
    await page.locator('[data-action="add"]').first().click();
    await page.locator('[data-action="remove"]').first().click();
    await expect(page.locator('.basket-fruit')).toHaveCount(0);
    for (let i = 0; i < 5; i++) {
      const { product } = await fillOrder(page);
      if (i === 0) {
        // Match the explicit accessible label so unit text never affects selection.
        const otherButton = page.locator(`[data-action="add"]:not([aria-label="Tambah ${product}"])`).first();
        await otherButton.click();
        await page.getByRole('button', { name: 'Pesanan siap' }).click();
        await expect(page.locator('#feedback')).toContainText('yang tidak dipesan');
        await page.locator('.basket-fruit').last().click();
        await page.getByRole('button', { name: `Tambah ${product}`, exact: true }).click();
        await page.getByRole('button', { name: 'Pesanan siap' }).click();
        await expect(page.locator('#feedback')).toContainText('Keluarkan 1');
        await page.locator('.basket-fruit').last().click();
        await assertLayout(page);
        await page.screenshot({ path: `test-results/play-${stall}-${width}.png`, fullPage: true, animations: 'disabled' });
      }
      expect(await page.locator('[data-action="add"]').evaluateAll(els => els.map(el => el.dataset.value))).toEqual(choices);
      await page.getByRole('button', { name: 'Pesanan siap' }).click();
      await expect(page.locator('#feedback')).toContainText('Pas sekali');
      await expect(page.locator('[data-action="add"]').first()).toBeDisabled();
      await page.getByRole('button', { name: i === 4 ? 'Selesai' : 'Teman berikutnya' }).click();
    }
    await expect(page.getByRole('heading', { name: /penjaga toko kecil/ })).toBeVisible();
    await page.screenshot({ path: `test-results/finish-${stall}-${width}.png`, fullPage: true, animations: 'disabled' });
    await page.getByRole('button', { name: 'Main lagi' }).click();
    const replayChoices = await page.locator('[data-action="add"]').evaluateAll(els => els.map(el => el.dataset.value));
    expect(replayChoices.some(id => !choices.includes(id))).toBe(true);
    await expect(page.locator('.speech-bubble .eyebrow')).toHaveText('PESANAN 1 DARI 5');
    await page.locator('[data-action="add"]').first().click();
    await page.getByRole('button', { name: 'Mulai ulang' }).click();
    await expect(page.locator('.basket-fruit')).toHaveCount(0);
    expect(await page.locator('[data-action="add"]').evaluateAll(els => els.map(el => el.dataset.value))).toEqual(replayChoices);
    await page.getByRole('button', { name: 'Keluar' }).click();
    await expect(page.getByRole('heading', { name: /Toko kecil/ })).toBeVisible();
    expect(errors).toEqual([]);
  });
}
test('easy first despite legacy storage, advanced after completion, both stall switching paths', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem('anakhebat-games:settings:v1', JSON.stringify({ level: 'advanced', sound: false }));
    Object.defineProperty(window, 'speechSynthesis', { value: undefined });
  });
  await page.goto('/member/games/pasar-mini/');
  await expect(page.getByRole('button', { name: /Coba 1–5/ })).toHaveCount(0);
  await page.getByRole('button', { name: 'Mulai', exact: true }).click();
  await expect(page.locator('.visual-order')).toBeVisible();
  await expect(page.locator('.speech-bubble h1')).toContainText('satu');
  await completeSession(page);
  await page.getByRole('button', { name: 'Coba 1–5 barang' }).click();
  await expect(page.locator('.visual-order')).toHaveCount(0);
  await page.getByRole('button', { name: 'Bantu hitung' }).click();
  await expect(page.locator('.visual-order')).toBeVisible();
  await page.getByRole('button', { name: 'Dengarkan pesanan' }).click();
  await expect(page.locator('#audio-notice')).toContainText('belum tersedia');
  await page.getByRole('button', { name: 'Suara nyala' }).click();
  await expect(page.locator('#audio-notice')).toBeEmpty();
  await completeSession(page);
  await page.getByRole('button', { name: 'Pindah ke Lapak Sayur', exact: true }).click();
  await expect(page.locator('.session-label')).toContainText('Lapak Sayur');
  await expect(page.locator('.session-label')).toContainText('Mulai kecil');
  await expect(page.locator('.speech-bubble h1')).toContainText('satu');
  await expect(page.locator('.visual-order')).toBeVisible();
  await page.getByRole('button', { name: 'Pilih lapak lain' }).click();
  await page.getByRole('button', { name: 'Lapak Lauk', exact: true }).click();
  await page.getByRole('button', { name: 'Mulai', exact: true }).click();
  await expect(page.locator('.session-label')).toContainText('Lapak Lauk');
  await expect(page.locator('.speech-bubble h1')).toContainText('satu');
  await expect(page.locator('.basket-fruit')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('.easy-start')).toBeVisible();
  await expect(page.getByRole('button', { name: /Coba 1–5/ })).toHaveCount(0);
});
test('320px nested route, all catalog illustrations, keyboard and blocked storage', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw Error('blocked'); } }); });
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/member/games/pasar-mini/');
  for (const stall of ['Buah', 'Sayur', 'Lauk']) {
    await page.getByRole('button', { name: `Lapak ${stall}`, exact: true }).click();
    await expect(page.locator('.catalog-preview img')).toHaveCount(6);
    await assertLayout(page);
  }
  await page.getByRole('button', { name: 'Mulai', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.basket')).toBeVisible();
  await assertLayout(page);
});
