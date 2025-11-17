import { test } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();

import SearchMSISDNPage from './pages/SearchMSISDNPage';
import ChangeLanguagePage from './pages/ChangeLanguagePage';
import ApprovalPage from './pages/ApprovalPage';
import { reloginAndValidateOrder } from './helpers/reloginAndValidateOrder';
import { testEnv } from '../envConfig';

test('@crm Change Language after MSISDN search (with conditional upload + approval)', async ({ browser }) => {
  const msisdn = testEnv.msisdn;

  const creatorContext = await browser.newContext();
  const creatorPage = await creatorContext.newPage();

  await creatorPage.goto(testEnv.crmUrl);
  await creatorPage.waitForLoadState('networkidle');

  const searchPage = new SearchMSISDNPage(creatorPage);
  await searchPage.search(msisdn);
  await searchPage.assertServiceDetailsVisible();

  const langPage = new ChangeLanguagePage(creatorPage);
  const newLanguage = await langPage.toggleLanguage('Test file.txt');
  console.log(`✅ Language successfully switched to: ${newLanguage}`);

  await creatorContext.close(); // session will be invalidated after approval

  if (process.env.CONNECTION_TYPE === 'EBU') {
    console.log(`⚠️ Approval required for MSISDN ${msisdn}`);

    const approverContext = await browser.newContext();
    const approverPage = await approverContext.newPage();

    const approvalPage = new ApprovalPage(approverPage);
    await approvalPage.login(testEnv.approverUser, testEnv.approverPass);
    await approvalPage.approve(msisdn, 'Approved after document upload');

    await approverContext.close();
  } else {
    console.log(`ℹ️ No approval required for MSISDN ${msisdn}`);
  }

  // ✅ Re-login and validate order
  await reloginAndValidateOrder(browser, msisdn);
});