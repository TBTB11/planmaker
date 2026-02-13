import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, type Student, type SchoolType } from "@/db/db";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const SUBJECTS = ["数学", "英語", "国語", "理科", "社会"];

export function StudentRegistration() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        studentId: "",
        name: "",
        grade: "",
        schoolType: "JuniorHigh" as SchoolType,
        subjects: [] as string[],
        goal: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const newStudent: Student = {
                id: uuidv4(),
                studentId: formData.studentId,
                name: formData.name,
                grade: formData.grade,
                schoolType: formData.schoolType,
                goals: [
                    {
                        type: "RegularTest", // Default
                        targetDate: new Date(),
                        description: formData.goal,
                    },
                ],
                subjects: formData.subjects,
            };

            await db.students.add(newStudent);
            navigate("/students");
        } catch (error) {
            console.error("Failed to register student:", error);
            alert("登録に失敗しました");
        }
    };

    const toggleSubject = (subject: string) => {
        setFormData((prev) => {
            if (prev.subjects.includes(subject)) {
                return { ...prev, subjects: prev.subjects.filter((s) => s !== subject) };
            } else {
                return { ...prev, subjects: [...prev.subjects, subject] };
            }
        });
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>新規生徒登録</CardTitle>
                    <CardDescription>
                        新しい生徒の基本情報を入力してください。
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="studentId">生徒ID</Label>
                            <Input
                                id="studentId"
                                placeholder="例: S001"
                                value={formData.studentId}
                                onChange={(e) =>
                                    setFormData({ ...formData, studentId: e.target.value })
                                }
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">氏名</Label>
                            <Input
                                id="name"
                                placeholder="例: 山田 太郎"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="schoolType">学校種別</Label>
                                <Select
                                    value={formData.schoolType}
                                    onValueChange={(value: SchoolType) =>
                                        setFormData({ ...formData, schoolType: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="選択してください" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Elementary">小学校</SelectItem>
                                        <SelectItem value="JuniorHigh">中学校</SelectItem>
                                        <SelectItem value="HighSchool">高校</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="grade">学年</Label>
                                <Input
                                    id="grade"
                                    placeholder="例: 中2"
                                    value={formData.grade}
                                    onChange={(e) =>
                                        setFormData({ ...formData, grade: e.target.value })
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>受講科目</Label>
                            <div className="flex flex-wrap gap-4 mt-2">
                                {SUBJECTS.map((subject) => (
                                    <div key={subject} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`subject-${subject}`}
                                            checked={formData.subjects.includes(subject)}
                                            onCheckedChange={() => toggleSubject(subject)}
                                        />
                                        <label
                                            htmlFor={`subject-${subject}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            {subject}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="goal">現在の目標</Label>
                            <Input
                                id="goal"
                                placeholder="例: 次の定期テストで80点以上"
                                value={formData.goal}
                                onChange={(e) =>
                                    setFormData({ ...formData, goal: e.target.value })
                                }
                            />
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate("/students")}
                            >
                                キャンセル
                            </Button>
                            <Button type="submit">登録</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
