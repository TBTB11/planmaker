import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/db";
import { UNDERSTANDING_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface ClassRecordListProps {
    studentId: string;
}

const INITIAL_DISPLAY_COUNT = 5;

export function ClassRecordList({ studentId }: ClassRecordListProps) {
    const [showAll, setShowAll] = useState(false);

    const records = useLiveQuery(
        async () => {
            const all = await db.classRecords
                .where("studentId")
                .equals(studentId)
                .toArray();
            return all.sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
        },
        [studentId]
    );

    const units = useLiveQuery(
        () => db.units.where("studentId").equals(studentId).toArray(),
        [studentId]
    );

    if (!records || !units) {
        return (
            <p className="text-sm text-muted-foreground text-center py-4">読み込み中...</p>
        );
    }

    if (records.length === 0) {
        return (
            <p className="text-sm text-muted-foreground text-center py-8">
                まだ授業記録がありません。
            </p>
        );
    }

    const displayed = showAll ? records : records.slice(0, INITIAL_DISPLAY_COUNT);

    const getUnitName = (unitId: string) => {
        const unit = units.find((u) => u.id === unitId);
        return unit ? `${unit.subject} — ${unit.name}` : unitId;
    };

    const getNextUnitName = (nextClassPlan: string) => {
        if (!nextClassPlan) return null;
        const unit = units.find((u) => u.id === nextClassPlan);
        return unit ? `${unit.subject} — ${unit.name}` : nextClassPlan;
    };

    const getUnderstandingColor = (n: number) => {
        if (n >= 4) return "bg-green-100 text-green-700";
        if (n === 3) return "bg-yellow-100 text-yellow-700";
        return "bg-red-100 text-red-700";
    };

    return (
        <div className="space-y-3">
            {displayed.map((record) => (
                <Card key={record.id}>
                    <CardContent className="pt-4 pb-3 space-y-2">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">
                                {format(new Date(record.date), "M月d日(E)", { locale: ja })}
                            </p>
                            <Badge className={`text-xs ${getUnderstandingColor(record.understanding)}`}>
                                理解度 {record.understanding}：{UNDERSTANDING_LABELS[record.understanding]}
                            </Badge>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">実施単元</p>
                            <div className="flex flex-wrap gap-1">
                                {record.unitIds.map((id) => (
                                    <span
                                        key={id}
                                        className="inline-block text-xs bg-secondary text-secondary-foreground rounded px-2 py-0.5"
                                    >
                                        {getUnitName(id)}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {record.nextClassPlan && (
                            <p className="text-xs text-muted-foreground">
                                次回予定：{getNextUnitName(record.nextClassPlan)}
                            </p>
                        )}

                        {record.studentMood && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                                メモ：{record.studentMood}
                            </p>
                        )}

                        {record.homeworkAssigned && (
                            <p className="text-xs text-muted-foreground">
                                宿題：{record.homeworkAssigned}
                            </p>
                        )}
                    </CardContent>
                </Card>
            ))}

            {records.length > INITIAL_DISPLAY_COUNT && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-muted-foreground"
                    onClick={() => setShowAll((v) => !v)}
                >
                    {showAll
                        ? "折りたたむ"
                        : `さらに ${records.length - INITIAL_DISPLAY_COUNT} 件を表示`}
                </Button>
            )}
        </div>
    );
}
