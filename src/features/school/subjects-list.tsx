import Link from "next/link";
import { RecordStatusBadge } from "./record-status-badge";
import { courseLabel, showingText, subjectCardMeta, teacherLabel, weeklyHoursShort } from "./school-rules";
import {
    ASSIGN_LABEL,
    DELETE_LABEL,
    EDIT_LABEL,
    EMPTY_VALUE,
    SEE_LABEL,
    SUBJECT_COLUMNS,
} from "./school-texts";
import type { Subject } from "./types";

type SubjectsListProps = {
    subjects: Subject[];
    total: number;
    onEdit: (subject: Subject) => void;
    onAssign: (subject: Subject) => void;
    onDelete: (subject: Subject) => void;
};

const ACTION_STYLES =
    "inline-flex min-h-11 items-center justify-center rounded-[10px] px-3 text-sm font-semibold outline-blue/40 focus-visible:outline-3 disabled:opacity-50";
const LINK_ACTION = `${ACTION_STYLES} text-blue hover:bg-page`;
const DANGER_ACTION = `${ACTION_STYLES} text-error hover:bg-error-bg`;
const CARD_BUTTON =
    "inline-flex min-h-11 flex-1 items-center justify-center rounded-[10px] border border-line bg-surface px-3 text-sm font-semibold text-ink outline-blue/40 hover:bg-page focus-visible:outline-3 disabled:opacity-50";

// Lista de materias: tabla en escritorio y tarjetas en celular (SDD 4.4)
export function SubjectsList({ subjects, total, onEdit, onAssign, onDelete }: SubjectsListProps) {
    return (
        <div className="flex flex-col gap-3">
            <div className="hidden overflow-x-auto rounded-2xl border border-line bg-surface lg:block">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[#F1F5F9] text-xs font-semibold text-muted">
                        <tr>
                            <th scope="col" className="px-4 py-3">{SUBJECT_COLUMNS.subject}</th>
                            <th scope="col" className="px-4 py-3">{SUBJECT_COLUMNS.course}</th>
                            <th scope="col" className="px-4 py-3">{SUBJECT_COLUMNS.teacher}</th>
                            <th scope="col" className="px-4 py-3">{SUBJECT_COLUMNS.hours}</th>
                            <th scope="col" className="px-4 py-3">{SUBJECT_COLUMNS.status}</th>
                            <th scope="col" className="px-4 py-3 text-right">{SUBJECT_COLUMNS.actions}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subjects.map((subject) => (
                            <tr key={subject.id} className="border-t border-line">
                                <th scope="row" className="px-4 py-2 font-semibold text-ink">{subject.name}</th>
                                <td className="px-4 py-2 text-ink">{subject.course ? courseLabel(subject.course) : EMPTY_VALUE}</td>
                                <td className="px-4 py-2 text-ink">{teacherLabel(subject.teacher)}</td>
                                <td className="px-4 py-2 text-ink">{weeklyHoursShort(subject.weeklyHours)}</td>
                                <td className="px-4 py-2"><RecordStatusBadge status={subject.status} /></td>
                                <td className="px-2 py-1">
                                    <div className="flex justify-end">
                                        <Link href={`/materias/${subject.id}`} className={LINK_ACTION} aria-label={`${SEE_LABEL} ${subject.name}`}>
                                            {SEE_LABEL}
                                        </Link>
                                        <button type="button" onClick={() => onEdit(subject)} className={LINK_ACTION} aria-label={`${EDIT_LABEL} ${subject.name}`}>
                                            {EDIT_LABEL}
                                        </button>
                                        <button
                                            type="button"
                                            disabled={!subject.course}
                                            onClick={() => onAssign(subject)}
                                            className={LINK_ACTION}
                                            aria-label={`Asignar docente a ${subject.name}`}
                                        >
                                            {ASSIGN_LABEL}
                                        </button>
                                        <button type="button" onClick={() => onDelete(subject)} className={DANGER_ACTION} aria-label={`${DELETE_LABEL} ${subject.name}`}>
                                            {DELETE_LABEL}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ul className="flex flex-col gap-3 lg:hidden">
                {subjects.map((subject) => {
                    const meta = subjectCardMeta(subject);
                    return (
                        <li key={subject.id} className="rounded-2xl border border-line bg-surface p-4">
                            <div className="flex items-start justify-between gap-3">
                                <h3 className="font-semibold text-ink">{subject.name}</h3>
                                <RecordStatusBadge status={subject.status} />
                            </div>
                            {meta && <p className="mt-1 text-sm text-muted">{meta}</p>}
                            <p className="text-sm text-muted">{teacherLabel(subject.teacher)}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <Link href={`/materias/${subject.id}`} className={CARD_BUTTON}>{SEE_LABEL}</Link>
                                <button type="button" onClick={() => onEdit(subject)} className={CARD_BUTTON}>{EDIT_LABEL}</button>
                                <button type="button" disabled={!subject.course} onClick={() => onAssign(subject)} className={CARD_BUTTON}>{ASSIGN_LABEL}</button>
                                <button type="button" onClick={() => onDelete(subject)} className={`${CARD_BUTTON} text-error`} aria-label={`${DELETE_LABEL} ${subject.name}`}>
                                    {DELETE_LABEL}
                                </button>
                            </div>
                        </li>
                    );
                })}
            </ul>

            <p className="text-sm text-muted">{showingText(subjects.length, total, "materias")}</p>
        </div>
    );
}
