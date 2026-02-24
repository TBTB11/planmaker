import type { GoalDateTemplate, GoalDateTemplateMap } from "./types";

// 中学校の定期テスト共通日程（5回: 中間×2 + 期末×2 + 学年末）
const JH_REGULAR_5: GoalDateTemplate[] = [
    { month: 5, day: 25, reasoning: "1学期中間テストは通常5月下旬に実施されます。", confidence: "high" },
    { month: 7, day: 1, reasoning: "1学期期末テストは通常6月末〜7月初旬に実施されます。", confidence: "high" },
    { month: 10, day: 15, reasoning: "2学期中間テストは通常10月中旬に実施されます。", confidence: "high" },
    { month: 11, day: 28, reasoning: "2学期期末テストは通常11月末に実施されます。", confidence: "high" },
    { month: 2, day: 20, reasoning: "学年末テストは通常2月下旬に実施されます。", confidence: "high" },
];

// 中3は学年末なし（4回）
const JH_REGULAR_4: GoalDateTemplate[] = JH_REGULAR_5.slice(0, 4);

// 高校の定期テスト共通日程（5回）
const HS_REGULAR_5: GoalDateTemplate[] = [
    { month: 5, day: 25, reasoning: "1学期中間テストは通常5月下旬に実施されます。", confidence: "high" },
    { month: 7, day: 1, reasoning: "1学期期末テストは通常7月初旬に実施されます。", confidence: "high" },
    { month: 10, day: 15, reasoning: "2学期中間テストは通常10月中旬に実施されます。", confidence: "high" },
    { month: 12, day: 1, reasoning: "2学期期末テストは通常12月初旬に実施されます。", confidence: "high" },
    { month: 2, day: 25, reasoning: "学年末テストは通常2月下旬に実施されます。", confidence: "high" },
];

// 高3は学年末なし（3回: 中間+期末+中間のみ）
const HS_REGULAR_3: GoalDateTemplate[] = HS_REGULAR_5.slice(0, 3);

export const goalDateTemplates: GoalDateTemplateMap = {
    Exam: {
        Elementary: {
            E6: [
                { month: 2, day: 1, reasoning: "中学受験は通常2月上旬に実施されます。", confidence: "high" },
            ],
        },
        JuniorHigh: {
            J3: [
                { month: 2, day: 10, reasoning: "私立高校入試は通常2月上旬〜中旬に実施されます。", confidence: "high" },
                { month: 3, day: 5, reasoning: "公立高校入試は通常3月上旬に実施されます。", confidence: "high" },
            ],
        },
        HighSchool: {
            H3: [
                { month: 1, day: 18, reasoning: "大学入学共通テストは通常1月中旬に実施されます。", confidence: "high" },
                { month: 2, day: 25, reasoning: "国公立大学前期試験は通常2月下旬に実施されます。", confidence: "high" },
            ],
        },
    },
    RegularTest: {
        Elementary: {},
        JuniorHigh: { J1: JH_REGULAR_5, J2: JH_REGULAR_5, J3: JH_REGULAR_4 },
        HighSchool: { H1: HS_REGULAR_5, H2: HS_REGULAR_5, H3: HS_REGULAR_3 },
    },
    OvercomingWeakness: {
        Elementary: {},
        JuniorHigh: {},
        HighSchool: {},
    },
    Advanced: {
        Elementary: {},
        JuniorHigh: {},
        HighSchool: {},
    },
};
