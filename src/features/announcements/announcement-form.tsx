"use client";

import { useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import type { Role } from "../session/types";
import {
    confirmDescription,
    fieldId,
    firstInvalidField,
    pickVisibleErrors,
} from "./announcement-form-state";
import type { TouchedFields } from "./announcement-form-state";
import { AnnouncementFormFields } from "./announcement-form-fields";
import { buildPayload, emptyForm, isFormDirty, validateForm } from "./announcements-rules";
import {
    CONFIRM_PUBLISH_BACK_LABEL,
    CONFIRM_PUBLISH_LABEL,
    CONFIRM_PUBLISH_TITLE,
    LEAVE_CONFIRM_LABEL,
    LEAVE_DESCRIPTION,
    LEAVE_STAY_LABEL,
    LEAVE_TITLE,
    PUBLISHED_MESSAGE,
    PUBLISHING_LABEL,
} from "./announcements-ui";
import type { AnnouncementForm as AnnouncementFormValues, AnnouncementFormField } from "./types";
import { useAnnouncementCourses } from "./use-announcement-courses";
import { usePublishAnnouncement } from "./use-publish-announcement";

type AnnouncementFormProps = {
    role: Role;
    // Se publicó bien: la pantalla cierra el formulario y vuelve a pedir la lista
    onPublished: () => void;
    // Se cerró sin publicar
    onClose: () => void;
};

// Formulario "Nuevo comunicado": guarda lo que se escribe, valida, pide confirmación y publica.
export function AnnouncementForm({ role, onPublished, onClose }: AnnouncementFormProps) {
    const { state: coursesState, courses, retry } = useAnnouncementCourses(true);
    const { state: publishState, publish, reset } = usePublishAnnouncement();
    const { showToast } = useToast();

    const [form, setForm] = useState<AnnouncementFormValues>(() => emptyForm(role));
    // Campos que ya se tocaron y si ya se intentó enviar (los errores se muestran recién ahí)
    const [touched, setTouched] = useState<TouchedFields>({});
    const [submitted, setSubmitted] = useState(false);
    const [confirmPublishOpen, setConfirmPublishOpen] = useState(false);
    const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);

    // Ya publicado también cuenta: los botones siguen deshabilitados hasta que se cierra el formulario
    const publishing = publishState.status === "publishing" || publishState.status === "published";
    const dirty = isFormDirty(form, role);
    const errors = validateForm(form, role, courses);
    const visibleErrors = pickVisibleErrors(errors, touched, submitted);

    // Si hay texto escrito y se intenta cerrar la pestaña, el navegador avisa.
    // (Los enlaces del menú todavía no avisan: pendiente, igual que el resto de la app.)
    useEffect(() => {
        if (!dirty) return;
        function handleBeforeUnload(event: BeforeUnloadEvent) {
            event.preventDefault();
        }
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [dirty]);

    function handleChange(patch: Partial<AnnouncementFormValues>) {
        setForm((current) => ({ ...current, ...patch }));
        // Al seguir escribiendo desaparece el error del intento anterior
        if (publishState.status === "error") reset();
    }

    function handleBlur(field: AnnouncementFormField) {
        setTouched((current) => ({ ...current, [field]: true }));
    }

    // Enviar: si hay errores los muestra todos y lleva el foco al primero; si no, pide confirmación
    function handleSubmit() {
        setSubmitted(true);
        const first = firstInvalidField(errors);
        if (first) {
            document.getElementById(fieldId(first))?.focus();
            return;
        }
        setConfirmPublishOpen(true);
    }

    async function handleConfirmPublish() {
        const payload = buildPayload(form, role, courses);
        if (!payload) {
            setConfirmPublishOpen(false);
            return;
        }
        const ok = await publish(payload);
        if (!ok) {
            // El error se muestra en el formulario; lo escrito no se pierde
            setConfirmPublishOpen(false);
            return;
        }
        showToast(PUBLISHED_MESSAGE);
        onPublished();
    }

    function handleCancel() {
        if (dirty) setConfirmLeaveOpen(true);
        else onClose();
    }

    return (
        <>
            <AnnouncementFormFields
                role={role}
                form={form}
                errors={visibleErrors}
                coursesStatus={
                    coursesState.status === "ready"
                        ? "ready"
                        : coursesState.status === "error"
                          ? "error"
                          : "loading"
                }
                courses={courses}
                publishing={publishing}
                publishError={
                    publishState.status === "error"
                        ? { kind: publishState.kind, message: publishState.message }
                        : null
                }
                onChange={handleChange}
                onBlur={handleBlur}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                onRetryCourses={retry}
            />

            <ConfirmDialog
                open={confirmPublishOpen}
                title={CONFIRM_PUBLISH_TITLE}
                description={confirmDescription(form, courses)}
                confirmLabel={CONFIRM_PUBLISH_LABEL}
                cancelLabel={CONFIRM_PUBLISH_BACK_LABEL}
                loading={publishing}
                loadingLabel={PUBLISHING_LABEL}
                onConfirm={handleConfirmPublish}
                // Mientras publica no se puede cancelar (evita dejar la publicación a medias en pantalla)
                onCancel={() => {
                    if (!publishing) setConfirmPublishOpen(false);
                }}
            />

            <ConfirmDialog
                open={confirmLeaveOpen}
                title={LEAVE_TITLE}
                description={LEAVE_DESCRIPTION}
                confirmLabel={LEAVE_CONFIRM_LABEL}
                cancelLabel={LEAVE_STAY_LABEL}
                destructive
                onConfirm={() => {
                    setConfirmLeaveOpen(false);
                    onClose();
                }}
                onCancel={() => setConfirmLeaveOpen(false)}
            />
        </>
    );
}
