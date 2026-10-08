import { useMutation } from '@tanstack/react-query'
import { VerifyCustomerEmail } from './verify-email'
import type { VerifyEmailPayload, VerifyEmailResponse } from '../types/signup'

export const useVerifyCustomerEmail = () =>
  useMutation<VerifyEmailResponse, Error, VerifyEmailPayload>({
    mutationFn: VerifyCustomerEmail,
  })
