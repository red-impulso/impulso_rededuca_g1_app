import Link from "next/link";
import { RecordStatusBadge } from "./record-status-badge";
import { courseCardMeta, courseLabel, shiftLabel, showingText, studentsText } from "./school-rules";
import {
    ASSIGN_LABEL,
    ASSIGN_TEACHER_LABEL,
    COURSE_COLUMNS,
    DELETE_LABEL,
    EDIT_LABEL,
    EMPTY_VALUE,
    SEE_DETAIL_LABEL,
    SEE_LABEL,
} from "./school-texts";
import type { Course } from "./types";

type CoursesListProps = {
    courses: Course[];
    // Total de cursos sin filtrar ("Mostrando 3 de 5 cursos")
    total: number;
    onEdit: (course: Course) => void;
    onAssign: (course: Course) => void;
    onDelete: (course: Course) => void;
};

const ACTION_STYLES =
    "inline-flex min-h-11 items-center justify-center rounded-[10px] px-3 text-sm font-semibold outline-blue/40 focus-visible:outline-3";
const LINK_ACTION = `${ACTION_STYLES} text-blue hover:bg-page`;
const DANGER_ACTION = `${ACTION_STYLES} text-error hover:bg-error-bg`;
const CARD_BUTTON =
    "inline-flex min-h-11 flex-1 items-center justify-center rounded-[10px] border border-line bg-surface px-3 text-sm font-semibold text-ink outline-blue/40 hover:bg-page focus-visible:outline-3";

function homeroomText(course: Course): string {
    return course.homeroomTeacher?.fullName ?? EMPTY_VALUE;
}

// Lista de cursos: tabla en escritorio y tarjetas en celular (SDD 4.2)
export function CoursesList({ courses, total, onEdit, onAssign, onDelete }: CoursesListProps) {
    return (
        <div className="flex flex-col gap-3">
            <div className="hidden overflow-x-auto rounded-2xl border border-line bg-surface lg:block">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[#F1F5F9] text-xs font-semibold text-muted">
                        <tr>
                            <th scope="col" className="px-4 py-3">{COURSE_COLUMNS.course}</th>
                            <th scope="col" className="px-4 py-3">{COURSE_COLUMNS.shift}</th>
                            <th scope="col" className="px-4 py-3">{COURSE_COLUMNS.students}</th>
                            <th scope="col" className="px-4 py-3">{COURSE_COLUMNS.homeroom}</th>
                            <th scope="col" className="px-4 py-3">{COURSE_COLUMNS.status}</th>
                            <th scope="col" className="px-4 py-3 text-right">{COURSE_COLUMNS.actions}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.map((course) => {
                            const label = courseLabel(course);
                            return (
                                <tr key={course.id} className="border-t border-line">
                                    <th scope="row" className="px-4 py-2 font-semibold text-ink">{label}</th>
                                    <td className="px-4 py-2 text-ink">{shiftLabel(course.shift)}</td>
                                    <td className="px-4 py-2 text-ink">{studentsText(course.studentsCount)}</td>
                                    <td className="px-4 py-2 text-ink">{homeroomText(course)}</td>
                                    <td className="px-4 py-2"><RecordStatusBadge status={course.status} /></td>
                                    <td className="px-2 py-1">
                                        <div className="flex justify-end">
                                            <Link href={`/cursos/${course.id}`} className={LINK_ACTION} aria-label={`${SEE_LABEL} ${label}`}>
                                                {SEE_LABEL}
                                            </Link>
                                            <button type="button" onClick={() => onEdit(course)} className={LINK_ACTION} aria-label={`${EDIT_LABEL} ${label}`}>
                                                {EDIT_LABEL}
                                            </button>
                                            <button type="button" onClick={() => onAssign(course)} className={LINK_ACTION} aria-label={`${ASSIGN_TEACHER_LABEL} en ${label}`}>
                                                {ASSIGN_LABEL}
                                            </button>
                                            <button type="button" onClick={() => onDelete(course)} className={DANGER_ACTION} aria-label={`${DELETE_LABEL} ${label}`}>
                                                {DELETE_LABEL}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <ul className="flex flex-col gap-3 lg:hidden">
                {courses.map((course) => {
                    const label = courseLabel(course);
                    const meta = courseCardMeta(course);
                    return (
                        <li key={course.id} className="rounded-2xl border border-line bg-surface p-4">
                            <div className="flex items-start justify-between gap-3">
                                <h3 className="font-semibold text-ink">{label}</h3>
                                <RecordStatusBadge status={course.status} />
                            </div>
                            {meta && <p className="mt-1 text-sm text-muted">{meta}</p>}
                            <p className="text-sm text-muted">Tutor: {homeroomText(course)}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <Link href={`/cursos/${course.id}`} className={CARD_BUTTON}>{SEE_DETAIL_LABEL}</Link>
                                <button type="button" onClick={() => onEdit(course)} className={CARD_BUTTON}>{EDIT_LABEL}</button>
                                <button type="button" onClick={() => onAssign(course)} className={CARD_BUTTON}>{ASSIGN_TEACHER_LABEL}</button>
                                <button type="button" onClick={() => onDelete(course)} className={`${CARD_BUTTON} text-error`} aria-label={`${DELETE_LABEL} ${label}`}>
                                    {DELETE_LABEL}
                                </button>
                            </div>
                        </li>
                    );
                })}
            </ul>

            <p className="text-sm text-muted">{showingText(courses.length, total, "cursos")}</p>
        </div>
    );
}
