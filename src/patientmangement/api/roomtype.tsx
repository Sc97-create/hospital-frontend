import axios from "axios";
import type { RoomType, RoomTypeResponse } from "../types/roomtype";

//write api call
export const CreateRoomType = async (payload: RoomType): Promise<RoomTypeResponse> => {
    const response = await axios.post(
        "http://localhost:9069/api/v1/bed/createRoomType",
        payload
    );
    return response.data
}
export const GetRoomType = async (id: string): Promise<RoomTypeResponse> => {
    const response = await axios.get(
        `http://localhost:9069/api/v1/bed/getRoomTypeData`,
        { params: { id } }
    );
    return response.data
}