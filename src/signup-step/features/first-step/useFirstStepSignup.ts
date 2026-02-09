import { useMutation } from "@tanstack/react-query";
import type { OrgSignup, OrgSignupResponse } from "../../types/first-step-signup";
import { FirstSignup } from "../../api/first-step-signup";


export const useFirstStepSignup=()=>useMutation<OrgSignupResponse,Error,OrgSignup>({
    mutationFn:FirstSignup
})