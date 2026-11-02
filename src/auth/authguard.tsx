import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { usePermissions } from "./permissions-context";
import type { ModuleName, PermissionAction } from "../authentication/types/auth";
import { isSubscriptionExpired, SUBSCRIPTION_RENEW_PATH } from "../customer/subscription/access";

type AuthGuardProps = {
    children: ReactNode;
    /** Backend module this route belongs to. Omit for auth-only pages (profile, update-password). */
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
    const { can, getDefaultRoute } = usePermissions();

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (isSubscriptionExpired()) {
        return <Navigate to={SUBSCRIPTION_RENEW_PATH} replace />;
    }

    if (module && !can(module, action)) {
        return <Navigate to={getDefaultRoute()} replace />;
    }

    return children;
};

export default AuthGuard;
