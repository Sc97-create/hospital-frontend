export interface CreateLabOrderTestItem {
    name: string;
    sub_test: string;
}

export interface CreateLabOrderPayload {
    organisation_id: string;
    patient_id: string;
    doctor_id: string;
    diagnostic_centre_id: string;
    tests: CreateLabOrderTestItem[];
}

export interface CreateLabOrderResponse {
    code: number | string;
    lab_order_id: string;
    message: string;
}

export type LabOrderListStatus =
    | "pending"
    | "completed"
    | "cancelled"
    | string;

export interface GetLabOrdersParams {
    organisation_id: string;
    patient_id?: string;
    status?: string;
    limit?: number;
    page_no?: number;
}

export interface LabOrderListItem {
    id: string;
    patient_id: string;
    patient_name: string;
    doctor_id: string;
    doctor_name: string;
    tests_count: number;
    status: LabOrderListStatus;
    received_at: string;
}

export interface GetLabOrdersResponse {
    code: number | string;
    count: number;
    data: LabOrderListItem[];
}

export interface LabOrderDetailPatient {
    patient_id: string;
    patient_name: string;
    patient_code: string;
    age: number | null;
}

export interface LabOrderDetailDoctor {
    doctor_id: string;
    doctor_name: string;
}

export interface LabOrderDetailTest {
    id: string;
    name: string;
    sub_test: string;
    status: LabOrderListStatus;
}

export interface LabOrderDetail {
    id: string;
    organisation_id: string;
    patient: LabOrderDetailPatient;
    doctor: LabOrderDetailDoctor;
    diagnostic_centre_id: string;
    appointment_id: string | null;
    tests: LabOrderDetailTest[];
    tests_count: number;
    status: LabOrderListStatus;
    received_at: string;
    updated_at: string;
}

export interface GetLabOrderByIdResponse {
    code: number | string;
    data: LabOrderDetail;
}

export interface BulkUpdateLabOrderStatusPayload {
    lab_order_id: string;
    test_ids: string[];
    status: LabOrderListStatus;
}

export interface BulkUpdateLabOrderStatusResponse {
    code: number | string;
    message?: string;
}

export interface CheckBillingByBillingIdResponse {
    code: number | string;
    count: number;
    message?: string;
}
