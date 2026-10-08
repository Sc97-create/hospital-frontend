import apiClient from '../../lib/api-client'
import type {
  ConfirmCheckoutPayload,
  ConfirmCheckoutResponse,
  CreateSubscriptionPayload,
  CreateSubscriptionResponse,
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
