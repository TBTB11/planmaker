import { Sparkles } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { AIConfidenceBadge } from "./AIConfidenceBadge";
import type { ProposedUnit } from "@/lib/ai/types";

interface ProposedUnitListProps {
    units: ProposedUnit[];
    selectedIndices: Set<number>;
    onToggle: (index: number) => void;
    onSelectAll: () => void;
    onDeselectAll: () => void;
}

export function ProposedUnitList({
    units,
    selectedIndices,
    onToggle,
    onSelectAll,
    onDeselectAll,
}: ProposedUnitListProps) {
    const groupedBySubject = units.reduce<
        Record<string, { unit: ProposedUnit; originalIndex: number }[]>
    >((acc, unit, index) => {
        if (!acc[unit.subject]) {
            acc[unit.subject] = [];
        }
        acc[unit.subject].push({ unit, originalIndex: index });
        return acc;
    }, {});

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onSelectAll}
                >
                    全選択
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onDeselectAll}
                >
                    全解除
                </Button>
            </div>

            {Object.entries(groupedBySubject).map(([subject, items]) => (
                <div key={subject} className="space-y-2">
                    <h4 className="text-sm font-semibold">{subject}</h4>
                    <div className="space-y-2">
                        {items.map(({ unit, originalIndex }) => (
                            <div
                                key={originalIndex}
                                className="flex items-center gap-3 rounded-lg border border-dashed p-3"
                            >
                                <Checkbox
                                    checked={selectedIndices.has(originalIndex)}
                                    onCheckedChange={() => onToggle(originalIndex)}
                                />
                                <Sparkles className="h-4 w-4 shrink-0 text-yellow-500" />
                                <div className="flex-1 min-w-0">
                                    <span className="text-sm font-medium">
                                        {unit.name}
                                    </span>
                                    <span className="ml-2 text-xs text-muted-foreground">
                                        {unit.estimatedSessions}コマ
                                    </span>
                                </div>
                                <AIConfidenceBadge confidence={unit.confidence} />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
