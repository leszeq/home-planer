import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProjectsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto('/dashboard/projects');
  }

  async createProject(name: string, budget: string) {
    await this.clickTestId('create-project-trigger-btn');
    await this.getTestId('create-project-name-input').fill(name);
    await this.getTestId('create-project-budget-input').fill(budget);
    await this.clickTestId('create-project-submit-btn');
  }

  async deleteProject(name: string) {
    const projectCard = this.page.locator('.group').filter({ hasText: name }).first();
    const deleteTrigger = projectCard.getByTestId('delete-project-trigger');
    await deleteTrigger.click();
    
    // Zastąp clickTestId wywołaniem locatora wewnątrz modalu
    await this.clickTestId('delete-project-confirm-btn');
  }
}
