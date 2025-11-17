import { chromium } from '@playwright/test';
import { LoginPage } from './pages/LoginPage.js';
import { testEnv } from '../envConfig.js';
import fs from 'fs';

export default async () => {
  console.log(`Running global setup for environment: ${testEnv.env}`);

  const browser = await chromium.launch();
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(testEnv.creatorUser, testEnv.creatorPass);
  await loginPage.assertLoggedIn();

  // 🔑 Save cookies + localStorage to a file named after the environment
  const storageDir = 'storage';
  await fs.promises.mkdir(storageDir, { recursive: true });

  const storageFile = `${storageDir}/${testEnv.env.toLowerCase()}.json`;
  await context.storageState({ path: storageFile });

  console.log(`✅ Storage state saved to ${storageFile}`);

  await browser.close();
};