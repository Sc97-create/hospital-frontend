export interface OrganisationAddress {
    country_id: string;
    state: string;
    city: string;
}

export interface OrganisationData {
    id?: string;
    organisation_name?: string;
    legal_entity_name?: string;
    hospital_type?: string;
    code?: string;
    address?: OrganisationAddress;
}

/** Logged-in user / findbyID employee payload */
export interface UserData {
    id?: string;
    employee_id?: string;
    employee_code?: string;
    employee_name?: string;
    employee_first_name?: string;
    employee_last_name?: string;
    employee_email?: string;
    employee_phone?: string;
    employee_role_id?: string;
    role_name?: string;
    employee_department_id?: string;
    department_name?: string;
    employee_status?: string;
    employee_organisation_id?: string;
}

export interface OrganisationResponse {
    data: OrganisationData;
    code: string;
}

export interface UserResponse {
    data: UserData;
    message?: string;
    code?: string | number;
}
