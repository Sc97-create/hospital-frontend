import { useMutation } from "@tanstack/react-query";
import type { SecondSignupPayload, SecondSignupResponse } from "../../types/second-step-signup";
import { SecondSignup } from "../../api/second-step-signup";

export const useSecondSignup = () => useMutation<SecondSignupResponse, Error, SecondSignupPayload>({
    mutationFn: SecondSignup
})