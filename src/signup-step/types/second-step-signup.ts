export interface SecondSignupPayload {
    organisation_id:string;
    
    country_id: string;
    state_id: string;
    city_id: string;
    timezone: string;
    auditlogs:boolean;
    emergencyexit:boolean;
}
export interface SecondSignupResponse {
    message: string;
    code: string;
}