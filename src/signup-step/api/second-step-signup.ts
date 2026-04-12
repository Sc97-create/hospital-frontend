
import axios from "axios";
import type { SecondSignupPayload, SecondSignupResponse } from "../types/second-step-signup";



export const SecondSignup = async (payload: SecondSignupPayload): Promise<SecondSignupResponse> => {
    const response = await axios.patch(
        "http://localhost:9069/api/v1/organisation/updateLocation",
        payload

    );
    return response.data
}