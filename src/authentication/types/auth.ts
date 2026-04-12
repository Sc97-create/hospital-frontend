export interface loginPayload{
    user_name:string;
    password:string;
}
export interface loginResponse{
    user_id:string;
    accesstoken:string;
    message:string;

}