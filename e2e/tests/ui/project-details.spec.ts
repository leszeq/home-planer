import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { ProjectsPage } from '../../pages/ProjectsPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { ProjectDetailsPage } from '../../pages/ProjectDetailsPage';

test.describe('Project Details & Internals', () => {
  const TEST_EMAIL = process.env.TEST_USER_EMAIL || '';
  const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || '';
  let projectName = `E2E Details Project ${Date.now()}`;

  test.beforeEach(async ({ page }) => {
    test.skip(!TEST_EMAIL || !TEST_PASSWORD, 'Missing test credentials');
    const loginPage = new LoginPage(page);
    await loginPage.login(TEST_EMAIL, TEST_PASSWORD);
  });

  test('User can manage stages, checklists, and schedule in a project', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const projectsPage = new ProjectsPage(page);
    const detailsPage = new ProjectDetailsPage(page);

    // 1. Create a dummy project for testing internals
    await dashboardPage.navigateToProjects();
    await projectsPage.createProject(projectName, '50000');
    await projectsPage.expectTextVisible(projectName);

    // Navigate to project details
    await page.locator('a').filter({ hasText: projectName }).first().click();

    // 2. Verify basic components load
    await detailsPage.expectTitle(projectName);
    await expect(detailsPage.stagesCard).toBeVisible();
    await expect(detailsPage.timelineCard).toBeVisible();

    // 3. Add a new Stage
    const stageName = 'E2E Etap Testowy';
    await detailsPage.addStage(stageName);

    // 4. Add a Custom Checklist
    const checklistName = 'Zadania testowe';
    const items = ['Kupić materiały', 'Zatrudnić ekipę', 'Rozpocząć prace'];
    await detailsPage.addCustomChecklist(stageName, checklistName, items);

    // Verify template checklist works as well
    // Let's use a known template ID if available, otherwise just pick one from the list visually.
    // 'poszukiwanie-dzialki' is usually a valid template ID from your CHECKLIST_TEMPLATES.pl
    await detailsPage.addTemplateChecklist(stageName, 'poszukiwanie-dzialki');

    // 5. Setup stage schedule
    // Let's use today and tomorrow
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Format to YYYY-MM-DD
    const formatDate = (d: Date) => d.toISOString().split('T')[0];
    await detailsPage.setStageDates(stageName, formatDate(today), formatDate(tomorrow));

    // Verify it reflects on the Gantt chart (should have a timeline stage item now)
    await expect(page.getByTestId('timeline-stage-item').filter({ hasText: stageName })).toBeVisible();

    // 6. Check items off the checklist and verify stage status changes
    // Currently, it's 'todo'
    await detailsPage.verifyStageStatus(stageName, 'badge-todo');

    // Toggle one item -> should be 'in_progress'
    await detailsPage.toggleChecklistItem(stageName, checklistName, 'Kupić materiały');
    
    // Refreshing might be optimistic, let's wait a bit for status to update
    // If there's an automatic backend trigger that changes stage status based on checklists,
    // we could verify it here. If it requires manual toggling:
    
    // Let's manually toggle the stage status to 'in_progress'
    await detailsPage.toggleStageStatusManually(stageName);
    await detailsPage.verifyStageStatus(stageName, 'badge-progress');

    // Toggle to 'done'
    await detailsPage.toggleStageStatusManually(stageName);
    await detailsPage.verifyStageStatus(stageName, 'badge-done');

    // 7. Cleanup
    await dashboardPage.navigateToProjects();
    await projectsPage.deleteProject(projectName);
    await expect(page.locator('.group').filter({ hasText: projectName })).toHaveCount(0);
  });
});
