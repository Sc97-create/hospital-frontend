import { useMutation } from '@tanstack/react-query'
import { CreateSubscription } from './api'
import type { CreateSubscriptionPayload, CreateSubscriptionResponse } from './types'

export const useCreateSubscription = () =>
  useMutation<CreateSubscriptionResponse, Error, CreateSubscriptionPayload>({
    mutationFn: CreateSubscription,
  })
