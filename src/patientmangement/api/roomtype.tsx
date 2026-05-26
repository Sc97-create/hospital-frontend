import apiClient from "../../lib/api-client";
import type { RoomType, RoomTypeArr, RoomTypeResponse } from "../types/roomtype";

//write api call
export const CreateRoomType = async (payload: RoomType): Promise<RoomTypeResponse> => {
    const response = await apiClient.post(
        "/bed/createRoomType",
        payload
    );
    return response.data
}
export const GetRoomType = async (id: string): Promise<RoomTypeResponse> => {
    const response = await apiClient.get(
        `/bed/getRoomTypeData`,
        { params: { id } }
    );
    return response.data
}
export const GetRoomTypeByOrganisationID = async (organisationID: string): Promise<RoomTypeArr> => {
    const response = await apiClient.get(
        `/bed/getAvailableRoomTypes`,
        {
            params: {
                organisation_id: organisationID
            }
        }
    );
    return response.data
}