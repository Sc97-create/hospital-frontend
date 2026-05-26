export interface PersonalInfo{
    first_name:string;
    last_name:string;
    email_id:string;
    age:number;
    weight:number;
    gender:string;
    organisationID:string;
    department:string;
    mobile_number:string;
    assign_doctor:string;
    symptoms:string[];
}
export interface PersonalInfoResponse{
    data:any;
    message:string;
    code:string;
}