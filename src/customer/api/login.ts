import apiClient from '../../lib/api-client'
import type { CustomerLoginPayload, CustomerLoginResponse } from '../types/signup'

/** POST /api/v1/central/customer/login */
export const CustomerLogin = async (
  payload: CustomerLoginPayload,
): Promise<CustomerLoginResponse> => {
  const response = await apiClient.post<CustomerLoginResponse>(
    '/central/customer/login',
    payload,
    { skipAuthHeader: true, skipAuthRefresh: true },
  )
  return response.data
}
