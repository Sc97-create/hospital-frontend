import apiClient from "../../lib/api-client"
import type { GetDepartmentsResponse } from "../types/share-type"

export const GetDepartments = async (organisationID: string, page: number, limit: number): Promise<GetDepartmentsResponse> => {
    const response = await apiClient.get(`/department/getDepartments`, {
        params: {
            organisation_id: organisationID,
            page_no: page,
            limit: limit
        }
    })
    return response.data
}

export const GetDoctors = async (search: string, organisationID: string): Promise<unknown> => {
    const response = await apiClient.get(`/employee/getDoctors`,
        {
            params: {
                organisation_id: organisationID,
                name: search,
            }
        })

    return response.data
}