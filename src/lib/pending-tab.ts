// Abre una pestaña nueva en el mismo clic y le pasa la dirección cuando Back responde.
// Un window.open() hecho después de un await ya no cuenta como respuesta al clic y
// Chrome y Safari lo bloquean como ventana emergente.
export type PendingTab = {
    // Lleva la pestaña a la dirección (por ejemplo, el archivo exportado)
    open: (url: string) => void;
    // Cierra la pestaña vacía si el pedido falló
    close: () => void;
};

export function openPendingTab(): PendingTab {
    const tab = typeof window === "undefined" ? null : window.open("", "_blank");
    // La pestaña nueva no puede manejar a esta (equivale a "noopener")
    if (tab) tab.opener = null;

    return {
        open(url) {
            if (tab && !tab.closed) {
                tab.location.href = url;
            } else {
                // El navegador no dejó abrir la pestaña: último intento
                window.open(url, "_blank", "noopener");
            }
        },
        close() {
            if (tab && !tab.closed) tab.close();
        },
    };
}
