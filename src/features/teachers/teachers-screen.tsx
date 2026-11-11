"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { CONTROL_STYLES, LABEL_STYLES } from "@/components/ui/form-fields";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { SkeletonLines } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/features/session/use-session";
import { canManageSchool, courseLabel } from "../school/school-rules";
import { CLEAR_FILTERS_LABEL, FILTERS_LABEL, FORBIDDEN_TEXT, SHIFT_LABELS } from "../school/school-texts";
import { errorInfo, useCourses, useSubjects } from "../school/use-school-data";
import { pageCount } from "../students/students-rules";
import { pageRangeText } from "../students/students-texts";
import { TeacherFormDialog } from "./teacher-form-dialog";
import { TeachersList } from "./teachers-list";
import { DEFAULT_TEACHER_FILTERS, hasTeacherFilters, readTeacherFilters, teacherFiltersQuery, withTeacherFilter } from "./teachers-rules";
import {
    ASSIGN_SUBJECTS_LABEL,
    CHANGE_STATUS_LABEL,
    EMPLOYMENT_LABELS,
    EXPORT_ERROR_TEXT,
    EXPORT_LABEL,
    IMPORT_ERROR_TEXT,
    IMPORT_LABEL,
    NEW_TEACHER_LABEL,
    SEARCH_TEACHERS_PLACEHOLDER,
    STATUS_CHANGED_TEXT,
    TABS,
    TEACHER_CREATED_TEXT,
    TEACHER_FILTER_LABELS,
    TEACHER_SAVED_TEXT,
    TEACHER_SORT_LABELS,
    TEACHER_STATUS_LABELS,
    TEACHERS_EMPTY_TITLE,
    TEACHERS_ERROR_TEXT,
    TEACHERS_LOADING_TEXT,
    TEACHERS_OFFLINE_TEXT,
    TEACHERS_TITLE,
    selectedText,
    teachersNoResultsTitle,
    teachersTotalText,
} from "./teachers-texts";
import type { EmploymentStatus, TeacherFilters, TeacherSort, TeacherStatus } from "./types";
import { useChangeTeacherStatus, useExportTeachers, useImportTeachers, useTeacher, useTeacherCounts, useTeachers } from "./use-teachers-data";

const PRIMARY = "inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-blue px-4 font-semibold text-white outline-blue/40 hover:bg-blue/90 focus-visible:outline-3 disabled:opacity-60";
const SECONDARY = "inline-flex h-11 items-center justify-center rounded-[10px] border border-line bg-surface px-4 text-sm font-semibold text-ink outline-blue/40 hover:bg-page focus-visible:outline-3 disabled:opacity-60";

function Select({ id, label, value, onChange, options }: { id: string; label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[] }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={id} className={LABEL_STYLES}>{label}</label>
            <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className={`${CONTROL_STYLES} border-line lg:w-40`}>
                {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
        </div>
    );
}

