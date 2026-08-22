export interface GetDepartmentsResponse {
    data: Department[];
    message: string;
    code: number;
}
export interface Department {
    organisation_id: string;
    name: string;
    created_at: string;
    updated_at: string;
    deleted_at: string;
    id: string;
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