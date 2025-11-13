// tests/pages/DocumentUploadPage.js
export default class DocumentUploadPage {
  constructor(page) {
    this.page = page;
  }

  async uploadApplicationLetter(filePath) {
    await this.page.locator('div').filter({ hasText: /^Select$/ }).nth(2).click();
    await this.page.getByText('Application Letter', { exact: true }).click();
    await this.page.getByRole('button', { name: 'Browse' }).setInputFiles(filePath);
    await this.page.getByRole('button', { name: 'Add Files' }).click();
    await this.page.getByRole('button', { name: 'Submit' }).click();
  }

  async uploadAdditionalDocument(filePath) {
    await this.page.locator('div').filter({ hasText: /^Select$/ }).nth(2).click();
    await this.page.locator('#react-select-5-option-0').click();
    await this.page.locator('input[name="fileName"]').fill('Unidentified');
    await this.page.getByRole('button', { name: 'Browse' }).setInputFiles(filePath);
    await this.page.getByRole('button', { name: 'Add Files' }).click();
  }
}