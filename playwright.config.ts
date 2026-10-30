import { defineConfig, devices } from '@playwright/test';

const isCi = Boolean(process.env.CI);

export default defineConfig({
  testDir: './tests/e2e',
  // El juego se pausa cuando su pestaña queda en segundo plano; ejecutar una
  // partida por navegador evita que una prueba paralela congele su reloj.
  fullyParallel: false,
  retries: isCi ? 2 : 0,
  reporter: isCi ? 'github' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173/Princesa_Estela/',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: isCi ? {} : { executablePath: '/usr/bin/chromium' },
      },
    },
    ...(isCi ? [{ name: 'webkit-mobile', use: { ...devices['iPhone 13'], viewport: { width: 844, height: 390 } } }] : []),
  ],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173/Princesa_Estela/',
    reuseExistingServer: !isCi,
  },
});
