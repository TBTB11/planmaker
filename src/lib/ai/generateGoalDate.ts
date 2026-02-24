import type { GoalType, SchoolType } from "@/db/db";
import type { GoalDateProposal } from "./types";
import { goalDateTemplates } from "./goalDateTemplates";

export function generateGoalDate(
    grade: string,
    schoolType: SchoolType,
    goalType: GoalType
): GoalDateProposal {
    const templates = goalDateTemplates[goalType]?.[schoolType]?.[grade];

    if (!templates || templates.length === 0) {
        if (goalType === "OvercomingWeakness") {
            const fallback = new Date();
            fallback.setMonth(fallback.getMonth() + 3);
            return {
                suggestedDate: fallback.toISOString().split("T")[0],
                confidence: "medium",
                reasoning:
                    "苦手克服には3ヶ月程度の集中的な学習期間が効果的です。",
            };
        }

        if (goalType === "Advanced") {
            const now = new Date();
            const nextApril = new Date(now.getFullYear(), 3, 1); // April 1
            if (nextApril <= now) {
                nextApril.setFullYear(nextApril.getFullYear() + 1);
            }
            return {
                suggestedDate: nextApril.toISOString().split("T")[0],
                confidence: "medium",
                reasoning:
                    "先取り学習は次の学年開始（4月）までの完了を目標としています。",
            };
        }

        const fallback = new Date();
        fallback.setMonth(fallback.getMonth() + 3);
        return {
            suggestedDate: fallback.toISOString().split("T")[0],
            confidence: "low",
            reasoning:
                "具体的な日程データがありません。3ヶ月後を仮の目標としています。",
        };
    }

    const now = new Date();
    const currentYear = now.getFullYear();

    for (const template of templates) {
        const candidateDate = new Date(
            currentYear,
            template.month - 1,
            template.day
        );
        if (candidateDate < now) {
            candidateDate.setFullYear(currentYear + 1);
        }
        return {
            suggestedDate: candidateDate.toISOString().split("T")[0],
            confidence: template.confidence,
            reasoning: template.reasoning,
        };
    }

    return {
        suggestedDate: new Date(currentYear, 2, 1).toISOString().split("T")[0],
        confidence: "low",
        reasoning: "日程を特定できませんでした。",
    };
}
