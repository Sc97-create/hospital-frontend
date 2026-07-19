export interface CreatePrescription {
    appointment_id: string;
    organisation_id: string;
    prescribed_by: string;
    medicine_array: Medicine[];
    prescription_id?: string;

}
export interface Medicine {
    medicine_id: string;
    medicine_name: string;
    morning: number;
    afternoon: number;
    night: number;
    dosage: string;
    duration: number;
    duration_type: string;
    food_instruction: string;
    medicine_type: string;
}
export interface createPrescResponse {
    data: createPrescResponseData;
    code: string;
    message: string;
}
export interface createPrescResponseData {
    id: string;
}
export interface medicineResponse {
    prescription_id: string;
    prescription_item_id: string;
    medicine_id: string;
    medicine_name: string;
    medicine_form: string;
    quantity: number;
    frequency: {
        morning: number;
        afternoon: number;
        night: number;
    };
    duration_day: number;
    duration_type: string;
    food_instruction: string;
}

export interface SearchMedicineItem {
    id: string;
    name: string;
    generic_name: string;
    strength: string;
    form: string;
    hsn_code?: string;
    shelf_location?: string;
    reorder_level?: number;
    max_stock_target?: number;
}

export interface SearchMedicineResponse {
    data: SearchMedicineItem[];
    message: string;
}
export interface findOneResponse {
    data: findOneResponseData;
    message: string;
    code: string;
}
export interface PrescriptionListItem {
    id: string;
    code: string;
    prescribed_by: string;
    prescription_date: string;
    created_at?: string;
    status: string;
    patient_id?: string;
    medicines?: medicineResponse[];
}

export interface findOneResponseData {
    medicines: medicineResponse[];
    created_at: string;
    total_count: number;
    patient_id?: string;
}

export interface FindManyResponse {
    data: PrescriptionListItem[];
    total_count: number;
    code: string;
    message: string;
}

export interface PrescriptionByPatientIdResponse {
    data: PrescriptionListItem[];
    total: number;
    code: string;
    message: string;
}

export type PrescriptionStatusFilter = "all" | "draft" | "sent";
export interface UpdatePrescriptionStatus {
    prescription_id: string;
    appointment_id: string;
    status: string;
}

export interface UpdateStatusResponse {
    data: string;
    code: string;
    message: string;
}

export interface UpdatePrescriptionItemPayload {
    prescription_item_id: string;
    medicine_id: string;
    duration: number;
    duration_type: string;
    food_instruction: string;
    morning: number;
    afternoon: number;
    night: number;
}

export interface UpdatePrescriptionItemResponse {
    data: {
        id: string;
    };
    code: string;
    message: string;
}

/** Batch stock + pricing attached to a dispense/checkout line */
export interface MedicineBatchPricing {
    mrp: number;
    unit_price: number;
    selling_price: number;
    unit_selling_price: number;
}

export interface MedicineBatch {
    batch_id: string;
    batch_no: string;
    expires_at: string;
    current_stock_units: number;
    units_per_box: number;
    pricing: MedicineBatchPricing;
    shelf_location: string;
    /** From getMedicineInfo medicine_batches[]; used on billing/create */
    supplier_id: string;
}

/** Flat dispense/checkout line from backend (one row per prescription_item_id) */
export interface DispenseLineResponse {
    prescription_code: string;
    prescription_status: string;
    prescription_created_at: string;
    prescribed_quantity: number;
    prescription_id: string;
    prescription_item_id: string;
    patient_id?: string;
    medicine_id: string;
    medicine_name: string;
    medicine_form: string;
    medicine_strength: string;
    frequency: {
        morning: number;
        afternoon: number;
        night: number;
    };
    reorder_level: number;
    max_stock_target: number;
    medicine_batches: MedicineBatch[];
    supplier_id?: string;
}

export interface DispenseCheckoutResponse {
    data: DispenseLineResponse[];
    code: string;
    message: string;
    total: number;
    patient_id?: string;
}

export interface CheckoutBatchAllocationPayload {
    batch_id: string;
    allocate_qty: number;
}

export type CheckoutPaymentMethod = "cash" | "qr" | "link";

export interface PrescriptionCheckoutPayload {
    prescription_id: string;
    payment_method: CheckoutPaymentMethod;
    amount_paid: number;
    notes?: string;
    /** cash/qr = pharmacist confirms; link = gateway/webhook auto */
    status_update?: "manual" | "automatic";
    items: Array<{
        prescription_item_id: string;
        medicine_id: string;
        dispense_qty: number;
        unit_price: number;
        line_subtotal: number;
        batches: CheckoutBatchAllocationPayload[];
    }>;
}

/** One sold chunk per inventory batch (multi-batch lines flatten to multiple rows). */
export interface BillingDispenseItem {
    medicine_id: string;
    medicine_inventory_id: string;
    prescription_item_id: string;
    batch_no: string;
    current_stock_units: number;
    quantity_sold_units: number;
    unit_price_charged: number;
    computed_item_total: number;
    total_amount: number;
}

export interface BillingCreateFinancials {
    discount_amount: number;
    sub_total_amount: number;
    tax_amount: number;
    total_amount: number;
}

export interface BillingCreatePayload {
    prescription_id: string;
    patient_id: string;
    cashier_id: string;
    supplier_id: string;
    organisation_id: string;
    financials: BillingCreateFinancials;
    dispense_items: BillingDispenseItem[];
}

export interface BillingCreateResponse {
    data?: unknown;
    code?: string;
    message?: string;
}