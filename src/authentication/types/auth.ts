export interface loginPayload{
    user_name:string;
    password:string;
}
export interface loginResponse{
    user_id:string;
    token:string;
    message:string;
    organisation_id:string;
    refresh_token:string;

}