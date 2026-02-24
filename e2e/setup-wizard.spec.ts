import { test, expect } from '@playwright/test';

/**
 * セットアップウィザードの E2E テスト
 * US-01: 初回セットアップウィザード
 * US-02: AIカリキュラム提案
 * US-03: AI目標日提案
 */

test.describe('セットアップウィザード', () => {
  test.beforeEach(async ({ page }) => {
    // IndexedDB をクリアして初回ユーザーをシミュレート
    await page.goto('/');
    await page.evaluate(() => indexedDB.deleteDatabase('PlanMakerDB'));
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('生徒0件時にダッシュボードにセットアップCTAが表示される', async ({ page }) => {
    await expect(page.getByText('PlanMaker へようこそ！')).toBeVisible();
    await expect(page.getByText('ガイド付きセットアップ')).toBeVisible();
  });

  test('セットアップウィザードページに遷移できる', async ({ page }) => {
    await page.click('text=ガイド付きセットアップ');
    await expect(page).toHaveURL('/setup');
    await expect(page.getByText('セットアップウィザード')).toBeVisible();
    await expect(page.getByText('生徒情報の入力')).toBeVisible();
  });

  test('Step 1: 必須項目未入力で次へ進めない', async ({ page }) => {
    await page.goto('/setup');

    // 何も入力せずに「次へ」をクリック
    await page.click('button:has-text("次へ")');

    // エラーメッセージが表示される
    await expect(page.getByText('生徒IDを入力してください')).toBeVisible();
  });

  test('Step 1: 生徒情報を入力して次へ進める', async ({ page }) => {
    await page.goto('/setup');

    // 生徒ID入力
    await page.fill('input#studentId', 'S001');

    // 科目選択（数学にチェック）
    await page.click('label[for="wizard-subject-数学"]');

    // 学年選択
    await page.click('[role="combobox"]:near(:text("学年"))');
    await page.click('[role="option"]:has-text("中2")');

    // 次へ
    await page.click('button:has-text("次へ")');

    // Step 2 に遷移
    await expect(page.getByText('目標の設定')).toBeVisible();
  });

  test('Step 2: AI目標日提案が表示される (US-03)', async ({ page }) => {
    await page.goto('/setup');

    // Step 1 を完了
    await page.fill('input#studentId', 'S001');
    await page.click('label[for="wizard-subject-数学"]');
    await page.click('[role="combobox"]:near(:text("学年"))');
    await page.click('[role="option"]:has-text("中2")');
    await page.click('button:has-text("次へ")');

    // AI提案が表示される
    await expect(page.getByText('AI提案')).toBeVisible();
    await expect(page.getByText('適用')).toBeVisible();
  });

  test('Step 2: 戻るボタンでStep 1に戻れる', async ({ page }) => {
    await page.goto('/setup');

    // Step 1 を完了
    await page.fill('input#studentId', 'S001');
    await page.click('label[for="wizard-subject-数学"]');
    await page.click('[role="combobox"]:near(:text("学年"))');
    await page.click('[role="option"]:has-text("中2")');
    await page.click('button:has-text("次へ")');

    // 戻る
    await page.click('button:has-text("戻る")');
    await expect(page.getByText('生徒情報の入力')).toBeVisible();
  });

  test('Step 3: AIカリキュラム提案が表示される (US-02)', async ({ page }) => {
    await page.goto('/setup');

    // Step 1
    await page.fill('input#studentId', 'S001');
    await page.click('label[for="wizard-subject-数学"]');
    await page.click('[role="combobox"]:near(:text("学年"))');
    await page.click('[role="option"]:has-text("中2")');
    await page.click('button:has-text("次へ")');

    // Step 2
    await page.click('button:has-text("適用")');
    await page.fill('input#description', '次の定期テストで80点以上');
    await page.click('button:has-text("次へ")');

    // Step 3 - カリキュラム提案が表示される
    await expect(page.getByText('カリキュラム提案')).toBeVisible();
    await expect(page.getByText('全選択')).toBeVisible();
    await expect(page.getByText('式の計算')).toBeVisible(); // J2数学の最初の単元
  });

  test('全フロー: セットアップ完了後ダッシュボードに生徒が表示される', async ({ page }) => {
    await page.goto('/setup');

    // Step 1
    await page.fill('input#studentId', 'S001');
    await page.click('label[for="wizard-subject-数学"]');
    await page.click('[role="combobox"]:near(:text("学年"))');
    await page.click('[role="option"]:has-text("中2")');
    await page.click('button:has-text("次へ")');

    // Step 2
    await page.click('button:has-text("適用")');
    await page.fill('input#description', '次の定期テストで80点以上');
    await page.click('button:has-text("次へ")');

    // Step 3 - 確定
    await page.click('button:has-text("確定して登録")');

    // Step 4 - 完了
    await expect(page.getByText('セットアップ完了！')).toBeVisible();
    await expect(page.getByText('S001')).toBeVisible();

    // ダッシュボードへ
    await page.click('button:has-text("ダッシュボードへ")');
    await expect(page).toHaveURL('/');
    await expect(page.getByText('S001')).toBeVisible();
  });
});
