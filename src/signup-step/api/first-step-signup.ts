import axios from "axios";
import type { OrgSignup, OrgSignupResponse } from "../types/first-step-signup";



export const FirstSignup= async(payload:OrgSignup):Promise<OrgSignupResponse>=>{
    const response= await axios.post(
        "http://localhost:9069/api/v1/organisation/signupOrg",
        payload
    );
    return response.data
}