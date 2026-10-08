import apiClient from "../lib/api-client";

export interface DashboardStatusCounts {
    scheduled: number;
    in_consult: number;
    completed: number;
    missed: number;
    waiting: number;
}

export interface DashboardStatusCountsResponse {
    code: string;
    message: string;
    data: DashboardStatusCounts;
}

export interface DashboardTodayAppointment {
    appointment_id: string;
    appointment_code: string;
    patient_name: string;
    doctor_name: string;
    status: string;
    start_time: string;
    end_time: string;
    appointment_date: string;
    patient_id?: string;
    patient_gender?: string;
    patient_age?: number;
    visit_type?: string;
    mobile_no?: string;
}

export interface DashboardTodayAppointmentsResponse {
    code: string;
    message: string;
    data: DashboardTodayAppointment[];
}

export interface DashboardInvoiceMethodSummary {
    count: number;
    amount: number;
}

export interface DashboardTodayInvoiceSummary {
    total_invoices: number;
    total_amount: number;
    cash: DashboardInvoiceMethodSummary;
    qr: DashboardInvoiceMethodSummary;
    link: DashboardInvoiceMethodSummary;
}

export interface DashboardTodayInvoiceSummaryResponse {
    code: string;
    message: string;
    data: DashboardTodayInvoiceSummary;
}

export const GetDashboardStatusCounts = async (
    organisation_id: string,
): Promise<DashboardStatusCountsResponse> => {
    const response = await apiClient.get("/dashboard/getByStatus", {
        params: { organisation_id },
    });
    return response.data;
};

export const GetDashboardTodayAppointments = async (
    organisation_id: string,
): Promise<DashboardTodayAppointmentsResponse> => {
    const response = await apiClient.get("/dashboard/getTodayAppointments", {
        params: { organisation_id },
    });
    return response.data;
};

export const GetDashboardTodayInvoiceSummary = async (
    organisation_id: string,
): Promise<DashboardTodayInvoiceSummaryResponse> => {
    const response = await apiClient.get("/dashboard/getTodayInvoiceSummary", {
        params: { organisation_id },
    });
    return response.data;
};

export interface DashboardEmployeeStatusCounts {
    active: number;
    inactive: number;
    total: number;
}

export interface DashboardEmployeeStatusCountsResponse {
    code: string;
    message: string;
    data: DashboardEmployeeStatusCounts;
}

export const GetDashboardEmployeeStatusCounts = async (
    organisation_id: string,
): Promise<DashboardEmployeeStatusCountsResponse> => {
    const response = await apiClient.get("/dashboard/getEmployeeStatusCounts", {
        params: { organisation_id },
    });
    return response.data;
};

export interface DashboardTodayPrescription {
    id: string;
    code: string;
    prescribed_by: string;
    patient_id: string;
    patient_name: string;
    appointment_id: string;
    created_at: string;
    status: string;
}

export interface DashboardTodayPrescriptionsData {
    prescriptions: DashboardTodayPrescription[];
    total: number;
}

export interface DashboardTodayPrescriptionsResponse {
    code: string;
    message: string;
    data: DashboardTodayPrescriptionsData;
}

export const GetDashboardTodayPrescriptions = async (
    organisation_id: string,
): Promise<DashboardTodayPrescriptionsResponse> => {
    const response = await apiClient.get("/dashboard/getTodayPrescriptions", {
        params: { organisation_id },
    });
    return response.data;
};
