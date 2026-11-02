import apiClient from '../../lib/api-client'
import type {
  ConfirmCheckoutPayload,
  ConfirmCheckoutResponse,
  CreateSubscriptionPayload,
  CreateSubscriptionResponse,
  GetSubscriptionByTenantResponse,
  UpdateSubscriptionPayload,
  UpdateSubscriptionResponse,
} from './types'

/** POST /api/v1/central/subscription/create — requires signup JWT */
export const CreateSubscription = async (
  payload: CreateSubscriptionPayload,
): Promise<CreateSubscriptionResponse> => {
  const response = await apiClient.post<CreateSubscriptionResponse>(
    '/central/subscription/create',
    payload,
    { skipAuthRefresh: true },
  )
  return response.data
}

/** POST /api/v1/central/subscription/update — expired trial renewal */
export const UpdateSubscription = async (
  payload: UpdateSubscriptionPayload,
): Promise<UpdateSubscriptionResponse> => {
  const response = await apiClient.post<UpdateSubscriptionResponse>(
    '/central/subscription/update',
    payload,
    { skipAuthRefresh: true },
  )
  return response.data
}

/** GET /api/v1/central/subscription/getByTenant/:tenant_id — requires signup JWT */
export const GetSubscriptionByTenant = async (
  tenantId: string,
): Promise<GetSubscriptionByTenantResponse> => {
  const response = await apiClient.get<GetSubscriptionByTenantResponse>(
    `/central/subscription/getByTenant/${tenantId}`,
    { skipAuthRefresh: true },
  )
  return response.data
}

/** POST /api/v1/central/subscription/confirmCheckout — after Razorpay success */
export const ConfirmCheckout = async (
  payload: ConfirmCheckoutPayload,
): Promise<ConfirmCheckoutResponse> => {
  const response = await apiClient.post<ConfirmCheckoutResponse>(
    '/central/subscription/confirmCheckout',
    payload,
    { skipAuthRefresh: true },
  )
  return response.data
}
