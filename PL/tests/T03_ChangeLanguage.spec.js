import { test } from '@playwright/test';
import SearchMSISDNPage from './pages/SearchMSISDNPage';
import ChangeLanguagePage from './pages/ChangeLanguagePage';
import ApprovalPage from './pages/approvalPage';
import dotenv from 'dotenv';
dotenv.config();

test('@crm Change Language after MSISDN search (with conditional upload + approval)', async ({ browser }) => {
  const msisdn = process.env.BP_EBU_MSISDN;

  // --- Creator context ---
  const creatorContext = await browser.newContext();
  const creatorPage = await creatorContext.newPage();

  // Go straight to CRM UI (no explicit login, same as your working code)
  await creatorPage.goto('https://bp-6dapps-sit.crm-bp.bss.blueprint.lab/crm-ui/#page');
  await creatorPage.waitForLoadState('networkidle');

  // Step 1: Search MSISDN
  const searchPage = new SearchMSISDNPage(creatorPage);
  await searchPage.search(msisdn);
  await searchPage.assertServiceDetailsVisible();

  // Step 2: Toggle language (Amharic <-> English)
  const langPage = new ChangeLanguagePage(creatorPage);
  const newLanguage = await langPage.toggleLanguage('Test file.txt');
  console.log(`✅ Language successfully switched to: ${newLanguage}`);

  // --- Conditional approval flow ---
  if (process.env.CONNECTION_TYPE === 'EBU') {
    console.log(`⚠️ Approval required for MSISDN ${msisdn}`);

    const approverContext = await browser.newContext();
    const approverPage = await approverContext.newPage();

    // Approver login + approval
    const approvalPage = new ApprovalPage(approverPage);
    await approvalPage.login(process.env.APPROVER_USER, process.env.APPROVER_PASS);
    await approvalPage.approve(msisdn, 'Language change approved after document upload');

    await approverContext.close();
  } else {
    console.log(`ℹ️ No approval required for MSISDN ${msisdn}`);
  }

  await creatorContext.close();
});