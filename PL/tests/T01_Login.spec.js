import { test } from '@playwright/test';
import CRMUIPage from './pages/CRMUIPage';
import { loginAndOpenCRMUI } from './helpers/navigation';
import { testEnv } from '../envConfig';


test('login and open CRMUI', async ({ page }) => {
  const crmPage = await loginAndOpenCRMUI(page);
  await crmPage.goto(testEnv.crmUrl);

  const crmUI = new CRMUIPage(crmPage);
  await crmUI.assertWelcomeMessage();
});
// import { test } from '@playwright/test';
// import { LoginPage } from './pages/LoginPage';
// import CRMUIPage  from './pages/CRMUIPage';

// test('login and open CRMUI', async ({ page }) => {
//   const loginPage = new LoginPage(page);

//   // Login
//   await loginPage.goto();
//   await loginPage.login(process.env.KEYCLOAK_USER, process.env.KEYCLOAK_PASS);
//   await loginPage.assertLoggedIn();

//   // Open CRMUI popup
//   const crmPagePromise = page.waitForEvent('popup');
//   await page.getByText('CRMUI').click();
//   const crmPage = await crmPagePromise;

//   // Use CRMUI page object
//   const crmUI = new CRMUIPage(crmPage);
//   await crmUI.assertWelcomeMessage();
// });
