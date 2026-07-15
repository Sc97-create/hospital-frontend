import apiClient from "../../lib/api-client";
import type {
    CreateSupplierPayload,
    CreateSupplierResponse,
    GetSuppliersByOrgResponse,
} from "../types/supplier";

export const CreateSupplier = async (
    payload: CreateSupplierPayload,
): Promise<CreateSupplierResponse> => {
    const response = await apiClient.post("/supplier/createSupplier", payload);
    return response.data;
};

export const GetSuppliersByOrgID = async (
    organisation_id: string,
    limit: number,
    page_no: number,
): Promise<GetSuppliersByOrgResponse> => {
    const response = await apiClient.get("/supplier/getSupplierByOrgID", {
        params: { organisation_id, limit, page_no },
    });
    return response.data;
};
