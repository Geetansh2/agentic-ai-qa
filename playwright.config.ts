import { defineConfig, devices } from '@playwright/test';
import { envConfig } from './config/env';
import dotenv from 'dotenv';

dotenv.config();


const isCI = false;

const parsedWorkers = process.env.PLAYWRIGHT_WORKERS
  ? Number(process.env.PLAYWRIGHT_WORKERS)
  : undefined;

const workers =
  parsedWorkers && Number.isFinite(parsedWorkers) && parsedWorkers > 0
    ? parsedWorkers
    : isCI
      ? 1
      : 2;
console.log(workers);
export default defineConfig({
  testDir: './tests',
// fullyParallel: true,
  workers,
  retries: 0,
  globalSetup: require.resolve('./listeners/globalSetup'),
  globalTeardown: [require.resolve('./listeners/globalTeardown')],

  use: {
    baseURL: envConfig.baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },
  ],

  reporter: [['list'], ['allure-playwright'], ['./listeners/ExecutionReporter.ts']],
});
