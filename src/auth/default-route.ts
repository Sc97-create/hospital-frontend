import type {
    ModulePermissionEntry,
    ModuleName,
} from "../authentication/types/auth";
import type { PermissionsByModule } from "./permissions-context";

export const MODULE_HOME_ROUTES: { module: ModuleName | string; path: string }[] = [
    { module: "dashboard", path: "/dashboard" },
    { module: "patient", path: "/patients" },
    { module: "appointment", path: "/appointments" },
    { module: "medicine", path: "/suppliers" },
    { module: "employee", path: "/employees" },
    { module: "prescription", path: "/prescription" },
];

const emptyPermissions = () => ({
    create: false,
    update: false,
    view: false,
    delete: false,
});

const toPermissionsMap = (
    entries: ModulePermissionEntry[] | undefined,
): PermissionsByModule => {
    const map: PermissionsByModule = {};
    if (!entries?.length) return map;

    for (const entry of entries) {
        const name = entry.module_name?.trim();
        if (!name) continue;
        map[name] = {
            ...emptyPermissions(),
            ...entry.permissions,
        };
    }
    return map;
};

export function resolveDefaultRoute(
    isAdmin: boolean,
    permissions: PermissionsByModule,
): string {
    if (isAdmin) return "/dashboard";

    for (const { module, path } of MODULE_HOME_ROUTES) {
        if (permissions[module]?.view) return path;
    }

    return "/profile";
}

export function resolveDefaultRouteFromEntries(
    isAdmin: boolean,
    entries?: ModulePermissionEntry[],
): string {
    return resolveDefaultRoute(isAdmin, toPermissionsMap(entries));
}
