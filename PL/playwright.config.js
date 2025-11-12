// import { defineConfig } from '@playwright/test';
// import dotenv from 'dotenv';
// dotenv.config({ path: './.env', debug: false });

// export default defineConfig({
//   globalSetup: './tests/global-setup.js',
//   // testDir: './tests',
//    // run login before tests
//   use: {
//     ignoreHTTPSErrors: true,
//     headless: false,
//     viewport: null,
//     browserName: 'chromium',
//     launchOptions: {
//       args: ['--start-maximized'],
//     },
//     storageState: 'storageState.json',      // start tests already logged in
//     baseURL: process.env.BASE_URL || 'https://dev.mycrm.internal',
//   },
//   projects: [
//     { name: 'chromium' },
//   ],
// });

import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config({ path: './.env', debug: false });

export default defineConfig({
  testDir: './tests',

  globalSetup: './tests/global-setup.js',
  globalTeardown: './tests/global-teardown.js',

  use: {
    ignoreHTTPSErrors: true,
    headless: false,
    viewport: null,
    browserName: 'chromium',
    launchOptions: {
      args: ['--start-maximized'],
    },
    baseURL: process.env.BASE_URL || 'https://dev.mycrm.internal',
  },

  projects: [
    {
      name: 'authenticated',
      use: {
        storageState: 'storageState.json', // logged in by default eg. npx playwright test tests/T02_SearchMSISDN.spec.js --project=authenticated
      },
    },
    {
      name: 'unauthenticated',
      use: {
        storageState: undefined,           // fresh context, forces login page npx playwright test tests/T02_SearchMSISDN.spec.js --project=unauthenticated
      },
    },
  ],
});