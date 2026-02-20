import { z } from "zod";

export const goalSchema = z.object({
    type: z.enum(["Exam", "RegularTest", "OvercomingWeakness", "Advanced"]),
    targetDate: z.string().min(1, "目標期日を入力してください"),
    targetScore: z.number().min(0).max(100).optional(),
    description: z.string().min(1, "目標の説明を入力してください"),
});

export const studentFormSchema = z.object({
    studentId: z.string().min(1, "生徒IDを入力してください"),
    name: z.string().min(1, "氏名を入力してください"),
    grade: z.string().min(1, "学年を選択してください"),
    schoolType: z.enum(["Elementary", "JuniorHigh", "HighSchool"]),
    subjects: z.array(z.string()).min(1, "科目を1つ以上選択してください"),
    goals: z.array(goalSchema).min(1, "目標を1つ以上設定してください"),
});

export type StudentFormData = z.infer<typeof studentFormSchema>;
export type GoalFormData = z.infer<typeof goalSchema>;

export const unitStatusUpdateSchema = z.object({
    unitId: z.string().min(1),
    newStatus: z.enum([
        "NotStarted", "Introduced", "Practicing",
        "WaitingConfirmation", "Completed", "NeedsReview", "OnHold"
    ]),
});

export const classRecordFormSchema = z.object({
    date: z.string().min(1, "授業日を入力してください"),
    unitIds: z.array(z.string()).min(1, "実施した単元を1つ以上選択してください"),
    unitStatusUpdates: z.array(unitStatusUpdateSchema),
    understanding: z.number().min(1, "理解度を選択してください").max(5),
    studentMood: z.string().max(500).optional(),
    nextClassPlan: z.string().optional(),
    homeworkAssigned: z.string().max(500).optional(),
});

export type ClassRecordFormData = z.infer<typeof classRecordFormSchema>;
export type UnitStatusUpdateData = z.infer<typeof unitStatusUpdateSchema>;
