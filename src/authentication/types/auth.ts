export type PermissionAction = "create" | "update" | "view" | "delete";

export type ModuleName =
    | "employee"
    | "patient"
    | "prescription"
    | "medicine"
    | "appointment";

export type ModulePermissions = Record<PermissionAction, boolean>;

export interface ModulePermissionEntry {
    module_name: ModuleName | string;
    permissions: ModulePermissions;
}

export interface loginPayload{
    user_name:string;
    password:string;
}
export interface loginResponse{
    user_id:string;
    token:string;
    message:string;
    organisation_id:string;
    refresh_token:string;
    passwordcleared?: boolean | string;
    password_cleared?: boolean | string;
    is_admin?: boolean;
    permissions?: ModulePermissionEntry[];
}

export interface logoutResponse {
    message?: string;
    code?: string;
}

export interface UpdatePasswordPayload {
    password: string;
    confirm_password: string;
}

export interface UpdatePasswordResponse {
    code?: number | string;
    message?: string;
    data?: unknown;
}