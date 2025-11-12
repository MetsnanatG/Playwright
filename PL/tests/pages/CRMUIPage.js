import { expect } from '@playwright/test';

export default class CRMUIPage {
  constructor(page) {
    this.page = page;
  }

  async assertWelcomeMessage() {
    await expect(
      this.page.getByText(/Welcome to CRM/i)
    ).toBeVisible({ timeout: 15000 });
  }
}