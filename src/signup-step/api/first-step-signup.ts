import apiClient from "../../lib/api-client";
import type { OrgSignup, OrgSignupResponse, UpdateOrganisation } from "../types/first-step-signup";



export const CreateOrg = async (payload: OrgSignup): Promise<OrgSignupResponse> => {
    const response = await apiClient.post(
        "/organisation/signupOrg",
        payload
    );
    return response.data
}
export const UpdateOrg = async (payload: UpdateOrganisation): Promise<OrgSignupResponse> => {
    const response = await apiClient.patch(
        "/organisation/update",
        payload
    )
    return response.data
}