import { LoginPage } from '../pages/LoginPage';

export async function loginAndOpenCRMUI(page) {
  console.log('Storage state loaded:', await page.context().storageState());
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(process.env.KEYCLOAK_USER, process.env.KEYCLOAK_PASS);
  await loginPage.assertLoggedIn();

  const crmPagePromise = page.waitForEvent('popup');
  await page.getByText('CRMUI').click();
  return await crmPagePromise;
}