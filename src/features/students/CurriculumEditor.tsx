import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Unit } from "@/db/db";
import { v4 as uuidv4 } from "uuid";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
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
import { GripVertical, Plus, Trash2 } from "lucide-react";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

function SortableUnitItem({ unit, onRemove }: { unit: Unit; onRemove: (id: string) => void }) {
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
            className="flex items-center gap-4 p-4 mb-2 bg-background border rounded-lg shadow-sm"
        >
            <div {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground">
                <GripVertical size={20} />
            </div>
            <div className="flex-1 grid grid-cols-4 gap-4 items-center">
                <div className="font-medium col-span-2">{unit.name}</div>
                <div className="text-sm text-muted-foreground">{unit.subject}</div>
                <div className="text-sm text-muted-foreground">想定コマ数: {unit.estimatedSessions}</div>
            </div>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(unit.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
                <Trash2 size={18} />
            </Button>
        </div>
    );
}

export function CurriculumEditor() {
    const { studentId } = useParams<{ studentId: string }>();
    const navigate = useNavigate();

    const student = useLiveQuery(() => db.students.get(studentId || ""), [studentId]);
    const existingUnits = useLiveQuery(
        () =>
            db.units
                .where("studentId")
                .equals(studentId || "")
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

        if (active.id !== over.id) {
            setUnits((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);

                // Update order in DB
                const updates = newItems.map((unit, index) => ({
                    key: unit.id,
                    changes: { order: index + 1 },
                }));

                // Optimize: Bulk update could be better but Dexie update is per item
                updates.forEach((u) => db.units.update(u.key, u.changes));

                return newItems;
            });
        }
    };

    const handleAddUnit = async () => {
        if (!studentId || !newUnitName || !newUnitSubject) return;

        const newUnit: Unit = {
            id: uuidv4(),
            studentId: studentId,
            subject: newUnitSubject,
            name: newUnitName,
            order: units.length + 1,
            estimatedSessions: newUnitSessions,
            weight: 10, // Default weight
            status: 'NotStarted'
        };

        await db.units.add(newUnit);
        setNewUnitName("");
        setNewUnitSessions(1);
        // Subject stays same for convenience
    };

    const handleJavaAutoFill = async () => {
        // Mock AI auto-fill
        if (!studentId) return;

        const mockUnits: Unit[] = [
            { id: uuidv4(), studentId, subject: 'Math', name: 'Positive and Negative Numbers', order: units.length + 1, estimatedSessions: 3, weight: 10, status: 'NotStarted' },
            { id: uuidv4(), studentId, subject: 'Math', name: 'Letters and Expressions', order: units.length + 2, estimatedSessions: 4, weight: 10, status: 'NotStarted' },
            { id: uuidv4(), studentId, subject: 'Math', name: 'Equations', order: units.length + 3, estimatedSessions: 5, weight: 10, status: 'NotStarted' },
        ];

        await db.units.bulkAdd(mockUnits);
    }

    const handleRemoveUnit = async (id: string) => {
        await db.units.delete(id);
    };

    if (!student) return <div>Loading...</div>;

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{student.name} さんのカリキュラム</h1>
                    <p className="text-muted-foreground">{student.grade} - {student.schoolType}</p>
                </div>
                <Button variant="outline" onClick={() => navigate("/students")}>
                    戻る
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>学習単元リスト (ドラッグで並べ替え)</CardTitle>
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
                                <div className="space-y-2">
                                    {units.length === 0 && <p className="text-muted-foreground text-center py-8">単元が登録されていません。</p>}
                                    {units.map((unit) => (
                                        <SortableUnitItem
                                            key={unit.id}
                                            unit={unit}
                                            onRemove={handleRemoveUnit}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>単元を追加</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>教科</Label>
                            <Select value={newUnitSubject} onValueChange={setNewUnitSubject}>
                                <SelectTrigger>
                                    <SelectValue placeholder="教科を選択" />
                                </SelectTrigger>
                                <SelectContent>
                                    {student.subjects.map((sub) => (
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
                                onChange={(e) => setNewUnitSessions(parseInt(e.target.value))}
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

                        <Button variant="secondary" onClick={handleJavaAutoFill} className="w-full">
                            AI自動生成 (Mock)
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
