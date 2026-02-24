import type { SchoolType, GoalType } from "@/db/db";

export type AIConfidence = "high" | "medium" | "low";

export interface ProposedUnit {
    name: string;
    subject: string;
    estimatedSessions: number;
    weight: number;
    confidence: AIConfidence;
}

export interface CurriculumProposal {
    units: ProposedUnit[];
    overallConfidence: AIConfidence;
    source: "general";
}

export interface GoalDateProposal {
    suggestedDate: string; // ISO date string (yyyy-MM-dd)
    confidence: AIConfidence;
    reasoning: string; // Japanese explanation for user
}

export interface TemplateUnit {
    name: string;
    estimatedSessions: number;
    weight: number;
    confidence: AIConfidence;
}

export interface CurriculumTemplate {
    units: TemplateUnit[];
    source: string;
}

export interface GoalDateTemplate {
    month: number; // 1-12
    day: number;
    reasoning: string;
    confidence: AIConfidence;
}

export type CurriculumTemplateMap = Record<
    SchoolType,
    Record<string, Record<string, CurriculumTemplate>>
>;

export type GoalDateTemplateMap = Record<
    GoalType,
    Record<SchoolType, Record<string, GoalDateTemplate[]>>
>;
