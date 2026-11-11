"use client";

import { useEffect, useState } from "react";
import { CONTROL_STYLES, LABEL_STYLES } from "../../components/ui/form-fields";
import { courseLabel } from "../school/school-rules";
import { CLEAR_FILTERS_LABEL, FILTERS_LABEL, SHIFT_LABELS } from "../school/school-texts";
import type { Course } from "../school/types";
import { withFilter } from "./students-rules";
import { ALL_COURSES_OPTION, ALL_OPTION, ALL_YEARS_OPTION, FILTER_LABELS, SEARCH_PLACEHOLDER, SORT_LABELS, STUDENT_STATUS_LABELS } from "./students-texts";
import type { StudentFilters, StudentSort, StudentStatus } from "./types";

type StudentFiltersBarProps = {
    filters: StudentFilters;
    courses: Course[];
    years: number[];
    hasFilters: boolean;
    onChange: (filters: StudentFilters) => void;
    onClear: () => void;
};

const SEARCH_DEBOUNCE_MS = 300;

function Select({ id, label, value, onChange, options, width }: { id: string; label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[]; width: string }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={id} className={LABEL_STYLES}>{label}</label>
            <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className={`${CONTROL_STYLES} border-line ${width}`}>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
        </div>
    );
}

// Búsqueda única + Curso, Turno, Estado, Año lectivo y Orden (SDD 5.1)
export function StudentFiltersBar({ filters, courses, years, hasFilters, onChange, onClear }: StudentFiltersBarProps) {
    const [query, setQuery] = useState(filters.q);
    const [urlQuery, setUrlQuery] = useState(filters.q);
    const [open, setOpen] = useState(false);

    if (filters.q !== urlQuery) {
        setUrlQuery(filters.q);
        setQuery(filters.q);
    }

    useEffect(() => {
        if (query === filters.q) return;
        const timer = setTimeout(() => onChange(withFilter(filters, { q: query })), SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [query, filters, onChange]);

    const set = (change: Partial<StudentFilters>) => onChange(withFilter(filters, change));

    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-3 lg:flex-row lg:flex-wrap lg:items-end">
            <div className="flex gap-2 lg:min-w-72 lg:flex-1">
                <label htmlFor="alumnos-buscar" className="sr-only">{SEARCH_PLACEHOLDER}</label>
                <input id="alumnos-buscar" type="search" placeholder={SEARCH_PLACEHOLDER} value={query} onChange={(event) => setQuery(event.target.value)} className={`${CONTROL_STYLES} border-line`} />
                <button
                    type="button"
                    aria-expanded={open}
                    aria-controls="alumnos-filtros"
                    onClick={() => setOpen((value) => !value)}
                    className="h-11 shrink-0 rounded-[10px] border border-line bg-surface px-3 text-sm font-semibold text-ink outline-blue/40 focus-visible:outline-3 lg:hidden"
                >
                    {FILTERS_LABEL}
                </button>
            </div>
            <div id="alumnos-filtros" className={`${open ? "grid" : "hidden"} grid-cols-2 gap-3 lg:flex lg:flex-wrap lg:items-end`}>
                <Select
                    id="alumnos-curso"
                    label={FILTER_LABELS.course}
                    value={filters.courseId ?? ""}
                    onChange={(value) => set({ courseId: value || null })}
                    options={[{ value: "", label: ALL_COURSES_OPTION }, ...courses.map((course) => ({ value: course.id, label: courseLabel(course) }))]}
                    width="lg:w-40"
                />
                <Select
                    id="alumnos-turno"
                    label={FILTER_LABELS.shift}
                    value={filters.shift ?? ""}
                    onChange={(value) => set({ shift: (value || null) as StudentFilters["shift"] })}
                    options={[{ value: "", label: ALL_OPTION }, ...Object.entries(SHIFT_LABELS).map(([value, label]) => ({ value, label }))]}
                    width="lg:w-32"
                />
                <Select
                    id="alumnos-estado"
                    label={FILTER_LABELS.status}
                    value={filters.status ?? ""}
                    onChange={(value) => set({ status: (value || null) as StudentStatus | null })}
                    options={[{ value: "", label: ALL_OPTION }, ...Object.entries(STUDENT_STATUS_LABELS).map(([value, label]) => ({ value, label }))]}
                    width="lg:w-32"
                />
                <Select
                    id="alumnos-anio"
                    label={FILTER_LABELS.schoolYear}
                    value={filters.schoolYear === null ? "" : String(filters.schoolYear)}
                    onChange={(value) => set({ schoolYear: value ? Number(value) : null })}
                    options={[{ value: "", label: ALL_YEARS_OPTION }, ...years.map((year) => ({ value: String(year), label: `Año lectivo ${year}` }))]}
                    width="lg:w-44"
                />
                <Select
                    id="alumnos-orden"
                    label={FILTER_LABELS.sort}
                    value={filters.sort}
                    onChange={(value) => set({ sort: value as StudentSort })}
                    options={Object.entries(SORT_LABELS).map(([value, label]) => ({ value, label }))}
                    width="lg:w-44"
                />
                {hasFilters && (
                    <button type="button" onClick={onClear} className="col-span-2 h-11 rounded-[10px] px-3 text-sm font-semibold text-blue outline-blue/40 hover:underline focus-visible:outline-3">
                        {CLEAR_FILTERS_LABEL}
                    </button>
                )}
            </div>
        </div>
    );
}
