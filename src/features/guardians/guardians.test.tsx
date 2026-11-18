import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { guardianCandidatesPath, guardiansPath, makePrimaryPath, parseGuardianLinks, toGuardianPersonBody } from "./guardians-api";
import { availableCandidates, formatPhone, groupGuardians, roleLabels, unlinkRule } from "./guardians-rules";
import { guardianSchema, linkToValues } from "./guardians-schemas";
import { GuardianCard } from "./guardian-card";
import type { GuardianLink } from "./types";

function link(id: string, change: Partial<GuardianLink> = {}): GuardianLink {
    return {
        guardianMembershipId: id,
        relationship: "madre",
        isPrimary: false,
        isEmergencyContact: false,
        isFinancialResponsible: false,
        status: "active",
        updatedAt: null,
        fullName: `Tutor ${id}`,
        firstName: null,
        lastName: null,
        dni: null,
        phone: null,
        altPhone: null,
        address: null,
        email: null,
        otherStudentsCount: 0,
        ...change,
    };
}

describe("guardians-api", () => {
    it("rutas", () => {
        expect(guardiansPath("s1", true)).toBe("/students/s1/guardians?includeInactive=true");
        expect(makePrimaryPath("s1", "g1")).toBe("/students/s1/guardians/g1/make-primary");
        expect(guardianCandidatesPath(" ana ")).toBe("/guardians?limit=20&q=ana");
    });

    it("lee los vínculos de Back", () => {
        const links = parseGuardianLinks({
            data: [{ guardianMembershipId: "g1", relationship: "padre", isPrimary: true, status: "active", profile: { fullName: "Juan Díaz", phone: "3884123456" }, email: "j@x.com", otherStudentsCount: 2 }, {}],
            total: 1,
        });
        expect(links).toHaveLength(1);
        expect(links?.[0]).toMatchObject({ fullName: "Juan Díaz", isPrimary: true, phone: "3884123456", email: "j@x.com", altPhone: null });
    });

    it("cuerpo del tutor nuevo", () => {
        const values = { ...linkToValues(null), firstName: " Ana ", lastName: "Paz", dni: "30111222", email: "a@b.com", phone: "3884123456" };
        expect(toGuardianPersonBody(values)).toEqual({ firstName: "Ana", lastName: "Paz", dni: "30111222", email: "a@b.com", phone: "3884123456", altPhone: null, address: null });
    });
});

describe("guardians-schemas", () => {
    const valid = { ...linkToValues(null), firstName: "Ana", lastName: "Paz", dni: "30111222", relationship: "madre" as const, email: "a@b.com", phone: "3884123456" };
    it("acepta un tutor válido", () => expect(guardianSchema.safeParse(valid).success).toBe(true));
    it("rechaza lo que pide el SDD", () => {
        expect(guardianSchema.safeParse({ ...valid, firstName: "A" }).success).toBe(false);
        expect(guardianSchema.safeParse({ ...valid, dni: "123456" }).success).toBe(false);
        expect(guardianSchema.safeParse({ ...valid, email: "a@" }).success).toBe(false);
        expect(guardianSchema.safeParse({ ...valid, phone: "388412345" }).success).toBe(false);
        expect(guardianSchema.safeParse({ ...valid, altPhone: "12" }).success).toBe(false);
        expect(guardianSchema.safeParse({ ...valid, address: "x".repeat(121) }).success).toBe(false);
    });
});

describe("guardians-rules", () => {
    const links = [link("a"), link("p", { isPrimary: true }), link("i", { status: "inactive" }), link("c")];
    it("agrupa principal, secundario y otros; inactivos ocultos", () => {
        const groups = groupGuardians(links, false);
        expect(groups.primary.map((item) => item.guardianMembershipId)).toEqual(["p"]);
        expect(groups.secondary.map((item) => item.guardianMembershipId)).toEqual(["a"]);
        expect(groups.others.map((item) => item.guardianMembershipId)).toEqual(["c"]);
        expect(groupGuardians(links, true).others.map((item) => item.guardianMembershipId)).toEqual(["i", "c"]);
    });

    it("no desvincula al único principal sin elegir otro", () => {
        expect(unlinkRule(links[0], links).kind).toBe("free");
        const choose = unlinkRule(links[1], links);
        expect(choose.kind === "choose-primary" && choose.options.map((item) => item.guardianMembershipId)).toEqual(["a", "c"]);
        expect(unlinkRule(links[1], [links[1]]).kind).toBe("blocked");
    });

    it("roles y teléfono", () => {
        expect(roleLabels(link("x", { isPrimary: true, isEmergencyContact: true }))).toEqual(["Principal", "Contacto de emergencia"]);
        expect(formatPhone("3884123456")).toBe("388 412-3456");
    });
});

