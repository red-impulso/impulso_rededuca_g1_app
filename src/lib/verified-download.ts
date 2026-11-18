// Descarga un archivo que devuelve Back (URL firmada de Storage) solo si existe.
// Antes se abría la URL en una pestaña sin revisarla y, si el archivo no estaba,
// la pestaña mostraba un 404 de Supabase ("Bucket not found").

export class DownloadError extends Error {
    constructor(readonly status: number) {
        super(`No se pudo descargar el archivo (${status})`);
        this.name = "DownloadError";
    }
}

// Pide el archivo y lanza DownloadError si no llega (status 0: sin conexión o bloqueado)
export async function fetchVerifiedBlob(url: string, fetchImpl: typeof fetch = fetch): Promise<Blob> {
    let response: Response;
    try {
        response = await fetchImpl(url);
    } catch {
        throw new DownloadError(0);
    }
    if (!response.ok) throw new DownloadError(response.status);
    return response.blob();
}

// "Díaz, Tomás" → "informe-diaz-tomas.csv"
export function downloadFileName(prefix: string, name: string, extension: string): string {
    const slug = name
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    return `${slug ? `${prefix}-${slug}` : prefix}.${extension}`;
}

// Guarda el archivo con un enlace de descarga: no abre pestañas, así que el
// bloqueador de ventanas emergentes no lo frena aunque venga después de un await
export function saveBlob(blob: Blob, fileName: string): void {
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = fileName;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
    // Se libera después: algunos navegadores leen el blob cuando ya volvió click()
    setTimeout(() => URL.revokeObjectURL(href), 60_000);
}
