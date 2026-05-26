import axios from "axios";
import type { loginPayload, loginResponse } from "../types/auth";

export const LoginReq= async(payload:loginPayload):Promise<loginResponse>=>{
    const response=await axios.post(
        "http://localhost:9069/api/v1/authentication/login",
        payload
    );
    return response.data
}