import apiClient from "../../lib/api-client";
import type {
    BulkUpdateLabOrderStatusPayload,
    BulkUpdateLabOrderStatusResponse,
    CheckBillingByBillingIdResponse,
    CreateLabOrderPayload,
    CreateLabOrderResponse,
    GetLabOrderByIdResponse,
    GetLabOrdersParams,
    GetLabOrdersResponse,
    LabOrderDetail,
} from "../types/lab-order";

export const CreateLabOrder = async (
    payload: CreateLabOrderPayload,
): Promise<CreateLabOrderResponse> => {
    const response = await apiClient.post<CreateLabOrderResponse>(
        "/lab-orders/create",
        payload,
    );
    return response.data;
};

export const ListLabOrders = async (
    params: GetLabOrdersParams,
): Promise<GetLabOrdersResponse> => {
    const trimmedStatus = params.status?.trim();
    const trimmedPatientId = params.patient_id?.trim();

    const response = await apiClient.get<GetLabOrdersResponse>("/lab-orders/list", {
        params: {
            organisation_id: params.organisation_id,
            ...(trimmedPatientId ? { patient_id: trimmedPatientId } : {}),
            ...(trimmedStatus ? { status: trimmedStatus } : {}),
            ...(params.limit != null ? { limit: params.limit } : {}),
            ...(params.page_no != null ? { page_no: params.page_no } : {}),
        },
    });

    return {
        code: response.data.code,
        count: response.data.count ?? 0,
        data: response.data.data ?? [],
    };
};

export const GetLabOrderById = async (labId: string): Promise<LabOrderDetail> => {
    const response = await apiClient.get<GetLabOrderByIdResponse>(
        `/lab-orders/getbyID/${labId}`,
    );
    return response.data.data;
};

export const BulkUpdateLabOrderStatus = async (
    payload: BulkUpdateLabOrderStatusPayload,
): Promise<BulkUpdateLabOrderStatusResponse> => {
    const response = await apiClient.patch<BulkUpdateLabOrderStatusResponse>(
        "/lab-orders/bulkupdatestatus",
        payload,
    );
    return response.data;
};

/** count === 0 → no invoice yet (can complete); count > 0 → already billed. */
export const CheckBillingByBillingId = async (
    billingId: string,
): Promise<CheckBillingByBillingIdResponse> => {
    const response = await apiClient.get<CheckBillingByBillingIdResponse>(
        `/billing/checkByBillingID/${billingId}`,
    );
    return {
        code: response.data.code,
        count: Number(response.data.count) || 0,
        message: response.data.message,
    };
};
