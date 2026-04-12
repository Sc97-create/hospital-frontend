import axios from "axios";
import type { GenerateBedModel, Beds, RoomsummaryResponse, CreateBedResponse, Beddata, } from "../types/beds";

export const CreateBed = async (payload: Beds): Promise<CreateBedResponse> => {
    const response = await axios.post(
        "http://localhost:9069/api/v1/bed/createBed",
        payload
    );
    return response.data
}
export const GenerateBeds = async (payload: GenerateBedModel): Promise<Beddata> => {
    const response = await axios.post(
        "http://localhost:9069/api/v1/bed/generateBeds",
        payload
    );
    return response.data
}
export const GetRoomSummaryByRoomType = async (room_type_id: string): Promise<RoomsummaryResponse> => {
    const response = await axios.get(
        `http://localhost:9069/api/v1/bed/getRoomSummaryByRoomType/${room_type_id}`
    );
    return response.data
}