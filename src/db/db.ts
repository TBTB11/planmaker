import Dexie, { type EntityTable } from 'dexie';

export type GoalType = 'Exam' | 'RegularTest' | 'OvercomingWeakness' | 'Advanced';
export type UnitStatus = 'NotStarted' | 'Introduced' | 'Practicing' | 'WaitingConfirmation' | 'Completed' | 'NeedsReview' | 'OnHold';
export type SchoolType = 'Elementary' | 'JuniorHigh' | 'HighSchool';

export interface Goal {
    type: GoalType;
    targetDate: Date;
    targetScore?: number;
    description: string;
}

export interface Student {
    id: string; // UUID
    studentId: string; // Display ID e.g. S001
    name: string; // Encrypted/Anonymized in export
    grade: string;
    schoolType: SchoolType;
    goals: Goal[];
    subjects: string[];
}

export interface Unit {
    id: string; // UUID
    studentId: string; // Belongs to Student
    subject: string;
    name: string;
    order: number;
    estimatedSessions: number;
    weight: number;
    status: UnitStatus;
    completionDate?: Date;
    reviewDueDate?: Date;
}

export interface ClassRecord {
    id: string; // UUID
    studentId: string;
    date: Date;
    unitIds: string[]; // Units covered
    understanding: number; // 1-5
    studentMood: string;
    homeworkAssigned: string;
    nextClassPlan: string;
}

export const db = new Dexie('PlanMakerDB') as Dexie & {
    students: EntityTable<Student, 'id'>,
    units: EntityTable<Unit, 'id'>,
    classRecords: EntityTable<ClassRecord, 'id'>
};

db.version(1).stores({
    students: 'id, studentId, grade',
    units: 'id, studentId, [studentId+subject], [studentId+status]',
    classRecords: 'id, studentId, date'
});

export type { EntityTable };
