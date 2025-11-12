import { chromium } from '@playwright/test';
import { LoginPage } from './pages/LoginPage.js';
import dotenv from 'dotenv';
dotenv.config();

export default async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(process.env.KEYCLOAK_USER, process.env.KEYCLOAK_PASS);
  await loginPage.assertLoggedIn();

  // 🔑 Save cookies + localStorage to file
  await context.storageState({ path: 'storageState.json' });

  await browser.close();
};