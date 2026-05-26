import apiClient from "../../lib/api-client";
import type { PersonalInfo, PersonalInfoResponse } from "../types/first-step-appointment";


export const CreateAppointment = async (payload: PersonalInfo): Promise<PersonalInfoResponse> => {
    const response = await apiClient.post(
        "/patients/addGeneralInfo",
        payload
    );
    return response.data
}
export const GetPatientByID = async (patientID: string): Promise<PersonalInfoResponse> => {
    const response = await apiClient.get(
        `/patients/getPatientByID`, { params: { patient_id: patientID } }
    );
    return response.data
}
