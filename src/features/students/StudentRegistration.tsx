import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { db } from "@/db/db";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import { studentFormSchema, type StudentFormData } from "@/lib/validators";
import {
    SUBJECTS,
    SCHOOL_TYPE_LABELS,
    GRADES_BY_SCHOOL,
    GOAL_TYPE_LABELS,
} from "@/lib/constants";
import type { SchoolType, GoalType } from "@/db/db";

export function StudentRegistration() {
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        control,
        formState: { errors },
    } = useForm<StudentFormData>({
        resolver: zodResolver(studentFormSchema) as any,
        defaultValues: {
            studentId: "",
            name: "",
            grade: "",
            schoolType: "JuniorHigh",
            subjects: [],
            goals: [
                {
                    type: "RegularTest",
                    targetDate: new Date().toISOString().split("T")[0],
                    description: "",
                },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "goals",
    });

    const schoolType = watch("schoolType");
    const subjects = watch("subjects");

    const onSubmit = async (data: StudentFormData) => {
        try {
            await db.students.add({
                id: uuidv4(),
                studentId: data.studentId,
                name: data.name,
                grade: data.grade,
                schoolType: data.schoolType,
                goals: data.goals.map((g) => ({
                    ...g,
                    targetDate: new Date(g.targetDate),
                })),
                subjects: data.subjects,
            });
            navigate("/students");
        } catch (error) {
            console.error("Failed to register student:", error);
            alert("登録に失敗しました");
        }
    };

    const toggleSubject = (subject: string) => {
        const current = subjects || [];
        if (current.includes(subject)) {
            setValue(
                "subjects",
                current.filter((s) => s !== subject),
                { shouldValidate: true }
            );
        } else {
            setValue("subjects", [...current, subject], { shouldValidate: true });
        }
    };

    const gradeOptions = GRADES_BY_SCHOOL[schoolType] || [];

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>新規生徒登録</CardTitle>
                    <CardDescription>
                        新しい生徒の基本情報を入力してください。
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
                                <p className="text-sm text-destructive">{errors.studentId.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">氏名</Label>
                            <Input
                                id="name"
                                placeholder="例: 山田 太郎"
                                {...register("name")}
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">{errors.name.message}</p>
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
                                        {(Object.keys(SCHOOL_TYPE_LABELS) as SchoolType[]).map((key) => (
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
                                    onValueChange={(value) => setValue("grade", value, { shouldValidate: true })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="選択してください" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {gradeOptions.map((g) => (
                                            <SelectItem key={g.value} value={g.value}>
                                                {g.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.grade && (
                                    <p className="text-sm text-destructive">{errors.grade.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>受講科目</Label>
                            <div className="flex flex-wrap gap-4 mt-2">
                                {SUBJECTS.map((subject) => (
                                    <div key={subject} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`subject-${subject}`}
                                            checked={subjects?.includes(subject) || false}
                                            onCheckedChange={() => toggleSubject(subject)}
                                        />
                                        <label
                                            htmlFor={`subject-${subject}`}
                                            className="text-sm font-medium leading-none"
                                        >
                                            {subject}
                                        </label>
                                    </div>
                                ))}
                            </div>
                            {errors.subjects && (
                                <p className="text-sm text-destructive">{errors.subjects.message}</p>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>目標</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        append({
                                            type: "RegularTest",
                                            targetDate: new Date().toISOString().split("T")[0],
                                            description: "",
                                        })
                                    }
                                >
                                    <Plus className="mr-1 h-3 w-3" />
                                    追加
                                </Button>
                            </div>
                            {fields.map((field, index) => (
                                <Card key={field.id} className="p-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">目標 {index + 1}</span>
                                            {fields.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-destructive"
                                                    onClick={() => remove(index)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <Label className="text-xs">種別</Label>
                                                <Select
                                                    value={watch(`goals.${index}.type`)}
                                                    onValueChange={(value: GoalType) =>
                                                        setValue(`goals.${index}.type`, value)
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {(Object.keys(GOAL_TYPE_LABELS) as GoalType[]).map((key) => (
                                                            <SelectItem key={key} value={key}>
                                                                {GOAL_TYPE_LABELS[key]}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs">目標期日</Label>
                                                <Input
                                                    type="date"
                                                    {...register(`goals.${index}.targetDate`)}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="col-span-2 space-y-1">
                                                <Label className="text-xs">説明</Label>
                                                <Input
                                                    placeholder="例: 次の定期テストで80点以上"
                                                    {...register(`goals.${index}.description`)}
                                                />
                                                {errors.goals?.[index]?.description && (
                                                    <p className="text-xs text-destructive">
                                                        {errors.goals[index]?.description?.message}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs">目標点数</Label>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    max={100}
                                                    placeholder="任意"
                                                    {...register(`goals.${index}.targetScore`, { valueAsNumber: true })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                            {errors.goals && !Array.isArray(errors.goals) && (
                                <p className="text-sm text-destructive">{errors.goals.message}</p>
                            )}
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate("/students")}
                            >
                                キャンセル
                            </Button>
                            <Button type="submit">登録</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
