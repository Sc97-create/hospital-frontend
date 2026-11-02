import { useMutation } from '@tanstack/react-query'
import { UpdateSubscription } from './api'
import type { UpdateSubscriptionPayload, UpdateSubscriptionResponse } from './types'

export const useUpdateSubscription = () =>
  useMutation<UpdateSubscriptionResponse, Error, UpdateSubscriptionPayload>({
    mutationFn: UpdateSubscription,
  })
