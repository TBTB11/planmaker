import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/db";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus } from "lucide-react";
import { StudentSummaryCard } from "./StudentSummaryCard";
import { GoalEditor } from "./GoalEditor";
import { CurriculumEditor } from "./CurriculumEditor";
import { ClassRecordForm } from "@/features/class-records/ClassRecordForm";
import { ClassRecordList } from "@/features/class-records/ClassRecordList";
import { SCHOOL_TYPE_LABELS, GRADES_BY_SCHOOL } from "@/lib/constants";

export function StudentDetail() {
    const { studentId } = useParams<{ studentId: string }>();
    const navigate = useNavigate();
    const [recordFormOpen, setRecordFormOpen] = useState(false);

    const student = useLiveQuery(
        () => db.students.get(studentId || ""),
        [studentId]
    );

    if (!student) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">読み込み中...</p>
            </div>
        );
    }

    const gradeLabel = GRADES_BY_SCHOOL[student.schoolType]?.find(
        (g) => g.value === student.grade
    )?.label || student.grade;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/students")}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{student.name}</h1>
                        <p className="text-muted-foreground">
                            {student.studentId} - {SCHOOL_TYPE_LABELS[student.schoolType]} {gradeLabel}
                        </p>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">概要</TabsTrigger>
                    <TabsTrigger value="curriculum">カリキュラム</TabsTrigger>
                    <TabsTrigger value="records">授業記録</TabsTrigger>
                    <TabsTrigger value="history">履歴</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <StudentSummaryCard student={student} />
                        <GoalEditor student={student} />
                    </div>
                </TabsContent>

                <TabsContent value="curriculum">
                    <CurriculumEditor
                        studentId={student.id}
                        subjects={student.subjects}
                    />
                </TabsContent>

                <TabsContent value="records">
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <Button onClick={() => setRecordFormOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                授業記録を追加
                            </Button>
                        </div>
                        <ClassRecordList studentId={student.id} />
                        <ClassRecordForm
                            studentId={student.id}
                            open={recordFormOpen}
                            onOpenChange={setRecordFormOpen}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="history">
                    <div className="text-center py-12 text-muted-foreground">
                        <p>履歴機能は次のフェーズで実装予定です。</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
