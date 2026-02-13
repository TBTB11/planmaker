import { db, type Student, type Unit, type ClassRecord } from './db';
import { v4 as uuidv4 } from 'uuid';

export async function seedDatabase() {
    const count = await db.students.count();
    if (count > 0) {
        console.log("Database already seeded");
        return;
    }

    console.log("Seeding database...");

    const studentId = uuidv4();
    const student: Student = {
        id: studentId,
        studentId: 'S001',
        name: 'Taro Yamada',
        grade: 'J2', // Junior High 2
        schoolType: 'JuniorHigh',
        goals: [
            {
                type: 'RegularTest',
                targetDate: new Date('2026-03-01'),
                description: 'Score 80+ in Math Final',
                targetScore: 80
            }
        ],
        subjects: ['Math', 'English']
    };

    const units: Unit[] = [
        {
            id: uuidv4(),
            studentId: studentId,
            subject: 'Math',
            name: 'Linear Functions',
            order: 1,
            estimatedSessions: 3,
            weight: 20,
            status: 'Completed',
            completionDate: new Date('2026-01-15')
        },
        {
            id: uuidv4(),
            studentId: studentId,
            subject: 'Math',
            name: 'Parallel Lines and Angles',
            order: 2,
            estimatedSessions: 4,
            weight: 20,
            status: 'Practicing'
        },
        {
            id: uuidv4(),
            studentId: studentId,
            subject: 'Math',
            name: 'Triangles and Congruence',
            order: 3,
            estimatedSessions: 4,
            weight: 25,
            status: 'NotStarted'
        }
    ];

    const classRecords: ClassRecord[] = [
        {
            id: uuidv4(),
            studentId: studentId,
            date: new Date('2026-01-10'),
            unitIds: [units[0].id],
            understanding: 4,
            studentMood: 'Motivated',
            homeworkAssigned: 'Workbook p.20-22',
            nextClassPlan: 'Linear Functions Wrap-up'
        }
    ];

    await db.students.add(student);
    await db.units.bulkAdd(units);
    await db.classRecords.bulkAdd(classRecords);

    console.log("Database seeded successfully");
}
