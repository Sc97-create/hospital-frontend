
import apiClient from "../../lib/api-client";
import type { SecondSignupPayload, SecondSignupResponse } from "../types/second-step-signup";



export const SecondSignup = async (payload: SecondSignupPayload): Promise<SecondSignupResponse> => {
    const response = await apiClient.patch(
        "/organisation/updateLocation",
        payload

    );
    return response.data
}