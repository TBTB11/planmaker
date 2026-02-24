import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowRight } from "lucide-react";

interface StepCompleteProps {
    studentId: string;
    unitCount: number;
    onGoToDashboard: () => void;
}

export function StepComplete({
    studentId,
    unitCount,
    onGoToDashboard,
}: StepCompleteProps) {
    return (
        <Card>
            <CardContent className="py-16 text-center space-y-6">
                <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold">
                        セットアップ完了！
                    </h2>
                    <p className="text-muted-foreground">
                        生徒の登録とカリキュラムの設定が完了しました。
                    </p>
                </div>
                <div className="rounded-lg bg-muted p-4 inline-block mx-auto text-left space-y-1">
                    <p className="text-sm">
                        <span className="font-medium">生徒ID:</span>{" "}
                        {studentId}
                    </p>
                    <p className="text-sm">
                        <span className="font-medium">登録単元:</span>{" "}
                        {unitCount}件
                    </p>
                </div>
                <Button size="lg" onClick={onGoToDashboard}>
                    ダッシュボードへ
                    <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
            </CardContent>
        </Card>
    );
}
