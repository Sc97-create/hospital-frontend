import type { ModuleName } from "../authentication/types/auth";

/** Maps sidebar / app routes to backend module names. */
export const ROUTE_MODULE_MAP: Record<string, ModuleName> = {
    "/patients": "patient",
    "/appointments": "appointment",
    "/suppliers": "medicine",
    "/employees": "employee",
    "/prescription": "prescription",
};

export function moduleForRoute(path: string): ModuleName | undefined {
    const match = Object.keys(ROUTE_MODULE_MAP)
        .sort((a, b) => b.length - a.length)
        .find((prefix) => path === prefix || path.startsWith(`${prefix}/`));
    return match ? ROUTE_MODULE_MAP[match] : undefined;
}
