export interface GenerateBedModel {
    beds_per_room: number;
    organisation_id: string;
    room_number: string[];
    room_type_id: string;
}
export interface Beddata {
    data: Record<string, RoomBed[]>;
    code: string;
    room_summary: RoomSummary
}
export interface CreateBedResponse {
    message: string;
    code: number;
}
export interface RoomBed {
    bed_number: string[];
    room_id: string;
}
export interface BedPreview {
    key: string;
    room_number: string;
    room_id: string;
    beds: string[];
    total: number;
}
export interface Beds {
    organisation_id: string;
    beds: BedPreview[];
    room_type_id: string;
}
export interface RoomsummaryResponse {
    message: string;
    data: RoomSummary;
    code: string;
}
export interface RoomSummary {
    total_rooms: number;
    total_beds: number;
    total_floors: number;
}