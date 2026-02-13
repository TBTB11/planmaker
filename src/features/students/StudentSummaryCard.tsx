import { useLiveQuery } from "dexie-react-hooks";
import { db, type Student } from "@/db/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { SCHOOL_TYPE_LABELS, GRADES_BY_SCHOOL } from "@/lib/constants";
import { format } from "date-fns";

interface StudentSummaryCardProps {
    student: Student;
}

export function StudentSummaryCard({ student }: StudentSummaryCardProps) {
    const units = useLiveQuery(
        () => db.units.where("studentId").equals(student.id).toArray(),
        [student.id]
    );

    const latestRecord = useLiveQuery(
        () =>
            db.classRecords
                .where("studentId")
                .equals(student.id)
                .reverse()
                .sortBy("date")
                .then((records) => records[0] || null),
        [student.id]
    );

    if (!units) return null;

    const statusCounts = {
        completed: units.filter((u) => u.status === "Completed").length,
        inProgress: units.filter((u) =>
            ["Introduced", "Practicing", "WaitingConfirmation"].includes(u.status)
        ).length,
        notStarted: units.filter((u) => u.status === "NotStarted").length,
        needsReview: units.filter((u) => u.status === "NeedsReview").length,
    };

    const totalUnits = units.length;
    const completionRate = totalUnits > 0
        ? Math.round((statusCounts.completed / totalUnits) * 100)
        : 0;

    const gradeLabel = GRADES_BY_SCHOOL[student.schoolType]?.find(
        (g) => g.value === student.grade
    )?.label || student.grade;

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                    <span>概要</span>
                    <Badge variant="outline">
                        {SCHOOL_TYPE_LABELS[student.schoolType]} {gradeLabel}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <p className="text-xs text-muted-foreground">全単元</p>
                            <p className="text-lg font-bold">{totalUnits}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-md bg-green-50">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <div>
                            <p className="text-xs text-muted-foreground">完了</p>
                            <p className="text-lg font-bold text-green-600">{statusCounts.completed}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-md bg-blue-50">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <div>
                            <p className="text-xs text-muted-foreground">進行中</p>
                            <p className="text-lg font-bold text-blue-600">{statusCounts.inProgress}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-md bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <div>
                            <p className="text-xs text-muted-foreground">要復習</p>
                            <p className="text-lg font-bold text-red-600">{statusCounts.needsReview}</p>
                        </div>
                    </div>
                </div>

                {totalUnits > 0 && (
                    <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">進捗率</span>
                            <span className="font-medium">{completionRate}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{ width: `${completionRate}%` }}
                            />
                        </div>
                    </div>
                )}

                {latestRecord && (
                    <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-1">直近の授業</p>
                        <p className="text-sm">
                            {format(new Date(latestRecord.date), "yyyy/MM/dd")}
                            {" — "}
                            理解度 {latestRecord.understanding}/5
                        </p>
                    </div>
                )}

                <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-1">受講科目</p>
                    <div className="flex flex-wrap gap-1">
                        {student.subjects.map((sub) => (
                            <Badge key={sub} variant="secondary" className="text-xs">
                                {sub}
                            </Badge>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
