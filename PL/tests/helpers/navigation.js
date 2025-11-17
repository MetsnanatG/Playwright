import { LoginPage } from '../pages/LoginPage';
import { testEnv } from '../../envConfig';

export async function loginAndOpenCRMUI(page) {
  console.log('Storage state loaded:', await page.context().storageState());
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(testEnv.creatorUser, testEnv.creatorPass);
  await loginPage.assertLoggedIn();

  const crmPagePromise = page.waitForEvent('popup');
  await page.getByText('CRMUI').click();
  return await crmPagePromise;
}