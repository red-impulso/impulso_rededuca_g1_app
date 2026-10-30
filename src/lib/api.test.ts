import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getSession = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
    createClient: () => ({ auth: { getSession } }),
}));

async function loadApi() {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test/");
    return import("./api");
}

function jsonResponse(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

describe("apiFetch", () => {
    const fetchMock = vi.fn();

    beforeEach(() => {
        getSession.mockResolvedValue({ data: { session: { access_token: "token-demo" } } });
        vi.stubGlobal("fetch", fetchMock);
    });

    afterEach(() => {
        vi.unstubAllEnvs();
        vi.unstubAllGlobals();
        vi.clearAllMocks();
    });

    it("agrega Authorization y X-Institution-Id", async () => {
        const { apiFetch, setActiveInstitutionId } = await loadApi();
        setActiveInstitutionId("institucion-1");
        fetchMock.mockResolvedValue(jsonResponse({ ok: true }));

        await expect(apiFetch("/me/subjects")).resolves.toEqual({ ok: true });

        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toBe("http://api.test/me/subjects");
        const headers = init.headers as Headers;
        expect(headers.get("Authorization")).toBe("Bearer token-demo");
        expect(headers.get("X-Institution-Id")).toBe("institucion-1");
    });

    it("omite X-Institution-Id si todavía no hay membresía activa", async () => {
        const { apiFetch } = await loadApi();
        fetchMock.mockResolvedValue(jsonResponse({}));

        await apiFetch("/me");

        const headers = fetchMock.mock.calls[0][1].headers as Headers;
        expect(headers.has("X-Institution-Id")).toBe(false);
    });

    it("lanza ApiError con status y mensaje si la respuesta no es 2xx", async () => {
        const { apiFetch, ApiError } = await loadApi();
        fetchMock.mockResolvedValue(jsonResponse({ message: "Sin permiso" }, 403));

        const error = await apiFetch("/me").catch((e: unknown) => e);
        expect(error).toBeInstanceOf(ApiError);
        expect(error).toMatchObject({ status: 403, message: "Sin permiso" });
    });

    it("lanza ApiError con status 0 si no hay conexión", async () => {
        const { apiFetch } = await loadApi();
        fetchMock.mockRejectedValue(new TypeError("fetch failed"));

        await expect(apiFetch("/me")).rejects.toMatchObject({ status: 0 });
    });
});
