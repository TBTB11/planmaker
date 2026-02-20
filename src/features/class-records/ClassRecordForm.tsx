import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLiveQuery } from "dexie-react-hooks";
import { v4 as uuidv4 } from "uuid";
import { db, type UnitStatus } from "@/db/db";
import { classRecordFormSchema, type ClassRecordFormData } from "@/lib/validators";
import { UNDERSTANDING_LABELS, NEXT_STATUS_SUGGESTION } from "@/lib/constants";
import { useAISuggestion } from "./useAISuggestion";
import { UnitStatusUpdateRow } from "./UnitStatusUpdateRow";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { format } from "date-fns";

interface ClassRecordFormProps {
    studentId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ClassRecordForm({ studentId, open, onOpenChange }: ClassRecordFormProps) {
    const [optionalOpen, setOptionalOpen] = useState(false);
    const [aiSuggestedUnitIds, setAiSuggestedUnitIds] = useState<Set<string>>(new Set());

    const units = useLiveQuery(
        () => db.units.where("studentId").equals(studentId).sortBy("order"),
        [studentId]
    );

    const { suggestedUnitIds, suggestedNextUnitId, isLoading } = useAISuggestion(studentId);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ClassRecordFormData>({
        resolver: zodResolver(classRecordFormSchema) as any,
        defaultValues: {
            date: format(new Date(), "yyyy-MM-dd"),
            unitIds: [],
            unitStatusUpdates: [],
            understanding: 0,
            studentMood: "",
            nextClassPlan: "",
            homeworkAssigned: "",
        },
    });

    const selectedUnitIds = watch("unitIds");
    const unitStatusUpdates = watch("unitStatusUpdates");

    // AI提案が確定したら初期値に設定
    useEffect(() => {
        if (!isLoading && suggestedUnitIds.length > 0 && selectedUnitIds.length === 0) {
            setValue("unitIds", suggestedUnitIds);
            setAiSuggestedUnitIds(new Set(suggestedUnitIds));

            if (units) {
                const updates = suggestedUnitIds
                    .map((id) => {
                        const unit = units.find((u) => u.id === id);
                        if (!unit) return null;
                        const suggested = NEXT_STATUS_SUGGESTION[unit.status] ?? unit.status;
                        return { unitId: id, newStatus: suggested };
                    })
                    .filter(Boolean) as { unitId: string; newStatus: UnitStatus }[];
                setValue("unitStatusUpdates", updates);
            }
        }
    }, [isLoading, suggestedUnitIds, units]);

    // AI提案の次回予定単元を設定
    useEffect(() => {
        if (!isLoading && suggestedNextUnitId) {
            setValue("nextClassPlan", suggestedNextUnitId);
        }
    }, [isLoading, suggestedNextUnitId]);

    // 選択単元が変わったら unitStatusUpdates を同期
    useEffect(() => {
        if (!units) return;
        const currentUpdates = unitStatusUpdates ?? [];
        const newUpdates = selectedUnitIds.map((id) => {
            const existing = currentUpdates.find((u) => u.unitId === id);
            if (existing) return existing;
            const unit = units.find((u) => u.id === id);
            const suggested = unit
                ? (NEXT_STATUS_SUGGESTION[unit.status] ?? unit.status)
                : "NotStarted" as UnitStatus;
            return { unitId: id, newStatus: suggested };
        });
        setValue("unitStatusUpdates", newUpdates);
    }, [selectedUnitIds.join(",")]);

    const toggleUnit = (unitId: string, checked: boolean) => {
        if (checked) {
            setValue("unitIds", [...selectedUnitIds, unitId]);
            // AI提案ではないので suggestedSet から除外
            setAiSuggestedUnitIds((prev) => {
                const next = new Set(prev);
                next.delete(unitId);
                return next;
            });
        } else {
            setValue(
                "unitIds",
                selectedUnitIds.filter((id) => id !== unitId)
            );
            setAiSuggestedUnitIds((prev) => {
                const next = new Set(prev);
                next.delete(unitId);
                return next;
            });
        }
    };

    const handleStatusChange = (unitId: string, status: UnitStatus) => {
        const current = unitStatusUpdates ?? [];
        const updated = current.map((u) =>
            u.unitId === unitId ? { ...u, newStatus: status } : u
        );
        setValue("unitStatusUpdates", updated);
    };

    const onSubmit = async (data: ClassRecordFormData) => {
        const record = {
            id: uuidv4(),
            studentId,
            date: new Date(data.date),
            unitIds: data.unitIds,
            understanding: data.understanding,
            studentMood: data.studentMood ?? "",
            homeworkAssigned: data.homeworkAssigned ?? "",
            nextClassPlan: data.nextClassPlan ?? "",
        };
        await db.classRecords.add(record);

        for (const update of data.unitStatusUpdates) {
            const changes: Record<string, unknown> = { status: update.newStatus };
            if (update.newStatus === "Completed") {
                changes.completionDate = new Date();
            }
            await db.units.update(update.unitId, changes);
        }

        reset({
            date: format(new Date(), "yyyy-MM-dd"),
            unitIds: [],
            unitStatusUpdates: [],
            understanding: 0,
            studentMood: "",
            nextClassPlan: "",
            homeworkAssigned: "",
        });
        setAiSuggestedUnitIds(new Set());
        setOptionalOpen(false);
        onOpenChange(false);
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            reset({
                date: format(new Date(), "yyyy-MM-dd"),
                unitIds: [],
                unitStatusUpdates: [],
                understanding: 0,
                studentMood: "",
                nextClassPlan: "",
                homeworkAssigned: "",
            });
            setAiSuggestedUnitIds(new Set());
            setOptionalOpen(false);
        }
        onOpenChange(open);
    };

