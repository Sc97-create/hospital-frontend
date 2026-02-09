import { useMutation } from "@tanstack/react-query";



import {
    FirstStep,
   
} from '../../api/first-step-appointment'
import type { PersonalInfo,PersonalInfoResponse } from "../../types/first-step-appointment";

export const useFirstStepAppointment=()=> useMutation<PersonalInfoResponse,Error,PersonalInfo>({
    mutationFn:FirstStep
})