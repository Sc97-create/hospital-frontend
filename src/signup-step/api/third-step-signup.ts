import axios from "axios";
import type { CreateAdmin,AdminResponse, UpdateUserPayload } from "../types/third-step-signup";



export const AddUser = async (payload: CreateAdmin): Promise<AdminResponse> => {
    const response = await axios.post(
        "http://localhost:9069/api/v1/employee/create",
        payload

    );
    return response.data
}

export const UpdateUsers= async(payload:UpdateUserPayload):Promise<AdminResponse>=>{
    const response=await axios.patch(
        "http://localhost:9069/api/v1/employee/update",
        payload
    );
    return response.data
}