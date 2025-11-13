import { expect } from '@playwright/test';

export class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = page.locator('#username');   // adjust selector to match DOM
    this.passwordInput = page.locator('#password');
    this.signInButton = page.getByRole('button', { name: /Sign In/i });
  }

  async goto() {
     await this.page.goto(process.env.BASE_URL,{timeout:60000});
    // Explicitly sign out if a session is active
      const signOutLink = this.page.getByRole('link', { name: /Sign Out/i });
    if (await signOutLink.isVisible()) {
      await signOutLink.click();
      await this.page.waitForLoadState('networkidle');
      console.log('✅ Explicit Sign Out performed');
    }

    await this.page.waitForLoadState('domcontentloaded' ,{ timeout: 60000 });
  }

  async login(username, password) {
    await this.usernameInput.type(username);
    await this.passwordInput.type(password);

    

    await expect(this.signInButton).toBeEnabled();

    await this.signInButton.click();
  }

    async assertLoggedIn() {
    await expect(this.page).toHaveURL(/applications/);
    }

}