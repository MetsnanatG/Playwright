import { defineConfig } from '@playwright/test';
import { testEnv } from './envConfig.js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env', debug: false });

export default defineConfig({
  timeout: 80000,
  testDir: './tests',
  globalSetup: './tests/global-setup.js',
  reporter: [['html', { outputFolder: 'playwright-report' }]],

  use: {
    actionTimeout: 20000,
    navigationTimeout: 60000,
    ignoreHTTPSErrors: true,
    headless: false,
    viewport: null,
    trace: 'retain-on-failure',
    outputDir: 'test-results',
    browserName: 'chromium',
    launchOptions: { args: ['--start-maximized', '--ignore-certificate-errors'] },
        // Environment‑specific values come from envConfig.js
    baseURL: testEnv.crmUrl,
    storageState: `storage/${testEnv.env.toLowerCase()}.json`,

   
  },

  // projects: [
  //   {
  //     name: 'bp',
  //     use: {
  //       baseURL: testEnv.env === 'BP' ? testEnv.crmUrl : undefined,
  //       storageState: 'storage/bp.json',
  //     },
  //     metadata: {
  //       env: 'BP',
  //       msisdn: process.env.BP_EBU_MSISDN,
  //       TEST_ENV: 'BP'
  //     },
  //   },
  //   {
  //     name: 'prod',
  //     use: {
  //       baseURL: testEnv.env === 'PROD' ? testEnv.crmUrl : undefined,
  //       storageState: 'storage/prod.json',
  //     },
  //     metadata: {
  //       env: 'PROD',
  //       msisdn: process.env.PROD_EBU_MSISDN,
  //       TEST_ENV: 'PROD'
  //     },
  //   },
  // ],
});