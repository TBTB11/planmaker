import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/db/db";
import type { GoalType, SchoolType } from "@/db/db";
import type { ProposedUnit } from "@/lib/ai/types";

export interface WizardStudentData {
    studentId: string;
    schoolType: SchoolType;
    grade: string;
    subjects: string[];
}

export interface WizardGoalData {
    goalType: GoalType;
    targetDate: string;
    targetScore?: number;
    description: string;
}

export function useSetupWizard() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [studentData, setStudentData] = useState<WizardStudentData | null>(
        null
    );
    const [goalData, setGoalData] = useState<WizardGoalData | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const nextStep = useCallback(() => {
        setCurrentStep((prev) => Math.min(prev + 1, 3));
    }, []);

    const prevStep = useCallback(() => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    }, []);

    const completeWizard = useCallback(
        async (confirmedUnits: ProposedUnit[]) => {
            if (!studentData || !goalData) return;
            setIsSubmitting(true);
            try {
                const studentId = uuidv4();

                await db.students.add({
                    id: studentId,
                    studentId: studentData.studentId,
                    name: "",
                    grade: studentData.grade,
                    schoolType: studentData.schoolType,
                    goals: [
                        {
                            type: goalData.goalType,
                            targetDate: new Date(goalData.targetDate),
                            targetScore: goalData.targetScore,
                            description: goalData.description,
                        },
                    ],
                    subjects: studentData.subjects,
                });

                for (let i = 0; i < confirmedUnits.length; i++) {
                    const unit = confirmedUnits[i];
                    await db.units.add({
                        id: uuidv4(),
                        studentId,
                        subject: unit.subject,
                        name: unit.name,
                        order: i,
                        estimatedSessions: unit.estimatedSessions,
                        weight: unit.weight,
                        status: "NotStarted",
                        aiProposed: true,
                        aiConfidence: unit.confidence,
                    });
                }

                nextStep();
            } catch (error) {
                alert("セットアップに失敗しました。もう一度お試しください。");
            } finally {
                setIsSubmitting(false);
            }
        },
        [studentData, goalData, nextStep]
    );

    const goToDashboard = useCallback(() => {
        navigate("/");
    }, [navigate]);

    return {
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
    };
}
