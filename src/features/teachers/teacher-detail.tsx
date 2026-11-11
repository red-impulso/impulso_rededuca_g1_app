import Link from "next/link";
import type { ReactNode } from "react";
import { courseLabel } from "../school/school-rules";
import { EMPTY_VALUE } from "../school/school-texts";
import { formatDate, phoneHref, relativeDay } from "../students/students-rules";
import type { StudentActivity } from "../students/types";
import { LoadMeter } from "./load-meter";
import { TeacherStatusBadge } from "./teacher-status-badge";
import { TeacherAvatar } from "./teachers-list";
import { employmentLabel, seniorityText } from "./teachers-rules";
import {
    ACTIVITY_ERROR_TEXT,
    ASSIGN_SUBJECTS_LABEL,
    DAYS,
    DETAIL_LABELS,
    DETAIL_SECTIONS,
    KPI_LABELS,
    NO_ACTIVITY_TEXT,
    NO_SCHEDULE_TEXT,
    NO_SUBJECTS_TEXT,
    loadText,
} from "./teachers-texts";
import type { ScheduleBlock, TeacherDetail } from "./types";

export type TeacherActivityState =
    | { status: "loading" }
    | { status: "error"; message: string; onRetry: () => void }
    | { status: "ready"; data: StudentActivity[] };

type TeacherDetailViewProps = {
    teacher: TeacherDetail;
    activity: TeacherActivityState;
    actions: ReactNode;
    onRemoveSubject: (subject: TeacherDetail["subjects"][number]) => void;
};

const CARD = "rounded-2xl border border-line bg-surface p-4";
const LINK = "inline-flex min-h-11 items-center rounded-[10px] px-3 text-sm font-semibold text-blue outline-blue/40 hover:bg-page focus-visible:outline-3";

function Card({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className={CARD} aria-label={title}>
            <h2 className="mb-3 font-semibold text-ink">{title}</h2>
            {children}
        </section>
    );
}

function Rows({ rows }: { rows: [string, ReactNode][] }) {
    return (
        <dl className="flex flex-col gap-2 text-sm">
            {rows.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3">
                    <dt className="text-muted">{label}</dt>
                    <dd className="text-right font-medium break-words text-ink">{value}</dd>
                </div>
            ))}
        </dl>
    );
}

