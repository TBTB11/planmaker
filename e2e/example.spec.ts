import { test, expect } from '@playwright/test';

/**
 * サンプル E2E テスト
 * PlanMaker の基本動作を確認
 */

test.describe('PlanMaker - 基本動作', () => {
  test('トップページが正しく表示される', async ({ page }) => {
    // Arrange & Act
    await page.goto('/');

    // Assert
    await expect(page).toHaveTitle(/PlanMaker/i);
  });

  test('ダッシュボードにアクセスできる', async ({ page }) => {
    // Arrange & Act
    await page.goto('/');

    // Assert - ダッシュボードの要素が表示されることを確認
    await expect(page.locator('h1, h2')).toBeVisible();
  });
});
