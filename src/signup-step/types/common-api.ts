export interface OrganisationAddress {
    country_id: string;
    state: string;
    city: string;
}

export interface OrganisationData {
    id?: string;
    organisation_name?: string;
    legal_entity_name?: string;
    hospital_type?: string;
    code?: string;
    address?: OrganisationAddress;
}

export interface UserData {
    id?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
    email_id?: string;
    phone_number?: string;
}

export interface OrganisationResponse {
    data: OrganisationData;
    code: string;
}

export interface UserResponse {
    data: UserData;
    code: string;
}
