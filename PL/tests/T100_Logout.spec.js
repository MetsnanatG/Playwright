import { test } from '@playwright/test';
import LogoutPage from './pages/LogoutPage';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

test('@crm dedicated logout and clear session', async ({ page }) => {
  // Navigate into CRM UI with the persisted session
  await page.goto(process.env.CRM_BASE_URL);
  await page.waitForLoadState('networkidle');

  // Perform logout
  const logoutPage = new LogoutPage(page);
  await logoutPage.logout();
  await logoutPage.assertLoggedOut();

  // Clear session info (delete storageState.json)
  try {
    fs.unlinkSync('storageState.json');
    console.log('🗑️ Cleared storageState.json after logout');
  } catch (err) {
    console.warn('⚠️ No storageState.json to delete:', err.message);
  }
});
