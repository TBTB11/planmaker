import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { generateCurriculum } from "@/lib/ai/generateCurriculum";
import { AIConfidenceBadge } from "../components/AIConfidenceBadge";
import { ProposedUnitList } from "../components/ProposedUnitList";
import type { WizardStudentData } from "../useSetupWizard";
import type { ProposedUnit } from "@/lib/ai/types";

interface StepCurriculumProposalProps {
    studentData: WizardStudentData;
    isSubmitting: boolean;
    onConfirm: (units: ProposedUnit[]) => void;
    onBack: () => void;
}

export function StepCurriculumProposal({
    studentData,
    isSubmitting,
    onConfirm,
    onBack,
}: StepCurriculumProposalProps) {
    const proposal = useMemo(
        () =>
            generateCurriculum(
                studentData.grade,
                studentData.schoolType,
                studentData.subjects
            ),
        [studentData.grade, studentData.schoolType, studentData.subjects]
    );

    const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
        () => new Set(proposal.units.map((_, i) => i))
    );

    const handleToggle = (index: number) => {
        setSelectedIndices((prev) => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    };

    const handleSelectAll = () => {
        setSelectedIndices(new Set(proposal.units.map((_, i) => i)));
    };

    const handleDeselectAll = () => {
        setSelectedIndices(new Set());
    };

    const handleConfirm = () => {
        const confirmed = proposal.units.filter((_, i) =>
            selectedIndices.has(i)
        );
        onConfirm(confirmed);
    };

    if (proposal.units.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>カリキュラム提案</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        選択された学年・科目の組み合わせに対応するカリキュラムテンプレートがまだありません。
                        セットアップ完了後、手動でカリキュラムを追加してください。
                    </p>
                    <div className="flex justify-between">
                        <Button variant="outline" onClick={onBack}>
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            戻る
                        </Button>
                        <Button onClick={() => onConfirm([])} disabled={isSubmitting}>
                            {isSubmitting ? "登録中..." : "スキップして完了"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    カリキュラム提案
                    <AIConfidenceBadge
                        confidence={proposal.overallConfidence}
                    />
                </CardTitle>
                <CardDescription>
                    AIが学習指導要領をベースにカリキュラムを提案しました。
                    不要な単元のチェックを外してください。
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <ProposedUnitList
                    units={proposal.units}
                    selectedIndices={selectedIndices}
                    onToggle={handleToggle}
                    onSelectAll={handleSelectAll}
                    onDeselectAll={handleDeselectAll}
                />

                <p className="text-sm text-muted-foreground">
                    {selectedIndices.size} / {proposal.units.length}{" "}
                    単元を選択中
                </p>

                <div className="flex justify-between">
                    <Button variant="outline" onClick={onBack}>
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        戻る
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={selectedIndices.size === 0 || isSubmitting}
                    >
                        {isSubmitting ? (
                            "登録中..."
                        ) : (
                            <>
                                <CheckCircle className="mr-1 h-4 w-4" />
                                確定して登録
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
