import { cn } from "@/lib/utils";

const STEPS = [
    { label: "生徒情報" },
    { label: "目標設定" },
    { label: "カリキュラム" },
    { label: "完了" },
];

interface WizardStepIndicatorProps {
    currentStep: number;
}

export function WizardStepIndicator({ currentStep }: WizardStepIndicatorProps) {
    return (
        <div className="flex items-center justify-center gap-2">
            {STEPS.map((step, index) => (
                <div key={step.label} className="flex items-center gap-2">
                    <div className="flex flex-col items-center gap-1">
                        <div
                            className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                                index < currentStep
                                    ? "bg-primary text-primary-foreground"
                                    : index === currentStep
                                      ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                                      : "bg-muted text-muted-foreground"
                            )}
                        >
                            {index < currentStep ? "✓" : index + 1}
                        </div>
                        <span
                            className={cn(
                                "text-xs",
                                index <= currentStep
                                    ? "font-medium text-foreground"
                                    : "text-muted-foreground"
                            )}
                        >
                            {step.label}
                        </span>
                    </div>
                    {index < STEPS.length - 1 && (
                        <div
                            className={cn(
                                "mb-5 h-0.5 w-8",
                                index < currentStep ? "bg-primary" : "bg-muted"
                            )}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}
