import apiClient from "../../lib/api-client";
import type { CreateAdmin,AdminResponse, UpdateUserPayload } from "../types/third-step-signup";



export const AddUser = async (payload: CreateAdmin): Promise<AdminResponse> => {
    const response = await apiClient.post(
        "/employee/create",
        payload

    );
    return response.data
}

export const UpdateUsers= async(payload:UpdateUserPayload):Promise<AdminResponse>=>{
    const response=await apiClient.patch(
        "/employee/update",
        payload
    );
    return response.data
}