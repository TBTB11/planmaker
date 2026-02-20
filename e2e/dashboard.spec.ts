import { test, expect } from '@playwright/test';

/**
 * ダッシュボード機能の E2E テスト
 * Phase A: ダッシュボードの基本表示と統計情報の確認
 */

test.describe('ダッシュボード', () => {
  test('ダッシュボードが正しく表示される', async ({ page }) => {
    // Arrange & Act
    await page.goto('/');

    // Assert - ダッシュボードのタイトルまたは主要要素が表示される
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('サイドバーのナビゲーションが表示される', async ({ page }) => {
    // Arrange & Act
    await page.goto('/');

    // Assert - 主要なナビゲーションリンクが存在する
    await expect(page.getByRole('link', { name: /ダッシュボード/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /生徒管理/i })).toBeVisible();
  });

  test('全てのナビゲーションリンクが機能する', async ({ page }) => {
    // Arrange
    await page.goto('/');

    // Act & Assert - 各ページに遷移できることを確認
    const navLinks = [
      { name: /生徒管理/i, url: '/students' },
      { name: /一括計画/i, url: '/planning' },
      { name: /レポート/i, url: '/reports' },
      { name: /設定/i, url: '/settings' },
    ];

    for (const link of navLinks) {
      await page.click(`a[href="${link.url}"]`);
      await expect(page).toHaveURL(link.url);

      // ダッシュボードに戻る
      await page.click('a[href="/"]');
      await expect(page).toHaveURL('/');
    }
  });

  test('レスポンシブデザインが機能する', async ({ page }) => {
    // モバイル表示をテスト
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // モバイルでも主要要素が表示されることを確認
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
