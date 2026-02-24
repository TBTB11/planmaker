import type { SchoolType } from "@/db/db";
import type { AIConfidence, CurriculumProposal, ProposedUnit } from "./types";
import { curriculumTemplates } from "./curriculumTemplates";

export function generateCurriculum(
    grade: string,
    schoolType: SchoolType,
    subjects: string[]
): CurriculumProposal {
    const allUnits: ProposedUnit[] = [];

    for (const subject of subjects) {
        const template = curriculumTemplates[schoolType]?.[grade]?.[subject];
        if (template) {
            allUnits.push(
                ...template.units.map((u) => ({
                    ...u,
                    subject,
                }))
            );
        }
    }

    const overallConfidence: AIConfidence =
        allUnits.length > 0 ? "high" : "low";

    return {
        units: allUnits,
        overallConfidence,
        source: "general",
    };
}
