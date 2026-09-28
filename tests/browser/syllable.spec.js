import {test, expect} from '@playwright/test';

test('syllable game starts on mobile, offers three modes and first island interaction', async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  const errors=[]; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/member/games/petualangan-suku-kata/');
  await expect(page.getByRole('heading', {name:/Petualangan Suku Kata/})).toBeVisible();
  await expect(page.locator('[data-a="mode"]')).toHaveCount(3);
  await page.locator('[data-a="mode"][data-id="penjelajah"]').click();
  await page.getByRole('button', {name:'Mulai petualangan'}).click();
  await expect(page.getByRole('heading', {name:'Tepuk Suku Kata'})).toBeVisible();
  await expect(page.locator('.pk-progress')).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', {name:'Ulangi kata'}).click();
  await page.getByRole('button', {name:'Bantu aku'}).click();
  await page.locator('[data-a="clap"]').click();
  await expect(page.locator('#pk-feedback')).toContainText(/Tepuk|Hebat/);
  expect(errors).toEqual([]);
});

test('syllable game can stop and return to the hub', async ({page}) => {
  await page.goto('/member/games/petualangan-suku-kata/');
  await page.getByRole('button', {name:'Mulai petualangan'}).click();
  await page.getByRole('button', {name:'Istirahat'}).click();
  await expect(page.getByRole('heading', {name:'Petualangan hebat!'})).toBeVisible();
  await page.getByRole('link', {name:/Kembali ke Main/}).click();
  await expect(page.getByRole('heading', {name:/Hari ini/})).toBeVisible();
});
