# E2E テストガイド

## 概要

PlanMaker では [Playwright](https://playwright.dev/) を使用して E2E（エンドツーエンド）テストを実施します。

## テスト方針

### テスト対象

**クリティカルパスのみ**に焦点を当てます：

1. **主要なユーザーフロー**
   - 生徒登録 → 詳細表示
   - カリキュラム作成 → 編集 → 保存
   - ダッシュボードでの統計確認

2. **Phase 別の重要機能**
   - Phase A: 生徒管理、カリキュラムエディタ
   - Phase B: 授業記録、スケジュール
   - Phase C: 進捗追跡、アラート
   - Phase D: データ管理

3. **統合テストでカバーできない部分**
   - ページ遷移
   - UI の表示/非表示
   - レスポンシブデザイン

### テスト対象外

- 単純な表示確認（ユニットテストで対応）
- 細かいバリデーション（統合テストで対応）
- 全てのエッジケース（コストが高い）

## ディレクトリ構成

```
e2e/
├── dashboard.spec.ts       # ダッシュボードのテスト
├── students.spec.ts        # 生徒管理のテスト
├── curriculum.spec.ts      # カリキュラム管理のテスト（Phase A 完了後）
├── class-records.spec.ts   # 授業記録のテスト（Phase B）
└── helpers/                # テスト用ヘルパー関数
    ├── navigation.ts       # ナビゲーション補助
    └── test-data.ts        # テストデータ生成
```

## テストの書き方

### 基本パターン

```typescript
import { test, expect } from '@playwright/test';

test.describe('機能名', () => {
  test.beforeEach(async ({ page }) => {
    // 各テストの前処理
    await page.goto('/');
  });

  test('テストケース名（何をしたら何が起きるか）', async ({ page }) => {
    // Arrange - 準備
    await page.goto('/students');

    // Act - 実行
    await page.click('a[href="/students/new"]');

    // Assert - 検証
    await expect(page).toHaveURL('/students/new');
  });
});
```

### 命名規則

- **describe**: 機能名（例: `生徒管理`、`カリキュラムエディタ`）
- **test**: 日本語で「〜できる」「〜が表示される」形式

### セレクタの優先順位

1. **role + name**: `page.getByRole('button', { name: '保存' })`
2. **label**: `page.getByLabel('生徒番号')`
3. **test-id**: `page.getByTestId('student-form')`（必要に応じて）
4. **CSS セレクタ**: 最終手段

### データ依存テストの扱い

```typescript
test('ダッシュボードから生徒詳細に遷移できる', async ({ page }) => {
  await page.goto('/');

  const studentLinks = page.locator('a[href^="/students/"]').first();
  const hasStudents = await studentLinks.count() > 0;

  if (hasStudents) {
    await studentLinks.click();
    await expect(page.url()).toMatch(/\/students\/.+/);
  } else {
    // データがない場合はスキップ
    test.skip();
  }
});
```

### データ登録を伴うテスト

実際のデータベースに影響を与えるテストは **skip** にし、必要時のみ実行：

```typescript
test.skip('生徒を新規登録できる（統合テスト）', async ({ page }) => {
  // 実装
});
```

## テスト実行コマンド

### 基本的な実行

```bash
# ヘッドレスモードで全テスト実行
npm run test:e2e

# UI モードで実行（推奨）
npm run test:e2e:ui

# ブラウザを表示して実行
npm run test:e2e:headed

# デバッグモード
npm run test:e2e:debug

# レポートを表示
npm run test:e2e:report
```

### 特定のテストのみ実行

```bash
# ファイル指定
npx playwright test students.spec.ts

# テスト名でフィルタ
npx playwright test --grep "生徒登録"
```

## CI/CD での実行

### GitHub Actions での設定例

```yaml
- name: Install Playwright Browsers
  run: npx playwright install --with-deps chromium

- name: Run E2E tests
  run: npm run test:e2e

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## ベストプラクティス

### 1. テストの独立性

各テストは独立して実行可能であること：

```typescript
// ❌ 悪い例：前のテストに依存
test('生徒を登録する', async ({ page }) => { /* ... */ });
test('登録した生徒を確認する', async ({ page }) => { /* ... */ });

// ✅ 良い例：各テストで準備
test('生徒を登録する', async ({ page }) => {
  await page.goto('/students/new');
  // テストロジック
});

test('生徒詳細が表示される', async ({ page }) => {
  // テストデータを用意してから確認
  await page.goto('/students/TEST001');
  // テストロジック
});
```

### 2. 待機の扱い

```typescript
// ❌ 悪い例：固定時間待機
await page.waitForTimeout(3000);

// ✅ 良い例：要素の表示を待つ
await page.waitForSelector('button[type="submit"]');
await expect(page.getByRole('button', { name: '保存' })).toBeVisible();
```

### 3. スクリーンショットとトレース

失敗時のデバッグに役立つ設定は `playwright.config.ts` で有効化済み：

- `screenshot: 'only-on-failure'`
- `trace: 'on-first-retry'`

## トラブルシューティング

### テストが不安定（flaky）

1. **適切な待機を追加**
   ```typescript
   await expect(page.getByText('保存しました')).toBeVisible();
   ```

2. **レースコンディションを避ける**
   ```typescript
   await page.waitForLoadState('networkidle');
   ```

### 要素が見つからない

1. **UI モードでデバッグ**
   ```bash
   npm run test:e2e:ui
   ```

2. **セレクタを確認**
   ```typescript
   // Playwright Inspector で要素を特定
   await page.pause();
   ```

## 参考リンク

- [Playwright 公式ドキュメント](https://playwright.dev/)
- [Best Practices - Playwright](https://playwright.dev/docs/best-practices)
- [test-strategy スキル](./.claude/skills/test-strategy/SKILL.md)
