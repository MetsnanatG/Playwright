import { expect } from '@playwright/test';
import { testEnv } from '../../envConfig';

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
    await this.page.goto(testEnv.crmUrl);
    await this.page.waitForLoadState('domcontentloaded');
  }
  // Wait until neither backdrop nor spinner are visible, up to maxTotalMs.
  // If they persist, optionally refresh CRM homepage and retry waiting once.
  async waitUntilInteractable(maxTotalMs = 15000, pollMs = 250) {
    await this.recreatePageIfClosed();

    const backdrop = this.page.locator('.MuiBackdrop-root');
    const spinner = this.page.locator('[role="progressbar"], .spinner-border');

    const start = Date.now();
    while (Date.now() - start < maxTotalMs) {
      // If page was closed during waiting, recreate and restart timer
      if (this.page.isClosed()) {
        console.log('⚠️ Page closed while waiting — recreating page');
        await this.recreatePageIfClosed();
      }

      const [bVisible, sVisible] = await Promise.all([
        backdrop.isVisible().catch(() => false),
        spinner.isVisible().catch(() => false)
      ]);

      if (!bVisible && !sVisible) return; // good to interact

      // small sleep before re-check
      await new Promise(r => setTimeout(r, pollMs));
    }
  }

  async navigateToOrderView() {
    const crmHome = testEnv.crmUrl;

    const ensureAlive = async () => {
      if (this.page && !this.page.isClosed()) return;
      if (!this.browser) throw new Error('Page closed and no browser reference to recreate it');
      const context = await this.browser.newContext();
      this.page = await context.newPage();
    };

    const waitForNoOverlay = async (timeout = 5000) => {
      // prefer waitForSelector so rejection is catchable
      try {
        // wait for known backdrop to be hidden; if it doesn't exist this resolves immediately
        await this.page.waitForSelector('.MuiBackdrop-root', { state: 'hidden', timeout });
        // also ensure common spinners are hidden
        await this.page.waitForSelector('[role="progressbar"]', { state: 'hidden', timeout }).catch(() => { });
        await this.page.waitForSelector('.spinner-border', { state: 'hidden', timeout }).catch(() => { });
      } catch {
        // if overlays persist, refresh once and try a short second wait
        await this.page.goto(crmHome);
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForSelector('.MuiBackdrop-root', { state: 'hidden', timeout: 7000 }).catch(() => { });
      }
    };

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`🔁 Attempt ${attempt}: Navigating to Order View`);

        // recreate page if closed
        await ensureAlive();

        // always start from CRM home to get a consistent state
        await this.page.goto(crmHome);
        await this.page.waitForLoadState('domcontentloaded');
        // 🔑 Ensure overlays are gone right after navigation
        await this.waitBackdropGoneOrRefresh(10000);


        const url = this.page.url();
        if (url.includes('logout') || url.includes('login')) {
          throw new Error(`Session not active (URL=${url})`);
        }

        // wait until overlays are gone (throws if page closes or timeout)
        await waitForNoOverlay(10000);

        const orderViewCard = this.page.getByText('Order View', { exact: true });

        await expect(orderViewCard).toBeVisible({ timeout: 15000 });
        await expect(orderViewCard).toBeEnabled({ timeout: 15000 });

        await orderViewCard.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(150); // short buffer

        // final quick guard: if backdrop reappeared synchronously, throw to trigger retry
        if (await this.page.locator('.MuiBackdrop-root').isVisible().catch(() => false)) {
          throw new Error('Backdrop present just before click');
        }

        // bounded click; handle failures locally
        try {
          await orderViewCard.click({ timeout: 10000 });
        } catch (clickErr) {
          console.log('⚠️ Click failed or intercepted:', clickErr.message);

          // capture a diagnostic screenshot if helpful (non-blocking)
          try { await this.page.screenshot({ path: `orderView-click-fail-${Date.now()}.png`, fullPage: true }); } catch { }

          // if backdrop is visible now, refresh and throw to trigger outer retry
          if (await this.page.locator('.MuiBackdrop-root').isVisible().catch(() => false)) {
            console.log('⚠️ Backdrop detected after failed click — refreshing and retrying outer loop');
            await this.page.goto(crmHome);
            await this.page.waitForLoadState('domcontentloaded');
            throw new Error('Click intercepted by backdrop');
          }

          // otherwise rethrow to be handled by outer catch
          throw clickErr;
        }

        // confirm navigation by waiting for table row
        const firstRow = this.page.locator('table tbody tr').first();
        await firstRow.waitFor({ state: 'visible', timeout: 30000 });

        console.log('✅ Successfully navigated to Order View');
        return;
      } catch (error) {
        console.log(`❌ Attempt ${attempt} failed: ${error.message}`);

        if (attempt === 3) throw new Error('❌ Failed to navigate to Order View after 3 attempts');

        // safe retry pause: only sleep if page alive
        if (this.page && !this.page.isClosed()) {
          await this.page.waitForTimeout(attempt * 1000);
        } else {
          // shortest backoff before next recreate
          await new Promise(r => setTimeout(r, 500));
        }

        console.log('⚠️ Retrying navigation...');
      }
    }
  }

 async searchOrder(serviceId) {
  console.log(`🔍 Searching for serviceId: ${serviceId}`);

  const advancedSearch = this.page.getByText(/Advanced Search/i);

  // Only click Advanced Search if it's still visible (first time)
  if (await advancedSearch.isVisible().catch(() => false)) {
    console.log('ℹ️ Advanced Search visible — clicking to open panel');
    await advancedSearch.click();
  } else {
    console.log('ℹ️ Advanced Search already open — skipping click');
  }

  // Now fill and search regardless
  await this.page.locator('#serviceId').fill(serviceId);
  await this.page.getByRole('button', { name: 'Search' }).click();
}

  async validateOrderCompletion(serviceId) {
    const crmHome = testEnv.crmUrl;
    const firstRow = this.page.locator('table tbody tr').first();

    for (let attempt = 1; attempt <= 10; attempt++) {
      console.log(`🔄 Validation attempt ${attempt}`);

      // Guard against session expiry
      const url = this.page.url();
      if (url.includes('logout') || url.includes('login')) {
        console.log('⚠️ Session expired — navigating back to CRM homepage');
        await this.page.goto(crmHome);
        await this.page.waitForLoadState('domcontentloaded');
        await this.navigateToOrderView();
        await this.searchOrder(serviceId);
        continue;
      }

      // Backdrop/spinner guard
      await this.waitBackdropGoneOrRefresh(20000);

      // Try to wait for the table row directly
      try {
        await firstRow.waitFor({ state: 'visible', timeout: 20000 });
      } catch {
        console.log('⚠️ Table not visible within 20s — re‑navigating to Order View and retrying');
        await this.page.goto(crmHome);
        await this.page.waitForLoadState('domcontentloaded');
        await this.navigateToOrderView();
        await this.searchOrder(serviceId);
        continue;
      }

      // If we reach here, table is visible
      const text = await firstRow.textContent();
      console.log(`⏳ Attempt ${attempt}: raw status row = "${text}"`);

      const parsed = this.parseOrderRow(text);
      console.log('📑 Parsed Order Row:', parsed);

      if (parsed.status === 'Completed') {
        console.log('✅ Order status is Completed');
        return parsed;
      }

      if (parsed.status === 'In Progress') {
        const reloadIcon = this.page.locator("svg[width='19']");
        if (await reloadIcon.isVisible().catch(() => false)) {
          console.log('⚠️ Status In Progress — clicking reload icon');
          await reloadIcon.click();
          await this.waitBackdropGoneOrRefresh(10000);
          await this.searchOrder(serviceId);
        }
        // backoff before next attempt
        await new Promise(res => setTimeout(res, 1000));
      }

      // Backoff before next attempt
      await new Promise(res => setTimeout(res, 5000));
    }

    throw new Error('❌ Order never reached Completed within retries');
  }

  parseOrderRow(rowText) {
    const normalized = rowText.replace(/\s+/g, ' ').trim();

    let status = 'Unknown';
    if (/Completed/i.test(normalized)) {
      status = 'Completed';
    } else if (/In\s*Progress/i.test(normalized)) {
      status = 'In Progress';
    } else if (/Failed/i.test(normalized)) {
      status = 'Failed';
    }

    return { status, raw: rowText };
  }


  async fullFlow(serviceId) {
    await this.navigateToOrderView();
    await this.searchOrder(serviceId);
    return await this.validateOrderCompletion(serviceId);
  }
}