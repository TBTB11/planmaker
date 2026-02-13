import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/db";
import { Link } from "react-router-dom";
import { PlusCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export function StudentList() {
    const students = useLiveQuery(() => db.students.toArray());

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">生徒一覧</h2>
                    <p className="text-muted-foreground">
                        登録されている生徒の学習進捗を確認できます。
                    </p>
                </div>
                <Button asChild>
                    <Link to="/students/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        新規生徒登録
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>生徒リスト</CardTitle>
                    <CardDescription>
                        現在 {students?.length || 0} 名の生徒が登録されています。
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>生徒ID</TableHead>
                                <TableHead>名前</TableHead>
                                <TableHead>学年</TableHead>
                                <TableHead>学校種別</TableHead>
                                <TableHead>目標</TableHead>
                                <TableHead className="text-right">操作</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students?.map((student) => (
                                <TableRow key={student.id}>
                                    <TableCell className="font-medium">{student.studentId}</TableCell>
                                    <TableCell>{student.name}</TableCell>
                                    <TableCell>{student.grade}</TableCell>
                                    <TableCell>
                                        {student.schoolType === "JuniorHigh"
                                            ? "中学校"
                                            : student.schoolType === "HighSchool"
                                                ? "高校"
                                                : "小学校"}
                                    </TableCell>
                                    <TableCell>
                                        {student.goals[0]?.description || "なし"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link to={`/students/${student.id}`}>詳細</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {students?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        生徒が登録されていません。「新規生徒登録」またはダッシュボードの「Seed」から追加してください。
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
