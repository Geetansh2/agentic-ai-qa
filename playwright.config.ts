import { defineConfig } from '@playwright/test';
import { envConfig } from './config/env';

export default defineConfig({
  testDir: './tests',

  use: {
    baseURL: envConfig.baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  reporter: [['list']],
});