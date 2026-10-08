export interface Role {
    id: string;
    name: string;
}

export interface GetRolesResponse {
    code: number;
    data: Role[];
    message: string;
    total: number;
}

export interface Department {
    id: string;
    name: string;
    description: string;
    is_active: boolean;
    organisation_id: string;
    created_at: string;
    created_by: string;
    updated_at: string;
    updated_by: string;
}

export interface GetDepartmentsResponse {
    code: number;
    data: Department[];
    total: number;
    message?: string;
}

export interface Doctor {
    id: string;
    username: string;
}

export interface GetDoctorsResponse {
    data: Doctor[];
    message?: string;
    code?: string | number;
}
