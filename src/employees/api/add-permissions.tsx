import apiClient from "../../lib/api-client";

export interface Permission {
    id: string;
    name: string;
}

export interface PermissionModule {
    id: string;
    name: string;
}

export interface GetPermissionsResponse {
    modules: PermissionModule[];
    permissions: Permission[];
}

export const GetPermissions = async (): Promise<GetPermissionsResponse> => {
    const response = await apiClient.get<GetPermissionsResponse>(
        `/permission/getAll`
    );
    return response.data
}
