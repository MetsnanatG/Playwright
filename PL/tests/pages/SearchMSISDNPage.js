import { expect } from '@playwright/test';

export default class SearchMSISDNPage {
  constructor(page) {
    this.page = page;
    this.msisdnInput = page.locator('input.MuiInputBase-input');
    this.searchButton = page.locator('.MuiButtonBase-root.MuiIconButton-root');
    this.serviceDetailsSection = page.locator('div.sc-eCYdqJ.jpmAId');
  }

  async search(msisdn) {
    await this.page.waitForLoadState('domcontentloaded');

    let lastError;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt}: checking MSISDN input...`);
        await expect(this.msisdnInput, 'MSISDN input should be visible').toBeVisible({ timeout: 5000 });

        const box = await this.msisdnInput.boundingBox();
        if (!box) throw new Error('Input present but not interactable (no bounding box)');

        console.log('✅ MSISDN input is visible and interactable');
        break; // success, exit retry loop
      } catch (error) {
        lastError = error;
        if (attempt === 2) {
          const screenshotPath = `screenshots/msisdn-input-failure-${Date.now()}.png`;
          await this.page.screenshot({ path: screenshotPath, fullPage: true });
          throw new Error(`❌ MSISDN input not ready after 2 attempts — screenshot captured at ${screenshotPath}\nCause: ${error.message}`);
        }

        console.log('⚠️ MSISDN input not ready — navigating back to CRM homepage...');
        console.log(`   └─ Current URL: ${this.page.url()}`);
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
    await expect(this.serviceDetailsSection, 'Service details section should be visible').toBeVisible({ timeout: 15000 });
    console.log('📄 Service details section is visible');
  }
}