// Grilla semanal por bloques (ScheduleGrid); en celular, lista por día
export function ScheduleGrid({ blocks }: { blocks: ScheduleBlock[] }) {
    if (blocks.length === 0) return <p className="text-sm text-muted">{NO_SCHEDULE_TEXT}</p>;
    return (
        <div className="grid gap-2 sm:grid-cols-5">
            {DAYS.map((day, index) => {
                const items = blocks.filter((block) => block.day === index + 1).sort((a, b) => a.start.localeCompare(b.start));
                return (
                    <div key={day} className="rounded-[10px] bg-page p-2">
                        <h3 className="mb-1 text-xs font-semibold text-muted">{day}</h3>
                        {items.length === 0 ? (
                            <p className="text-xs text-muted">{EMPTY_VALUE}</p>
                        ) : (
                            <ul className="flex flex-col gap-1">
                                {items.map((block) => (
                                    <li key={`${block.start}-${block.subject}`} className="rounded-[10px] border-l-4 border-blue bg-surface px-2 py-1 text-xs">
                                        <span className="block font-semibold text-ink">{block.start}–{block.end}</span>
                                        <span className="block text-ink">{block.subject}</span>
                                        <span className="block text-muted">{block.course}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// Ficha de docente (SDD 7.2): dos columnas en escritorio, una en celular
export function TeacherDetailView({ teacher, activity, actions, onRemoveSubject }: TeacherDetailViewProps) {
    const { kpis } = teacher;
    const tel = phoneHref(teacher.phone);
    return (
        <div className="flex flex-col gap-4">
            <header className={`${CARD} flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between`}>
                <div className="flex items-start gap-4">
                    <TeacherAvatar name={teacher.fullName} size="lg" />
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl font-semibold break-words text-ink">{teacher.fullName || EMPTY_VALUE}</h1>
                            <TeacherStatusBadge status={teacher.status} />
                        </div>
                        <p className="text-sm text-muted">
                            {[employmentLabel(teacher.employmentStatus), teacher.fileNumber ? `Legajo ${teacher.fileNumber}` : null, teacher.email].filter(Boolean).join(" · ")}
                        </p>
                        <p className="text-sm text-ink">{[...new Set(teacher.subjects.map((subject) => subject.name))].join(", ") || EMPTY_VALUE}</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">{actions}</div>
            </header>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {[
                            [KPI_LABELS.load, loadText(kpis.weeklyHours, kpis.maxWeeklyHours)],
                            [KPI_LABELS.subjects, String(kpis.subjectsCount)],
                            [KPI_LABELS.courses, String(kpis.coursesCount)],
                            [KPI_LABELS.students, String(kpis.studentsReached)],
                        ].map(([label, value]) => (
                            <div key={label} className={CARD}>
                                <p className="text-xs text-muted">{label}</p>
                                <p className="text-xl font-semibold text-ink">{value}</p>
                            </div>
                        ))}
                    </div>
                    <Card title={DETAIL_SECTIONS.subjects}>
                        {teacher.subjects.length === 0 ? (
                            <div className="flex flex-col items-start gap-2">
                                <p className="text-sm text-muted">{NO_SUBJECTS_TEXT}</p>
                                <Link href="/docentes/asignacion" className={LINK}>{ASSIGN_SUBJECTS_LABEL}</Link>
                            </div>
                        ) : (
                            <ul className="divide-y divide-line">
                                {teacher.subjects.map((subject) => (
                                    <li key={subject.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                                        <div>
                                            <p className="font-semibold text-ink">{subject.name}</p>
                                            <p className="text-sm text-muted">{[subject.course ? courseLabel(subject.course) : null, `${subject.weeklyHours} hs semanales`].filter(Boolean).join(" · ")}</p>
                                        </div>
                                        <div className="flex">
                                            <Link href={`/docentes/asignacion?curso=${subject.course?.id ?? ""}&materia=${subject.id}`} className={LINK}>Cambiar</Link>
                                            <button type="button" onClick={() => onRemoveSubject(subject)} className={`${LINK} text-error`}>Quitar</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>
                    <Card title={DETAIL_SECTIONS.schedule}>
                        <ScheduleGrid blocks={teacher.schedule} />
                    </Card>
                </div>
                <div className="flex flex-col gap-4">
                    <Card title={KPI_LABELS.load}>
                        <LoadMeter hours={kpis.weeklyHours} max={kpis.maxWeeklyHours} />
                    </Card>
                    <Card title={DETAIL_SECTIONS.contact}>
                        <Rows
                            rows={[
                                [DETAIL_LABELS.email, teacher.email ? <a href={`mailto:${teacher.email}`} className="text-blue hover:underline">{teacher.email}</a> : EMPTY_VALUE],
                                [DETAIL_LABELS.phone, tel ? <a href={tel} className="text-blue hover:underline">{teacher.phone}</a> : EMPTY_VALUE],
                            ]}
                        />
                    </Card>
                    <Card title={DETAIL_SECTIONS.employment}>
                        <Rows
                            rows={[
                                [DETAIL_LABELS.fileNumber, teacher.fileNumber ?? EMPTY_VALUE],
                                [DETAIL_LABELS.employment, employmentLabel(teacher.employmentStatus)],
                                [DETAIL_LABELS.hiredAt, formatDate(teacher.hiredAt)],
                                [DETAIL_LABELS.seniority, seniorityText(teacher.seniority)],
                                [DETAIL_LABELS.maxHours, `${kpis.maxWeeklyHours} hs`],
                            ]}
                        />
                    </Card>
                    <Card title={DETAIL_SECTIONS.activity}>
                        {activity.status === "loading" && <p className="text-sm text-muted">Cargando…</p>}
                        {activity.status === "error" && (
                            <p className="flex flex-wrap items-center gap-2 text-sm">
                                <span role="alert" className="text-error">{ACTIVITY_ERROR_TEXT} {activity.message}</span>
                                <button type="button" onClick={activity.onRetry} className={LINK}>Reintentar</button>
                            </p>
                        )}
                        {activity.status === "ready" &&
                            (activity.data.length === 0 ? (
                                <p className="text-sm text-muted">{NO_ACTIVITY_TEXT}</p>
                            ) : (
                                <ul className="flex flex-col gap-2 text-sm">
                                    {activity.data.map((item) => (
                                        <li key={item.id} className="flex justify-between gap-2">
                                            <span className="text-ink">{item.title}</span>
                                            <span className="shrink-0 text-muted">{relativeDay(item.occurredAt)}</span>
                                        </li>
                                    ))}
                                </ul>
                            ))}
                    </Card>
                </div>
            </div>
        </div>
    );
}
