import { test } from '@playwright/test';
import SearchMSISDNPage from './pages/SearchMSISDNPage';
import dotenv from 'dotenv';
dotenv.config();

test('search MSISDN with persisted session', async ({ page }) => {
  await page.goto('https://bp-6dapps-sit.crm-bp.bss.blueprint.lab/crm-ui/#page');
  await page.waitForLoadState('networkidle');

  const searchPage = new SearchMSISDNPage(page);
  await searchPage.search(process.env.BP_EBU_MSISDN);
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