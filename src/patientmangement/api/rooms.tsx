import apiClient from "../../lib/api-client";
import type { RoomDataArr, RoomResponse, Rooms } from "../types/rooms";

export const CreateRoom = async (payload: Rooms): Promise<RoomResponse> => {
    const response = await apiClient.post(
        "/bed/createRoom",
        payload
    );
    return response.data
}
export const GetAvailableRooms = async (organisationID: string, limit: string, offset: string): Promise<RoomDataArr> => {
    const response = await apiClient.get(
        `/bed/getAvailableRooms`,
        {
            params: {
                organisation_id: organisationID,
                limit: limit,
                pageno: offset
            }
        }
    );
    return response.data
}