function Filters({ filters, onChange }: { filters: TeacherFilters; onChange: (filters: TeacherFilters) => void }) {
    const courses = useCourses();
    const subjects = useSubjects();
    const [query, setQuery] = useState(filters.q);
    const [urlQuery, setUrlQuery] = useState(filters.q);
    const [open, setOpen] = useState(false);
    if (filters.q !== urlQuery) {
        setUrlQuery(filters.q);
        setQuery(filters.q);
    }
    useEffect(() => {
        if (query === filters.q) return;
        const timer = setTimeout(() => onChange(withTeacherFilter(filters, { q: query })), 300);
        return () => clearTimeout(timer);
    }, [query, filters, onChange]);
    const set = (change: Partial<TeacherFilters>) => onChange(withTeacherFilter(filters, change));
    const all = { value: "", label: "Todos" };
    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-3 lg:flex-row lg:flex-wrap lg:items-end">
            <div className="flex gap-2 lg:min-w-72 lg:flex-1">
                <label htmlFor="docentes-buscar" className="sr-only">{SEARCH_TEACHERS_PLACEHOLDER}</label>
                <input id="docentes-buscar" type="search" placeholder={SEARCH_TEACHERS_PLACEHOLDER} value={query} onChange={(event) => setQuery(event.target.value)} className={`${CONTROL_STYLES} border-line`} />
                <button type="button" aria-expanded={open} aria-controls="docentes-filtros" onClick={() => setOpen((value) => !value)} className={`${SECONDARY} shrink-0 lg:hidden`}>{FILTERS_LABEL}</button>
            </div>
            <div id="docentes-filtros" className={`${open ? "grid" : "hidden"} grid-cols-2 gap-3 lg:flex lg:flex-wrap lg:items-end`}>
                <Select id="docentes-revista" label={TEACHER_FILTER_LABELS.employment} value={filters.employmentStatus ?? ""} onChange={(value) => set({ employmentStatus: (value || null) as EmploymentStatus | null })} options={[all, ...Object.entries(EMPLOYMENT_LABELS).map(([value, label]) => ({ value, label }))]} />
                <Select id="docentes-materia" label={TEACHER_FILTER_LABELS.subject} value={filters.subjectId ?? ""} onChange={(value) => set({ subjectId: value || null })} options={[{ value: "", label: "Todas" }, ...(subjects.data ?? []).map((subject) => ({ value: subject.id, label: subject.course ? `${subject.name} · ${courseLabel(subject.course)}` : subject.name }))]} />
                <Select id="docentes-curso" label={TEACHER_FILTER_LABELS.course} value={filters.courseId ?? ""} onChange={(value) => set({ courseId: value || null })} options={[all, ...(courses.data ?? []).map((course) => ({ value: course.id, label: courseLabel(course) }))]} />
                <Select id="docentes-turno" label={TEACHER_FILTER_LABELS.shift} value={filters.shift ?? ""} onChange={(value) => set({ shift: (value || null) as TeacherFilters["shift"] })} options={[all, ...Object.entries(SHIFT_LABELS).map(([value, label]) => ({ value, label }))]} />
                <Select id="docentes-orden" label={TEACHER_FILTER_LABELS.sort} value={filters.sort} onChange={(value) => set({ sort: value as TeacherSort })} options={Object.entries(TEACHER_SORT_LABELS).map(([value, label]) => ({ value, label }))} />
                {hasTeacherFilters({ ...filters, status: null }) && (
                    <button type="button" onClick={() => onChange({ ...DEFAULT_TEACHER_FILTERS, status: filters.status })} className="col-span-2 h-11 rounded-[10px] px-3 text-sm font-semibold text-blue hover:underline">{CLEAR_FILTERS_LABEL}</button>
                )}
            </div>
        </div>
    );
}

function EditTeacherDialog({ id, onClose, onSaved }: { id: string; onClose: () => void; onSaved: () => void }) {
    const teacher = useTeacher(id);
    if (!teacher.data) return null;
    return <TeacherFormDialog open teacher={teacher.data} onOpenChange={(open) => !open && onClose()} onSaved={onSaved} />;
}

function TeachersContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { showToast } = useToast();
    const filters = readTeacherFilters(searchParams);
    const teachers = useTeachers(filters);
    const counts = useTeacherCounts();
    const changeStatus = useChangeTeacherStatus();
    const exportTeachers = useExportTeachers();
    const importTeachers = useImportTeachers();
    const fileInput = useRef<HTMLInputElement>(null);
    const [selected, setSelected] = useState<string[]>([]);
    const [dialog, setDialog] = useState<{ type: "none" } | { type: "create" } | { type: "edit"; id: string }>({ type: "none" });
    const setFilters = useCallback((next: TeacherFilters) => router.replace(`${pathname}${teacherFiltersQuery(next)}`, { scroll: false }), [router, pathname]);
    const rows = teachers.data?.data ?? [];
    const close = () => setDialog({ type: "none" });

    const runExport = () =>
        exportTeachers.mutate(selected, {
            onSuccess: (url) => window.open(url, "_blank", "noopener"),
            onError: (error) => showToast(`${EXPORT_ERROR_TEXT} ${errorInfo(error, "").message}`.trim()),
        });

    let content: ReactNode;
    if (teachers.isPending) {
        content = <div className="rounded-2xl border border-line bg-surface p-4" aria-busy="true"><p className="mb-3 text-sm text-muted">{TEACHERS_LOADING_TEXT}</p><SkeletonLines lines={8} /></div>;
    } else if (teachers.isError && !teachers.data) {
        const info = errorInfo(teachers.error, TEACHERS_ERROR_TEXT);
        content = <ErrorState message={info.kind === "offline" ? TEACHERS_OFFLINE_TEXT : info.message === TEACHERS_ERROR_TEXT ? info.message : `${TEACHERS_ERROR_TEXT} ${info.message}`} onRetry={() => void teachers.refetch()} />;
    } else if (teachers.data.total === 0 && !hasTeacherFilters(filters)) {
        content = (
            <EmptyState
                title={TEACHERS_EMPTY_TITLE}
                action={
                    <div className="flex flex-wrap justify-center gap-2">
                        <button type="button" onClick={() => setDialog({ type: "create" })} className={PRIMARY}>{NEW_TEACHER_LABEL}</button>
                        <button type="button" onClick={() => fileInput.current?.click()} className={SECONDARY}>{IMPORT_LABEL}</button>
                    </div>
                }
            />
        );
    } else if (rows.length === 0) {
        content = <EmptyState title={teachersNoResultsTitle(filters.q)} action={<button type="button" onClick={() => setFilters(DEFAULT_TEACHER_FILTERS)} className={SECONDARY}>{CLEAR_FILTERS_LABEL}</button>} />;
    } else {
        const last = pageCount(teachers.data.total, teachers.data.limit);
        content = (
            <>
                {teachers.isError && <p role="alert" className="rounded-[10px] bg-warning-bg px-4 py-3 text-sm text-warning">{TEACHERS_OFFLINE_TEXT} <button type="button" onClick={() => void teachers.refetch()} className="font-semibold underline">Reintentar</button></p>}
                <TeachersList
                    teachers={rows}
                    selected={selected}
                    onToggle={(id) => setSelected((list) => (list.includes(id) ? list.filter((item) => item !== id) : [...list, id]))}
                    onToggleAll={() => setSelected((list) => (rows.every((row) => list.includes(row.id)) ? [] : rows.map((row) => row.id)))}
                    onEdit={(teacher) => setDialog({ type: "edit", id: teacher.id })}
                />
                <nav aria-label="Paginación" className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-muted">{pageRangeText(teachers.data.page, teachers.data.limit, teachers.data.total)}</p>
                    <div className="flex gap-2">
                        <button type="button" disabled={filters.page <= 1} onClick={() => setFilters(withTeacherFilter(filters, { page: filters.page - 1 }))} className={SECONDARY}>Anterior</button>
                        <button type="button" disabled={filters.page >= last} onClick={() => setFilters(withTeacherFilter(filters, { page: filters.page + 1 }))} className={SECONDARY}>Siguiente</button>
                    </div>
                </nav>
            </>
        );
    }

    return (
        <>
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold text-ink">{TEACHERS_TITLE}</h1>
                    {teachers.data && <p className="text-sm text-muted">{teachersTotalText(teachers.data.total)}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={runExport} disabled={exportTeachers.isPending} className={SECONDARY}>{EXPORT_LABEL}</button>
                    <button type="button" onClick={() => fileInput.current?.click()} disabled={importTeachers.isPending} className={SECONDARY}>{IMPORT_LABEL}</button>
                    <button type="button" onClick={() => setDialog({ type: "create" })} className={`${PRIMARY} hidden lg:inline-flex`}><span aria-hidden="true">+</span> {NEW_TEACHER_LABEL}</button>
                </div>
                <input
                    ref={fileInput}
                    type="file"
                    accept=".csv,text/csv"
                    className="sr-only"
                    aria-label={IMPORT_LABEL}
                    onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.target.value = "";
                        if (file) importTeachers.mutate(file, { onError: (error) => showToast(`${IMPORT_ERROR_TEXT} ${errorInfo(error, "").message}`.trim()) });
                    }}
                />
            </div>
            <div role="tablist" aria-label="Estado" className="mb-4 flex gap-1 overflow-x-auto border-b border-line">
                {(Object.keys(TABS) as (keyof typeof TABS)[]).map((tab) => {
                    const value = tab === "all" ? null : tab;
                    const count = counts.data?.[tab];
                    return (
                        <button key={tab} type="button" role="tab" aria-selected={filters.status === value} onClick={() => setFilters(withTeacherFilter(filters, { status: value }))} className={`min-h-11 shrink-0 border-b-2 px-4 text-sm font-semibold ${filters.status === value ? "border-blue text-blue" : "border-transparent text-muted"}`}>
                            {TABS[tab]}{count !== undefined && <span className="ml-1 rounded-full bg-page px-2 text-xs">{count}</span>}
                        </button>
                    );
                })}
            </div>
            <div className="flex flex-col gap-4 pb-20 lg:pb-0">
                <Filters filters={filters} onChange={setFilters} />
                {selected.length > 0 && (
                    <div role="region" aria-label="Acciones en lote" className="flex flex-wrap items-center gap-2 rounded-2xl border border-blue bg-[#E8EEF9] p-3">
                        <span className="text-sm font-semibold text-ink">{selectedText(selected.length)}</span>
                        <button type="button" onClick={runExport} className={SECONDARY}>{EXPORT_LABEL}</button>
                        <label htmlFor="docentes-lote-estado" className="sr-only">{CHANGE_STATUS_LABEL}</label>
                        <select
                            id="docentes-lote-estado"
                            value=""
                            disabled={changeStatus.isPending}
                            onChange={(event) => {
                                const status = event.target.value as TeacherStatus;
                                if (!status) return;
                                changeStatus.mutate({ ids: selected, status }, { onSuccess: () => { setSelected([]); showToast(STATUS_CHANGED_TEXT); }, onError: (error) => showToast(errorInfo(error, TEACHERS_ERROR_TEXT).message) });
                            }}
                            className={`${CONTROL_STYLES} w-44 border-line`}
                        >
                            <option value="">{CHANGE_STATUS_LABEL}</option>
                            {Object.entries(TEACHER_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                        </select>
                        <Link href="/docentes/asignacion" className={SECONDARY}>{ASSIGN_SUBJECTS_LABEL}</Link>
                        <button type="button" onClick={() => setSelected([])} className="h-11 px-3 text-sm font-semibold text-blue hover:underline">Quitar selección</button>
                    </div>
                )}
                {content}
            </div>
            <button type="button" onClick={() => setDialog({ type: "create" })} className={`${PRIMARY} fixed right-4 bottom-4 z-20 shadow-lg lg:hidden`}><span aria-hidden="true">+</span> {NEW_TEACHER_LABEL}</button>
            <TeacherFormDialog open={dialog.type === "create"} teacher={null} onOpenChange={(open) => !open && close()} onSaved={() => { close(); showToast(TEACHER_CREATED_TEXT); }} />
            {dialog.type === "edit" && <EditTeacherDialog id={dialog.id} onClose={close} onSaved={() => { close(); showToast(TEACHER_SAVED_TEXT); }} />}
        </>
    );
}

// Lista de docentes (SDD 7.1)
export function TeachersScreen() {
    const { active } = useSession();
    if (!canManageSchool(active.role)) return <EmptyState title={FORBIDDEN_TEXT} />;
    return <TeachersContent />;
}
