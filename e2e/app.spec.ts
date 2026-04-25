import { expect, test } from '@playwright/test';

async function login(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@cafe.local');
  await page.getByLabel('Пароль').fill('demo1234');
  await page.getByLabel('Заведение').selectOption('cafe-center');
  await page.getByRole('button', { name: 'Войти' }).click();
  await expect(page).toHaveURL(/dashboard/);
}

test('logs in and opens the protected dashboard', async ({ page }) => {
  await login(page);

  await expect(page.getByRole('heading', { name: 'Заказы кафе' })).toBeVisible();
  await expect(page.getByText('Активные заказы')).toBeVisible();
});

test('creates an order from menu items', async ({ page }) => {
  await login(page);

  await page.getByRole('button', { name: /Паста с томатами/ }).click();
  await page.getByRole('button', { name: 'Создать заказ' }).click();

  await expect(page.getByText('#104')).toBeVisible();
});

test('filters menu items', async ({ page }) => {
  await login(page);
  await page.getByRole('link', { name: 'Меню' }).click();
  await expect(page.getByRole('heading', { name: 'Меню' })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Поиск' }).fill('Капучино');

  await expect(page.getByText('Капучино')).toBeVisible();
  await expect(page.getByText('Сырники')).toHaveCount(0);
});
