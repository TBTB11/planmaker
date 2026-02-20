import { test, expect } from '@playwright/test';

/**
 * 生徒管理機能の E2E テスト
 * Phase A: 生徒一覧、登録、詳細表示のクリティカルパスをテスト
 */

test.describe('生徒管理', () => {
  test.beforeEach(async ({ page }) => {
    // 各テストの前にトップページにアクセス
    await page.goto('/');
  });

  test('生徒一覧ページに遷移できる', async ({ page }) => {
    // Arrange & Act
    await page.click('a[href="/students"]');

    // Assert
    await expect(page).toHaveURL('/students');
    await expect(page.getByRole('heading', { name: /生徒一覧/i })).toBeVisible();
  });

  test('新規生徒登録ページに遷移できる', async ({ page }) => {
    // Arrange
    await page.goto('/students');

    // Act
    await page.click('a[href="/students/new"]');

    // Assert
    await expect(page).toHaveURL('/students/new');
    await expect(page.getByRole('heading', { name: /生徒登録/i })).toBeVisible();
  });

  test('生徒登録フォームが表示される', async ({ page }) => {
    // Arrange & Act
    await page.goto('/students/new');

    // Assert - フォームの主要フィールドが表示されることを確認
    await expect(page.getByLabel(/生徒番号/i)).toBeVisible();
    await expect(page.getByLabel(/学年/i)).toBeVisible();
    await expect(page.getByLabel(/志望校/i)).toBeVisible();
  });

  test.skip('生徒を新規登録できる（統合テスト）', async ({ page }) => {
    // このテストは実際のデータ登録を伴うため、スキップ
    // 必要に応じて有効化

    await page.goto('/students/new');

    // フォーム入力
    await page.fill('input[name="studentNumber"]', 'TEST001');
    await page.selectOption('select[name="grade"]', '中学3年');
    await page.fill('input[name="targetSchool"]', 'テスト高校');

    // 送信
    await page.click('button[type="submit"]');

    // 一覧ページにリダイレクトされることを確認
    await expect(page).toHaveURL('/students');
  });

  test('ダッシュボードから生徒詳細に遷移できる', async ({ page }) => {
    // Arrange
    await page.goto('/');

    // Act - ダッシュボードに生徒リンクがある場合クリック
    const studentLinks = page.locator('a[href^="/students/"]').first();
    const hasStudents = await studentLinks.count() > 0;

    if (hasStudents) {
      await studentLinks.click();

      // Assert
      await expect(page.url()).toMatch(/\/students\/.+/);
    } else {
      // 生徒データがない場合はテストをスキップ
      test.skip();
    }
  });
});
