export interface CreatePrescription {
    patient_id: string;
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
    medicine_id: string;
    medicine_name: string;
    quantity: number,
    dosage: string,
    frequency: {
        morning: number,
        afternoon: number,
        night: number
    },
    duration_day: number,
    duration_type: string,
    medicine_type: string,
    food_instruction: string,
}

export interface SearchMedicineItem {
    id: string;
    name: string;
    generic_name: string;
    strength: string;
    form: string;
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
export interface findOneResponseData {
    medicines: medicineResponse[];
    created_at: string;
    total_count: number;
}

export interface PrescriptionListItem {
    id: string;
    code: string;
    prescribed_by: string;
    prescription_date: string;
    status: string;
    medicines?: medicineResponse[];
}

export interface FindManyResponse {
    data: PrescriptionListItem[];
    total_count: number;
    code: string;
    message: string;
}
export interface UpdatePrescriptionStatus {
    prescription_id: string;
}

export interface UpdateStatusResponse {
    code: string;
    message: string;
}