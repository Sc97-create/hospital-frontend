export interface PersonalInfo {
    name:string;
    blood_group:string;
    email_id: string;
    age: number;
    weight: number;
    gender: string;
    organisation_id: string
    mobile_number: string;
    address: string;
    
}
export interface PersonalInfoResponse {
    data: any;
    message: string;
    code: number;
}
