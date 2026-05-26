import axios from "axios";
import type { PersonalInfo, PersonalInfoResponse } from "../types/first-step-appointment";


export const FirstStep=async(payload:PersonalInfo):Promise<PersonalInfoResponse>=>{
    const response= await axios.post(
        "http://localhost:9069/api/v1/patient/addGeneralInfo",
        payload
    );
    return response.data
}