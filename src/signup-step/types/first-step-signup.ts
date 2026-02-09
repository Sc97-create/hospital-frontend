export interface OrgSignup{
    organisation_name:string;
    legal_entity_name:string;
    hospital_type:string;
}
export interface OrgSignupResponse{
    message:string;
    organisation_id:string;
}