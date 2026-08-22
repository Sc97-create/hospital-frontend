import apiClient from "../../lib/api-client";
import type {
    AddEmployeePayload,
    AddEmployeeResponse,
    GetEmployeesParams,
    GetEmployeesResponse,
} from "../types/employee";

export const AddEmployeeApi = async (
    payload: AddEmployeePayload,
): Promise<AddEmployeeResponse> => {
    const response = await apiClient.post("/employee/addEmployee", payload);
    return response.data;
};

export const GetEmployees = async (
    params: GetEmployeesParams,
): Promise<GetEmployeesResponse> => {
    const trimmedSearch = params.search?.trim();
    const response = await apiClient.get("/employee/getEmployees", {
        params: {
            organisation_id: params.organisation_id,
            limit: params.limit,
            page_no: params.page_no,
            ...(trimmedSearch ? { search: trimmedSearch } : {}),
        },
    });
    return response.data;
};
