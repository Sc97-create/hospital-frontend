import apiClient from "../../lib/api-client";
import type { appointmentByPatientID, appointmentByPatResp, appointmentGetPayload, appointmentPayload, appointmentResponse, commonresponse, previewAppntmnt, slotResponse, statusUpdate } from "../types/appointments";

export const CreateAppointment = async (payload: appointmentPayload): Promise<any> => {
    const response = await apiClient.post(
        "/appointment/create",
        payload
    );
    return response.data
}
export const GetSlots = async (organisation_id: string, doctor_id: string, date: string): Promise<slotResponse> => {
    const response = await apiClient.get(
        "/appointment/getTimeSlots",
        {
            params: {
                organisation_id,
                doctor_id,
                date
            }
        }
    );
    return response.data
}
export const GetAppointmentsByOrganisationID = async (payload: appointmentGetPayload): Promise<appointmentResponse> => {
    const response = await apiClient.post(
        "/appointment/getappointmentbyOrgID",
        payload
    );
    return response.data
}
export const GetAppointmentPreview = async (organisation_id: string, appointment_id: string): Promise<previewAppntmnt> => {
    const response = await apiClient.get(
        "/appointment/getAppointmentsPreview",
        {
            params: {
                organisation_id,
                appointment_id
            }
        }

    );
    return response.data
}
export const updateStatus = async (payload: statusUpdate): Promise<commonresponse> => {
    const response = await apiClient.patch(
        "/appointment/updateStatus",
        payload
    );
    return response.data
}
export const GetAppointmentByPatientID = async (payload: appointmentByPatientID): Promise<appointmentByPatResp> => {
    const response = await apiClient.post(
        "/appointment/getappointmentByPatientID",
        payload

    );
    return response.data
}