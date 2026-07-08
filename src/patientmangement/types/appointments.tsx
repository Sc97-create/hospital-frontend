import dayjs from "dayjs"
export interface appointmentPayload {
    start_time: string;
    end_time: string;
    daysjs_appointment_date: dayjs.Dayjs;
    organisation_id: string;
    patient_id: string;
    doctor_id: string;
    visit_type: string;
    user_id: string;
    appointment_date: string;
}
export interface slotResponse {
    message: string;
    code: string;
    appointment_slots: slots[];
}
export interface slots {
    end_time: string;
    start_time: string;
    allow: boolean;
}
export interface appointmentGetPayload {
    organisation_id: string;
    doctor_id: string;
    date: string;
    status: string;
    visit_type: string;
    page_no: number;
    limit: number;
}
export interface AppointmentOrg {
    appointment_id: string;
    appointment_code: string;
    doctor_id: string;
    doctor_name: string;
    patient_id: string;
    patient_name: string;
    appointment_date: string;
    start_time: string;
    end_time: string;
    visit_type: string;
    status: string;
    mobile_no: string;
    next: boolean;
}
export interface appointmentResponse {
    message: string;
    code: string;
    data: AppointmentOrg[];
    total: number;
}
export interface previewAppointmentData {
    appointment_id: string;
    appointment_code: string;
    start_time: string;
    end_time: string;
    patient_name: string;
    mobile_no: string;
    doctor_name: string;
    visit_type: string;
    status: string;
    appointment_date: dayjs.Dayjs;
    notes: string;
    medicines: number;
    patient_age:number;
    patient_gender:string;
    department_name:string;
    slot_duration:number;
}
export interface previewAppntmnt{
    data:previewAppointmentData,
    code:string;
    message:string;
}
export interface statusUpdate{
    appointment_id:string;
    status:string;
}
export interface commonresponse{
    data:any;
    code:string;
    message:string;
}
export interface appointmentByPatientID{
    patient_id:string;
    organisation_id:string;
    limit:number;
    page_no:number;
    status?:string;
}
export interface appointmentByPatResp{
    data:previewAppointmentData[];
    code:string;
    message:string;
    total:number|string;
}