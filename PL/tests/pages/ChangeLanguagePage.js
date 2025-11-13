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

    await this.updateLanguageLink.waitFor({ state: 'visible', timeout: 10000 });
    await this.updateLanguageLink.click();

    const langElement = this.page.locator('span.text-dots.float-left', {
      hasText: /Amharic|English/
    }).first();

    await langElement.waitFor({ state: 'visible', timeout: 10000 });
    const currentLang = (await langElement.textContent())?.trim();
    console.log("✅ Detected current language:", currentLang);
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

  async assertLanguageChanged(lang) {
    const langElement = this.page.locator('div.css-1uccc91-singleValue', {
      hasText: lang
    });
    await langElement.waitFor({ state: 'visible', timeout: 10000 });
    console.log(`✅ Verified language changed to: ${lang}`);
  }

  async toggleLanguage(filePath = 'Test file.txt') {
    const current = await this.getCurrentLanguage();
    const target = current === 'Amharic' ? 'English' : 'Amharic';

    await this.changeLanguage(target, filePath);
    await this.assertLanguageChanged(target);

    return target;
  }
}