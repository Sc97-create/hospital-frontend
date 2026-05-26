export interface CreateAdmin {
    organisation_id:string;
    department_id:string;
    role_id:string;
    first_name: string;
    last_name: string;
    email_id: string;
    mob_no: string;
    password: string;
    confirm_password: string;
    is_consent: boolean;
    assign_default_roles:boolean;
    assign_default_departments:boolean;
    assign_default_role_permissions:boolean;
}
export interface AdminResponse {
    user_id: string;
    code: string;
}
export interface UpdateUserPayload{
    user_id:string;
    first_name: string;
    last_name: string;
    email_id: string;
    mob_no: string;
    password: string;
    confirm_password: string;
}