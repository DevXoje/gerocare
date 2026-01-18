import { expect,test } from '@playwright/test';

// See here how to get started:
// https://playwright.dev/docs/intro
test('visits the app root url', async ({ page }) => {
  await page.goto('/');
  // La aplicación redirige a login, verificamos que la página de login carga
  await expect(page.locator('h1')).toHaveText('Iniciar Sesión');
  await expect(page).toHaveTitle('Gerocare');
})
