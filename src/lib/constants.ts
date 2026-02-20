import type { GoalType, SchoolType, UnitStatus } from "@/db/db";

export const SUBJECTS = ["数学", "英語", "国語", "理科", "社会"] as const;

export const SCHOOL_TYPE_LABELS: Record<SchoolType, string> = {
    Elementary: "小学校",
    JuniorHigh: "中学校",
    HighSchool: "高校",
};

export const GRADES_BY_SCHOOL: Record<SchoolType, { value: string; label: string }[]> = {
    Elementary: [
        { value: "E1", label: "小1" },
        { value: "E2", label: "小2" },
        { value: "E3", label: "小3" },
        { value: "E4", label: "小4" },
        { value: "E5", label: "小5" },
        { value: "E6", label: "小6" },
    ],
    JuniorHigh: [
        { value: "J1", label: "中1" },
        { value: "J2", label: "中2" },
        { value: "J3", label: "中3" },
    ],
    HighSchool: [
        { value: "H1", label: "高1" },
        { value: "H2", label: "高2" },
        { value: "H3", label: "高3" },
    ],
};

export const UNIT_STATUS_LABELS: Record<UnitStatus, string> = {
    NotStarted: "未着手",
    Introduced: "導入済み",
    Practicing: "演習中",
    WaitingConfirmation: "定着確認待ち",
    Completed: "完了",
    NeedsReview: "要復習",
    OnHold: "保留",
};

export const UNIT_STATUS_COLORS: Record<UnitStatus, string> = {
    NotStarted: "bg-gray-100 text-gray-700",
    Introduced: "bg-blue-100 text-blue-700",
    Practicing: "bg-yellow-100 text-yellow-700",
    WaitingConfirmation: "bg-purple-100 text-purple-700",
    Completed: "bg-green-100 text-green-700",
    NeedsReview: "bg-red-100 text-red-700",
    OnHold: "bg-gray-200 text-gray-500",
};

export const GOAL_TYPE_LABELS: Record<GoalType, string> = {
    Exam: "受験",
    RegularTest: "定期テスト",
    OvercomingWeakness: "苦手克服",
    Advanced: "先取り学習",
};

export const UNDERSTANDING_LABELS: Record<number, string> = {
    1: "理解不足",
    2: "やや不安",
    3: "普通",
    4: "概ね理解",
    5: "完全理解",
};

export const NEXT_STATUS_SUGGESTION: Partial<Record<UnitStatus, UnitStatus>> = {
    NotStarted: "Introduced",
    Introduced: "Practicing",
    Practicing: "WaitingConfirmation",
    WaitingConfirmation: "Completed",
    NeedsReview: "Practicing",
};