describe("GuardianCard", () => {
    const noop = () => undefined;
    it("muestra datos, estado con texto y acciones", () => {
        const html = renderToStaticMarkup(<GuardianCard link={link("g", { phone: "3884123456" })} busy={false} contactSubject="Consulta sobre Díaz, Tomás" onCopyEmail={noop} onEdit={noop} onMakePrimary={noop} onUnlink={noop} />);
        expect(html).toContain("Tutor g");
        expect(html).toContain("Madre");
        expect(html).toContain("Activo");
        expect(html).not.toContain("tel:");
        expect(html).toContain("388 412-3456");
        expect(html).toContain("Marcar como principal");
        expect(html).toContain("Desvincular");
    });

    it("el principal no muestra Marcar como principal; inactivo no se desvincula", () => {
        expect(renderToStaticMarkup(<GuardianCard link={link("g", { isPrimary: true })} busy={false} contactSubject="Consulta sobre Díaz, Tomás" onCopyEmail={noop} onEdit={noop} onMakePrimary={noop} onUnlink={noop} />)).not.toContain("Marcar como principal");
        expect(renderToStaticMarkup(<GuardianCard link={link("g", { status: "inactive" })} busy={false} contactSubject="Consulta sobre Díaz, Tomás" onCopyEmail={noop} onEdit={noop} onMakePrimary={noop} onUnlink={noop} />)).not.toContain("Desvincular");
    });
});

describe("QA-M9", () => {
    const noop = () => undefined;

    it("Contactar abre un mailto con asunto y ofrece Copiar email (QA-M9-03)", () => {
        const html = renderToStaticMarkup(<GuardianCard link={link("g", { email: "ana+tutora@demo.rededuca", phone: "3884123456" })} busy={false} contactSubject="Consulta sobre Díaz, Tomás" onCopyEmail={noop} onEdit={noop} onMakePrimary={noop} onUnlink={noop} />);
        expect(html).toContain('href="mailto:ana%2Btutora@demo.rededuca?subject=Consulta%20sobre%20D%C3%ADaz%2C%20Tom%C3%A1s"');
        expect(html).toContain("Copiar email");
    });

    it("sin correo, Contactar queda deshabilitado y no hay Copiar email", () => {
        const html = renderToStaticMarkup(<GuardianCard link={link("g")} busy={false} contactSubject="x" onCopyEmail={noop} onEdit={noop} onMakePrimary={noop} onUnlink={noop} />);
        expect(html).toMatch(/<button type="button" disabled=""[^>]*>Contactar<\/button>/);
        expect(html).not.toContain("mailto:");
        expect(html).not.toContain("Copiar email");
    });

    it("muestra Marcando… mientras se marca como principal (QA-M9-09)", () => {
        const html = renderToStaticMarkup(<GuardianCard link={link("g")} busy marking contactSubject="x" onCopyEmail={noop} onEdit={noop} onMakePrimary={noop} onUnlink={noop} />);
        expect(html).toContain("Marcando…");
        expect(html).toContain('aria-busy="true"');
    });

    it("no ofrece tutores con vínculo activo; sí los inactivos (QA-M9-05)", () => {
        const candidates = ["g1", "g2", "g3"].map((membershipId) => ({ membershipId, fullName: membershipId, dni: null, email: null }));
        const links = [link("g1"), link("g2", { status: "inactive" })];
        expect(availableCandidates(candidates, links).map((item) => item.membershipId)).toEqual(["g2", "g3"]);
    });
});
