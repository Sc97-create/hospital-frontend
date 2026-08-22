import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { usePermissions } from "./permissions-context";
import type { ModuleName, PermissionAction } from "../authentication/types/auth";

type AuthGuardProps = {
    children: ReactNode;
    /** Backend module this route belongs to. Omit for auth-only pages (dashboard, update-password). */
    module?: ModuleName | string;
    /** Required action. Defaults to view. Use create for add flows. */
    action?: PermissionAction;
};

/**
 * Requires login. When module is set, also requires that permission
 * (modules absent from the login permissions list are denied).
 */
const AuthGuard = ({
    children,
    module,
    action = "view",
}: AuthGuardProps) => {
    const token = localStorage.getItem("access_token");
    const { can } = usePermissions();

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (module && !can(module, action)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default AuthGuard;
