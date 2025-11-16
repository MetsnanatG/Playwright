import { expect } from '@playwright/test';

export default class OrderManagementPage {
  constructor(page) {
    this.page = page; // CRM page reference
  }

  async waitBackdropGoneOrRefresh(maxWaitMs = 5000) {
    const backdrop = this.page.locator('.MuiBackdrop-root');
    const spinner = this.page.locator('[role="progressbar"], .spinner-border');

    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
      const [b, s] = await Promise.all([backdrop.isVisible(), spinner.isVisible()]);
      if (!b && !s) return; // page is likely interactable
      await this.page.waitForTimeout(200);
    }

    console.log('⚠️ Backdrop/spinner persisted — refreshing CRM homepage');
    await this.page.goto('https://bp-6dapps-sit.crm-bp.bss.blueprint.lab/crm-ui/#page');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async navigateToOrderView() {
    const crmHome = 'https://bp-6dapps-sit.crm-bp.bss.blueprint.lab/crm-ui/#page';

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`🔁 Attempt ${attempt}: Navigating to Order View`);

        await this.page.goto(crmHome);
        await this.page.waitForLoadState('domcontentloaded');

        const url = this.page.url();
        if (url.includes('logout') || url.includes('login')) {
          throw new Error(`Session not active (URL=${url})`);
        }

        // Backdrop/spinner guard: short wait, else refresh
        await this.waitBackdropGoneOrRefresh(5000);

        const orderViewCard = this.page.getByText('Order View', { exact: true });

        await expect(orderViewCard).toBeVisible({ timeout: 20000 });
        await expect(orderViewCard).toBeEnabled({ timeout: 20000 });

        await orderViewCard.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(150);

        try {
          await orderViewCard.click({ timeout: 5000 });
        } catch (e) {
          // Backdrop likely reappeared — refresh and retry once
          console.log('⚠️ Click intercepted — refreshing and retrying Order View click');
          await this.page.goto(crmHome);
          await this.page.waitForLoadState('domcontentloaded');
          await this.waitBackdropGoneOrRefresh(5000);
          await expect(orderViewCard).toBeVisible({ timeout: 20000 });
          await orderViewCard.click({ timeout: 5000 });
        }

        // Confirm arrival by URL or table presence
        await this.page.waitForURL(/crm-ui\/viewOrders/, { timeout: 10000 }).catch(() => {
          console.log('ℹ️ URL not yet /viewOrders — waiting for table as proxy signal');
        });

        const firstRow = this.page.locator('table tbody tr').first();
        await firstRow.waitFor({ state: 'visible', timeout: 30000 });

        console.log('✅ Successfully navigated to Order View');
        return;
      } catch (error) {
        console.log(`❌ Attempt ${attempt} failed: ${error.message}`);
        if (attempt === 3) throw new Error('❌ Failed to navigate to Order View after 3 attempts');
        console.log('⚠️ Retrying navigation...');
        await this.page.waitForTimeout(attempt * 1000);
      }
    }
  }

  async searchOrder(serviceId) {
    console.log(`🔍 Searching for serviceId: ${serviceId}`);
    await this.page.getByText('Advanced Search').click();
    await this.page.locator('#serviceId').fill(serviceId);
    await this.page.getByRole('button', { name: 'Search' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async validateOrderCompletion(serviceId) {
    const crmHome = 'https://bp-6dapps-sit.crm-bp.bss.blueprint.lab/crm-ui/#page';
    const firstRow = this.page.locator('table tbody tr').first();

    for (let attempt = 1; attempt <= 10; attempt++) {
      console.log(`🔄 Reload attempt ${attempt}`);
      await this.page.reload();
      await this.page.waitForLoadState('domcontentloaded');

      // If redirected out, re-navigate and re-search
      const url = this.page.url();
      if (url.includes('logout') || url.includes('login')) {
        console.log('⚠️ Session expired during validation — navigating back to CRM homepage');
        await this.page.goto(crmHome);
        await this.page.waitForLoadState('domcontentloaded');
        await this.navigateToOrderView();
        await this.searchOrder(serviceId);
        continue;
      }

      // Backdrop/spinner guard before asserting table
      await this.waitBackdropGoneOrRefresh(4000);

      try {
        await firstRow.waitFor({ state: 'visible', timeout: 20000 });
      } catch {
        console.log('⚠️ Table not visible — re-navigating to Order View and retrying');
        await this.navigateToOrderView();
        await this.searchOrder(serviceId);
        continue;
      }

      const text = await firstRow.textContent();
      console.log(`⏳ Attempt ${attempt}: raw status row = "${text}"`);

      const parsed = this.parseOrderRow(text);
      console.log('📑 Parsed Order Row:', parsed);

      // Assert only on status; will throw immediately if not Completed
      expect(parsed.status).toBe('Completed');

      if (parsed.status === 'Completed') {
        console.log('✅ Order status is Completed');
        return parsed;
      }

      if (parsed.status === 'In Progress') {
        const retryButton = this.page.getByRole('button', { name: 'Retry' });
        if (await retryButton.isVisible()) {
          console.log('⚠️ Status In Progress — clicking Retry');
          await retryButton.click();
        }
      }

      await this.page.waitForTimeout(5000);
    }

    throw new Error('❌ Order never reached Completed within retries');
  }

  // ✅ Updated parser: split by spaces, preserve quoted description
  parseOrderRow(text) {
    const parts = text.match(/("[^"]+"|[^\s]+)/g);
    if (!parts || parts.length < 12) {
      return { raw: text, status: text.includes('Completed') ? 'Completed' : 'Unknown' };
    }

    return {
      transactionId: parts[0],
      action: parts[1],
      system: parts[2],
      status: parts[3],
      timestamp: `${parts[4]} ${parts[5]}`,
      referenceNumber: parts[6],
      code: parts[7],
      serviceId: parts[8],
      serviceType: parts[9],
      plan: parts[10],
      segment: parts[11],
      description: parts.slice(12).join(' ').replace(/"/g, '').trim()
    };
  }

  async fullFlow(serviceId) {
    await this.navigateToOrderView();
    await this.searchOrder(serviceId);
    return await this.validateOrderCompletion(serviceId);
  }
}