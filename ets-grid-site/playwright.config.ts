import { defineConfig, devices } from '@playwright/test';

// Категорії functional, a11y, visual (D-024). Сайт має бути зібраний: npm run build.
const PORT = 4792;

export default defineConfig({
  testDir: './tests',
  testMatch: ['functional/**/*.spec.ts', 'a11y/**/*.spec.ts', 'visual/**/*.spec.ts'],
  fullyParallel: true,
  reporter: [['list']],
  outputDir: 'test-results',
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'mobile-375',
      use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 667 } },
    },
    {
      name: 'desktop-1440',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: {
    command: `node scripts/serve.mjs --port ${PORT}`,
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: !process.env.CI,
  },
});
