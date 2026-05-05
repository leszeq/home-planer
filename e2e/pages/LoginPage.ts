import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto('/login');
  }

  async fillEmail(email: string) {
    await this.getTestId('login-email-input').fill(email);
  }

  async fillPassword(password: string) {
    await this.getTestId('login-password-input').fill(password);
  }

  async submit() {
    await this.clickTestId('login-submit-button');
  }

  async login(email: string, password: string) {
    await this.goto();
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
    await this.page.waitForURL(/.*\/dashboard/);
  }
}
