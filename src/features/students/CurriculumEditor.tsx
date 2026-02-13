import { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Unit, type UnitStatus } from "@/db/db";
import { v4 as uuidv4 } from "uuid";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { UNIT_STATUS_LABELS, UNIT_STATUS_COLORS } from "@/lib/constants";

interface CurriculumEditorProps {
    studentId: string;
    subjects: string[];
}

function SortableUnitItem({
    unit,
    onRemove,
    onStatusChange,
}: {
    unit: Unit;
    onRemove: (id: string) => void;
    onStatusChange: (id: string, status: UnitStatus) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: unit.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-3 p-3 mb-2 bg-background border rounded-lg shadow-sm"
        >
            <div {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground">
                <GripVertical size={18} />
            </div>
            <div className="flex-1 grid grid-cols-12 gap-2 items-center">
                <div className="font-medium col-span-4 text-sm">{unit.name}</div>
                <div className="text-sm text-muted-foreground col-span-2">{unit.subject}</div>
                <div className="text-sm text-muted-foreground col-span-2">
                    {unit.estimatedSessions}コマ
                </div>
                <div className="col-span-3">
                    <Select
                        value={unit.status}
                        onValueChange={(value: UnitStatus) => onStatusChange(unit.id, value)}
                    >
                        <SelectTrigger className="h-7 text-xs">
                            <Badge className={`${UNIT_STATUS_COLORS[unit.status]} text-xs border-0`}>
                                {UNIT_STATUS_LABELS[unit.status]}
                            </Badge>
                        </SelectTrigger>
                        <SelectContent>
                            {(Object.keys(UNIT_STATUS_LABELS) as UnitStatus[]).map((status) => (
                                <SelectItem key={status} value={status}>
                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${UNIT_STATUS_COLORS[status]}`}>
                                        {UNIT_STATUS_LABELS[status]}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => onRemove(unit.id)}
            >
                <Trash2 size={16} />
            </Button>
        </div>
    );
}

export function CurriculumEditor({ studentId, subjects }: CurriculumEditorProps) {
    const existingUnits = useLiveQuery(
        () =>
            db.units
                .where("studentId")
                .equals(studentId)
                .sortBy("order"),
        [studentId]
    );

    const [units, setUnits] = useState<Unit[]>([]);
    const [newUnitName, setNewUnitName] = useState("");
    const [newUnitSubject, setNewUnitSubject] = useState("");
    const [newUnitSessions, setNewUnitSessions] = useState(1);

    useEffect(() => {
        if (existingUnits) {
            setUnits(existingUnits);
        }
    }, [existingUnits]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event: any) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setUnits((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);

                const updates = newItems.map((unit, index) => ({
                    key: unit.id,
                    changes: { order: index + 1 },
                }));

                updates.forEach((u) => db.units.update(u.key, u.changes));

                return newItems;
            });
        }
    };

    const handleAddUnit = async () => {
        if (!newUnitName || !newUnitSubject) return;

        const newUnit: Unit = {
            id: uuidv4(),
            studentId,
            subject: newUnitSubject,
            name: newUnitName,
            order: units.length + 1,
            estimatedSessions: newUnitSessions,
            weight: 10,
            status: "NotStarted",
        };

        await db.units.add(newUnit);
        setNewUnitName("");
        setNewUnitSessions(1);
    };

    const handleAutoFill = async () => {
        const mockUnits: Unit[] = [
            { id: uuidv4(), studentId, subject: "数学", name: "正負の数", order: units.length + 1, estimatedSessions: 3, weight: 10, status: "NotStarted" },
            { id: uuidv4(), studentId, subject: "数学", name: "文字と式", order: units.length + 2, estimatedSessions: 4, weight: 10, status: "NotStarted" },
            { id: uuidv4(), studentId, subject: "数学", name: "方程式", order: units.length + 3, estimatedSessions: 5, weight: 10, status: "NotStarted" },
        ];

        await db.units.bulkAdd(mockUnits);
    };

    const handleRemoveUnit = async (id: string) => {
        await db.units.delete(id);
    };

    const handleStatusChange = async (id: string, status: UnitStatus) => {
        const changes: Partial<Unit> = { status };
        if (status === "Completed") {
            changes.completionDate = new Date();
        }
        await db.units.update(id, changes);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle className="text-base">学習単元リスト (ドラッグで並べ替え)</CardTitle>
                </CardHeader>
                <CardContent>
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={units.map((u) => u.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-1">
                                {units.length === 0 && (
                                    <p className="text-muted-foreground text-center py-8">
                                        単元が登録されていません。
                                    </p>
                                )}
                                {units.map((unit) => (
                                    <SortableUnitItem
                                        key={unit.id}
                                        unit={unit}
                                        onRemove={handleRemoveUnit}
                                        onStatusChange={handleStatusChange}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">単元を追加</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>教科</Label>
                        <Select value={newUnitSubject} onValueChange={setNewUnitSubject}>
                            <SelectTrigger>
                                <SelectValue placeholder="教科を選択" />
                            </SelectTrigger>
                            <SelectContent>
                                {subjects.map((sub) => (
                                    <SelectItem key={sub} value={sub}>
                                        {sub}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>単元名</Label>
                        <Input
                            value={newUnitName}
                            onChange={(e) => setNewUnitName(e.target.value)}
                            placeholder="例: 一次関数"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>想定コマ数</Label>
                        <Input
                            type="number"
                            min={1}
                            value={newUnitSessions}
                            onChange={(e) => setNewUnitSessions(parseInt(e.target.value) || 1)}
                        />
                    </div>

                    <Button onClick={handleAddUnit} className="w-full" disabled={!newUnitName || !newUnitSubject}>
                        <Plus className="mr-2 h-4 w-4" /> 追加
                    </Button>

                    <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                または
                            </span>
                        </div>
                    </div>

                    <Button variant="secondary" onClick={handleAutoFill} className="w-full">
                        AI自動生成 (Mock)
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
