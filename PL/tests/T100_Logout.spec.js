import { test } from '@playwright/test';
import fs from 'fs';
import env from '../config/index.js'; // adjust relative path if needed
import LogoutPage from './pages/LogoutPage.js'; // ensure this module exports the expected API

test('@crm dedicated logout and clear session', async ({ page }) => {
  // Navigate into CRM UI with the configured environment URL
  await page.goto(env.crmHome, { timeout: 60000 });
  await page.waitForLoadState('domcontentloaded');

  // Perform logout (LogoutPage should encapsulate sign-out flow)
  const logoutPage = new LogoutPage(page);
  await logoutPage.logout();
  await logoutPage.assertLoggedOut();

  // Clear persisted storage state so subsequent runs perform fresh login
  try {
    if (fs.existsSync('storageState.json')) {
      fs.unlinkSync('storageState.json');
      console.log('🗑️ Cleared storageState.json after logout');
    } else {
      console.log('ℹ️ storageState.json not present; nothing to delete');
    }
  } catch (err) {
    console.warn('⚠️ Error clearing storageState.json:', err.message);
  }
});