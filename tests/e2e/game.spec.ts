import { expect, test, type Page } from '@playwright/test';

async function scorePoints(page: Page, amount: number): Promise<void> {
  for (let index = 0; index < amount; index += 1) {
    await page.evaluate(() => window.__ESTELA_TEST__?.scorePoint());
  }
}

test.use({ viewport: { width: 1280, height: 720 } });

test('cada enjambre nace completo, disminuye y permite avanzar', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'ESTELA' })).toBeVisible();
  await page.getByRole('button', { name: 'INICIO' }).click();
  await expect(page.locator('#hud')).toHaveClass(/is-visible/);
  await expect.poll(() => page.evaluate(() => window.__ESTELA_TEST__?.activeScenes())).toEqual(['Game']);
  await expect(page.locator('#level-value')).toHaveText('1');
  await expect(page.locator('#target-value')).toHaveText('12');
  await expect(page.locator('#bowser-limit-value')).toHaveText('6');
  await expect.poll(() => page.evaluate(() => window.__ESTELA_TEST__?.bugCount())).toBe(12);
  await expect.poll(() => page.evaluate(() => window.__ESTELA_TEST__?.bowserBugCount())).toBe(8);
  await scorePoints(page, 1);
  await expect.poll(() => page.evaluate(() => window.__ESTELA_TEST__?.bugCount())).toBe(11);
  await page.waitForTimeout(500);
  await expect.poll(() => page.evaluate(() => window.__ESTELA_TEST__?.bugCount())).toBe(11);
  await scorePoints(page, 11);
  await expect(page.getByRole('heading', { name: '¡NIVEL SUPERADO!' })).toBeVisible();
  await expect(page.locator('#complete-level-time')).toHaveText(/^\d{2}:\d{2}\.\d$/);
  await expect(page.locator('#complete-total-time')).toHaveText(/^\d{2}:\d{2}\.\d$/);
  await page.getByRole('button', { name: '¡A POR EL SIGUIENTE NIVEL!' }).click();
  await expect(page.locator('#level-value')).toHaveText('2');
  await expect(page.locator('#score-value')).toHaveText('0');
  await expect.poll(() => page.evaluate(() => window.__ESTELA_TEST__?.bugCount())).toBe(14);
  await expect.poll(() => page.evaluate(() => window.__ESTELA_TEST__?.bowserBugCount())).toBe(9);
  await expect.poll(() => page.evaluate(() => window.__ESTELA_TEST__?.activeScenes())).toEqual(['Game']);
});

test('el noveno nivel empieza con sus 28 cacas rápidas', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'ESTELA' })).toBeVisible();
  await page.evaluate(() => window.__ESTELA_TEST__?.startLevel(9));
  await expect(page.locator('#level-value')).toHaveText('9');
  await expect(page.locator('#target-value')).toHaveText('28');
  await expect.poll(() => page.evaluate(() => window.__ESTELA_TEST__?.bugCount())).toBe(28);
  await expect.poll(() => page.evaluate(() => window.__ESTELA_TEST__?.bowserBugCount())).toBe(16);
});

test('los puntos Bowser provocan derrota y el reintento conserva el tiempo', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'INICIO' }).click();
  await expect(page.locator('#bowser-value')).toHaveText('0');
  await expect(page.locator('#bowser-limit-value')).toHaveText('6');
  for (let point = 1; point <= 6; point += 1) {
    await page.evaluate(() => window.__ESTELA_TEST__?.scoreBowserPoint());
    await expect(page.locator('#bowser-value')).toHaveText(String(point));
  }
  await expect(page.getByRole('heading', { name: '¡NIVEL PERDIDO!' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.__ESTELA_TEST__?.activeScenes())).toEqual(['Failed']);
  await expect(page.locator('#failed-bowser-score')).toHaveText('6');
  const elapsedBeforeRetry = await page.evaluate(() => window.__ESTELA_TEST__?.state().timing.levelMs ?? 0);
  const frozenTime = await page.locator('#failed-level-time').textContent();
  await page.waitForTimeout(500);
  await expect(page.locator('#failed-level-time')).toHaveText(frozenTime ?? '');

  await page.getByRole('button', { name: 'REINTENTAR NIVEL' }).click();
  await expect(page.locator('#level-value')).toHaveText('1');
  await expect(page.locator('#score-value')).toHaveText('0');
  await expect(page.locator('#bowser-value')).toHaveText('0');
  await expect.poll(() => page.evaluate(() => window.__ESTELA_TEST__?.bugCount())).toBe(12);
  await expect.poll(() => page.evaluate(() => window.__ESTELA_TEST__?.bowserBugCount())).toBe(8);
  await expect.poll(() => page.evaluate(() => window.__ESTELA_TEST__?.activeScenes())).toEqual(['Game']);
  await expect.poll(() => page.evaluate(() => window.__ESTELA_TEST__?.state().timing.levelMs ?? 0)).toBeGreaterThan(elapsedBeforeRetry);
  const failedText = await page.locator('#failed-screen').innerText();
  expect(failedText).toBe(failedText.toLocaleUpperCase('es'));
});

test('el jefe permite elegir hechizo y cae después de cinco impactos', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'ESTELA' })).toBeVisible();
  await page.evaluate(() => window.__ESTELA_TEST__?.startLevel(10));
  await expect(page.locator('#spell-bar')).toHaveClass(/is-visible/);
  await expect(page.locator('#score-label')).toHaveText('HECHIZOS');
  await expect.poll(() => page.evaluate(() => window.__ESTELA_TEST__?.bossPosition())).toBeTruthy();
  await expect.poll(() => page.evaluate(() => window.__ESTELA_TEST__?.bowserBugCount())).toBe(5);
  await page.getByRole('button', { name: '⚡ RAYO' }).click();
  await expect(page.getByRole('button', { name: '⚡ RAYO' })).toHaveAttribute('aria-pressed', 'true');
  const minion = await page.evaluate(() => window.__ESTELA_TEST__?.bowserPosition());
  await page.mouse.click(minion?.x ?? 500, minion?.y ?? 450);
  await expect(page.locator('#bowser-value')).toHaveText('1');
  for (let hit = 1; hit <= 5; hit += 1) {
    const boss = await page.evaluate(() => window.__ESTELA_TEST__?.bossPosition());
    await page.mouse.click(boss?.x ?? 820, boss?.y ?? 310);
    await expect(page.locator('#score-value')).toHaveText(String(hit));
  }
  await expect(page.getByRole('heading', { name: '¡AVENTURA COMPLETADA!' })).toBeVisible();
  await expect(page.locator('#final-level-time')).toHaveText(/^\d{2}:\d{2}\.\d$/);
  await expect(page.locator('#final-total-time')).toHaveText(/^\d{2}:\d{2}\.\d$/);
  await page.getByRole('button', { name: 'JUGAR OTRA VEZ' }).click();
  await expect(page.locator('#level-value')).toHaveText('1');
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
