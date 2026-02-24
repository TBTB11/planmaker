import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { GOAL_TYPE_LABELS } from "@/lib/constants";
import { wizardGoalSchema } from "@/lib/validators";
import { generateGoalDate } from "@/lib/ai/generateGoalDate";
import { AIConfidenceBadge } from "../components/AIConfidenceBadge";
import type { GoalType } from "@/db/db";
import type { WizardStudentData, WizardGoalData } from "../useSetupWizard";

interface StepGoalSettingProps {
    studentData: WizardStudentData;
    initialData: WizardGoalData | null;
    onNext: (data: WizardGoalData) => void;
    onBack: () => void;
}

export function StepGoalSetting({
    studentData,
    initialData,
    onNext,
    onBack,
}: StepGoalSettingProps) {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<WizardGoalData>({
        resolver: zodResolver(wizardGoalSchema) as any,
        defaultValues: {
            goalType: initialData?.goalType ?? "RegularTest",
            targetDate: initialData?.targetDate ?? "",
            targetScore: initialData?.targetScore,
            description: initialData?.description ?? "",
        },
    });

    const goalType = watch("goalType");

    const aiProposal = useMemo(() => {
        return generateGoalDate(
            studentData.grade,
            studentData.schoolType,
            goalType
        );
    }, [studentData.grade, studentData.schoolType, goalType]);

    const applyAIDate = () => {
        setValue("targetDate", aiProposal.suggestedDate, {
            shouldValidate: true,
        });
    };

    const onSubmit = (data: WizardGoalData) => {
        onNext(data);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>目標の設定</CardTitle>
                <CardDescription>
                    学習の目標を設定しましょう。AIが目標日を提案します。
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <Label>目標タイプ</Label>
                        <Select
                            value={goalType}
                            onValueChange={(value: GoalType) =>
                                setValue("goalType", value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {(
                                    Object.keys(
                                        GOAL_TYPE_LABELS
                                    ) as GoalType[]
                                ).map((key) => (
                                    <SelectItem key={key} value={key}>
                                        {GOAL_TYPE_LABELS[key]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="rounded-lg border border-dashed p-4 space-y-2">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium">
                                AI提案
                            </span>
                            <AIConfidenceBadge
                                confidence={aiProposal.confidence}
                            />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {aiProposal.reasoning}
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">
                                推奨日: {aiProposal.suggestedDate}
                            </span>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={applyAIDate}
                            >
                                適用
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="targetDate">目標期日</Label>
                            <Input
                                id="targetDate"
                                type="date"
                                {...register("targetDate")}
                            />
                            {errors.targetDate && (
                                <p className="text-sm text-destructive">
                                    {errors.targetDate.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="targetScore">
                                目標点数（任意）
                            </Label>
                            <Input
                                id="targetScore"
                                type="number"
                                min={0}
                                max={100}
                                placeholder="例: 80"
                                {...register("targetScore")}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">目標の説明</Label>
                        <Input
                            id="description"
                            placeholder="例: 次の定期テストで80点以上"
                            {...register("description")}
                        />
                        {errors.description && (
                            <p className="text-sm text-destructive">
                                {errors.description.message}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-between">
                        <Button type="button" variant="outline" onClick={onBack}>
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            戻る
                        </Button>
                        <Button type="submit">
                            次へ
                            <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
