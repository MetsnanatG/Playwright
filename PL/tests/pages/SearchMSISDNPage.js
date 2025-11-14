import { expect } from '@playwright/test';

export default class SearchMSISDNPage {
  constructor(page) {
    this.page = page;
    this.msisdnInput = page.locator('input.MuiInputBase-input');
    this.searchButton = page.locator('.MuiButtonBase-root.MuiIconButton-root');
    // Target the specific div with the class you found
    this.serviceDetailsSection = page.locator('div.sc-eCYdqJ.jpmAId');
  }

 async search(msisdn) {
  await this.page.waitForLoadState('domcontentloaded');

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const isVisible = await this.msisdnInput.isVisible();
      if (!isVisible) throw new Error('Input not visible yet');

      const box = await this.msisdnInput.boundingBox();
      if (!box) throw new Error('Input not interactable');

      console.log('✅ MSISDN input is visible and ready');
      break;
    } catch (error) {
      if (attempt === 2) {
        await this.page.screenshot({ path: `screenshots/msisdn-input-failure-${Date.now()}.png`, fullPage: true });
        throw new Error('❌ MSISDN input not visible or interactable after retry — screenshot captured');
      }

      console.log('⚠️ MSISDN input not ready — navigating back to CRM homepage...');
      await this.page.goto(process.env.CRM_BASE_URL);
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForTimeout(1000); // brief pause before retry
    }
  }

  // Proceed with search logic
  await this.msisdnInput.fill(msisdn);
  await this.page.getByRole('button', { name: 'Search' }).click();
  console.log(`🔍 Searching for MSISDN: ${msisdn}`);
}

  async assertServiceDetailsVisible() {
    await expect(this.serviceDetailsSection).toBeVisible({ timeout: 15000 });
  }
}