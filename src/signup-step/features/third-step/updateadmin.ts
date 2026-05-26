import type { AdminResponse, UpdateUserPayload } from "../../types/third-step-signup";
import { UpdateUsers } from "../../api/third-step-signup";
import { useMutation } from "@tanstack/react-query";
export const updateAdmin= ()=>useMutation<AdminResponse,Error,UpdateUserPayload>({
    mutationFn:UpdateUsers
})