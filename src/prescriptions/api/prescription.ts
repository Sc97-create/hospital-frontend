import apiClient from "../../lib/api-client";
import type { createPrescResponse, CreatePrescription, FindManyResponse, findOneResponse, Medicine, SearchMedicineResponse, UpdatePrescriptionStatus } from "../types/prescriptionmodel";

export const SearchMedicines = async (name: string): Promise<SearchMedicineResponse> => {
    const response = await apiClient.get(`/medicine/searchMedicine?name=${name}`)
    return response.data
}
export const CreatePrescriptionApi = async (createprescription: CreatePrescription): Promise<createPrescResponse> => {
    const response = await apiClient.post(`/prescription/create`, createprescription)
    return response.data
}
export const UpdatePrescription = async (updateprescription: CreatePrescription): Promise<any> => {
    const response = await apiClient.patch(`/prescription/update`, updateprescription)
    return response.data
}
export const FindOnePrescription = async (prescription_id: string, limit: number = 3, offset: number = 0): Promise<findOneResponse> => {
    const response = await apiClient.get(`/prescription/getprescriptionbyid/${prescription_id}?limit=${limit}&offset=${offset}`)
    return response.data
}
export const FindAllPrescription = async (limit: number = 10, offset: number = 0, organisationID: string): Promise<FindManyResponse> => {
    const response = await apiClient.get(`/prescription/get?limit=${limit}&offset=${offset}&organisationID=${organisationID}`)
    return response.data
}
export const UpdateStatus = async (updateprescription: UpdatePrescriptionStatus): Promise<any> => {
    const response = await apiClient.patch(`/prescription/updateStatus`, updateprescription)
    return response.data
}