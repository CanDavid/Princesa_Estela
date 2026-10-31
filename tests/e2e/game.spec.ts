import { expect, test, type Page } from '@playwright/test';

async function scorePoints(page: Page, amount: number): Promise<void> {
  for (let index = 0; index < amount; index += 1) {
    await page.evaluate(() => window.__ESTELA_TEST__?.scorePoint());
  }
}

test.use({ viewport: { width: 1280, height: 720 } });

test('permite completar los tres niveles y volver a jugar', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'ESTELA' })).toBeVisible();
  await page.getByRole('button', { name: 'INICIO' }).click();
  await expect(page.locator('#hud')).toHaveClass(/is-visible/);
  await expect(page.locator('#level-value')).toHaveText('1');
  await scorePoints(page, 5);
  await expect(page.getByRole('heading', { name: '¡NIVEL SUPERADO!' })).toBeVisible();

  await page.getByRole('button', { name: 'SIGUIENTE NIVEL' }).click();
  await expect(page.locator('#level-value')).toHaveText('2');
  await scorePoints(page, 8);
  await expect(page.getByRole('heading', { name: '¡NIVEL SUPERADO!' })).toBeVisible();

  await page.getByRole('button', { name: 'SIGUIENTE NIVEL' }).click();
  await expect(page.locator('#level-value')).toHaveText('3');
  await scorePoints(page, 12);
  await expect(page.getByRole('heading', { name: '¡AVENTURA COMPLETADA!' })).toBeVisible();

  await page.getByRole('button', { name: 'JUGAR OTRA VEZ' }).click();
  await expect(page.locator('#level-value')).toHaveText('1');
  await expect(page.locator('#score-value')).toHaveText('0');
});

test('el control de sonido cambia de estado durante la sesión', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'INICIO' }).click();
  const mute = page.getByRole('button', { name: 'Silenciar sonido' });
  await expect(mute).toHaveAttribute('aria-pressed', 'false');
  await mute.click();
  await expect(page.getByRole('button', { name: 'Activar sonido' })).toHaveAttribute('aria-pressed', 'true');
});

test('un fallo no puntúa y un toque sobre un bicho sí', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'INICIO' }).click();
  await expect.poll(() => page.evaluate(() => window.__ESTELA_TEST__?.characterState())).toMatchObject({
    estela: 'estela-idle',
    lumi: 'lumi-idle',
    lumiVisible: true,
  });
  await page.mouse.click(300, 650);
  await expect(page.locator('#score-value')).toHaveText('0');
  await expect.poll(() => page.evaluate(() => window.__ESTELA_TEST__?.characterState()?.estela)).toBe('estela-magic');
  await page.waitForTimeout(600);
  await expect.poll(() => page.evaluate(() => window.__ESTELA_TEST__?.characterState()?.estela)).toBe('estela-idle');
  const bug = await page.evaluate(() => window.__ESTELA_TEST__?.bugPosition());
  expect(bug).toBeTruthy();
  await page.mouse.click(bug?.x ?? 700, bug?.y ?? 300);
  await expect(page.locator('#score-value')).toHaveText('1');
});

test('muestra el aviso de orientación en vertical', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  await expect(page.getByRole('status', { name: 'Gira el dispositivo' })).toBeVisible();
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.getByRole('status', { name: 'Gira el dispositivo' })).toBeHidden();
});
