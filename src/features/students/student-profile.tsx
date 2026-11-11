import Link from "next/link";
import type { ReactNode } from "react";
import { courseLabel, shiftLabel } from "../school/school-rules";
import { EMPTY_VALUE } from "../school/school-texts";
import { Avatar, StudentStatusBadge } from "./students-list";
import { countText, formatDate, formatDni, gradeText, percentText, phoneHref, relativeDay, studentName, studentStatusLabel } from "./students-rules";
import {
    ACADEMIC_LABELS,
    ATTENDANCE_BARS,
    BACK_TO_STUDENTS_LABEL,
    CONTACT_LABEL,
    GUARDIAN_PRIMARY_LABEL,
    GUARDIAN_SECONDARY_LABEL,
    KPI_LABELS,
    NO_ACADEMIC_TEXT,
    NO_ACADEMIC_TITLE,
    NO_ACTIVITY_TEXT,
    NO_OBSERVATIONS_TEXT,
    OBSERVATION_LABELS,
    PERSONAL_LABELS,
    SECTION_TITLES,
    SEE_COURSES_LABEL,
    SEND_ANNOUNCEMENT_LABEL,
} from "./students-texts";
import type { StudentActivity, StudentProfile } from "./types";

export type ActivityState = { status: "loading" } | { status: "error"; message: string; onRetry: () => void } | { status: "ready"; data: StudentActivity[] };

function Section({ title, children, defaultOpen = true }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
    // En celular se pliega; en escritorio queda abierta (lg:pointer-events-none en el summary no hace falta: details abierto)
    return (
        <details open={defaultOpen} className="group rounded-2xl border border-line bg-surface">
            <summary className="flex min-h-11 cursor-pointer items-center justify-between px-4 py-3 font-semibold text-ink">
                {title}
                <span aria-hidden="true" className="text-muted group-open:rotate-180">⌄</span>
            </summary>
            <div className="border-t border-line px-4 py-3">{children}</div>
        </details>
    );
}

function Rows({ rows }: { rows: [string, ReactNode][] }) {
    return (
        <dl className="grid gap-3 sm:grid-cols-2">
            {rows.map(([label, value]) => (
                <div key={label} className="min-w-0">
                    <dt className="text-xs font-semibold text-muted">{label}</dt>
                    <dd className="text-sm break-words text-ink">{value}</dd>
                </div>
            ))}
        </dl>
    );
}

function Kpi({ label, value, className = "" }: { label: string; value: string; className?: string }) {
    return (
        <div className={`rounded-2xl border border-line bg-surface p-4 ${className}`}>
            <p className="text-xs font-semibold text-muted">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-ink">{value}</p>
        </div>
    );
}

function Bar({ label, value, max }: { label: string; value: number | null; max: number }) {
    const width = value === null || max <= 0 ? 0 : Math.min(100, (value / max) * 100);
    return (
        <div>
            <div className="flex justify-between text-sm"><span className="text-ink">{label}</span><span className="font-semibold text-ink">{countText(value)}</span></div>
            <div className="mt-1 h-2 rounded-full bg-page" aria-hidden="true"><div className="h-2 rounded-full bg-blue" style={{ width: `${width}%` }} /></div>
        </div>
    );
}

function Donut({ percentage }: { percentage: number | null }) {
    const value = percentage ?? 0;
    return (
        <div className="relative hidden h-28 w-28 shrink-0 sm:block" role="img" aria-label={`${ATTENDANCE_BARS.attendance} ${percentText(percentage)}`}>
            <svg viewBox="0 0 36 36" className="h-28 w-28 -rotate-90" aria-hidden="true">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--line)" strokeWidth="3.5" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--blue)" strokeWidth="3.5" strokeDasharray={`${value} ${100 - value}`} />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-ink">{percentText(percentage)}</span>
        </div>
    );
}

type StudentProfileViewProps = {
    profile: StudentProfile;
    activity: ActivityState;
    actions: ReactNode;
};

