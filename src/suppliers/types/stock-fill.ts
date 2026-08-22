export interface AddMedicineInfo {
    medicine_id?: string;
    name: string;
    form: string;
    strength: string;
    hsn_code: string;
    batch_no: string;
    expiry_date: string;
    shelf_location: string;
    purchase_qty_boxes: number;
    units_per_box: number;
    mrp: number;
    purchase_price: number;
    discount: number;
    selling_price: number;
    reorder_level: number;
    max_stock_target: number;
}

export interface AddMedicinePayload {
    user_id: string;
    supplier_id: string;
    organisation_id: string;
    invoice_no: string;
    payment_due_date: string;
    medicine_info: AddMedicineInfo[];
}

export interface AddMedicineResponse {
    data?: unknown;
    code?: string | number;
    message?: string;
}
