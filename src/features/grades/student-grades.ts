import { PASSING_GRADE, calculateAverage } from "./grade-rules";
import type { StudentGrade } from "./types";

// Orden y resumen de las notas de un hijo (portal del tutor, M1-UX sección 5).
// Back entrega una lista plana (materia + período + nota); acá se agrupa por materia.

export type SubjectPeriodGrade = {
    periodId: string;
    periodName: string;
    value: number | null;
    // Observación del docente; null si no tiene (o si está vacía)
    observations: string | null;
};

export type SubjectGrades = {
    subjectId: string;
    subjectName: string;
    // Una nota por período, en el orden en que llegan de Back
    periods: SubjectPeriodGrade[];
    // Promedio de los períodos con nota; null si todavía no hay ninguna
    average: number | null;
};

// Agrupa por materia (de la A a la Z) y calcula el promedio de cada una
export function groupGradesBySubject(grades: StudentGrade[]): SubjectGrades[] {
    const bySubject = new Map<string, SubjectGrades>();

    for (const grade of grades) {
        let subject = bySubject.get(grade.subject.id);
        if (!subject) {
            subject = {
                subjectId: grade.subject.id,
                subjectName: grade.subject.name,
                periods: [],
                average: null,
            };
            bySubject.set(grade.subject.id, subject);
        }
        subject.periods.push({
            periodId: grade.period.id,
            periodName: grade.period.name,
            value: grade.value,
            observations: grade.observations?.trim() ? grade.observations.trim() : null,
        });
    }

    const subjects = [...bySubject.values()];
    for (const subject of subjects) {
        subject.average = calculateAverage(subject.periods.map((period) => period.value));
    }
    return subjects.sort((a, b) => a.subjectName.localeCompare(b.subjectName, "es"));
}

export type StudentSummary = {
    // Promedio de los promedios de cada materia; null si no hay notas
    generalAverage: number | null;
    // Materias con promedio de 6 o más (supuesto de UX, a validar con la institución)
    approved: number;
    // Materias con promedio menor a 6
    pending: number;
};

// Las materias sin ninguna nota todavía no cuentan como aprobadas ni como pendientes
export function summarizeStudent(subjects: SubjectGrades[]): StudentSummary {
    const averages = subjects.map((subject) => subject.average);
    const graded = averages.filter((average): average is number => average !== null);

    return {
        generalAverage: calculateAverage(averages),
        approved: graded.filter((average) => average >= PASSING_GRADE).length,
        pending: graded.filter((average) => average < PASSING_GRADE).length,
    };
}
