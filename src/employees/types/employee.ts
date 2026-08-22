export interface EmployeeShiftTimings {
    start_time: string;
    end_time: string;
}

export interface EmployeeEmergencyDetails {
    email?: string;
    name?: string;
    contact?: string;
}

export interface AddEmployeePayload {
    organisation_id: string;
    first_name: string;
    last_name: string;
    mobile_number: string;
    email_id: string;
    address?: string;
    date_of_birth?: string;
    date_of_joining?: string;
    role_id?: string;
    dept_id?: string;
    license_no?: string;
    qualification?: string;
    employee_type?: string;
    shift_timings?: EmployeeShiftTimings;
    emergency_details?: EmployeeEmergencyDetails;
}

export interface AddEmployeeResponse {
    code?: number | string;
    message?: string;
    data?: unknown;
}

export interface GetEmployeesParams {
    organisation_id: string;
    limit: number;
    page_no: number;
    search?: string;
}

export interface EmployeeListItem {
    employee_id: string;
    employee_code?: string;
    employee_name: string;
    employee_first_name: string;
    employee_last_name: string;
    employee_email: string;
    employee_phone: string;
    employee_role_id: string;
    role_name: string;
    employee_department_id: string;
    department_name: string;
    employee_status: string;
    employee_organisation_id: string;
}

export interface GetEmployeesResponse {
    code: number;
    data: EmployeeListItem[];
    total: number;
    total_count: number;
    message?: string;
}
