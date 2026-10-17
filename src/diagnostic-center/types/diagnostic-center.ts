export type DiagnosticCentreStatus = "active" | "inactive" | string;

export interface GetDiagnosticCentresParams {
    organisation_id: string;
    search?: string;
    status?: string;
    limit?: number;
    page_no?: number;
}

export interface DiagnosticCentreListItem {
    id: string;
    organisation_id: string;
    name: string;
    address: string;
    contact_number: string;
    email: string;
    status: DiagnosticCentreStatus;
    created_at: string;
    updated_at: string;
}

export interface GetDiagnosticCentresResponse {
    code: number | string;
    total: number;
    data: DiagnosticCentreListItem[];
}
