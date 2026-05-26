import apiClient from "../../lib/api-client";
import type { bedAllotment, bedAllotmentResponse } from "../types/second-step.appointment";

export const createBedallotment = async (payload: bedAllotment): Promise<bedAllotmentResponse> => {
    const response = await apiClient.post(
        "/bed/createBedAllotment",
        payload
    );
    return response.data
}