export default class OrderManagementPage {
  constructor(page) {
    this.page = page; // This is the main CRM page
  }

 async navigateToOrderView() {
  await this.page.goto('https://bp-6dapps-sit.crm-bp.bss.blueprint.lab/crm-ui/#page');
  await this.page.waitForLoadState('networkidle');
  const heading = this.page.getByRole('heading', { name: 'Order View' });
  await heading.waitFor({ state: 'visible', timeout: 10000 });
  await heading.click();
}

  async searchOrder(serviceId) {
    await this.page.getByText('Advanced Search').click();
    await this.page.locator('#serviceId').fill(serviceId);
    await this.page.getByRole('button', { name: 'Search' }).click();
  }

 async validateOrderCompletion() {
  const completedCell = this.page.getByRole('cell', { name: 'Completed' }).first();
  await completedCell.waitFor({ state: 'visible', timeout: 10000 });
  await completedCell.click();
  console.log(`✅ Order status is Completed`);
}

  async fullFlow(serviceId) {
    await this.navigateToOrderView();
    await this.searchOrder(serviceId);
    await this.validateOrderCompletion();
  }
}