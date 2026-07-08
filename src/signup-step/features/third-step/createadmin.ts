import { useMutation } from "@tanstack/react-query";
import type { CreateAdmin,AdminResponse } from "../../types/third-step-signup";

import { AddUser } from "../../api/third-step-signup";

export const useCreateAdmin = () => useMutation<AdminResponse, Error, CreateAdmin>({
    mutationFn:AddUser
})
