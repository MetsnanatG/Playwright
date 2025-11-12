export default class ChangeLanguagePage {
  constructor(page) {
    this.page = page;

    this.detailsLink = page.getByText('Details', { exact: true });
    this.updateLanguageLink = page.getByRole('link', { name: 'Update Language' });

    this.dropdownTrigger = page.locator('.css-19bqh2r'); // opens language select
    this.languageInput = page.locator('#react-select-2-input'); // type-ahead input

    this.submitButton = page.getByRole('button', { name: 'Submit' });
  }

  async getCurrentLanguage() {
  // Open Details
  await this.detailsLink.waitFor({ state: 'visible', timeout: 10000 });
  await this.detailsLink.click();

  // Click Update Language
  await this.updateLanguageLink.waitFor({ state: 'visible', timeout: 10000 });
  await this.updateLanguageLink.click();

  // Locate the language within the Active Language(s) section
  const langElement = this.page.locator('span.text-dots.float-left', {
    hasText: /Amharic|English/
  }).first(); // first visible matching element

  await langElement.waitFor({ state: 'visible', timeout: 10000 });

  const currentLang = (await langElement.textContent())?.trim();
  console.log("✅ Detected current language:", currentLang);
  return currentLang;
}


  // ✅ Change language workflow
  async changeLanguage(lang) {
    await this.dropdownTrigger.waitFor({ state: 'visible', timeout: 10000 });
    await this.dropdownTrigger.click();

    await this.languageInput.fill(lang);
    await this.languageInput.press('Enter');

    await this.submitButton.click();
    console.log(`✅ Submitted language change request: ${lang}`);
  }

async assertLanguageChanged(lang) {
  // Target only the div showing the selected language value
  const langElement = this.page.locator('div.css-1uccc91-singleValue', {
    hasText: lang
  });
  await langElement.waitFor({ state: 'visible', timeout: 10000 });

  console.log(`✅ Verified language changed to: ${lang}`);
}


  // ✅ Toggle language automatically
  async toggleLanguage() {
    const current = await this.getCurrentLanguage();
    const target = current === 'Amharic' ? 'English' : 'Amharic';

    await this.changeLanguage(target);
    await this.assertLanguageChanged(target);

    return target;
  }
}
