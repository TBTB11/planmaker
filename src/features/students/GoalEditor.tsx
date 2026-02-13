import { useState } from "react";
import { db, type Student, type Goal, type GoalType } from "@/db/db";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Pencil, Target } from "lucide-react";
import { GOAL_TYPE_LABELS } from "@/lib/constants";
import { format } from "date-fns";

interface GoalEditorProps {
    student: Student;
}

export function GoalEditor({ student }: GoalEditorProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [formData, setFormData] = useState<{
        type: GoalType;
        targetDate: string;
        targetScore: string;
        description: string;
    }>({
        type: "RegularTest",
        targetDate: "",
        targetScore: "",
        description: "",
    });

    const openNew = () => {
        setEditingIndex(null);
        setFormData({
            type: "RegularTest",
            targetDate: format(new Date(), "yyyy-MM-dd"),
            targetScore: "",
            description: "",
        });
        setDialogOpen(true);
    };

    const openEdit = (index: number) => {
        const goal = student.goals[index];
        setEditingIndex(index);
        setFormData({
            type: goal.type,
            targetDate: format(new Date(goal.targetDate), "yyyy-MM-dd"),
            targetScore: goal.targetScore?.toString() || "",
            description: goal.description,
        });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.description) return;

        const newGoal: Goal = {
            type: formData.type,
            targetDate: new Date(formData.targetDate),
            description: formData.description,
            ...(formData.targetScore ? { targetScore: Number(formData.targetScore) } : {}),
        };

        const updatedGoals = [...student.goals];
        if (editingIndex !== null) {
            updatedGoals[editingIndex] = newGoal;
        } else {
            updatedGoals.push(newGoal);
        }

        await db.students.update(student.id, { goals: updatedGoals });
        setDialogOpen(false);
    };

    const handleDelete = async (index: number) => {
        const updatedGoals = student.goals.filter((_, i) => i !== index);
        await db.students.update(student.id, { goals: updatedGoals });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    目標
                </h3>
                <Button variant="outline" size="sm" onClick={openNew}>
                    <Plus className="mr-1 h-3 w-3" />
                    追加
                </Button>
            </div>

            {student.goals.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                    目標が設定されていません。
                </p>
            ) : (
                <div className="space-y-2">
                    {student.goals.map((goal, index) => (
                        <Card key={index} className="p-3">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary">
                                            {GOAL_TYPE_LABELS[goal.type]}
                                        </Badge>
                                        {goal.targetScore && (
                                            <Badge variant="outline">
                                                目標 {goal.targetScore}点
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm">{goal.description}</p>
                                    <p className="text-xs text-muted-foreground">
                                        期日: {format(new Date(goal.targetDate), "yyyy/MM/dd")}
                                    </p>
                                </div>
                                <div className="flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => openEdit(index)}
                                    >
                                        <Pencil className="h-3 w-3" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-destructive"
                                        onClick={() => handleDelete(index)}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingIndex !== null ? "目標を編集" : "目標を追加"}
                        </DialogTitle>
                        <DialogDescription>
                            学習の目標と期日を設定してください。
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label>種別</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value: GoalType) =>
                                        setFormData({ ...formData, type: value })
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
                            <div className="space-y-2">
                                <Label>目標期日</Label>
                                <Input
                                    type="date"
                                    value={formData.targetDate}
                                    onChange={(e) =>
                                        setFormData({ ...formData, targetDate: e.target.value })
                                    }
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>説明</Label>
                            <Input
                                placeholder="例: 次の定期テストで80点以上"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>目標点数（任意）</Label>
                            <Input
                                type="number"
                                min={0}
                                max={100}
                                placeholder="例: 80"
                                value={formData.targetScore}
                                onChange={(e) =>
                                    setFormData({ ...formData, targetScore: e.target.value })
                                }
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            キャンセル
                        </Button>
                        <Button onClick={handleSave} disabled={!formData.description}>
                            {editingIndex !== null ? "更新" : "追加"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
