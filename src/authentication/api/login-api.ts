import apiClient from "../../lib/api-client";
import type { loginPayload, loginResponse } from "../types/auth";

export const LoginReq = async (payload: loginPayload): Promise<loginResponse> => {
    const response = await apiClient.post(
        "/authentication/login",
        payload
        , { withCredentials: true }
    );
    return response.data
}