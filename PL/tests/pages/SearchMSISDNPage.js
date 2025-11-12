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
    // await this.msisdnInput.waitFor({ state: 'visible', timeout: 15000 });
    await this.msisdnInput.waitFor({ state: 'visible', timeout: 15000 });
    await this.msisdnInput.fill(msisdn);

    await this.searchButton.click();
  }

  async assertServiceDetailsVisible() {
    await expect(this.serviceDetailsSection).toBeVisible({ timeout: 15000 });
  }
}