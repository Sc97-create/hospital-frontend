import apiClient from "../../lib/api-client";
import type {
    GetPatientsPayload,
    Patientlistresponse,
    PatientResponse,
} from "../types/patients";

export const findMany = async (
    payload: GetPatientsPayload,
): Promise<Patientlistresponse> => {
    const response = await apiClient.post(`/patients/getPatients`, payload);
    return response.data;
};

export const findOne = async (patientID: string): Promise<PatientResponse> => {
    const response = await apiClient.get(`/patients/getpatientByID/${patientID}`);
    return response.data;
};