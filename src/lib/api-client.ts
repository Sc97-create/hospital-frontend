import axios from "axios";
import { LICENSE_EXPIRED_PATH } from "../license/constants";
import { API_V1_URL, APP_URL } from "./env";

// URLs that should NOT include the Authorization header
const PUBLIC_ENDPOINTS: string[] = [
    "/authentication/login",
    "/authentication/requestPasswordReset",
    "/central/customer/signup",
    "/central/customer/login",
];

/** Central signup APIs use a customer JWT — hospital refresh cookies do not apply. */
function isCentralSignupRequest(url: string | undefined): boolean {
    return Boolean(url?.includes("/central/"));
}

declare module "axios" {
    export interface AxiosRequestConfig {
        skipAuthRefresh?: boolean;
        skipAuthHeader?: boolean;
    }
}

// Shared Axios instance with base URL and auth header
const apiClient = axios.create({
    baseURL: API_V1_URL,
});

// Request interceptor — automatically attaches the token to every request
// except for public endpoints listed above
apiClient.interceptors.request.use(
    (config) => {
        const isPublic = PUBLIC_ENDPOINTS.some(
            (url) => config.url?.includes(url)
        );
        if (!isPublic && !config.skipAuthHeader) {
            const hasAuthHeader = Boolean(config.headers?.Authorization);
            const token = localStorage.getItem("access_token");
            if (token && !hasAuthHeader) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// To prevent infinite loops and handle concurrent requests during refresh
let isRefreshing = false;

type QueuedRequest = {
    resolve: (token: string | null) => void;
    reject: (error: unknown) => void;
};

let failedQueue: QueuedRequest[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

function redirectToLicenseExpired() {
    if (window.location.pathname === LICENSE_EXPIRED_PATH) return;
    window.location.replace(`${APP_URL}${LICENSE_EXPIRED_PATH}`);
}

// Response interceptor — handle 401 (token expired) and 402 (license expired) globally
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 402) {
            redirectToLicenseExpired();
            return Promise.reject(error);
        }

        const originalRequest = error.config;

        // Check if the error is 401, we haven't retried this request yet, and it's not a public endpoint
        const isPublic = PUBLIC_ENDPOINTS.some(url => originalRequest?.url?.includes(url));
        const isCentralSignup = isCentralSignupRequest(originalRequest?.url);

        // Signup JWT flow: never attempt hospital refresh / hard-redirect to login
        if (
            error.response?.status === 401 &&
            (isCentralSignup || originalRequest?.skipAuthRefresh)
        ) {
            return Promise.reject(error);
        }

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !isPublic &&
            !originalRequest.skipAuthRefresh
        ) {

            // If already refreshing, add to queue
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return apiClient(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Call the refresh token API endpoint
                // Since refresh token is in cookies, we use withCredentials: true
                const response = await axios.post(
                    `${API_V1_URL}/authentication/refresh`,
                    {},
                    { withCredentials: true }
                );

                // Extract new access token (checking both typical property names)
                const newAccessToken = response.data.accesstoken || response.data.access_token;

                if (newAccessToken) {
                    localStorage.setItem("access_token", newAccessToken);

                    // Update the authorization header for the original request
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                    processQueue(null, newAccessToken);
                    return apiClient(originalRequest);
                } else {
                    throw new Error("No access token returned from refresh endpoint");
                }
            } catch (refreshError) {
                processQueue(refreshError, null);

                if (
                    axios.isAxiosError(refreshError) &&
                    refreshError.response?.status === 402
                ) {
                    redirectToLicenseExpired();
                    return Promise.reject(refreshError);
                }

                // If refresh fails, clear storage and redirect to login
                localStorage.removeItem("access_token");
                localStorage.removeItem("user_id");
                localStorage.removeItem("organisation_id");
                localStorage.removeItem("is_admin");
                localStorage.removeItem("user_permissions");
                window.location.href = `${APP_URL}/login`;

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
