import { testEnv } from "../../envConfig";
export default class ApprovalPage {
  constructor(page) {
    this.page = page;
  }

  async login(username, password) {
    await this.page.goto(testEnv.baseUrl,{timeout:60000});
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
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      console.log(`🔁 Attempt ${attempt}: Starting approval flow for MSISDN ${msisdn}`);

      const popupPromise = this.page.waitForEvent('popup');
      await this.page.getByText('CRMUI').click();
      const crmPage = await popupPromise;

      // Guard against Keycloak redirect
      if (await crmPage.getByRole('heading', { name: 'Keycloak' }).isVisible()) {
        throw new Error('Redirected to Keycloak');
      }

      // add wait here 
      await crmPage.waitForLoadState('networkidle');

      await crmPage.getByText('Approvals').click();
      await crmPage.getByRole('link', { name: 'Approval', exact: true }).click();
      await crmPage.getByRole('cell', { name: msisdn }).first().click();
      await crmPage.getByRole('button').filter({ hasText: /^$/ }).nth(2).click(); 
      await crmPage.getByRole('button', { name: 'Self Assign' }).click();
      await crmPage.getByRole('button', { name: 'Edit' }).click();

      await crmPage.waitForLoadState('networkidle');

      const approveButton = crmPage.getByRole('button', { name: 'Approve' });
      await approveButton.waitFor({ state: 'visible', timeout: 20000 });
      await approveButton.click();

      await crmPage.locator('#comment').fill(comment);
      await crmPage.getByRole('button', { name: 'Submit' }).click();

      console.log(`✅ Approval completed for MSISDN ${msisdn}`);
      return;
    } catch (error) {
      if (attempt === 2) {
        
        throw new Error(`❌ Approval failed for MSISDN ${msisdn} after retry `);
      }
     
    }
  }
}
}