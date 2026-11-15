import { expect, test } from '@playwright/test';

test('el catálogo público carga', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Catálogo de Ropa/i })).toBeVisible();
});

test('se puede agregar al carrito sin iniciar sesión', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Ver Tallas' }).first().click();
  await page.getByRole('button', { name: 'Agregar al carrito' }).click();
  await expect(page.getByText('Producto agregado al carrito.')).toBeVisible();
  await expect(page.getByRole('link', { name: /Carrito/ })).toContainText('1');
});
