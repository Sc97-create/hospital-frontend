export interface Rooms {
    room_type_id: string;
    no_of_floors: number;
    room_per_floor: number;
    starting_per_floor: number;
    prefix: string;
    organisation_id: string;
}
export interface RoomResponse {
    message: string;
    data: RoomData[];

}
export interface RoomData {
    id: string;
    room_number: string;
}