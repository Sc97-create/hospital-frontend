import apiClient from '../../lib/api-client'
import type { VerifyEmailPayload, VerifyEmailResponse } from '../types/signup'

/** POST /api/v1/central/customer/verifyEmail */
export const VerifyCustomerEmail = async (
  payload: VerifyEmailPayload,
): Promise<VerifyEmailResponse> => {
  const response = await apiClient.post<VerifyEmailResponse>(
    '/central/customer/verifyEmail',
    payload,
  )
  return response.data
}
