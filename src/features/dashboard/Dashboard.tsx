import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "@/db/db";
import { seedDatabase } from "@/db/seed";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, PlusCircle, Database } from "lucide-react";
import { SCHOOL_TYPE_LABELS, GRADES_BY_SCHOOL } from "@/lib/constants";

export function Dashboard() {
    const students = useLiveQuery(() => db.students.toArray());
    const units = useLiveQuery(() => db.units.toArray());
    const classRecords = useLiveQuery(() => db.classRecords.toArray());

    const totalStudents = students?.length || 0;
    const totalUnits = units?.length || 0;
    const completedUnits = units?.filter((u) => u.status === "Completed").length || 0;
    const totalRecords = classRecords?.length || 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">ダッシュボード</h2>
                    <p className="text-muted-foreground">
                        学習計画の概要を確認できます。
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button asChild>
                        <Link to="/students/new">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            新規生徒登録
                        </Link>
                    </Button>
                    <Button variant="outline" onClick={() => seedDatabase()}>
                        <Database className="mr-2 h-4 w-4" />
                        Seed
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">生徒数</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalStudents}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">全単元数</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalUnits}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">完了単元</CardTitle>
                        <BookOpen className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{completedUnits}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">授業記録数</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalRecords}</div>
                    </CardContent>
                </Card>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-4">担当生徒</h3>
                {totalStudents === 0 ? (
                    <Card>
                        <CardContent className="text-center py-12">
                            <p className="text-muted-foreground mb-4">
                                生徒が登録されていません。
                            </p>
                            <div className="flex gap-2 justify-center">
                                <Button asChild>
                                    <Link to="/students/new">
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        新規生徒登録
                                    </Link>
                                </Button>
                                <Button variant="outline" onClick={() => seedDatabase()}>
                                    <Database className="mr-2 h-4 w-4" />
                                    テストデータを投入
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {students?.map((student) => {
                            const studentUnits = units?.filter((u) => u.studentId === student.id) || [];
                            const completed = studentUnits.filter((u) => u.status === "Completed").length;
                            const total = studentUnits.length;
                            const gradeLabel = GRADES_BY_SCHOOL[student.schoolType]?.find(
                                (g) => g.value === student.grade
                            )?.label || student.grade;

                            return (
                                <Link key={student.id} to={`/students/${student.id}`}>
                                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base flex items-center justify-between">
                                                <span>{student.name}</span>
                                                <Badge variant="outline" className="text-xs">
                                                    {student.studentId}
                                                </Badge>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <p className="text-sm text-muted-foreground">
                                                    {SCHOOL_TYPE_LABELS[student.schoolType]} {gradeLabel}
                                                </p>
                                                <div className="flex flex-wrap gap-1">
                                                    {student.subjects.map((sub) => (
                                                        <Badge key={sub} variant="secondary" className="text-xs">
                                                            {sub}
                                                        </Badge>
                                                    ))}
                                                </div>
                                                {total > 0 && (
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between text-xs">
                                                            <span className="text-muted-foreground">進捗</span>
                                                            <span>{completed}/{total}</span>
                                                        </div>
                                                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                                            <div
                                                                className="h-full rounded-full bg-primary transition-all"
                                                                style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                                {student.goals[0] && (
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {student.goals[0].description}
                                                    </p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
