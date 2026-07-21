import { LogoutReq } from "./api/login-api";

const AUTH_STORAGE_KEYS = ["access_token", "user_id", "organisation_id"] as const;

/** Clear local session tokens (used after logout API or failed refresh). */
export function clearAuthSession(): void {
    for (const key of AUTH_STORAGE_KEYS) {
        localStorage.removeItem(key);
    }
}

/**
 * POST /authentication/logout, clear local session, then go to login.
 * Still clears and redirects if the API call fails (e.g. already expired).
 */
export async function logoutAndRedirect(
    navigate: (path: string, options?: { replace?: boolean }) => void,
): Promise<void> {
    try {
        await LogoutReq();
    } catch (error) {
        console.error("Logout API failed:", error);
    } finally {
        clearAuthSession();
        navigate("/login", { replace: true });
    }
}
