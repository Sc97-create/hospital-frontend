import axios from "axios";
import type { OrganisationResponse, UserResponse } from "../types/common-api";


export const GetByOrganisationID = async (organisation_id: string): Promise<OrganisationResponse> => {
    console.log("id",organisation_id)
    const response = await axios.get(
        `http://localhost:9069/api/v1/organisation/getbyid/${organisation_id}`
    );
    return response.data
}

export const GetUserbyID=async (userID:string):Promise<UserResponse>=>{
    console.log('id',userID)
    const response = await axios.get(
        `http://localhost:9069/api/v1/employee/findbyID?user_id=${userID}`

    );
    return response.data
}