import { useMutation } from "@tanstack/react-query";
import type { OrgSignupResponse, UpdateOrganisation } from "../../types/first-step-signup";
import { UpdateOrg } from "../../api/first-step-signup";


export const useUpdateOrg = () => useMutation<OrgSignupResponse, Error, UpdateOrganisation>({
    mutationFn: UpdateOrg
})