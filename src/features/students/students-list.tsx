import Link from "next/link";
import { StatusBadge } from "../../components/ui/status-badge";
import { courseLabel } from "../school/school-rules";
import { EMPTY_VALUE } from "../school/school-texts";
import { formatDni, pageCount, pageNumbers, phoneHref, relativeDay, studentInitial, studentName, studentStatusLabel } from "./students-rules";
import {
    ATTENDANCE_LABEL,
    CALL_GUARDIAN_LABEL,
    EDIT_STUDENT_LABEL,
    MORE_LABEL,
    SEE_ATTENDANCE_LABEL,
    SEE_GRADES_LABEL,
    SEE_PROFILE_LABEL,
    STUDENT_COLUMNS,
    pageRangeText,
} from "./students-texts";
import type { StudentStatus, StudentSummary } from "./types";

const TONES = { active: "success", inactive: "neutral", draft: "warning" } as const;

export function StudentStatusBadge({ status }: { status: StudentStatus | null }) {
    if (!status) return <span className="text-sm text-muted">{EMPTY_VALUE}</span>;
    return <StatusBadge label={studentStatusLabel(status)} tone={TONES[status]} />;
}

export function Avatar({ student, size = "sm" }: { student: { firstName: string; lastName: string }; size?: "sm" | "lg" }) {
    const dimensions = size === "lg" ? "h-14 w-14 text-xl" : "h-9 w-9 text-sm";
    return (
        <span aria-hidden="true" className={`flex shrink-0 items-center justify-center rounded-full bg-[#E8EEF9] font-semibold text-blue ${dimensions}`}>
            {studentInitial(student)}
        </span>
    );
}

type StudentsListProps = {
    students: StudentSummary[];
    page: number;
    limit: number;
    total: number;
    onEdit: (student: StudentSummary) => void;
    onPage: (page: number) => void;
};

const LINK_ACTION =
    "inline-flex min-h-11 items-center justify-center rounded-[10px] px-3 text-sm font-semibold text-blue outline-blue/40 hover:bg-page focus-visible:outline-3";
const CARD_BUTTON =
    "inline-flex min-h-11 flex-1 items-center justify-center rounded-[10px] border border-line bg-surface px-3 text-sm font-semibold text-ink outline-blue/40 hover:bg-page focus-visible:outline-3";

function Pagination({ page, limit, total, onPage }: Pick<StudentsListProps, "page" | "limit" | "total" | "onPage">) {
    const last = pageCount(total, limit);
    const button =
        "flex h-11 min-w-11 items-center justify-center rounded-[10px] px-2 text-sm font-semibold outline-blue/40 focus-visible:outline-3 disabled:opacity-40";
    return (
        <nav aria-label="Paginación" className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">{pageRangeText(page, limit, total)}</p>
            {last > 1 && (
                <ul className="flex items-center gap-1">
                    <li>
                        <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Página anterior" className={`${button} text-ink hover:bg-page`}>
                            ‹
                        </button>
                    </li>
                    {pageNumbers(page, last).map((item, index) => (
                        <li key={`${item}-${index}`}>
                            {item === "…" ? (
                                <span className="px-1 text-muted">…</span>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => onPage(item)}
                                    aria-current={item === page ? "page" : undefined}
                                    aria-label={`Página ${item}`}
                                    className={`${button} ${item === page ? "bg-blue text-white" : "text-ink hover:bg-page"}`}
                                >
                                    {item}
                                </button>
                            )}
                        </li>
                    ))}
                    <li>
                        <button type="button" disabled={page >= last} onClick={() => onPage(page + 1)} aria-label="Página siguiente" className={`${button} text-ink hover:bg-page`}>
                            ›
                        </button>
                    </li>
                </ul>
            )}
        </nav>
    );
}

