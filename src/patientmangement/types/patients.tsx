export interface Patientlistresponse {
    data: patientlist[];
    total: number;
    message: string;
    code: number;
}
export interface PatientResponse {
    data: patientlist;
    message: string;
    code: number;
}
export interface patientlist {
    patient_id: string;
    patient_code: string;
    patient_name: string;
    patient_age: number;
    patient_gender: string;
    patient_phone: string;
    patient_email: string;
    patient_weight: number;
    patient_status: string;
    admission_date: Date;
    patient_address: string;
    patient_bg: string;
    waiting_time:string;
    patient_lvd: Date;

}