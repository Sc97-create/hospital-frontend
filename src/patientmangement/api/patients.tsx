import apiClient from "../../lib/api-client";
import type { Patientlistresponse, PatientResponse } from "../types/patients";

export const findMany = async (limit: number, pageno: number, organisationID: string): Promise<Patientlistresponse> => {
    const response = await apiClient.get(`/patients/getPatients`,
        {
            params: {
                organisation_id: organisationID,
                limit: limit,
                page_no: pageno
            }
        })

    return response.data
}
export const findOne = async (patientID: string): Promise<PatientResponse> => {
    const response = await apiClient.get(`/patients/getpatientByID/${patientID}`)
    return response.data
}