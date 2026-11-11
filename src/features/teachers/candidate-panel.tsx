"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { errorInfo } from "../school/use-school-data";
import { LoadMeter } from "./load-meter";
import { TeacherAvatar } from "./teachers-list";
import { availability } from "./teachers-rules";
import { AVAILABILITY_LABELS, LICENSE_WARNING_TEXT, SEARCHING_CANDIDATES_TEXT, TEACHERS_ERROR_TEXT, overLimitText } from "./teachers-texts";
import type { AssignmentRow, TeacherCandidate } from "./types";
import { useCandidates } from "./use-teachers-data";

type CandidatePanelProps = {
    courseId: string;
    row: AssignmentRow | null;
    extraHours: (teacherId: string) => number;
    onClose: () => void;
    onChoose: (candidate: TeacherCandidate) => void;
};

const TONES = { available: "text-success", conflict: "text-error", "over-limit": "text-error", unavailable: "text-muted" } as const;
const ICONS = { available: "✓", conflict: "✕", "over-limit": "▲", unavailable: "–" } as const;

// Selector de docente (SDD 7.3): panel lateral de 440 px en escritorio, hoja inferior en celular
export function CandidatePanel({ courseId, row, extraHours, onClose, onChoose }: CandidatePanelProps) {
    const candidates = useCandidates(courseId, row?.subjectId ?? null);
    const [query, setQuery] = useState("");
    const list = (candidates.data ?? []).filter((candidate) => candidate.fullName.toLocaleLowerCase("es").includes(query.trim().toLocaleLowerCase("es")));
    return (
        <Dialog.Root open={row !== null} onOpenChange={(open) => !open && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/50" />
                <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-t-[20px] border border-line bg-surface p-5 text-ink shadow-xl outline-none lg:inset-y-0 lg:right-0 lg:left-auto lg:max-h-none lg:w-[440px] lg:rounded-none lg:rounded-l-2xl">
                    <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                            <Dialog.Title className="text-lg font-semibold">Asignar docente</Dialog.Title>
                            <Dialog.Description className="text-sm text-muted">{row ? `${row.subjectName} · ${row.weeklyHours} hs semanales` : ""}</Dialog.Description>
                        </div>
                        <Dialog.Close className="flex h-11 w-11 items-center justify-center rounded-[10px] text-muted hover:bg-page" aria-label="Cerrar">✕</Dialog.Close>
                    </div>
                    <label htmlFor="candidatos-buscar" className="sr-only">Buscar docente</label>
                    <input id="candidatos-buscar" type="search" placeholder="Buscar docente" value={query} onChange={(event) => setQuery(event.target.value)} className="mb-3 h-11 w-full rounded-[10px] border border-line px-3 outline-blue/40 focus-visible:outline-3" />
                    <div className="min-h-0 flex-1 overflow-y-auto">
                        {candidates.isPending && <p className="text-sm text-muted" aria-busy="true">{SEARCHING_CANDIDATES_TEXT}</p>}
                        {candidates.isError && (
                            <div className="flex flex-col items-start gap-2">
                                <p role="alert" className="rounded-[10px] bg-error-bg px-4 py-3 text-sm text-error">{errorInfo(candidates.error, TEACHERS_ERROR_TEXT).message}</p>
                                <button type="button" onClick={() => void candidates.refetch()} className="min-h-11 rounded-[10px] px-3 text-sm font-semibold text-blue hover:underline">Reintentar</button>
                            </div>
                        )}
                        {candidates.data && row && (
                            <ul className="flex flex-col gap-2">
                                {list.map((candidate) => {
                                    const extra = extraHours(candidate.id);
                                    const state = availability(candidate, row.weeklyHours, extra);
                                    const resulting = candidate.weeklyHours + extra + row.weeklyHours;
                                    const current = row.teacher?.id === candidate.id;
                                    return (
                                        <li key={candidate.id} className={`rounded-2xl border border-line p-3 ${state === "unavailable" ? "opacity-60" : ""}`}>
                                            <div className="flex items-start gap-3">
                                                <TeacherAvatar name={candidate.fullName} />
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-semibold">{candidate.fullName}</p>
                                                    <p className={`text-sm font-semibold ${TONES[state]}`}><span aria-hidden="true">{ICONS[state]} </span>{AVAILABILITY_LABELS[state]}</p>
                                                </div>
                                            </div>
                                            <div className="mt-2"><LoadMeter hours={candidate.weeklyHours + extra} max={candidate.maxWeeklyHours} /></div>
                                            <p className="mt-1 text-xs text-muted">Carga resultante: {resulting} hs</p>
                                            {state === "conflict" && <p className="mt-1 text-sm text-error">{candidate.conflict}</p>}
                                            {state === "over-limit" && <p className="mt-1 text-sm text-error">{overLimitText(resulting, candidate.maxWeeklyHours)}</p>}
                                            {candidate.status === "licencia" && state === "available" && <p className="mt-1 text-sm text-warning">{LICENSE_WARNING_TEXT}</p>}
                                            <button type="button" disabled={state !== "available" || current} onClick={() => onChoose(candidate)} className="mt-2 h-11 w-full rounded-[10px] bg-blue px-4 text-sm font-semibold text-white outline-blue/40 hover:bg-blue/90 focus-visible:outline-3 disabled:bg-line disabled:text-muted">
                                                {current ? "Asignado" : "Asignar"}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
