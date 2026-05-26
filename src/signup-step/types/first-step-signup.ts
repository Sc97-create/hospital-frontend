export interface OrgSignup {
    organisation_name: string;
    legal_entity_name: string;
    hospital_type: string;
}
export interface OrgSignupResponse {
    message: string;
    organisation_id: string;
    department_id: string;
    role_id: string;
}
export interface UpdateOrganisation {
    organisation_id: string;
    organisation_name: string;
    legal_entity_name: string;
    hospital_type: string;
}