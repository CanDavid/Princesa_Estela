import { expect, test, type Page } from '@playwright/test';

async function scorePoints(page: Page, amount: number): Promise<void> {
  for (let index = 0; index < amount; index += 1) {
    await page.evaluate(() => window.__ESTELA_TEST__?.scorePoint());
  }
}

test.use({ viewport: { width: 1280, height: 720 } });

test('permite completar los ocho niveles y volver a jugar', async ({ page }) => {
  const targets = [12, 14, 16, 18, 20, 22, 24, 26];
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'ESTELA' })).toBeVisible();
  await page.getByRole('button', { name: 'INICIO' }).click();
  await expect(page.locator('#hud')).toHaveClass(/is-visible/);
  await expect.poll(() => page.evaluate(() => window.__ESTELA_TEST__?.activeScenes())).toEqual(['Game']);

  for (const [index, target] of targets.entries()) {
    const level = index + 1;
    await expect(page.locator('#level-value')).toHaveText(String(level));
    await expect(page.locator('#target-value')).toHaveText(String(target));
    await scorePoints(page, target);

    if (level < targets.length) {
      await expect(page.getByRole('heading', { name: '¡NIVEL SUPERADO!' })).toBeVisible();
      await expect.poll(() => page.evaluate(() => window.__ESTELA_TEST__?.activeScenes())).toEqual(['Complete']);
      await page.getByRole('button', { name: '¡A POR EL SIGUIENTE NIVEL!' }).click();
      await expect(page.locator('#score-value')).toHaveText('0');
      await expect(page.locator('#complete-screen')).not.toHaveClass(/is-visible/);
      await expect.poll(() => page.evaluate(() => window.__ESTELA_TEST__?.activeScenes())).toEqual(['Game']);
      await expect.poll(() => page.evaluate(() => window.__ESTELA_TEST__?.bugPosition())).toBeTruthy();
    } else {
      await expect(page.getByRole('heading', { name: '¡AVENTURA COMPLETADA!' })).toBeVisible();
      await expect.poll(() => page.evaluate(() => window.__ESTELA_TEST__?.activeScenes())).toEqual(['Final']);
    }
  }

  await page.getByRole('button', { name: 'JUGAR OTRA VEZ' }).click();
  await expect(page.locator('#level-value')).toHaveText('1');
  await expect(page.locator('#score-value')).toHaveText('0');
  await expect.poll(() => page.evaluate(() => window.__ESTELA_TEST__?.activeScenes())).toEqual(['Game']);
});

test('el control de sonido cambia de estado durante la sesión', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'INICIO' }).click();
  const mute = page.getByRole('button', { name: 'SILENCIAR SONIDO' });
  await expect(mute).toHaveAttribute('aria-pressed', 'false');
  await mute.click();
  await expect(page.getByRole('button', { name: 'ACTIVAR SONIDO' })).toHaveAttribute('aria-pressed', 'true');
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
  await expect(page.getByRole('status', { name: 'GIRA EL DISPOSITIVO' })).toBeVisible();
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.getByRole('status', { name: 'GIRA EL DISPOSITIVO' })).toBeHidden();
});

test('muestra todos los textos visibles en mayúsculas', async ({ page }) => {
  await page.goto('./');
  const titleText = await page.locator('#title-screen').innerText();
  expect(titleText).toBe(titleText.toLocaleUpperCase('es'));
  await page.getByRole('button', { name: 'INICIO' }).click();
  await scorePoints(page, 12);
  await expect(page.getByRole('heading', { name: '¡NIVEL SUPERADO!' })).toBeVisible();
  const completeText = await page.locator('#complete-screen').innerText();
  expect(completeText).toBe(completeText.toLocaleUpperCase('es'));
});
