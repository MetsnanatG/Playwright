// tests/pages/ApprovalPage.js
export default class ApprovalPage {
  constructor(page) {
    this.page = page;
  }

  async login(username, password) {
    await this.page.goto(process.env.BASE_URL,{timeout:60000});
    // Explicitly sign out if a session is active
      const signOutLink = this.page.getByRole('link', { name: /Sign Out/i });
    if (await signOutLink.isVisible()) {
      await signOutLink.click();
      await this.page.waitForLoadState('networkidle');
      console.log('✅ Explicit Sign Out performed');
    }

    


    await this.page.getByRole('textbox', { name: 'Username' }).type(username);
    await this.page.getByRole('textbox', { name: 'Password' }).type(password);
    await this.page.getByRole('button', { name: 'Sign In' }).click();
  }

  async approve(msisdn, comment = 'Test approved') {
    const popupPromise = this.page.waitForEvent('popup');
    await this.page.getByText('CRMUI').click();
    const crmPage = await popupPromise;

    await crmPage.getByText('Approvals').click();
    await crmPage.getByRole('link', { name: 'Approval', exact: true }).click();
    await crmPage.getByRole('cell', { name: msisdn }).first().click();

    await crmPage.getByRole('button').filter({ hasText: /^$/ }).nth(2).click();
    await crmPage.getByRole('button', { name: 'Self Assign' }).click();
    await crmPage.getByRole('button', { name: 'Edit' }).click();
    await crmPage.getByRole('button', { name: 'Approve' }).click();

    await crmPage.locator('#comment').fill(comment);
    await crmPage.getByRole('button', { name: 'Submit' }).click();

    console.log(`✅ Approval completed for MSISDN ${msisdn}`);
  }
}