import { Page, expect } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  abstract goto(): Promise<void>;

  /**
   * Czeka na widoczność konkretnego test id i opcjonalnie klika w niego.
   */
  async clickTestId(testId: string) {
    const locator = this.page.getByTestId(testId).first();
    await expect(locator).toBeVisible();
    await locator.click();
  }

  /**
   * Zwraca locator po test id
   */
  getTestId(testId: string) {
    return this.page.getByTestId(testId).first();
  }

  /**
   * Sprawdza czy na stronie jest dany tekst
   */
  async expectTextVisible(text: string) {
    await expect(this.page.getByText(text, { exact: false }).first()).toBeVisible();
  }
}
