import apiClient from "../../lib/api-client";

export const GetPermissions = async (): Promise<any> => {
    const response = await apiClient.get(
        `/permission/getAll`
    );
    return response.data
}