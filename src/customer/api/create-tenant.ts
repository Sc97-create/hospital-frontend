import apiClient from '../../lib/api-client'
import type {
  CreateTenantPayload,
  CreateTenantResponse,
  GetTenantByIdResponse,
  UpdateTenantPayload,
  UpdateTenantResponse,
} from '../types/tenant'

/** POST /api/v1/central/tenant/create — requires signup JWT */
export const CreateTenant = async (
  payload: CreateTenantPayload,
): Promise<CreateTenantResponse> => {
  const response = await apiClient.post<CreateTenantResponse>(
    '/central/tenant/create',
    payload,
    { skipAuthRefresh: true },
  )
  return response.data
}

/** GET /api/v1/central/tenant/getById/:tenant_id — requires signup JWT */
export const GetTenantById = async (tenantId: string): Promise<GetTenantByIdResponse> => {
  const response = await apiClient.get<GetTenantByIdResponse>(
    `/central/tenant/getById/${tenantId}`,
    { skipAuthRefresh: true },
  )
  return response.data
}

/** PATCH /api/v1/central/tenant/update — requires signup JWT */
export const UpdateTenant = async (
  payload: UpdateTenantPayload,
): Promise<UpdateTenantResponse> => {
  const response = await apiClient.patch<UpdateTenantResponse>(
    '/central/tenant/update',
    payload,
    { skipAuthRefresh: true },
  )
  return response.data
}
