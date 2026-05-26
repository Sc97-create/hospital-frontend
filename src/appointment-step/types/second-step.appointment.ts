export interface bedAllotment {
    patient_id: string;
    room_id: string;
    room_type: string;
    bed_id: string;
    organisation_id: string;
    appointment_id: string;
    charges: string;
    dischargeat: Date;
}
export interface bedAllotmentResponse {
    data: bedAllotment;
    message: string;
    status: string;
}