// Lista de alumnos (SDD 5.1): tabla en escritorio, tarjetas en celular, 25 por página
export function StudentsList({ students, page, limit, total, onEdit, onPage }: StudentsListProps) {
    return (
        <div className="flex flex-col gap-3">
            <div className="hidden overflow-x-auto rounded-2xl border border-line bg-surface lg:block">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[#F1F5F9] text-xs font-semibold text-muted">
                        <tr>
                            {Object.entries(STUDENT_COLUMNS).map(([key, label]) => (
                                <th key={key} scope="col" className={`px-4 py-3 ${key === "actions" ? "text-right" : ""}`}>{label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student) => {
                            const name = studentName(student);
                            return (
                                <tr key={student.id} className="border-t border-line">
                                    <th scope="row" className="px-4 py-2 font-semibold text-ink">
                                        <span className="flex items-center gap-2">
                                            <Avatar student={student} />
                                            {name}
                                        </span>
                                    </th>
                                    <td className="px-4 py-2 text-ink">{formatDni(student.dni)}</td>
                                    <td className="px-4 py-2 text-ink">{student.course?.year != null ? `${student.course.year}° Año` : EMPTY_VALUE}</td>
                                    <td className="px-4 py-2 text-ink">{student.course?.division ?? EMPTY_VALUE}</td>
                                    <td className="px-4 py-2"><StudentStatusBadge status={student.status} /></td>
                                    <td className="px-4 py-2 text-ink">{student.guardian?.fullName || EMPTY_VALUE}</td>
                                    <td className="px-4 py-2 text-muted">{relativeDay(student.updatedAt)}</td>
                                    <td className="px-2 py-1">
                                        <div className="flex items-center justify-end">
                                            <Link href={`/alumnos/${student.id}`} className={LINK_ACTION} aria-label={`${SEE_PROFILE_LABEL} de ${name}`}>{SEE_PROFILE_LABEL}</Link>
                                            <button type="button" onClick={() => onEdit(student)} className={LINK_ACTION} aria-label={`${EDIT_STUDENT_LABEL} ${name}`}>Editar</button>
                                            <details className="relative">
                                                <summary className={`${LINK_ACTION} cursor-pointer list-none`} aria-label={`${MORE_LABEL} acciones de ${name}`}>{MORE_LABEL}</summary>
                                                <div className="absolute right-0 z-10 mt-1 flex w-48 flex-col rounded-[10px] border border-line bg-surface p-1 shadow-lg">
                                                    <Link href={`/asistencia?alumno=${student.id}`} className={`${LINK_ACTION} justify-start text-ink`}>{SEE_ATTENDANCE_LABEL}</Link>
                                                    <Link href={`/calificaciones?alumno=${student.id}`} className={`${LINK_ACTION} justify-start text-ink`}>{SEE_GRADES_LABEL}</Link>
                                                </div>
                                            </details>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <ul className="flex flex-col gap-3 lg:hidden">
                {students.map((student) => {
                    const call = phoneHref(student.guardian?.phone ?? null);
                    const meta = [student.course ? courseLabel(student.course) : null, student.dni ? `DNI ${formatDni(student.dni)}` : null].filter(Boolean).join(" · ");
                    return (
                        <li key={student.id} className="rounded-2xl border border-line bg-surface p-4">
                            <div className="flex items-start gap-3">
                                <Avatar student={student} />
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-semibold break-words text-ink">{studentName(student)}</h3>
                                    {meta && <p className="text-sm text-muted">{meta}</p>}
                                </div>
                                <StudentStatusBadge status={student.status} />
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <Link href={`/alumnos/${student.id}`} className={`${CARD_BUTTON} border-blue bg-blue text-white hover:bg-blue/90`}>{SEE_PROFILE_LABEL}</Link>
                                {call ? (
                                    <a href={call} className={CARD_BUTTON}>{CALL_GUARDIAN_LABEL}</a>
                                ) : (
                                    <span aria-disabled="true" className={`${CARD_BUTTON} opacity-50`}>{CALL_GUARDIAN_LABEL}</span>
                                )}
                                <Link href={`/asistencia?alumno=${student.id}`} className={CARD_BUTTON}>{ATTENDANCE_LABEL}</Link>
                            </div>
                        </li>
                    );
                })}
            </ul>

            <Pagination page={page} limit={limit} total={total} onPage={onPage} />
        </div>
    );
}
