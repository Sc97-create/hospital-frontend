import apiClient from '../../lib/api-client'
import type { CustomerSignupPayload, CustomerSignupResponse } from '../types/signup'

/** POST /api/v1/central/customer/signup */
export const CustomerSignup = async (
  payload: CustomerSignupPayload,
): Promise<CustomerSignupResponse> => {
  const response = await apiClient.post<CustomerSignupResponse>(
    '/central/customer/signup',
    payload,
    { skipAuthHeader: true, skipAuthRefresh: true },
  )
  return response.data
}
