import apiClient from "../../lib/api-client";
import type {
    BillingCreatePayload,
    BillingCreateResponse,
    createPrescResponse,
    CreatePrescription,
    DispenseCheckoutResponse,
    FindManyResponse,
    findOneResponse,
    SearchMedicineResponse,
    UpdatePrescriptionStatus,
    UpdateStatusResponse,
} from "../types/prescriptionmodel";

export const SearchMedicines = async (name: string): Promise<SearchMedicineResponse> => {
    const response = await apiClient.get(`/medicine/searchMedicine?name=${name}`)
    return response.data
}
export const CreatePrescriptionApi = async (createprescription: CreatePrescription): Promise<createPrescResponse> => {
    const response = await apiClient.post(`/prescription/create`, createprescription)
    return response.data
}
export const UpdatePrescription = async (updateprescription: CreatePrescription): Promise<createPrescResponse> => {
    const response = await apiClient.patch(`/prescription/updatePrescriptions`, updateprescription)
    return response.data
}
export const FindOnePrescription = async (prescription_id: string, limit: number = 3, offset: number = 0): Promise<findOneResponse> => {
    const response = await apiClient.get(`/prescription/getprescriptionbyPid`, { params: { prescription_id, limit, offset } })    
    return response.data
}
export const FindAllPrescription = async (
    limit: number = 10,
    offset: number = 0,
    organisation_id: string,
    search?: string,
): Promise<FindManyResponse> => {
    const trimmedSearch = search?.trim();
    const response = await apiClient.get(`/prescription/get`, {
        params: {
            limit,
            offset,
            organisation_id,
            ...(trimmedSearch ? { search: trimmedSearch } : {}),
        },
    })
    return response.data
}
export const GetByStatus = async (
    limit: number = 10,
    offset: number = 0,
    organisation_id: string,
    status: string,
    search?: string,
): Promise<FindManyResponse> => {
    const trimmedSearch = search?.trim();
    const response = await apiClient.get(`/prescription/getByStatus`, {
        params: {
            limit,
            offset,
            organisation_id,
            status,
            ...(trimmedSearch ? { search: trimmedSearch } : {}),
        },
    })
    return response.data
}
export const UpdateStatus = async (updateprescription: UpdatePrescriptionStatus): Promise<UpdateStatusResponse> => {
    const response = await apiClient.patch(`/prescription/updateStatus`, updateprescription)
    return response.data
}

/** Batch-aware lines for pharmacist checkout (FEFO / stock decrement). */
export const GetDispenseCheckoutLines = async (
    prescription_id: string,
): Promise<DispenseCheckoutResponse> => {
    const response = await apiClient.get(`/prescription/getMedicineInfo/${prescription_id}`)
    return response.data
}

/** Confirm & Pay — create bill and decrement inventory per batch take. */
export const CreateBilling = async (
    payload: BillingCreatePayload,
): Promise<BillingCreateResponse> => {
    const response = await apiClient.post(`/billing/create`, payload)
    return response.data
}