import apiClient from "../../lib/api-client";
import type {
    ForgotPasswordRequestPayload,
    ForgotPasswordRequestResponse,
    loginPayload,
    loginResponse,
    logoutResponse,
    UpdatePasswordPayload,
    UpdatePasswordResponse,
} from "../types/auth";

export const LoginReq = async (payload: loginPayload): Promise<loginResponse> => {
    const response = await apiClient.post(
        "/authentication/login",
        payload
        , { withCredentials: true }
    );
    return response.data
}

export const LogoutReq = async (): Promise<logoutResponse> => {
    const response = await apiClient.post(
        "/authentication/logout",
        {},
        { withCredentials: true },
    );
    return response.data;
}

export const RequestPasswordReset = async (
    payload: ForgotPasswordRequestPayload,
): Promise<ForgotPasswordRequestResponse> => {
    const response = await apiClient.post(
        "/authentication/requestPasswordReset",
        payload,
    );
    return response.data;
};

export const UpdatePassword = async (
    payload: UpdatePasswordPayload,
): Promise<UpdatePasswordResponse> => {
    const response = await apiClient.patch(
        "/authentication/updatePassword",
        payload,
        payload.token
            ? {
                  skipAuthRefresh: true,
                  skipAuthHeader: true,
              }
            : undefined,
    );
    return response.data;
};

/** First login after a cleared temporary password. Not the signed-in change-password flow. */
export const UpdatePasswordFirstLogin = async (
    payload: UpdatePasswordPayload,
): Promise<UpdatePasswordResponse> => {
    const response = await apiClient.patch(
        "/authentication/updatePasswordFirstLogin",
        {
            password: payload.password,
            confirm_password: payload.confirm_password,
        },
    );
    return response.data;
};
