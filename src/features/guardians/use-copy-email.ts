"use client";

import { useToast } from "@/components/ui/toast";
import { COPY_EMAIL_ERROR_TEXT, EMAIL_COPIED_TEXT } from "./guardians-texts";

// «Copiar email» de los tutores: avisa con un toast si se copió o si falló
export function useCopyEmail(): (email: string) => void {
    const { showToast } = useToast();
    return (email: string) => {
        if (!navigator.clipboard) {
            showToast(COPY_EMAIL_ERROR_TEXT);
            return;
        }
        navigator.clipboard.writeText(email).then(
            () => showToast(EMAIL_COPIED_TEXT),
            () => showToast(COPY_EMAIL_ERROR_TEXT),
        );
    };
}
