import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';

test.describe('Authentication', () => {
  const TEST_EMAIL = process.env.TEST_USER_EMAIL || '';
  const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || '';

  test.beforeAll(() => {
    if (!TEST_EMAIL || !TEST_PASSWORD) {
      console.warn('⚠️ Missing TEST_USER_EMAIL or TEST_USER_PASSWORD in .env');
    }
  });

  test('User can log in with valid credentials', async ({ page }) => {
    test.skip(!TEST_EMAIL || !TEST_PASSWORD, 'Missing test credentials');

    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.goto();
    await loginPage.fillEmail(TEST_EMAIL);
    await loginPage.fillPassword(TEST_PASSWORD);
    await loginPage.submit();

    // Verify successful login by checking dashboard URL or some text
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.getByTestId('sidebar-nav-dashboard').first()).toBeVisible();
  });

  test('User gets error with invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.fillEmail('invalid-email@example.com');
    await loginPage.fillPassword('WrongPassword123!');
    await loginPage.submit();

    // Verify error message
    // Note: Assuming Polish locale for error message as default
    await loginPage.expectTextVisible('Nieprawidłowe'); // fragment of "Nieprawidłowe dane logowania"
  });
});
