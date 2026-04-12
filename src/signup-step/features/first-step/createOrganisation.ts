import { useMutation } from "@tanstack/react-query";
import type { OrgSignup, OrgSignupResponse } from "../../types/first-step-signup";
import { CreateOrg } from "../../api/first-step-signup";


export const createOrg = () => useMutation<OrgSignupResponse, Error, OrgSignup>({
    mutationFn: CreateOrg
})