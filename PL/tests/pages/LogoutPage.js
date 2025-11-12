import { expect } from '@playwright/test';

export default class LogoutPage {
  constructor(page) {
    this.page = page;
    // Adjust selector to the actual icon/button that opens the nav
    this.menuToggle = page.locator('xpath=//*[@id="root"]/div[6]/div[2]/nav/ul/li/a');

    this.logoutLink = page.getByText(/Logout|Sign out/i);
  }

  async logout() {
    // Open the menu first
    await this.menuToggle.waitFor({ state: 'visible', timeout: 10000 });
    await this.menuToggle.click();

    // Now the logout link should be visible
    await this.logoutLink.waitFor({ state: 'visible', timeout: 10000 });
    await this.logoutLink.click();

    console.log('✅ Logout clicked');
  }

 async assertLoggedOut() {
  // Wait until the Keycloak login page title is visible
  await expect(this.page.locator('xpath=//*[@id="kc-page-title"]'))
    .toBeVisible({ timeout: 10000 });

  console.log('✅ Verified user is logged out (login page title visible)');
}


}