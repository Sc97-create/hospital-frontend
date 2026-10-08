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
    patient_name?: string;
    medicines?: medicineResponse[];
}

export interface findOneResponseData {
    medicines: medicineResponse[];
    created_at: string;
    total_count: number;
    patient_id?: string;
    /** From getprescriptionbyPid — e.g. draft, sent, payment-pending, completed, tentative */
    prescription_status?: string;
    status?: string;
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

export type PrescriptionStatusFilter = "all" | "sent" | "completed" | "tentative";

export interface GetPrescriptionsPayload {
    organisation_id: string;
    search?: string;
    limit: number;
    page_no: number;
    status?: Exclude<PrescriptionStatusFilter, "all">;
}

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
    /** Units still to dispense (getMedicineInfo). */
    remaining_quantity?: number;
    /** @deprecated prefer remaining_quantity */
    remaining_qty?: number;
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
    /** e.g. fully_dispensed, pending */
    prescription_item_status?: string;
    food_instruction?: string;
    /** True when this line cannot be fulfilled from current inventory. */
    out_of_stock?: boolean;
    medicine_batches: MedicineBatch[];
    supplier_id?: string;
}

export interface DispenseCheckoutResponse {
    data: DispenseLineResponse[];
    patientData?: PrescriptionPatientData;
    code: string;
    message: string;
    total: number;
    /** @deprecated prefer patientData.patient_id */
    patient_id?: string;
}

/** Patient block returned with getMedicineInfo (same shape as patient list/detail). */
export interface PrescriptionPatientData {
    patient_id: string;
    patient_code: string;
    patient_name: string;
    patient_weight?: number;
    patient_gender: string;
    patient_phone: string;
    patient_address?: string;
    patient_email?: string;
    patient_image?: string;
    patient_status?: string;
    patient_age: number;
    patient_bg?: string;
    patient_lvd?: string;
    waiting_time?: string;
    patient_created_at?: string;
}

export interface CheckoutBatchAllocationPayload {
    batch_id: string;
    allocate_qty: number;
}

export type CheckoutPaymentMethod = "cash" | "qr" | "link";

/** `consultation` = reception collecting the visit fee, `prescription` = pharmacy dispense billing. */
export type PaymentType = "consultation" | "prescription";

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
    /** Omit / `"prescription"` — back-compat with pharmacy checkout. */
    payment_type?: PaymentType;
    prescription_id: string;
    patient_id: string;
    cashier_id: string;
    supplier_id: string;
    organisation_id: string;
    /** How the patient paid — used for categorisation / reporting. */
    payment_mode: CheckoutPaymentMethod;
    /**
     * Unique per payment attempt. Same key on retries / double-clicks must
     * create at most one bill on the backend.
     */
    idempotency_key: string;
    financials: BillingCreateFinancials;
    dispense_items: BillingDispenseItem[];
}

/**
 * Consultation (reception) fee billing — no prescription/dispense fields.
 * `cash` / `qr` only for this pass; see frontend-payment-type-api-changes.md.
 */
export interface ConsultationBillingCreatePayload {
    payment_type: "consultation";
    appointment_id: string;
    patient_id: string;
    cashier_id: string;
    organisation_id: string;
    payment_mode: "cash" | "qr";
    idempotency_key: string;
    financials: BillingCreateFinancials;
}

export interface BillingPaymentInfo {
    invoice_id: string;
    /** UPI / payment link URL when mode is qr or link. */
    payment_url?: string | null;
}

export interface BillingCreateResponse {
    payment?: BillingPaymentInfo;
    data?: {
        payment?: BillingPaymentInfo;
    };
    code?: string;
    message?: string;
}

/** Existing invoice for a prescription (resume unpaid checkout). */
export interface InvoiceByPrescription {
    id: string;
    invoice_code: string;
    prescription_id: string;
    patient_id: string;
    status: string;
    cashier_id: string;
    organisation_id: string;
    sub_total_amount: number;
    tax_amount: number;
    total_amount: number;
    discount_amount: number;
    created_at: string;
    updated_at: string;
}

/** Existing invoice for an appointment (resume unpaid consultation payment). */
export interface InvoiceByAppointment {
    id: string;
    invoice_code: string;
    payment_type: PaymentType;
    appointment_id: string;
    patient_id: string;
    status: string;
    cashier_id: string;
    organisation_id: string;
    payment_mode: string;
    sub_total_amount: number;
    tax_amount: number;
    total_amount: number;
    discount_amount: number;
    created_at: string;
    updated_at: string;
}

export interface GetInvoiceByAppointmentResponse {
    code?: string | number;
    message?: string;
    error?: string;
    /** Wrapped success body */
    data?: InvoiceByAppointment;
    /** Unwrapped success body fields (same as InvoiceByAppointment) */
    id?: string;
    invoice_code?: string;
    payment_type?: PaymentType;
    appointment_id?: string;
    patient_id?: string;
    status?: string;
    cashier_id?: string;
    organisation_id?: string;
    payment_mode?: string;
    sub_total_amount?: number;
    tax_amount?: number;
    total_amount?: number;
    discount_amount?: number;
    created_at?: string;
    updated_at?: string;
}

export interface GetInvoiceByPrescriptionResponse {
    code?: string | number;
    message?: string;
    error?: string;
    /** Wrapped success body */
    data?: InvoiceByPrescription;
    /** Unwrapped success body fields (same as InvoiceByPrescription) */
    id?: string;
    invoice_code?: string;
    prescription_id?: string;
    patient_id?: string;
    status?: string;
    cashier_id?: string;
    organisation_id?: string;
    sub_total_amount?: number;
    tax_amount?: number;
    total_amount?: number;
    discount_amount?: number;
    created_at?: string;
    updated_at?: string;
}

/** One line (consultation OR prescription) inside the combined bill-details receipt. */
export interface BillDetailsLine {
    code: string;
    category: string;
    qty: number;
    tax: number;
    discount: number;
    total_amount: number;
    invoice_status: string;
    payment_mode: string;
}

export interface BillDetailsPatient {
    id: string;
    uhid: string;
    name: string;
    age: number;
    gender: string;
    phone: string;
    email: string;
}

export interface BillDetailsAppointment {
    id: string;
    appointment_code: string;
    visit_type: string;
    status: string;
}

export interface BillDetailsPaymentDetails {
    consultation?: BillDetailsLine;
    prescription?: BillDetailsLine;
}

/** Combined receipt data — one appointment's consultation fee + its prescription bill, if any. */
export interface BillDetails {
    patientDetail: BillDetailsPatient;
    appointmentDetail: BillDetailsAppointment;
    paymentDetails: BillDetailsPaymentDetails;
    invoice_status: string;
    invoice_code: string;
    created_at: string;
    invoice_id: string;
}

export interface GetBillDetailsByPrescriptionResponse {
    code?: number | string;
    message?: string;
    data?: BillDetails;
}

/** Cash / QR — pharmacist swipe confirms payment. */
export interface ConfirmPaymentPayload {
    invoice_id: string;
    organisation_id: string;
    payment_mode: CheckoutPaymentMethod;
    /** Unique per confirm attempt — prevents double-confirm on rapid swipes. */
    idempotency_key: string;
    transaction_reference?: string;
}

export interface ConfirmPaymentResponse {
    data?: unknown;
    code?: string;
    message?: string;
}