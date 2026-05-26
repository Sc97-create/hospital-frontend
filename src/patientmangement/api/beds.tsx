import apiClient from "../../lib/api-client";
import type { GenerateBedModel, Beds, RoomsummaryResponse, CreateBedResponse, Beddata, RoomBedData, GetBedResponse, } from "../types/beds";

export const CreateBed = async (payload: Beds): Promise<CreateBedResponse> => {
    const response = await apiClient.post(
        "/bed/createBed",
        payload
    );
    return response.data
}
export const GenerateBeds = async (payload: GenerateBedModel): Promise<Beddata> => {
    const response = await apiClient.post(
        "/bed/generateBeds",
        payload
    );
    return response.data
}
export const GetRoomSummaryByRoomType = async (room_type_id: string): Promise<RoomsummaryResponse> => {
    const response = await apiClient.get(
        `/bed/getRoomSummaryByRoomType/${room_type_id}`
    );
    return response.data
}
export const GetAvailableBeds = async (organisationID: string, limit: string, offset: string, roomID: string): Promise<GetBedResponse> => {
    const response = await apiClient.get(
        `/bed/getAvailableBeds`,
        {
            params: {
                organisation_id: organisationID,
                limit: limit,
                pageno: offset,
                room_id: roomID
            }
        }
    );
    return response.data
}