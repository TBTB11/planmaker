import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/db";

export type AISuggestionConfidence = "high" | "medium" | "low";

interface AISuggestionResult {
    suggestedUnitIds: string[];
    suggestedNextUnitId: string | null;
    confidence: AISuggestionConfidence;
    isLoading: boolean;
}

export function useAISuggestion(studentId: string): AISuggestionResult {
    const latestRecord = useLiveQuery(
        async () => {
            const records = await db.classRecords
                .where("studentId")
                .equals(studentId)
                .toArray();
            records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            return records[0] ?? null;
        },
        [studentId]
    );

    const units = useLiveQuery(
        () => db.units.where("studentId").equals(studentId).toArray(),
        [studentId]
    );

    if (latestRecord === undefined || units === undefined) {
        return {
            suggestedUnitIds: [],
            suggestedNextUnitId: null,
            confidence: "low",
            isLoading: true,
        };
    }

    // ロジック1: 前回記録の nextClassPlan が有効な Unit ID なら高信頼度で提案
    if (latestRecord && latestRecord.nextClassPlan) {
        const nextUnit = units.find((u) => u.id === latestRecord.nextClassPlan);
        if (nextUnit && nextUnit.status !== "Completed") {
            const practicing = units.filter((u) => u.status === "Practicing");
            const suggestedIds = practicing.length > 0
                ? practicing.map((u) => u.id)
                : [nextUnit.id];

            const sortedUnits = [...units].sort((a, b) => a.order - b.order);
            const nextIdx = sortedUnits.findIndex((u) => u.id === nextUnit.id);
            const nextNextUnit = sortedUnits.slice(nextIdx + 1).find(
                (u) => u.status !== "Completed"
            );

            return {
                suggestedUnitIds: suggestedIds,
                suggestedNextUnitId: nextNextUnit?.id ?? null,
                confidence: "high",
                isLoading: false,
            };
        }
    }

    // ロジック2: 演習中の単元を提案（中信頼度）
    const practicing = units.filter((u) => u.status === "Practicing");
    if (practicing.length > 0) {
        const sortedUnits = [...units].sort((a, b) => a.order - b.order);
        const lastPracticing = practicing.sort((a, b) => b.order - a.order)[0];
        const nextUnit = sortedUnits
            .filter((u) => u.order > lastPracticing.order && u.status !== "Completed")
            .sort((a, b) => a.order - b.order)[0];

        return {
            suggestedUnitIds: practicing.map((u) => u.id),
            suggestedNextUnitId: nextUnit?.id ?? null,
            confidence: "medium",
            isLoading: false,
        };
    }

    // ロジック3: 未着手のうち order 最小の単元（低信頼度）
    const sortedUnits = [...units].sort((a, b) => a.order - b.order);
    const firstNotStarted = sortedUnits.find((u) => u.status === "NotStarted");
    if (firstNotStarted) {
        const nextUnit = sortedUnits
            .filter((u) => u.order > firstNotStarted.order && u.status !== "Completed")
            .sort((a, b) => a.order - b.order)[0];

        return {
            suggestedUnitIds: [firstNotStarted.id],
            suggestedNextUnitId: nextUnit?.id ?? null,
            confidence: "low",
            isLoading: false,
        };
    }

    return {
        suggestedUnitIds: [],
        suggestedNextUnitId: null,
        confidence: "low",
        isLoading: false,
    };
}
