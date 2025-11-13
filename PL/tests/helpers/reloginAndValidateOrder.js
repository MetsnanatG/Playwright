import { LoginPage } from '../pages/LoginPage';
import OrderManagementPage from '../pages/OrderManagementPage';

export async function reloginAndValidateOrder(browser, msisdn) {
  const context = await browser.newContext();
  const page = await context.newPage();

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(process.env.CREATOR_USER, process.env.CREATOR_PASS);
  await loginPage.assertLoggedIn();

  const orderPage = new OrderManagementPage(page);
  await orderPage.fullFlow(msisdn);

  await context.close();
}