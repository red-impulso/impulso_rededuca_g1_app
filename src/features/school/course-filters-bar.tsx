"use client";

import { useEffect, useState } from "react";
import { CONTROL_STYLES, LABEL_STYLES } from "../../components/ui/form-fields";
import {
    ALL_SHIFTS_LABEL,
    ALL_STATUSES_LABEL,
    ALL_YEARS_LABEL,
    CLEAR_FILTERS_LABEL,
    COURSE_SORT_LABELS,
    FILTERS_LABEL,
    SEARCH_LABEL,
    SHIFT_LABELS,
    SORT_LABEL,
    STATUS_LABELS,
    YEAR_OPTION_PREFIX,
} from "./school-texts";
import type { CourseFilters, CourseShift, CourseSort, RecordStatus } from "./types";

type CourseFiltersBarProps = {
    filters: CourseFilters;
    years: number[];
    hasFilters: boolean;
    onChange: (filters: CourseFilters) => void;
    onClear: () => void;
};

const SEARCH_DEBOUNCE_MS = 300;

// Buscador (con espera de 300 ms) + Año, Turno, Estado y Ordenar. En celular los filtros se abren con un botón.
export function CourseFiltersBar({ filters, years, hasFilters, onChange, onClear }: CourseFiltersBarProps) {
    const [query, setQuery] = useState(filters.q);
    const [open, setOpen] = useState(false);

    const [urlQuery, setUrlQuery] = useState(filters.q);

    // Si la URL cambia (Limpiar filtros, volver atrás), el buscador la sigue
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
                <label htmlFor="cursos-buscar" className="sr-only">
                    {SEARCH_LABEL}
                </label>
                <input
                    id="cursos-buscar"
                    type="search"
                    placeholder={SEARCH_LABEL}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className={`${CONTROL_STYLES} border-line`}
                />
                <button
                    type="button"
                    aria-expanded={open}
                    aria-controls="cursos-filtros"
                    onClick={() => setOpen((value) => !value)}
                    className="h-11 shrink-0 rounded-[10px] border border-line bg-surface px-3 text-sm font-semibold text-ink outline-blue/40 focus-visible:outline-3 lg:hidden"
                >
                    {FILTERS_LABEL}
                </button>
            </div>

            <div id="cursos-filtros" className={`${open ? "grid" : "hidden"} grid-cols-2 gap-3 lg:flex lg:flex-wrap lg:items-end`}>
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="cursos-anio" className={LABEL_STYLES}>{YEAR_OPTION_PREFIX}</label>
                    <select
                        id="cursos-anio"
                        value={filters.schoolYear === null ? "" : String(filters.schoolYear)}
                        onChange={(event) => onChange({ ...filters, schoolYear: event.target.value ? Number(event.target.value) : null })}
                        className={`${CONTROL_STYLES} border-line lg:w-40`}
                    >
                        <option value="">{ALL_YEARS_LABEL}</option>
                        {years.map((year) => (
                            <option key={year} value={year}>{`${YEAR_OPTION_PREFIX} ${year}`}</option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="cursos-turno" className={LABEL_STYLES}>Turno</label>
                    <select
                        id="cursos-turno"
                        value={filters.shift ?? ""}
                        onChange={(event) => onChange({ ...filters, shift: (event.target.value || null) as CourseShift | null })}
                        className={`${CONTROL_STYLES} border-line lg:w-36`}
                    >
                        <option value="">{ALL_SHIFTS_LABEL}</option>
                        {Object.entries(SHIFT_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="cursos-estado" className={LABEL_STYLES}>Estado</label>
                    <select
                        id="cursos-estado"
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
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="cursos-orden" className={LABEL_STYLES}>{SORT_LABEL}</label>
                    <select
                        id="cursos-orden"
                        value={filters.sort}
                        onChange={(event) => onChange({ ...filters, sort: event.target.value as CourseSort })}
                        className={`${CONTROL_STYLES} border-line lg:w-40`}
                    >
                        {Object.entries(COURSE_SORT_LABELS).map(([value, label]) => (
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
