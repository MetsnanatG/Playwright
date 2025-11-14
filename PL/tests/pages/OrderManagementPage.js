import { expect } from '@playwright/test';
export default class OrderManagementPage {
  constructor(page) {
    this.page = page; // This is the main CRM page
  }

 async navigateToOrderView() {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      console.log(`🔁 Attempt ${attempt}: Navigating to Order View`);

      // Always start from CRM homepage
      await this.page.goto('https://bp-6dapps-sit.crm-bp.bss.blueprint.lab/crm-ui/#page');
      await this.page.waitForLoadState('networkidle');

      // Repeat full navigation flow
      const heading = this.page.getByRole('heading', { name: 'Order View' });
      await heading.waitFor({ state: 'visible', timeout: 10000 });
      await heading.click();

      console.log('✅ Successfully navigated to Order View');
      return;
    } catch (error) {
      if (attempt === 2) {
        throw new Error('❌ Failed to navigate to Order View after retry');
      }
      console.log('⚠️ Heading not visible — retrying full flow...');
    }
  }
}

  async searchOrder(serviceId) {
    await this.page.getByText('Advanced Search').click();
    await this.page.locator('#serviceId').fill(serviceId);
    await this.page.getByRole('button', { name: 'Search' }).click();
  }

async validateOrderCompletion() {
  const firstRow = this.page.locator('table tbody tr').first();

  for (let attempt = 1; attempt <= 10; attempt++) {
    const text = await firstRow.textContent();
    if (text.includes('Completed')) {
      console.log('✅ Order status is Completed');
      return;
    }
    console.log(`⏳ Attempt ${attempt}: status is still "${text}"`);
    await this.page.waitForTimeout(5000); // wait 5s before retry
  }

  throw new Error('❌ Order never reached Completed within retries');
}
  async fullFlow(serviceId) {
    await this.navigateToOrderView();
    await this.searchOrder(serviceId);
    await this.validateOrderCompletion();
  }
}