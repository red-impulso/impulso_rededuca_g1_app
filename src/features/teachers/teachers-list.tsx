import Link from "next/link";
import { EMPTY_VALUE } from "../school/school-texts";
import { LoadMeter } from "./load-meter";
import { TeacherStatusBadge } from "./teacher-status-badge";
import { employmentLabel, teacherInitials } from "./teachers-rules";
import { ASSIGN_SUBJECTS_LABEL, EDIT_TEACHER_LABEL, TEACHER_COLUMNS } from "./teachers-texts";
import type { TeacherSummary } from "./types";

type TeachersListProps = {
    teachers: TeacherSummary[];
    selected: string[];
    onToggle: (id: string) => void;
    onToggleAll: () => void;
    onEdit: (teacher: TeacherSummary) => void;
};

const ACTION = "inline-flex min-h-11 items-center justify-center rounded-[10px] px-3 text-sm font-semibold text-blue outline-blue/40 hover:bg-page focus-visible:outline-3";
const CHECK = "h-5 w-5 accent-[var(--blue)]";

function subjectsText(teacher: TeacherSummary): string {
    const names = [...new Set(teacher.subjects.map((subject) => subject.name).filter(Boolean))];
    return names.length ? names.join(", ") : EMPTY_VALUE;
}

function assignHref(teacher: TeacherSummary): string {
    const course = teacher.subjects.find((subject) => subject.course)?.course;
    return course ? `/docentes/asignacion?curso=${course.id}` : "/docentes/asignacion";
}

export function TeacherAvatar({ name, size = "sm" }: { name: string; size?: "sm" | "lg" }) {
    return (
        <span aria-hidden="true" className={`flex shrink-0 items-center justify-center rounded-full bg-[#E8EEF9] font-semibold text-blue ${size === "lg" ? "h-14 w-14 text-xl" : "h-9 w-9 text-sm"}`}>
            {teacherInitials(name)}
        </span>
    );
}

// Lista de docentes (SDD 7.1): tabla densa con selección múltiple; tarjetas en celular
export function TeachersList({ teachers, selected, onToggle, onToggleAll, onEdit }: TeachersListProps) {
    const allSelected = teachers.length > 0 && teachers.every((teacher) => selected.includes(teacher.id));
    return (
        <>
            <div className="hidden overflow-x-auto rounded-2xl border border-line bg-surface lg:block">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[#F1F5F9] text-xs font-semibold text-muted">
                        <tr>
                            <th scope="col" className="w-12 px-4 py-3">
                                <input type="checkbox" className={CHECK} checked={allSelected} onChange={onToggleAll} aria-label="Seleccionar todos" />
                            </th>
                            {Object.entries(TEACHER_COLUMNS).map(([key, label]) => (
                                <th key={key} scope="col" className={`px-3 py-3 ${key === "actions" ? "text-right" : ""}`}>{label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {teachers.map((teacher) => (
                            <tr key={teacher.id} className={`border-t border-line ${selected.includes(teacher.id) ? "bg-[#E8EEF9]/50" : ""}`}>
                                <td className="px-4 py-2">
                                    <input type="checkbox" className={CHECK} checked={selected.includes(teacher.id)} onChange={() => onToggle(teacher.id)} aria-label={`Seleccionar a ${teacher.fullName}`} />
                                </td>
                                <th scope="row" className="px-3 py-2 font-normal">
                                    <span className="flex items-center gap-2">
                                        <TeacherAvatar name={teacher.fullName} />
                                        <span className="min-w-0">
                                            <Link href={`/docentes/${teacher.id}`} className="block font-semibold text-ink hover:underline">{teacher.fullName || EMPTY_VALUE}</Link>
                                            <span className="block truncate text-xs text-muted">{teacher.email ?? EMPTY_VALUE}</span>
                                        </span>
                                    </span>
                                </th>
                                <td className="px-3 py-2 text-ink">{teacher.fileNumber ?? EMPTY_VALUE}</td>
                                <td className="max-w-48 px-3 py-2 text-ink">{subjectsText(teacher)}</td>
                                <td className="px-3 py-2 text-ink">{teacher.coursesCount}</td>
                                <td className="px-3 py-2"><LoadMeter hours={teacher.weeklyHours} max={teacher.maxWeeklyHours} /></td>
                                <td className="px-3 py-2 text-ink">{employmentLabel(teacher.employmentStatus)}</td>
                                <td className="px-3 py-2"><TeacherStatusBadge status={teacher.status} /></td>
                                <td className="px-2 py-1">
                                    <div className="flex justify-end">
                                        <button type="button" onClick={() => onEdit(teacher)} className={ACTION} aria-label={`${EDIT_TEACHER_LABEL} ${teacher.fullName}`}>Editar</button>
                                        <Link href={assignHref(teacher)} className={ACTION}>Asignar</Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <ul className="flex flex-col gap-3 lg:hidden">
                {teachers.map((teacher) => (
                    <li key={teacher.id} className="rounded-2xl border border-line bg-surface p-4">
                        <div className="flex items-start gap-3">
                            <input type="checkbox" className={`${CHECK} mt-2`} checked={selected.includes(teacher.id)} onChange={() => onToggle(teacher.id)} aria-label={`Seleccionar a ${teacher.fullName}`} />
                            <TeacherAvatar name={teacher.fullName} />
                            <div className="min-w-0 flex-1">
                                <h3 className="font-semibold break-words text-ink">{teacher.fullName || EMPTY_VALUE}</h3>
                                <p className="text-sm text-muted">{[teacher.fileNumber, employmentLabel(teacher.employmentStatus)].filter(Boolean).join(" · ")}</p>
                                <p className="text-sm text-ink">{subjectsText(teacher)}</p>
                            </div>
                            <TeacherStatusBadge status={teacher.status} />
                        </div>
                        <div className="mt-3"><LoadMeter hours={teacher.weeklyHours} max={teacher.maxWeeklyHours} /></div>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <Link href={`/docentes/${teacher.id}`} className="inline-flex min-h-11 flex-1 items-center justify-center rounded-[10px] bg-blue px-3 text-sm font-semibold text-white">Ver ficha</Link>
                            <button type="button" onClick={() => onEdit(teacher)} className="inline-flex min-h-11 flex-1 items-center justify-center rounded-[10px] border border-line px-3 text-sm font-semibold text-ink">Editar</button>
                            <Link href={assignHref(teacher)} className="inline-flex min-h-11 flex-1 items-center justify-center rounded-[10px] border border-line px-3 text-sm font-semibold text-ink">{ASSIGN_SUBJECTS_LABEL}</Link>
                        </div>
                    </li>
                ))}
            </ul>
        </>
    );
}
