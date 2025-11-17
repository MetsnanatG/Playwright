import { test } from '@playwright/test';
import OrderManagementPage from './pages/OrderManagementPage';
import dotenv from 'dotenv';
dotenv.config();

test('@crm Validate Order Completion', async ({ page }) => {
  // await page.goto(process.env.CRM_BP_BASE_URL);

  // ✅ No popup needed — you're already on CRM landing page
  const orderPage = new OrderManagementPage(page);
  await orderPage.fullFlow(process.env.BP_EBU_MSISDN);
});