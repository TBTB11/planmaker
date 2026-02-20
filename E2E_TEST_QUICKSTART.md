# E2E テスト クイックスタート

## セットアップ完了✅

Playwright による E2E テスト環境が正常にセットアップされました。

## テストの実行方法

### 1. UI モードで実行（推奨）

```bash
npm run test:e2e:ui
```

インタラクティブな UI でテストを実行・デバッグできます。初めて実行する際はこちらがおすすめです。

### 2. ヘッドレスモードで実行

```bash
npm run test:e2e
```

バックグラウンドで全テストを実行します（CI/CD での実行方法）。

### 3. ブラウザを表示して実行

```bash
npm run test:e2e:headed
```

実際のブラウザでテストの動作を確認できます。

### 4. デバッグモード

```bash
npm run test:e2e:debug
```

ステップ実行でデバッグできます。

### 5. レポート表示

```bash
npm run test:e2e:report
```

テスト実行後のレポートを HTML で確認できます。

## テストファイル

現在実装されているテスト：

- `e2e/example.spec.ts` - 基本動作の確認
- `e2e/dashboard.spec.ts` - ダッシュボード機能
- `e2e/students.spec.ts` - 生徒管理機能

## 詳細ドキュメント

より詳しい情報は以下を参照してください：

- [E2E テストガイド](./docs/references/04_E2E_TESTING.md)
- [Playwright 公式ドキュメント](https://playwright.dev/)

## 次のステップ

1. **UI モードで試す**: `npm run test:e2e:ui` を実行
2. **テストを追加**: Phase B の機能（授業記録、スケジュール）のテストを作成
3. **CI/CD 統合**: GitHub Actions でテストを自動実行

---

**注意**: テスト実行時は開発サーバー（`npm run dev`）が自動的に起動されます。
