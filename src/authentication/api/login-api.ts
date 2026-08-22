import apiClient from "../../lib/api-client";
import type {
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

export const UpdatePassword = async (
    payload: UpdatePasswordPayload,
): Promise<UpdatePasswordResponse> => {
    const response = await apiClient.patch("/authentication/updatePassword", payload);
    return response.data;
};