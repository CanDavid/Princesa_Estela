import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: '/Princesa_Estela/',
  build: {
    target: 'es2022',
    sourcemap: true,
  },
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
  },
});
