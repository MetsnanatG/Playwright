import { test } from '@playwright/test';
import SearchMSISDNPage from './pages/SearchMSISDNPage';
import ChangeLanguagePage from './pages/ChangeLanguagePage';
import dotenv from 'dotenv';
dotenv.config();

test('@crm Change Language after MSISDN search', async ({ page }) => {
  await page.goto('https://bp-6dapps-sit.crm-bp.bss.blueprint.lab/crm-ui/#page');
  await page.waitForLoadState('networkidle');

  // Step 1: Search MSISDN
  const searchPage = new SearchMSISDNPage(page);
  await searchPage.search(process.env.BP_CBU_MSISDN);
  await searchPage.assertServiceDetailsVisible();

  // Step 2: Toggle language automatically (Amharic <-> English)
  const langPage = new ChangeLanguagePage(page);
  const newLanguage = await langPage.toggleLanguage();

  console.log(`✅ Language successfully switched to: ${newLanguage}`);
});
