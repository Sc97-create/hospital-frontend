export interface PersonalInfo {
    name:string;
    blood_group:string;
    email_id: string;
    age: number;
    weight: number;
    gender: string;
    organisation_id: string
    mobile_number: string;
    address: string;
    
}

export interface AppointmentCreateData {
    patient_id?: string;
    id?: string;
}

export interface PersonalInfoResponse {
    data?: string | AppointmentCreateData;
    patient_id?: string;
    message?: string;
    code?: number;
}
