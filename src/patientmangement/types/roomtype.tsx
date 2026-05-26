export interface RoomType {

    name: string;
    is_default: boolean;
    organisation_id: string;
    base_price: number;
}
export interface RoomTypeResponse {
    message: string;
    data: {
        room_type_id: string;
        room_type_name: string;
        base_price: number;
    }
}