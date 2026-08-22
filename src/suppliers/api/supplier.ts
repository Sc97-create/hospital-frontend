import apiClient from "../../lib/api-client";
import type {
    CreateSupplierPayload,
    CreateSupplierResponse,
    GetSuppliersByOrgPayload,
    GetSuppliersByOrgResponse,
} from "../types/supplier";

export const CreateSupplier = async (
    payload: CreateSupplierPayload,
): Promise<CreateSupplierResponse> => {
    const response = await apiClient.post("/supplier/createSupplier", payload);
    return response.data;
};

export const GetSuppliersByOrgID = async (
    payload: GetSuppliersByOrgPayload,
): Promise<GetSuppliersByOrgResponse> => {
    const response = await apiClient.post("/supplier/getSupplierByOrgID", payload);
    return response.data;
};
