# PlanMaker — AI開発ガイド

個別指導塾の講師向け学習計画管理ツール。ブラウザ内完結（ローカルファースト）。

## 技術スタック

- React 18 + TypeScript + Vite
- TailwindCSS + shadcn/ui (Radix UI) + Lucide Icons
- Zustand（状態管理）+ React Hook Form + Zod（バリデーション）
- Dexie.js（IndexedDB ラッパー、データ永続化）
- 詳細: `docs/planning/01_TECH_STACK.md`

## 現在のステータス

- **Phase A（完了）**: 基盤 + 生徒管理 + カリキュラムエディタ + ダッシュボード
- **Phase B（次）**: 授業記録 + スケジュール + AI基礎
- Phase C: 進捗追跡 + アラート + 保護者報告
- Phase D: データ管理 + 高度AI
- 進捗詳細: `docs/handbook/01_project_progress_summary.md`

## ドキュメントマップ — タスク別の参照先

### Step 1: 要件確認

1. `docs/planning/03_USER_STORIES_AND_FLOW.md` — 該当ユーザーストーリー（US-XX）を特定
2. `docs/references/01_FEATURE_SPECS.md` — ステータス定義、計算ロジック、アラート条件、AI補完仕様
3. `docs/references/03_INPUT_FIELDS.md` — フォームのフィールド仕様（型、バリデーション、例）
4. `docs/planning/02_DATA_MODEL.md` — データモデル（エンティティ、JSON Schema）

### Step 2: ブランチ作成

下記「ブランチ命名規則」に従い、masterから作成。

### Step 3: AI指示 → 実装

- 既存パターンを踏襲: `src/features/students/` のコンポーネント構造を参照
- DB スキーマ: `src/db/db.ts`
- バリデーション: `src/lib/validators.ts`（Zod スキーマ）
- セキュリティ: `docs/references/02_SECURITY_SPEC.md` Section 3 のテンプレートを遵守

### Step 4-5: 実装確認 → コードレビュー

- `docs/handbook/05_development_handbook.md` の Step 4-5 チェックリストに従う
- セキュリティ: `docs/references/02_SECURITY_SPEC.md` のリスク一覧を確認

### Step 6-7: コミット&PR → マージ

- `docs/handbook/05_development_handbook.md` の Step 6-7 に従う

## ブランチ命名規則

| プレフィックス | 用途 | 例 |
|-------------|------|-----|
| `feat/` | 新機能 | `feat/class-records` |
| `fix/` | バグ修正 | `fix/date-display-error` |
| `refactor/` | 内部改善 | `refactor/curriculum-editor` |
| `docs/` | ドキュメント | `docs/update-handbook` |

## コーディング規約

- **1ブランチ = 1機能**
- **外部API通信禁止**（ローカルファースト）
- **個人情報**: 生徒番号（ID）のみ使用。氏名等は本ツールでは扱わない
- **UI言語**: 日本語 / **コード言語**: 英語
- **コンポーネント配置**: `src/features/[機能名]/` 以下に配置
- **UI部品**: shadcn/ui を使用（独自CSS不可）
- **console.log**: デバッグ用のみ。コミット前に削除

## 開発フェーズ対応表

| Phase | テーマ | ユーザーストーリー |
|-------|-------|-----------------|
| A（完了） | 基盤 + 生徒詳細 | US-04, US-05, US-06, US-08, US-25 |
| B（次） | 授業記録 + スケジュール + AI基礎 | US-01, US-02, US-03, US-07, US-11, US-13, US-18, US-19, US-28 |
| C | 進捗追跡 + アラート + 保護者報告 | US-09, US-12, US-15, US-20, US-21, US-22, US-23 |
| D | データ管理 + 高度AI | US-10, US-14, US-16, US-17, US-24, US-26, US-27 |

## プロジェクト構造

```
src/
├── components/
│   ├── layout/          # Layout, Sidebar
│   └── ui/              # shadcn/ui コンポーネント
├── db/                  # Dexie DB スキーマ + シードデータ
├── features/            # 機能別モジュール
│   ├── dashboard/
│   └── students/        # Phase A 実装済み
├── lib/                 # ユーティリティ、バリデーション、定数
└── stores/              # Zustand ストア
```
