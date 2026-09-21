import { test, expect } from '@playwright/test';

for (const width of [320, 390, 1280]) {
  test(`hub choices, disclosure, game navigation and browser back at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 1280 ? 1000 : 844 });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Hari ini/ })).toBeVisible();
    await expect(page.locator('.hub-game-card')).toHaveCount(4);
    await expect(page.getByRole('link', { name: 'Main Pasar Mini' })).toHaveCount(1);
    await expect(page.getByRole('link', { name: 'Main Susun Ceritaku' })).toHaveCount(1);
    await expect(page.getByRole('link', { name: 'Main Kereta Pola' })).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.locator('img').evaluateAll(imgs => imgs.every(img => img.complete && img.naturalWidth > 0))).toBe(true);
    await page.screenshot({ path: `test-results/hub-${width}.png`, fullPage: true, animations: 'disabled' });
    await page.getByRole('link', { name: 'Main Susun Ceritaku' }).click();
    await expect(page.getByRole('heading', { name: /Tiga gambar/ })).toBeVisible();
    await page.getByRole('link', { name: 'Semua permainan', exact: false }).click();
    await page.locator('.hub-parent summary').click();
    await expect(page.getByText(/Permainan ini bukan tes/)).toBeVisible();
    await page.getByRole('link', { name: 'Main Pasar Mini' }).click();
    await expect(page).toHaveURL(/\/member\/games\/pasar-mini\/$/);
    await expect(page.getByRole('heading', { name: /Toko kecil/ })).toBeVisible();
    await page.getByRole('button', { name: 'Mulai', exact: true }).click();
    await expect(page.locator('.session-label')).toContainText('Mulai kecil');
    await page.getByRole('link', { name: 'Semua permainan' }).click();
    await expect(page).toHaveURL(/\/member\/games\/$/);
    await expect(page.getByRole('heading', { name: /Hari ini/ })).toBeVisible();
    await page.goBack();
    await expect(page.getByRole('link', { name: 'Semua permainan' })).toBeVisible();
    await page.goForward();
    await expect(page.getByRole('heading', { name: /Hari ini/ })).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('hub keyboard, shared sound and unavailable voice fallback', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(window, 'speechSynthesis', { value: undefined }); });
  await page.goto('/member/games/');
  await page.getByRole('button', { name: 'Dengarkan pilihan permainan' }).click();
  await expect(page.locator('#hub-audio-status')).toContainText('belum tersedia');
  await expect(page.getByRole('button', { name: 'Suara nyala' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('link', { name: 'Main Pasar Mini' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Suara nyala' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('link', { name: 'Semua permainan' }).click();
  await page.getByRole('button', { name: 'Suara nyala' }).click();
  await expect(page.locator('#hub-audio-status')).toBeEmpty();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Suara mati' })).toHaveAttribute('aria-pressed', 'false');
});

test('hub does not load game rules or styles until opening Pasar Mini', async ({ page }) => {
  const responses = [];
  page.on('response', response => { if (response.status() === 200 && /\.(js|css)$/.test(response.url())) responses.push(response.text()); });
  await page.goto('/member/games/');
  await expect(page.getByRole('link', { name: 'Main Pasar Mini' })).toBeVisible();
  const initialCode = (await Promise.all(responses)).join('\n');
  expect(initialCode).not.toContain('Pesananku belum sesuai');
  expect(initialCode).not.toContain('.fruit-picks');
  await page.getByRole('link', { name: 'Main Pasar Mini' }).click();
  await expect(page.getByRole('heading', { name: /Toko kecil/ })).toBeVisible();
  const loadedCode = (await Promise.all(responses)).join('\n');
  expect(loadedCode).toContain('Pesananku belum sesuai');
  expect(loadedCode).toContain('.fruit-picks');
});
