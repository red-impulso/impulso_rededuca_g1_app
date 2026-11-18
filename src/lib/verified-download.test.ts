import { describe, expect, it } from "vitest";
import { DownloadError, downloadFileName, fetchVerifiedBlob } from "./verified-download";

const fakeFetch = (result: Response | Error) =>
    (async () => {
        if (result instanceof Error) throw result;
        return result;
    }) as unknown as typeof fetch;

describe("verified-download", () => {
    it("devuelve el archivo si existe", async () => {
        const blob = await fetchVerifiedBlob("https://x/a.csv", fakeFetch(new Response("campo,valor", { status: 200 })));
        expect(await blob.text()).toBe("campo,valor");
    });

    it("falla con el 404 de Storage (QA-M7-05: Bucket not found)", async () => {
        const error = await fetchVerifiedBlob("https://x/a.csv", fakeFetch(new Response('{"error":"Bucket not found"}', { status: 404 }))).catch((e: unknown) => e);
        expect(error).toBeInstanceOf(DownloadError);
        expect((error as DownloadError).status).toBe(404);
    });

    it("falla sin conexión", async () => {
        const error = await fetchVerifiedBlob("https://x/a.csv", fakeFetch(new TypeError("Failed to fetch"))).catch((e: unknown) => e);
        expect(error).toBeInstanceOf(DownloadError);
        expect((error as DownloadError).status).toBe(0);
    });

    it("arma el nombre del archivo", () => {
        expect(downloadFileName("informe", "Díaz, Tomás", "csv")).toBe("informe-diaz-tomas.csv");
        expect(downloadFileName("informe", "  ", "csv")).toBe("informe.csv");
    });
});
