export interface CreateSupplierPayload {
    name: string;
    contact_number: string;
    email_id: string;
    payment_terms: string;
    supplier_status: string;
    gst_number: string;
    drug_license_number: string;
    credit_limit: number;
    organisation_id: string;
    user_id: string;
}

export interface CreateSupplierResponse {
    data?: unknown;
    code?: string | number;
    message?: string;
}

export interface SupplierListItem {
    id: string;
    supplier_code: string;
    name: string;
    contact_number: string;
    email: string;
    payment_terms: string;
    supplier_status: string;
    created_at: string;
}

export interface GetSuppliersByOrgResponse {
    code: string | number;
    total: number;
    data: SupplierListItem[];
    message?: string;
}
