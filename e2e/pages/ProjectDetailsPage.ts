import { Page, expect, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProjectDetailsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(projectId?: string) {
    if (!projectId) throw new Error('goto() requires projectId for ProjectDetailsPage');
    await this.page.goto(`/dashboard/projects/${projectId}`);
  }

  // Locators
  get title() { return this.getTestId('project-header-title'); }
  get stagesCard() { return this.getTestId('project-stages-card'); }
  get timelineCard() { return this.getTestId('project-timeline-card'); }

  // Actions
  async expectTitle(title: string) {
    await expect(this.title).toContainText(title);
  }

  async addStage(name: string) {
    await this.clickTestId('add-stage-btn');
    const input = this.getTestId('new-stage-name-input');
    await input.fill(name);
    await this.clickTestId('save-stage-btn');
    // Wait for the stage to appear
    await expect(this.page.locator(`[data-testid="stage-card"]:has-text("${name}")`)).toBeVisible();
  }

  private getStageCard(stageName: string): Locator {
    // using filter hasText to find the specific stage card among multiple
    return this.page.locator('[data-testid="stage-card"]').filter({ hasText: stageName }).first();
  }

  async setStageDates(stageName: string, startDate: string, endDate: string) {
    const stage = this.getStageCard(stageName);
    await stage.getByTestId('stage-calendar-btn').click();
    await stage.getByTestId('stage-start-date-input').fill(startDate);
    await stage.getByTestId('stage-end-date-input').fill(endDate);
    await stage.getByTestId('stage-save-dates-btn').click();
    
    // Ensure the edit mode is closed (button disappears)
    await expect(stage.getByTestId('stage-save-dates-btn')).toBeHidden();
  }

  async addCustomChecklist(stageName: string, checklistName: string, items: string[]) {
    const stage = this.getStageCard(stageName);
    await stage.getByTestId('create-checklist-trigger-btn').click();

    // Fill modal
    await this.page.getByTestId('create-checklist-name-input').fill(checklistName);
    
    // Add items (first item is already there)
    for (let i = 0; i < items.length; i++) {
      const inputs = this.page.getByTestId('create-checklist-item-input');
      await inputs.nth(i).fill(items[i]);
      if (i < items.length - 1) {
        await inputs.nth(i).press('Enter');
      }
    }

    await this.page.getByTestId('create-checklist-submit-btn').click();
    // Verify checklist was created inside this stage
    await expect(stage.locator(`[data-testid="checklist-container"]:has-text("${checklistName}")`)).toBeVisible();
  }

  async addTemplateChecklist(stageName: string, templateId: string) {
    const stage = this.getStageCard(stageName);
    // Find the add template button inside this stage. 
    // If it's a new stage, it might not have the "ghost" version but the "outline" one if no checklist exists, 
    // but the testID should be the same.
    await stage.getByTestId('add-template-trigger-btn').click();

    // Select template inside modal
    await this.page.getByTestId(`template-select-${templateId}`).click();
    await this.page.getByTestId('template-submit-btn').click();

    // Template name mapping for assertion, assuming basic template
    // If we don't know the exact name, we can just check if any checklist appeared.
    await expect(stage.locator('[data-testid="checklist-container"]')).not.toHaveCount(0);
  }

  getChecklistContainer(stageName: string, checklistName: string): Locator {
    const stage = this.getStageCard(stageName);
    return stage.locator('[data-testid="checklist-container"]').filter({ hasText: checklistName }).first();
  }

  async toggleChecklistItem(stageName: string, checklistName: string, itemText: string) {
    const checklist = this.getChecklistContainer(stageName, checklistName);
    const item = checklist.locator('[data-testid="checklist-item"]').filter({ hasText: itemText }).first();
    await item.getByTestId('item-toggle').click();
  }

  async verifyStageStatus(stageName: string, expectedStatusClass: string) {
    const stage = this.getStageCard(stageName);
    const badge = stage.locator('.badge-todo, .badge-progress, .badge-done').first();
    // For visual confirmation, Playwright can check the class
    await expect(badge).toHaveClass(new RegExp(expectedStatusClass));
  }

  async toggleStageStatusManually(stageName: string) {
    const stage = this.getStageCard(stageName);
    await stage.getByTestId('stage-status-toggle').click();
  }
}
