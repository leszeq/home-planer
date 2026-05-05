import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { ProjectsPage } from '../../pages/ProjectsPage';
import { DashboardPage } from '../../pages/DashboardPage';

test.describe('Projects Management', () => {
  const TEST_EMAIL = process.env.TEST_USER_EMAIL || '';
  const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || '';

  // We need to login before each test
  test.beforeEach(async ({ page }) => {
    test.skip(!TEST_EMAIL || !TEST_PASSWORD, 'Missing test credentials');
    const loginPage = new LoginPage(page);
    await loginPage.login(TEST_EMAIL, TEST_PASSWORD);
  });

  test('User can create a new project', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const projectsPage = new ProjectsPage(page);
    
    // Use UI navigation instead of direct URL
    await dashboardPage.navigateToProjects();

    const projectName = `E2E Test Project ${Date.now()}`;
    await projectsPage.createProject(projectName, '100000');

    // Verify project appears in the list (assuming it shows up with its name)
    await projectsPage.expectTextVisible(projectName);

    // Cleanup: delete the newly created project
    await projectsPage.deleteProject(projectName);

    // Verify project is no longer visible
    await expect(page.locator('.group').filter({ hasText: projectName })).toHaveCount(0);
  });
});
