"use client";

import { useEffect, useState } from "react";
import { CONTROL_STYLES, LABEL_STYLES } from "../../components/ui/form-fields";
import { courseLabel } from "./school-rules";
import {
    ALL_COURSES_LABEL,
    ALL_STATUSES_LABEL,
    ALL_TEACHERS_LABEL,
    CLEAR_FILTERS_LABEL,
    FILTERS_LABEL,
    SEARCH_LABEL,
    STATUS_LABELS,
    SUBJECT_COLUMNS,
} from "./school-texts";
import type { CourseRef, PersonRef, RecordStatus, SubjectFilters } from "./types";

type SubjectFiltersBarProps = {
    filters: SubjectFilters;
    courses: CourseRef[];
    teachers: PersonRef[];
    hasFilters: boolean;
    onChange: (filters: SubjectFilters) => void;
    onClear: () => void;
};

const SEARCH_DEBOUNCE_MS = 300;

// Buscador + Curso, Docente y Estado. En celular los filtros se abren con un botón.
export function SubjectFiltersBar({ filters, courses, teachers, hasFilters, onChange, onClear }: SubjectFiltersBarProps) {
    const [query, setQuery] = useState(filters.q);
    const [urlQuery, setUrlQuery] = useState(filters.q);
    const [open, setOpen] = useState(false);

    if (filters.q !== urlQuery) {
        setUrlQuery(filters.q);
        setQuery(filters.q);
    }

    useEffect(() => {
        if (query === filters.q) return;
        const timer = setTimeout(() => onChange({ ...filters, q: query }), SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [query, filters, onChange]);

    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-3 lg:flex-row lg:flex-wrap lg:items-end">
            <div className="flex gap-2 lg:min-w-64 lg:flex-1">
                <label htmlFor="materias-buscar" className="sr-only">{SEARCH_LABEL}</label>
                <input
                    id="materias-buscar"
                    type="search"
                    placeholder={SEARCH_LABEL}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className={`${CONTROL_STYLES} border-line`}
                />
                <button
                    type="button"
                    aria-expanded={open}
                    aria-controls="materias-filtros"
                    onClick={() => setOpen((value) => !value)}
                    className="h-11 shrink-0 rounded-[10px] border border-line bg-surface px-3 text-sm font-semibold text-ink outline-blue/40 focus-visible:outline-3 lg:hidden"
                >
                    {FILTERS_LABEL}
                </button>
            </div>
            <div id="materias-filtros" className={`${open ? "grid" : "hidden"} grid-cols-2 gap-3 lg:flex lg:flex-wrap lg:items-end`}>
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="materias-curso" className={LABEL_STYLES}>{SUBJECT_COLUMNS.course}</label>
                    <select
                        id="materias-curso"
                        value={filters.courseId ?? ""}
                        onChange={(event) => onChange({ ...filters, courseId: event.target.value || null })}
                        className={`${CONTROL_STYLES} border-line lg:w-44`}
                    >
                        <option value="">{ALL_COURSES_LABEL}</option>
                        {courses.map((course) => (
                            <option key={course.id} value={course.id}>{courseLabel(course)}</option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="materias-docente" className={LABEL_STYLES}>{SUBJECT_COLUMNS.teacher}</label>
                    <select
                        id="materias-docente"
                        value={filters.teacherId ?? ""}
                        onChange={(event) => onChange({ ...filters, teacherId: event.target.value || null })}
                        className={`${CONTROL_STYLES} border-line lg:w-48`}
                    >
                        <option value="">{ALL_TEACHERS_LABEL}</option>
                        {teachers.map((teacher) => (
                            <option key={teacher.id} value={teacher.id}>{teacher.fullName ?? "—"}</option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="materias-estado" className={LABEL_STYLES}>{SUBJECT_COLUMNS.status}</label>
                    <select
                        id="materias-estado"
                        value={filters.status ?? ""}
                        onChange={(event) => onChange({ ...filters, status: (event.target.value || null) as RecordStatus | null })}
                        className={`${CONTROL_STYLES} border-line lg:w-36`}
                    >
                        <option value="">{ALL_STATUSES_LABEL}</option>
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </div>
                {hasFilters && (
                    <button
                        type="button"
                        onClick={onClear}
                        className="col-span-2 h-11 rounded-[10px] px-3 text-sm font-semibold text-blue outline-blue/40 hover:underline focus-visible:outline-3"
                    >
                        {CLEAR_FILTERS_LABEL}
                    </button>
                )}
            </div>
        </div>
    );
}
