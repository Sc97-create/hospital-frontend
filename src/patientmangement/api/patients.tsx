import apiClient from "../../lib/api-client";
import type {
    GetPatientsPayload,
    Patientlistresponse,
    PatientResponse,
    UpdatePatientPayload,
    UpdatePatientResponse,
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

export const updatePatient = async (
    payload: UpdatePatientPayload,
): Promise<UpdatePatientResponse> => {
    const response = await apiClient.patch(`/patients/update`, payload);
    return response.data;
};