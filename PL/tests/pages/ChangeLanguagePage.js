import OrderManagementPage from "./OrderManagementPage";

export default class ChangeLanguagePage {
  constructor(page) {
    this.page = page;

    this.detailsLink = page.getByText('Details', { exact: true });
    this.updateLanguageLink = page.getByRole('link', { name: 'Update Language' });

    this.dropdownTrigger = page.locator('.css-19bqh2r'); 
    this.languageInput = page.locator('#react-select-2-input'); 
    this.submitButton = page.getByRole('button', { name: 'Submit' });
  }

  async getCurrentLanguage() {
  await this.detailsLink.waitFor({ state: 'visible', timeout: 10000 });
  await this.detailsLink.click();

  // Retry visibility check manually for flaky updateLanguageLink
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const isVisible = await this.updateLanguageLink.isVisible();
      if (!isVisible) throw new Error('Not visible yet');

      const box = await this.updateLanguageLink.boundingBox();
      if (!box) throw new Error('Not interactable');

      await this.updateLanguageLink.click();
      console.log('✅ Clicked Update Language link');
      break;
    } catch (error) {
      if (attempt === 2) {
        await this.page.screenshot({ path: `screenshots/updateLanguageLink-failure-${Date.now()}.png`, fullPage: true });
        throw new Error('❌ Failed to click Update Language link after retry — screenshot captured');
      }
      console.log('⚠️ Update Language link not ready — retrying...');
      await this.page.waitForTimeout(1000);
    }
  }

  const langElement = this.page.locator('span.text-dots.float-left', {
    hasText: /Amharic|English|Tigrinya|Oromiffa|Somali/
  }).first();

  await langElement.waitFor({ state: 'visible', timeout: 20000 });
  const currentLang = (await langElement.textContent())?.trim();
  console.log(`✅ Detected current language: ${currentLang}`);
  return currentLang;
}

async uploadDocuments(filePath) {
  // Step 1: Open the document type dropdown
  await this.page.locator('div').filter({ hasText: /^Select$/ }).nth(2).click();

  // Step 2: Select "Application Letter"
  await this.page.getByText('Application Letter', { exact: true }).click();

  // Step 3: Upload the file to the hidden input
  await this.page.locator('#multiFile-upload input[type="file"]').setInputFiles(filePath);

  // Step 4: Add the file
  await this.page.getByRole('button', { name: 'Add Files' }).click();

  console.log(`✅ Uploaded Application Letter: ${filePath}`);
}

  async changeLanguage(lang, filePath = 'Test file.txt') {
    await this.dropdownTrigger.waitFor({ state: 'visible', timeout: 10000 });
    await this.dropdownTrigger.click();

    await this.languageInput.fill(lang);
    await this.languageInput.press('Enter');
    await this.submitButton.click();

    // 🔑 Conditional document upload
    if (process.env.CONNECTION_TYPE === 'EBU') {
      await this.uploadDocuments(filePath);
    }

    await this.submitButton.click();
    console.log(`✅ Submitted language change request: ${lang}`);
  }

  async assertLanguageChanged(serviceId) {
  const orderPage = new OrderManagementPage(this.page);
  await orderPage.navigateToOrderView();
  await orderPage.searchOrder(serviceId);

  const parsed = await orderPage.validateOrderCompletion(serviceId);

  if (parsed.status === 'Completed') {
    console.log(`✅ Order for ${serviceId} is Completed`);
  } else {
    throw new Error(`❌ Order for ${serviceId} not completed. Parsed status: ${parsed.status}`);
  }
}

  async toggleLanguage(serviceId, filePath = 'Test file.txt') {
    const current = await this.getCurrentLanguage();
    const target = current === 'Amharic' ? 'English' : 'Amharic';

    await this.changeLanguage(target, filePath);
    await this.assertLanguageChanged(serviceId);

    return target;
  }
}