// Ficha del alumno (SDD 5.2): encabezado, KPI y secciones
export function StudentProfileView({ profile, activity, actions }: StudentProfileViewProps) {
    const { personal, academic, academicSummary: grades, attendanceSummary: attendance, observations } = profile;
    const course = academic.course;
    const subtitle = [personal.dni ? `DNI ${formatDni(personal.dni)}` : null, personal.fileNumber ? `Legajo ${personal.fileNumber}` : null, course ? courseLabel(course) : null].filter(Boolean).join(" · ");
    const noGrades = grades.averageGrade === null && !grades.approvedSubjects && !grades.pendingSubjects;
    const totalAttendance = (attendance.justified ?? 0) + (attendance.unjustified ?? 0) + (attendance.late ?? 0);
    const [primary, secondary] = profile.guardians;

    return (
        <div className="flex flex-col gap-4">
            <Link href="/alumnos" className="inline-flex min-h-11 items-center gap-1 self-start rounded-[10px] text-sm font-semibold text-blue outline-blue/40 hover:underline focus-visible:outline-3">
                <span aria-hidden="true">←</span> {BACK_TO_STUDENTS_LABEL}
            </Link>
            <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                    <Avatar student={personal} size="lg" />
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl font-semibold break-words text-ink">{studentName(personal)}</h1>
                            <StudentStatusBadge status={academic.status} />
                        </div>
                        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">{actions}</div>
            </div>

            {noGrades ? (
                <div className="rounded-2xl border border-line bg-surface p-4">
                    <p className="font-semibold text-ink">{NO_ACADEMIC_TITLE}</p>
                    <p className="text-sm text-muted">{NO_ACADEMIC_TEXT}</p>
                    <Link href="/cursos" className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-blue hover:underline">{SEE_COURSES_LABEL}</Link>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-3 lg:grid-cols-4">
                    <Kpi label={KPI_LABELS.average} value={gradeText(grades.averageGrade)} />
                    <Kpi label={KPI_LABELS.approved} value={countText(grades.approvedSubjects)} />
                    <Kpi label={KPI_LABELS.pending} value={countText(grades.pendingSubjects)} />
                    <Kpi label={KPI_LABELS.attendance} value={percentText(attendance.percentage)} className="hidden lg:block" />
                </div>
            )}

            <div className="grid gap-4 lg:grid-cols-2">
                <div className="flex flex-col gap-4">
                    <Section title={SECTION_TITLES.personal}>
                        <Rows
                            rows={[
                                [PERSONAL_LABELS.firstName, personal.firstName || EMPTY_VALUE],
                                [PERSONAL_LABELS.lastName, personal.lastName || EMPTY_VALUE],
                                [PERSONAL_LABELS.dni, formatDni(personal.dni)],
                                [PERSONAL_LABELS.birthDate, formatDate(personal.birthDate)],
                                [PERSONAL_LABELS.gender, personal.gender ?? EMPTY_VALUE],
                                [PERSONAL_LABELS.address, personal.address ?? EMPTY_VALUE],
                                [PERSONAL_LABELS.phone, personal.phone ?? EMPTY_VALUE],
                                [PERSONAL_LABELS.email, personal.email ?? EMPTY_VALUE],
                            ]}
                        />
                    </Section>
                    <Section title={SECTION_TITLES.academic} defaultOpen={false}>
                        <Rows
                            rows={[
                                [ACADEMIC_LABELS.course, course?.year != null ? `${course.year}° Año` : EMPTY_VALUE],
                                [ACADEMIC_LABELS.division, course?.division ?? EMPTY_VALUE],
                                [ACADEMIC_LABELS.shift, shiftLabel(course?.shift ?? null)],
                                [ACADEMIC_LABELS.schoolYear, course?.schoolYear != null ? String(course.schoolYear) : EMPTY_VALUE],
                                [ACADEMIC_LABELS.enrollmentDate, formatDate(academic.enrollmentDate)],
                                [ACADEMIC_LABELS.status, studentStatusLabel(academic.status)],
                            ]}
                        />
                    </Section>
                    <Section title={SECTION_TITLES.observations}>
                        {observations.academic || observations.institutional ? (
                            <div className="flex flex-col gap-3">
                                {observations.academic && (
                                    <div role="note" className="rounded-[10px] bg-warning-bg px-3 py-2 text-sm text-warning">
                                        <p className="font-semibold">⚠ {OBSERVATION_LABELS.academic}</p>
                                        <p className="whitespace-pre-line">{observations.academic}</p>
                                    </div>
                                )}
                                {observations.institutional && (
                                    <div className="text-sm text-ink">
                                        <p className="font-semibold">{OBSERVATION_LABELS.institutional}</p>
                                        <p className="whitespace-pre-line">{observations.institutional}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-muted">{NO_OBSERVATIONS_TEXT}</p>
                        )}
                    </Section>
                </div>
                <div className="flex flex-col gap-4">
                    <Section title={SECTION_TITLES.attendance}>
                        <div className="flex items-center gap-4">
                            <Donut percentage={attendance.percentage} />
                            <div className="flex flex-1 flex-col gap-3">
                                <div className="flex justify-between text-sm sm:hidden"><span>{ATTENDANCE_BARS.attendance}</span><span className="font-semibold">{percentText(attendance.percentage)}</span></div>
                                <Bar label={ATTENDANCE_BARS.justified} value={attendance.justified} max={totalAttendance} />
                                <Bar label={ATTENDANCE_BARS.unjustified} value={attendance.unjustified} max={totalAttendance} />
                                <Bar label={ATTENDANCE_BARS.late} value={attendance.late} max={totalAttendance} />
                            </div>
                        </div>
                    </Section>
                    <Section title={SECTION_TITLES.guardians} defaultOpen={false}>
                        {profile.guardians.length === 0 ? (
                            <p className="text-sm text-muted">{EMPTY_VALUE}</p>
                        ) : (
                            <ul className="flex flex-col gap-3">
                                {[primary, secondary].filter(Boolean).map((guardian, index) => {
                                    const call = phoneHref(guardian.phone);
                                    return (
                                        <li key={guardian.id} className="rounded-[10px] border border-line p-3">
                                            <p className="text-xs font-semibold text-muted">{index === 0 ? GUARDIAN_PRIMARY_LABEL : GUARDIAN_SECONDARY_LABEL}</p>
                                            <p className="font-semibold text-ink">{guardian.fullName || EMPTY_VALUE}</p>
                                            <p className="text-sm text-muted">{guardian.phone ?? "Sin teléfono"} · {guardian.email ?? "Sin correo"}</p>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                <Link href="/comunicados" className="inline-flex min-h-11 items-center rounded-[10px] px-2 text-sm font-semibold text-blue hover:underline">{SEND_ANNOUNCEMENT_LABEL}</Link>
                                                {(call || guardian.email) && (
                                                    <a href={call ?? `mailto:${guardian.email}`} className="inline-flex min-h-11 items-center rounded-[10px] px-2 text-sm font-semibold text-blue hover:underline">{CONTACT_LABEL}</a>
                                                )}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </Section>
                    <Section title={SECTION_TITLES.activity}>
                        {activity.status === "loading" && <p className="text-sm text-muted">Cargando…</p>}
                        {activity.status === "error" && (
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                                <span role="alert" className="text-error">{activity.message}</span>
                                <button type="button" onClick={activity.onRetry} className="min-h-11 rounded-[10px] px-2 font-semibold text-blue hover:underline">Reintentar</button>
                            </div>
                        )}
                        {activity.status === "ready" &&
                            (activity.data.length === 0 ? (
                                <p className="text-sm text-muted">{NO_ACTIVITY_TEXT}</p>
                            ) : (
                                <ol className="flex flex-col gap-3 border-l-2 border-line pl-4">
                                    {activity.data.map((item) => (
                                        <li key={item.id} className="text-sm">
                                            <p className="text-ink">{item.title}</p>
                                            <p className="text-xs text-muted">{relativeDay(item.occurredAt)}</p>
                                        </li>
                                    ))}
                                </ol>
                            ))}
                    </Section>
                </div>
            </div>
        </div>
    );
}
