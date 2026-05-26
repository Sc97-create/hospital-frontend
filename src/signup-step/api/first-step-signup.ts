import axios from "axios";
import type { OrgSignup, OrgSignupResponse, UpdateOrganisation } from "../types/first-step-signup";



export const CreateOrg = async (payload: OrgSignup): Promise<OrgSignupResponse> => {
    const response = await axios.post(
        "http://localhost:9069/api/v1/organisation/signupOrg",
        payload
    );
    return response.data
}
export const UpdateOrg = async (payload: UpdateOrganisation): Promise<OrgSignupResponse> => {
    const response = await axios.patch(
        "http://localhost:9069/api/v1/organisation/update",
        payload
    )
    return response.data
}