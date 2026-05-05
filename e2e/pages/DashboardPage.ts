import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto('/dashboard');
  }

  async navigateToProjects() {
    await this.clickTestId('sidebar-nav-projects');
  }

  async navigateToExpenses() {
    await this.clickTestId('sidebar-nav-expenses');
  }
}
