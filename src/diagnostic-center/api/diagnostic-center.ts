import apiClient from "../../lib/api-client";
import type {
    CreateDiagnosticCentrePayload,
    CreateDiagnosticCentreResponse,
    GetDiagnosticCentresParams,
    GetDiagnosticCentresResponse,
} from "../types/diagnostic-center";

export const ListDiagnosticCentres = async (
    params: GetDiagnosticCentresParams,
): Promise<GetDiagnosticCentresResponse> => {
    const trimmedSearch = params.search?.trim();
    const trimmedStatus = params.status?.trim();

    const response = await apiClient.get<GetDiagnosticCentresResponse>(
        "/diagnostic-centres/list",
        {
            params: {
                organisation_id: params.organisation_id,
                ...(trimmedSearch ? { search: trimmedSearch } : {}),
                ...(trimmedStatus ? { status: trimmedStatus } : {}),
                ...(params.limit != null ? { limit: params.limit } : {}),
                ...(params.page_no != null ? { page_no: params.page_no } : {}),
            },
        },
    );

    return {
        code: response.data.code,
        total: response.data.total ?? 0,
        data: response.data.data ?? [],
    };
};

export const CreateDiagnosticCentre = async (
    payload: CreateDiagnosticCentrePayload,
): Promise<CreateDiagnosticCentreResponse> => {
    const response = await apiClient.post<CreateDiagnosticCentreResponse>(
        "/diagnostic-centres/create",
        payload,
    );
    return response.data;
};
