import { useState } from "react";
import { WizardStepIndicator } from "./components/WizardStepIndicator";
import { StepStudentInfo } from "./steps/StepStudentInfo";
import { StepGoalSetting } from "./steps/StepGoalSetting";
import { StepCurriculumProposal } from "./steps/StepCurriculumProposal";
import { StepComplete } from "./steps/StepComplete";
import { useSetupWizard } from "./useSetupWizard";
import type { ProposedUnit } from "@/lib/ai/types";

export function SetupWizard() {
    const {
        currentStep,
        studentData,
        goalData,
        isSubmitting,
        setStudentData,
        setGoalData,
        nextStep,
        prevStep,
        completeWizard,
        goToDashboard,
    } = useSetupWizard();

    const [confirmedUnitCount, setConfirmedUnitCount] = useState(0);

    const handleConfirmCurriculum = async (units: ProposedUnit[]) => {
        setConfirmedUnitCount(units.length);
        await completeWizard(units);
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto max-w-2xl px-4 py-8 space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold">PlanMaker</h1>
                    <p className="text-sm text-muted-foreground">
                        セットアップウィザード
                    </p>
                </div>

                <WizardStepIndicator currentStep={currentStep} />

                {currentStep === 0 && (
                    <StepStudentInfo
                        initialData={studentData}
                        onNext={(data) => {
                            setStudentData(data);
                            nextStep();
                        }}
                    />
                )}

                {currentStep === 1 && studentData && (
                    <StepGoalSetting
                        studentData={studentData}
                        initialData={goalData}
                        onNext={(data) => {
                            setGoalData(data);
                            nextStep();
                        }}
                        onBack={prevStep}
                    />
                )}

                {currentStep === 2 && studentData && (
                    <StepCurriculumProposal
                        studentData={studentData}
                        isSubmitting={isSubmitting}
                        onConfirm={handleConfirmCurriculum}
                        onBack={prevStep}
                    />
                )}

                {currentStep === 3 && studentData && (
                    <StepComplete
                        studentId={studentData.studentId}
                        unitCount={confirmedUnitCount}
                        onGoToDashboard={goToDashboard}
                    />
                )}
            </div>
        </div>
    );
}
