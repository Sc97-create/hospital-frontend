import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import type {
    ModuleName,
    ModulePermissionEntry,
    ModulePermissions,
    PermissionAction,
} from "../authentication/types/auth";

const IS_ADMIN_KEY = "is_admin";
const PERMISSIONS_KEY = "user_permissions";

export type PermissionsByModule = Record<string, ModulePermissions>;

type PermissionsContextValue = {
    isAdmin: boolean;
    permissions: PermissionsByModule;
    setAccess: (isAdmin: boolean, entries?: ModulePermissionEntry[]) => void;
    clearAccess: () => void;
    /** True when admin, or when the module exists in the permissions list. */
    hasModule: (module: ModuleName | string) => boolean;
    can: (module: ModuleName | string, action: PermissionAction) => boolean;
    canView: (module: ModuleName | string) => boolean;
    canCreate: (module: ModuleName | string) => boolean;
};

const emptyPermissions = (): ModulePermissions => ({
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

const readStoredIsAdmin = (): boolean => {
    try {
        return localStorage.getItem(IS_ADMIN_KEY) === "true";
    } catch {
        return false;
    }
};

const readStoredPermissions = (): PermissionsByModule => {
    try {
        const raw = localStorage.getItem(PERMISSIONS_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw) as ModulePermissionEntry[];
        return Array.isArray(parsed) ? toPermissionsMap(parsed) : {};
    } catch {
        return {};
    }
};

const PermissionsContext = createContext<PermissionsContextValue | null>(null);

export function PermissionsProvider({ children }: { children: ReactNode }) {
    const [isAdmin, setIsAdmin] = useState(readStoredIsAdmin);
    const [permissions, setPermissions] = useState<PermissionsByModule>(
        readStoredPermissions,
    );

    const setAccess = useCallback(
        (nextIsAdmin: boolean, entries?: ModulePermissionEntry[]) => {
            const nextMap = toPermissionsMap(entries);
            setIsAdmin(nextIsAdmin);
            setPermissions(nextMap);
            localStorage.setItem(IS_ADMIN_KEY, String(nextIsAdmin));
            localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(entries ?? []));
        },
        [],
    );

    const clearAccess = useCallback(() => {
        setIsAdmin(false);
        setPermissions({});
        localStorage.removeItem(IS_ADMIN_KEY);
        localStorage.removeItem(PERMISSIONS_KEY);
    }, []);

    const hasModule = useCallback(
        (module: ModuleName | string): boolean => {
            if (isAdmin) return true;
            return Object.prototype.hasOwnProperty.call(permissions, module);
        },
        [isAdmin, permissions],
    );

    const can = useCallback(
        (module: ModuleName | string, action: PermissionAction): boolean => {
            if (isAdmin) return true;
            if (!Object.prototype.hasOwnProperty.call(permissions, module)) {
                return false;
            }
            return Boolean(permissions[module]?.[action]);
        },
        [isAdmin, permissions],
    );

    const canView = useCallback(
        (module: ModuleName | string): boolean => can(module, "view"),
        [can],
    );

    const canCreate = useCallback(
        (module: ModuleName | string): boolean => can(module, "create"),
        [can],
    );

    const value = useMemo(
        () => ({
            isAdmin,
            permissions,
            setAccess,
            clearAccess,
            hasModule,
            can,
            canView,
            canCreate,
        }),
        [
            isAdmin,
            permissions,
            setAccess,
            clearAccess,
            hasModule,
            can,
            canView,
            canCreate,
        ],
    );

    return (
        <PermissionsContext.Provider value={value}>
            {children}
        </PermissionsContext.Provider>
    );
}

export function usePermissions(): PermissionsContextValue {
    const ctx = useContext(PermissionsContext);
    if (!ctx) {
        throw new Error("usePermissions must be used within PermissionsProvider");
    }
    return ctx;
}

/** Safe for optional use outside provider (defaults to no access). */
export function useOptionalPermissions(): PermissionsContextValue | null {
    return useContext(PermissionsContext);
}
