# セットアップウィザード — 新規ファイル解説ガイド

> **対象読者**: 非エンジニアからエンジニアを目指している方
> **前提知識**: HTML/CSS の基礎、JavaScript の変数・関数・配列が分かる程度
> **目的**: 今回追加されたファイルを読みながら、React + TypeScript の実践的なパターンを学ぶ

---

## 目次

1. [全体像 — ファイル一覧と役割](#1-全体像)
2. [レイヤー構造 — なぜファイルを分けるのか](#2-レイヤー構造)
3. [各ファイルの詳細解説](#3-各ファイルの詳細解説)
4. [重要な概念・パターン](#4-重要な概念パターン)
5. [用語集](#5-用語集)
6. [次のステップ](#6-次のステップ)

---

## 1. 全体像

今回のセットアップウィザード機能で追加・変更したファイルは以下の通りです。

### 新規作成ファイル（14ファイル）

```
src/lib/ai/                          ← 「AIロジック層」
├── types.ts                         ... 型の定義（データの形を決める設計図）
├── curriculumTemplates.ts           ... カリキュラムのテンプレートデータ
├── goalDateTemplates.ts             ... 目標日程のテンプレートデータ
├── generateCurriculum.ts            ... カリキュラム提案を生成する関数
└── generateGoalDate.ts              ... 目標日を提案する関数

src/features/setup-wizard/           ← 「UI層」
├── SetupWizard.tsx                  ... ウィザード全体の司令塔
├── useSetupWizard.ts                ... ウィザードの状態管理（カスタムフック）
├── components/
│   ├── AIConfidenceBadge.tsx         ... 信頼度バッジ（●●●高 / ●●○中 / ●○○低）
│   ├── WizardStepIndicator.tsx       ... ステップ進捗表示
│   └── ProposedUnitList.tsx          ... AI提案の単元リスト
└── steps/
    ├── StepStudentInfo.tsx            ... Step 1: 生徒情報入力フォーム
    ├── StepGoalSetting.tsx            ... Step 2: 目標設定 + AI日程提案
    ├── StepCurriculumProposal.tsx     ... Step 3: AIカリキュラム提案
    └── StepComplete.tsx               ... Step 4: 完了画面

e2e/setup-wizard.spec.ts             ← 「テスト」
```

### 変更したファイル（4ファイル）

| ファイル | 変更内容 |
|---------|---------|
| `src/lib/constants.ts` | AI信頼度の表示用ラベル・色を追加 |
| `src/lib/validators.ts` | ウィザード用のバリデーションスキーマを追加 |
| `src/db/db.ts` | 単元データに `aiProposed` `aiConfidence` フィールドを追加 |
| `src/App.tsx` | `/setup` ルートの追加とレイアウト構造の変更 |
| `src/features/dashboard/Dashboard.tsx` | 初回ユーザー向けウェルカム画面の追加 |

---

## 2. レイヤー構造

このプロジェクトでは、コードを**3つの層**に分けています。これは「関心の分離」と呼ばれる設計原則です。

```
┌─────────────────────────────────────┐
│  UI層（画面に表示するもの）           │  ← SetupWizard.tsx, Steps/, Components/
│  「ユーザーが見て触るもの」           │
├─────────────────────────────────────┤
│  ロジック層（計算・判断するもの）      │  ← generateCurriculum.ts, generateGoalDate.ts
│  「裏で動くビジネスルール」           │
├─────────────────────────────────────┤
│  データ層（保存・読み出し）           │  ← db.ts, curriculumTemplates.ts
│  「情報を保持する倉庫」              │
└─────────────────────────────────────┘
```

**なぜ分けるのか？**

- **読みやすさ**: 「画面を直したい」→ UI層だけ見ればいい。「計算が間違ってる」→ ロジック層だけ見ればいい
- **テストしやすさ**: ロジック層は画面がなくても単体でテストできる
- **再利用しやすさ**: `generateCurriculum` はウィザード以外の画面でも使える

---

## 3. 各ファイルの詳細解説

### 3.1 `src/lib/ai/types.ts` — 型定義

```typescript
export type AIConfidence = "high" | "medium" | "low";
```

**「型」とは何か？**

TypeScript の最大の特徴は「型」です。型とは「このデータはこういう形ですよ」という約束事です。

例えば `AIConfidence` 型は「`"high"` か `"medium"` か `"low"` のどれかしか入らない」という約束です。もし誤って `"hign"` とタイプミスしたら、TypeScript がビルド時にエラーを出してくれます。

```typescript
export interface ProposedUnit {
    name: string;          // 単元名（例: "連立方程式"）
    subject: string;       // 科目名（例: "数学"）
    estimatedSessions: number;  // 推定コマ数（例: 5）
    weight: number;        // 重み（例: 15）
    confidence: AIConfidence;   // 信頼度
}
```

`interface` は「オブジェクトの形」を定義します。`ProposedUnit` というデータは必ず上記の5つのプロパティを持つ、という約束です。

**学習ポイント**: 型定義ファイルは「他のすべてのファイルが参照する設計図」です。まず型を定義してから実装を始めるのが良い習慣です。

---

### 3.2 `src/lib/ai/curriculumTemplates.ts` — テンプレートデータ

このファイルは、学年×科目ごとの標準的なカリキュラムを**ハードコード**（直接コードに書き込み）しています。

```typescript
export const curriculumTemplates: CurriculumTemplateMap = {
    JuniorHigh: {         // 学校種別
        J2: {             // 学年
            "数学": {     // 科目
                source: "学習指導要領準拠",
                units: [
                    { name: "式の計算", estimatedSessions: 4, weight: 12, confidence: "high" },
                    // ...
                ],
            },
        },
    },
};
```

**なぜ外部APIではなくハードコードなのか？**

このアプリは「ローカルファースト」設計です。つまり：
- インターネット接続がなくても動く
- 個人情報が外部に送信されない
- レスポンスが即座（ネットワーク遅延ゼロ）

テンプレートデータは学習指導要領に基づく静的な情報なので、ハードコードが最適な選択です。

---

### 3.3 `src/lib/ai/generateCurriculum.ts` — 純粋関数

```typescript
export function generateCurriculum(
    grade: string,
    schoolType: SchoolType,
    subjects: string[]
): CurriculumProposal {
    // ...テンプレートからデータを検索して返す
}
```

**「純粋関数」とは何か？**

純粋関数には2つの特徴があります：

1. **同じ入力なら必ず同じ出力を返す**: `generateCurriculum("J2", "JuniorHigh", ["数学"])` は何回呼んでも同じ結果
2. **外部に影響を与えない**: データベースを書き換えたり、画面を変えたり、ネットワーク通信をしたりしない

純粋関数はテストが簡単で、バグが起きにくいため、ロジック層では積極的に使います。

---

### 3.4 `src/features/setup-wizard/useSetupWizard.ts` — カスタムフック

```typescript
export function useSetupWizard() {
    const [currentStep, setCurrentStep] = useState(0);
    const [studentData, setStudentData] = useState<WizardStudentData | null>(null);
    // ...
    return { currentStep, studentData, nextStep, prevStep, completeWizard, ... };
}
```

**「カスタムフック」とは何か？**

React のフック（`useState`, `useCallback` など）を組み合わせて、再利用可能なロジックにまとめたものが「カスタムフック」です。

`useSetupWizard` は以下を管理します：
- **現在のステップ番号** (`currentStep`): 0〜3 のどのステップにいるか
- **各ステップで入力されたデータ** (`studentData`, `goalData`): ステップ間でデータを引き継ぐ
- **ステップ移動関数** (`nextStep`, `prevStep`): 前後のステップに移動
- **完了処理** (`completeWizard`): データベースに書き込む

**なぜフックに切り出すのか？**

UIコンポーネント（`SetupWizard.tsx`）から「状態管理のロジック」を分離することで：
- `SetupWizard.tsx` は「画面の構造」に集中できる
- `useSetupWizard.ts` は「データの流れ」に集中できる

---

### 3.5 `src/features/setup-wizard/SetupWizard.tsx` — オーケストレーター

```typescript
export function SetupWizard() {
    const { currentStep, studentData, ... } = useSetupWizard();

    return (
        <div>
            <WizardStepIndicator currentStep={currentStep} />

            {currentStep === 0 && <StepStudentInfo ... />}
            {currentStep === 1 && <StepGoalSetting ... />}
            {currentStep === 2 && <StepCurriculumProposal ... />}
            {currentStep === 3 && <StepComplete ... />}
        </div>
    );
}
```

**「条件付きレンダリング」パターン**

`{currentStep === 0 && <StepStudentInfo />}` は「currentStep が 0 のときだけ StepStudentInfo を表示する」という意味です。これにより、1つのページ内でステップごとに異なる画面を切り替えています。

**「Props（プロップス）」によるデータの受け渡し**

各ステップコンポーネントに `studentData`, `onNext`, `onBack` などを渡しています。これが React の基本的なデータの流れです：
- **親 → 子**: Props でデータを渡す
- **子 → 親**: コールバック関数（`onNext` など）で結果を返す

---

### 3.6 `steps/StepStudentInfo.tsx` — フォームコンポーネント

```typescript
const {
    register,          // 入力フィールドをフォームに登録する関数
    handleSubmit,      // 送信時のハンドラー
    watch,             // フォームの値をリアルタイムに監視
    setValue,          // プログラムから値を設定
    formState: { errors },  // バリデーションエラー
} = useForm<WizardStep1Data>({
    resolver: zodResolver(wizardStep1Schema),  // Zodスキーマでバリデーション
});
```

**React Hook Form + Zod パターン**

このプロジェクトのすべてのフォームは、この組み合わせで作られています：

1. **Zod**: 「このフォームにはどんなデータが入るべきか」のルールを定義（`validators.ts`）
2. **React Hook Form**: フォームの状態管理（入力値の追跡、バリデーション実行、エラー表示）
3. **zodResolver**: Zod のルールを React Hook Form に接続するアダプタ

**具体的な流れ:**
```
ユーザーが入力 → React Hook Form が値を保持
     ↓
「次へ」ボタンクリック → handleSubmit が呼ばれる
     ↓
zodResolver が Zod スキーマで検証
     ↓
OK → onSubmit 関数が実行される
NG → errors オブジェクトにエラー情報が入る → 画面にエラー表示
```

---

### 3.7 `steps/StepGoalSetting.tsx` — AI提案の統合

```typescript
const aiProposal = useMemo(() => {
    return generateGoalDate(studentData.grade, studentData.schoolType, goalType);
}, [studentData.grade, studentData.schoolType, goalType]);
```

**`useMemo` とは何か？**

`useMemo` は「計算結果をキャッシュする」フックです。依存配列（`[studentData.grade, ...]`）の値が変わらない限り、前回の計算結果を再利用します。

この場合、`goalType` が変更されたときだけ `generateGoalDate` を再実行し、それ以外のレンダリングでは前回の結果を使い回します。

---

### 3.8 `steps/StepCurriculumProposal.tsx` — 選択状態の管理

```typescript
const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
    () => new Set(proposal.units.map((_, i) => i))
);
```

**`Set` とは何か？**

`Set` は「重複なしの値の集合」です。配列と違い、同じ値を2回追加しても1つしか保持されません。

ここでは「どのインデックスの単元が選択されているか」を管理しています。初期値は全単元が選択された状態（`new Set([0, 1, 2, ...])`）です。

`useState` の引数に **関数** を渡している点にも注目してください。これは「遅延初期化」と呼ばれるパターンで、初回レンダリング時にのみ実行されます。

---

### 3.9 `components/AIConfidenceBadge.tsx` — 小さな再利用コンポーネント

```typescript
export function AIConfidenceBadge({ confidence }: AIConfidenceBadgeProps) {
    return (
        <Badge variant="outline" className="gap-1">
            <span className={AI_CONFIDENCE_COLORS[confidence]}>
                {AI_CONFIDENCE_DOTS[confidence]}
            </span>
            <span className="text-xs">{AI_CONFIDENCE_LABELS[confidence]}</span>
        </Badge>
    );
}
```

**「Record ルックアップ」パターン**

`AI_CONFIDENCE_COLORS[confidence]` は、`confidence` の値（`"high"`, `"medium"`, `"low"`）に応じて対応するCSSクラスを取得しています。

```typescript
// constants.ts で定義済み
const AI_CONFIDENCE_COLORS = {
    high: "text-green-600",    // 緑
    medium: "text-yellow-600", // 黄
    low: "text-red-500",       // 赤
};
```

`if/else` の連鎖の代わりに `Record`（辞書型オブジェクト）を使うことで、コードが簡潔になります。

---

### 3.10 `components/ProposedUnitList.tsx` — リスト表示

```typescript
const groupedBySubject = units.reduce<Record<string, ...>>((acc, unit, index) => {
    if (!acc[unit.subject]) acc[unit.subject] = [];
    acc[unit.subject].push({ unit, originalIndex: index });
    return acc;
}, {});
```

**`reduce` とは何か？**

`reduce` は配列を別の形に変換するメソッドです。ここでは「フラットな単元配列」を「科目ごとにグループ化されたオブジェクト」に変換しています。

```
入力: [{ subject: "数学", name: "式の計算" }, { subject: "英語", name: "be動詞" }, { subject: "数学", name: "連立方程式" }]
  ↓ reduce
出力: {
    "数学": [{ name: "式の計算" }, { name: "連立方程式" }],
    "英語": [{ name: "be動詞" }]
}
```

---

### 3.11 `src/App.tsx` の変更 — ネストレイアウト

```typescript
// 変更前
<Router>
    <Layout>
        <Routes>
            <Route path="/" element={<Dashboard />} />
        </Routes>
    </Layout>
</Router>

// 変更後
<Router>
    <Routes>
        <Route path="/setup" element={<SetupWizard />} />  {/* Layout外 */}
        <Route element={<LayoutWrapper />}>                 {/* Layout内 */}
            <Route path="/" element={<Dashboard />} />
        </Route>
    </Routes>
</Router>
```

**なぜ変更したのか？**

ウィザードはサイドバーのない集中UIにしたいため、`Layout`（サイドバー付き）の**外**にルーティングしています。`Outlet` コンポーネントは「子ルートの中身をここに表示してね」という意味です。

---

### 3.12 `e2e/setup-wizard.spec.ts` — E2Eテスト

```typescript
test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => indexedDB.deleteDatabase('PlanMakerDB'));
    await page.reload();
});
```

**E2Eテストとは何か？**

E2E（End-to-End）テストは「ユーザーが実際にブラウザで操作するのと同じ手順」を自動化するテストです。Playwright というツールが仮想ブラウザを操作して、クリック・入力・確認を自動で行います。

`beforeEach` は「各テストの前に毎回実行する準備作業」です。ここではデータベースをクリアして、毎回「初めてのユーザー」と同じ状態からテストを始めています。

---

## 4. 重要な概念・パターン

### 4.1 コンポーネントの分割基準

| 分割の理由 | 例 |
|-----------|-----|
| **再利用される** | `AIConfidenceBadge` — Step 2 と Step 3 の両方で使う |
| **独立して変更される** | 各 Step コンポーネント — 1つのステップの変更が他に影響しない |
| **責務が異なる** | `useSetupWizard`（ロジック） vs `SetupWizard`（表示） |

### 4.2 Props の流れ（データフロー）

```
SetupWizard (親)
    │
    ├── studentData, onNext を渡す
    │       ↓
    ├── StepStudentInfo (子)
    │       └── onNext(data) で親にデータを返す
    │
    ├── studentData を StepGoalSetting にも渡す
    │       ↓
    └── StepGoalSetting (子)
            └── onNext(data) で親にデータを返す
```

React では**データは上から下に流れ、イベントは下から上に流れ**ます。これを「単方向データフロー」と呼びます。

### 4.3 バリデーションの仕組み

```
validators.ts (ルール定義)
    ↓
zodResolver (アダプタ)
    ↓
React Hook Form (フォーム管理)
    ↓
UI コンポーネント (エラー表示)
```

バリデーションルールは `validators.ts` に集約されています。これにより：
- ルールの変更が1箇所で済む
- 複数のフォームで同じルールを再利用できる

---

## 5. 用語集

| 用語 | 説明 |
|------|------|
| **コンポーネント** | UIの部品。ボタン、フォーム、カードなど。React ではJavaScript の関数として定義する |
| **Props** | 親コンポーネントから子コンポーネントに渡すデータ。HTMLの属性に似ている |
| **State** | コンポーネントが内部で保持するデータ。`useState` で管理する |
| **フック (Hook)** | `use` で始まる関数。React の機能（状態管理、副作用など）をコンポーネントで使うためのAPI |
| **カスタムフック** | 複数のフックを組み合わせて作った独自のフック（例: `useSetupWizard`） |
| **型 (Type)** | TypeScript でデータの形を定義するもの。`interface` や `type` で定義 |
| **純粋関数** | 同じ入力に対して常に同じ出力を返し、外部に影響を与えない関数 |
| **バリデーション** | ユーザーの入力値が正しいかチェックすること |
| **Zod スキーマ** | バリデーションルールを宣言的に定義するライブラリ |
| **ルーティング** | URLに応じてどのコンポーネントを表示するか決める仕組み |
| **E2Eテスト** | ユーザーの操作を模倣して、アプリ全体が正しく動くかテストする手法 |
| **レンダリング** | React がコンポーネントを実行して、画面に表示するHTMLを生成すること |
| **Record** | TypeScript の型。キーと値のペアを持つオブジェクト（辞書のようなもの） |
| **Set** | 重複なしの値の集合。配列と違い同じ値は1つしか持てない |
| **useMemo** | 計算結果をキャッシュするフック。依存値が変わらない限り再計算しない |
| **Outlet** | React Router の機能。ネストされたルートの子コンポーネントを表示する場所を指定する |

---

## 6. 次のステップ

このコードを理解したら、以下を試してみてください：

### レベル 1: 読んで理解する
- [ ] `generateCurriculum.ts` に「高校1年の数学」テンプレートを追加してみる
- [ ] `AIConfidenceBadge` の色を変えてみる（`constants.ts` を編集）

### レベル 2: 小さな変更をする
- [ ] `StepComplete.tsx` に「登録した科目」の情報も表示するように改造する
- [ ] `WizardStepIndicator` のデザインを変更してみる

### レベル 3: パターンを応用する
- [ ] 新しいステップ（例: 「保護者情報の入力」）を追加してみる
- [ ] `goalDateTemplates.ts` に小学校のテスト日程を追加してみる

### おすすめの学習リソース
- **React公式ドキュメント**: https://react.dev/learn — 「Thinking in React」から始めるのがおすすめ
- **TypeScript公式ハンドブック**: https://www.typescriptlang.org/docs/handbook/
- **Zod公式ドキュメント**: https://zod.dev — バリデーションの書き方
