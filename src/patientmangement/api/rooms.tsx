import axios from "axios";
import type { RoomResponse, Rooms } from "../types/rooms";

export const CreateRoom = async (payload: Rooms): Promise<RoomResponse> => {
    const response = await axios.post(
        "http://localhost:9069/api/v1/bed/createRoom",
        payload
    );
    return response.data
}