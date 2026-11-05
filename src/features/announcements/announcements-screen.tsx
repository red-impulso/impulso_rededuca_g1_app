"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { SkeletonLines } from "@/components/ui/skeleton";
import { useSession } from "@/features/session/use-session";
import { AnnouncementCard } from "./announcement-card";
import { AnnouncementForm } from "./announcement-form";
import { canPublish } from "./announcements-rules";
import { EMPTY_DESCRIPTION, EMPTY_TITLE, LOADING_TEXT, NEW_BUTTON_LABEL } from "./announcements-ui";
import { useAnnouncements } from "./use-announcements";

// Mientras carga la lista
function LoadingCard() {
    return (
        <div className="rounded-2xl border border-line bg-surface p-4">
            <SkeletonLines lines={4} />
            <p className="mt-3 text-xs font-semibold text-muted">{LOADING_TEXT}</p>
        </div>
    );
}

// Pantalla de comunicados: lista del más nuevo al más viejo (Back ya filtra qué ve cada rol)
// y, para quien puede publicar, el botón "Nuevo comunicado" que abre el formulario acá mismo.
export function AnnouncementsScreen() {
    const { active } = useSession();
    const { state, reload } = useAnnouncements();
    const [formOpen, setFormOpen] = useState(false);

    const canCreate = canPublish(active.role);

    let list: ReactNode;
    if (state.status === "loading") {
        list = <LoadingCard />;
    } else if (state.status === "error") {
        list = <ErrorState message={state.message} onRetry={reload} />;
    } else if (state.items.length === 0) {
        list = <EmptyState title={EMPTY_TITLE} description={EMPTY_DESCRIPTION} />;
    } else {
        list = (
            <ul aria-busy={state.refreshing} className="flex max-w-3xl flex-col gap-3">
                {state.items.map((announcement) => (
                    <AnnouncementCard key={announcement.id} announcement={announcement} />
                ))}
            </ul>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {canCreate && !formOpen && (
                <button
                    type="button"
                    onClick={() => setFormOpen(true)}
                    className="h-11 self-start rounded-[10px] bg-blue px-4 font-semibold text-white outline-blue/40 hover:bg-blue/90 focus-visible:outline-3"
                >
                    {NEW_BUTTON_LABEL}
                </button>
            )}

            {canCreate && formOpen && (
                <AnnouncementForm
                    role={active.role}
                    onPublished={() => {
                        setFormOpen(false);
                        // La respuesta del POST no trae la lista: se vuelve a pedir
                        reload();
                    }}
                    onClose={() => setFormOpen(false)}
                />
            )}

            {list}
        </div>
    );
}
