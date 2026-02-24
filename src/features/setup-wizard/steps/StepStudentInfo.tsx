import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight } from "lucide-react";
import {
    SUBJECTS,
    SCHOOL_TYPE_LABELS,
    GRADES_BY_SCHOOL,
} from "@/lib/constants";
import { wizardStep1Schema, type WizardStep1Data } from "@/lib/validators";
import type { SchoolType } from "@/db/db";
import type { WizardStudentData } from "../useSetupWizard";

interface StepStudentInfoProps {
    initialData: WizardStudentData | null;
    onNext: (data: WizardStudentData) => void;
}

export function StepStudentInfo({ initialData, onNext }: StepStudentInfoProps) {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<WizardStep1Data>({
        resolver: zodResolver(wizardStep1Schema) as any,
        defaultValues: {
            studentId: initialData?.studentId ?? "",
            schoolType: initialData?.schoolType ?? "JuniorHigh",
            grade: initialData?.grade ?? "",
            subjects: initialData?.subjects ?? [],
        },
    });

    const schoolType = watch("schoolType");
    const subjects = watch("subjects");
    const gradeOptions = GRADES_BY_SCHOOL[schoolType] || [];

    const toggleSubject = (subject: string) => {
        const current = subjects || [];
        if (current.includes(subject)) {
            setValue(
                "subjects",
                current.filter((s) => s !== subject),
                { shouldValidate: true }
            );
        } else {
            setValue("subjects", [...current, subject], {
                shouldValidate: true,
            });
        }
    };

    const onSubmit = (data: WizardStep1Data) => {
        onNext(data as WizardStudentData);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>生徒情報の入力</CardTitle>
                <CardDescription>
                    まずは担当する生徒の基本情報を入力しましょう。
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="studentId">生徒ID</Label>
                        <Input
                            id="studentId"
                            placeholder="例: S001"
                            {...register("studentId")}
                        />
                        {errors.studentId && (
                            <p className="text-sm text-destructive">
                                {errors.studentId.message}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>学校種別</Label>
                            <Select
                                value={schoolType}
                                onValueChange={(value: SchoolType) => {
                                    setValue("schoolType", value);
                                    setValue("grade", "");
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="選択してください" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(
                                        Object.keys(
                                            SCHOOL_TYPE_LABELS
                                        ) as SchoolType[]
                                    ).map((key) => (
                                        <SelectItem key={key} value={key}>
                                            {SCHOOL_TYPE_LABELS[key]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>学年</Label>
                            <Select
                                value={watch("grade")}
                                onValueChange={(value) =>
                                    setValue("grade", value, {
                                        shouldValidate: true,
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="選択してください" />
                                </SelectTrigger>
                                <SelectContent>
                                    {gradeOptions.map((g) => (
                                        <SelectItem
                                            key={g.value}
                                            value={g.value}
                                        >
                                            {g.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.grade && (
                                <p className="text-sm text-destructive">
                                    {errors.grade.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>受講科目</Label>
                        <div className="flex flex-wrap gap-4 mt-2">
                            {SUBJECTS.map((subject) => (
                                <div
                                    key={subject}
                                    className="flex items-center space-x-2"
                                >
                                    <Checkbox
                                        id={`wizard-subject-${subject}`}
                                        checked={
                                            subjects?.includes(subject) || false
                                        }
                                        onCheckedChange={() =>
                                            toggleSubject(subject)
                                        }
                                    />
                                    <label
                                        htmlFor={`wizard-subject-${subject}`}
                                        className="text-sm font-medium leading-none"
                                    >
                                        {subject}
                                    </label>
                                </div>
                            ))}
                        </div>
                        {errors.subjects && (
                            <p className="text-sm text-destructive">
                                {errors.subjects.message}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end">
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
