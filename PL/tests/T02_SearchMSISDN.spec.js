import { test } from '@playwright/test';
import SearchMSISDNPage from './pages/SearchMSISDNPage';
import dotenv from 'dotenv';
import { testEnv } from '../envConfig';
dotenv.config();

test('search MSISDN with persisted session', async ({ page }) => {
  await page.goto(testEnv.crmUrl);
  await page.waitForLoadState('networkidle');

  const searchPage = new SearchMSISDNPage(page);
  await searchPage.search(testEnv.msisdn);
  await searchPage.assertServiceDetailsVisible();
});




// import { test } from '@playwright/test';
// import { loginAndOpenCRMUI } from './helpers/navigation';
// import SearchMSISDNPage from './pages/SearchMSISDNPage';

// test('search MSISDN after login', async ({ page }) => {
//   const crmPage = await loginAndOpenCRMUI(page);

//   const searchPage = new SearchMSISDNPage(crmPage);
//   await searchPage.search('251700000732');
//   await searchPage.assertServiceDetailsVisible();
// });