    // 科目ごとに単元をグループ化
    const unitsBySubject = (units ?? []).reduce<Record<string, typeof units>>((acc, unit) => {
        if (!acc[unit.subject]) acc[unit.subject] = [];
        acc[unit.subject]!.push(unit);
        return acc;
    }, {});

    const selectedUnitsData = (units ?? []).filter((u) =>
        selectedUnitIds.includes(u.id)
    );

    const understanding = watch("understanding");
    const nextClassPlan = watch("nextClassPlan");

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>授業記録を追加</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* 授業日 */}
                    <div className="space-y-1">
                        <Label htmlFor="date" className="text-sm font-medium">
                            授業日 <span className="text-destructive">*</span>
                        </Label>
                        <input
                            id="date"
                            type="date"
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            {...register("date")}
                        />
                        {errors.date && (
                            <p className="text-xs text-destructive">{errors.date.message}</p>
                        )}
                    </div>

                    {/* 実施単元 */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">
                            実施した単元 <span className="text-destructive">*</span>
                            {isLoading && (
                                <span className="ml-2 text-xs text-muted-foreground">読み込み中...</span>
                            )}
                        </Label>
                        {units && units.length === 0 && (
                            <p className="text-xs text-muted-foreground">
                                カリキュラムに単元が登録されていません。
                            </p>
                        )}
                        <div className="space-y-3">
                            {Object.entries(unitsBySubject).map(([subject, subjectUnits]) => (
                                <div key={subject}>
                                    <p className="text-xs font-medium text-muted-foreground mb-1">{subject}</p>
                                    <div className="space-y-1 pl-2">
                                        {subjectUnits!.map((unit) => {
                                            const isChecked = selectedUnitIds.includes(unit.id);
                                            const isAiSuggested = aiSuggestedUnitIds.has(unit.id);
                                            return (
                                                <div
                                                    key={unit.id}
                                                    className={`flex items-center gap-2 rounded-md p-1.5 ${
                                                        isAiSuggested && isChecked
                                                            ? "border border-dashed border-blue-400 bg-blue-50"
                                                            : ""
                                                    }`}
                                                >
                                                    <Checkbox
                                                        id={`unit-${unit.id}`}
                                                        checked={isChecked}
                                                        onCheckedChange={(checked) =>
                                                            toggleUnit(unit.id, checked === true)
                                                        }
                                                    />
                                                    <label
                                                        htmlFor={`unit-${unit.id}`}
                                                        className="text-sm cursor-pointer flex-1"
                                                    >
                                                        {unit.name}
                                                        {isAiSuggested && isChecked && (
                                                            <span className="ml-1 text-xs text-blue-500">
                                                                <Sparkles className="inline h-3 w-3" /> AI提案
                                                            </span>
                                                        )}
                                                    </label>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {errors.unitIds && (
                            <p className="text-xs text-destructive">{errors.unitIds.message}</p>
                        )}
                    </div>

                    {/* ステータス更新 */}
                    {selectedUnitsData.length > 0 && (
                        <div className="space-y-1">
                            <Label className="text-sm font-medium">
                                ステータス更新 <span className="text-destructive">*</span>
                            </Label>
                            <div className="border rounded-md divide-y px-3">
                                {selectedUnitsData.map((unit) => {
                                    const update = (unitStatusUpdates ?? []).find(
                                        (u) => u.unitId === unit.id
                                    );
                                    return (
                                        <UnitStatusUpdateRow
                                            key={unit.id}
                                            unit={unit}
                                            value={update?.newStatus ?? unit.status}
                                            onChange={handleStatusChange}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* 理解度 */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">
                            理解度 <span className="text-destructive">*</span>
                        </Label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((n) => (
                                <button
                                    key={n}
                                    type="button"
                                    onClick={() => setValue("understanding", n)}
                                    className={`flex-1 py-2 rounded-md border text-sm font-medium transition-colors ${
                                        understanding === n
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "border-input hover:bg-accent"
                                    }`}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                        {understanding > 0 && (
                            <p className="text-xs text-muted-foreground text-center">
                                {UNDERSTANDING_LABELS[understanding]}
                            </p>
                        )}
                        {errors.understanding && (
                            <p className="text-xs text-destructive">{errors.understanding.message}</p>
                        )}
                    </div>

                    {/* 任意セクション（折りたたみ） */}
                    <div className="border rounded-md">
                        <button
                            type="button"
                            className="w-full flex items-center justify-between px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setOptionalOpen((v) => !v)}
                        >
                            <span>任意項目を{optionalOpen ? "閉じる" : "入力する"}</span>
                            {optionalOpen ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                        </button>

                        {optionalOpen && (
                            <div className="px-3 pb-3 space-y-4 border-t pt-3">
                                {/* コメント */}
                                <div className="space-y-1">
                                    <Label className="text-sm">コメント</Label>
                                    <Textarea
                                        placeholder="授業のメモや所感を入力..."
                                        className="text-sm resize-none"
                                        rows={2}
                                        {...register("studentMood")}
                                    />
                                </div>

                                {/* 次回の予定単元 */}
                                <div className="space-y-1">
                                    <Label className="text-sm">
                                        次回の予定単元
                                        {suggestedNextUnitId && (
                                            <span className="ml-2 text-xs text-blue-500">
                                                <Sparkles className="inline h-3 w-3" /> AI提案
                                            </span>
                                        )}
                                    </Label>
                                    <Select
                                        value={nextClassPlan ?? ""}
                                        onValueChange={(v) => setValue("nextClassPlan", v)}
                                    >
                                        <SelectTrigger className="text-sm">
                                            <SelectValue placeholder="単元を選択..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(units ?? []).map((unit) => (
                                                <SelectItem key={unit.id} value={unit.id} className="text-sm">
                                                    {unit.subject} — {unit.name}
                                                    {unit.id === suggestedNextUnitId && " ✨"}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* 宿題・課題 */}
                                <div className="space-y-1">
                                    <Label className="text-sm">宿題・課題</Label>
                                    <Textarea
                                        placeholder="次回までの宿題や課題を入力..."
                                        className="text-sm resize-none"
                                        rows={2}
                                        {...register("homeworkAssigned")}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                        >
                            キャンセル
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            保存
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
