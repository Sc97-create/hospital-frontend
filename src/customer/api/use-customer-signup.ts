import { useMutation } from '@tanstack/react-query'
import { CustomerSignup } from '../api/signup'
import type { CustomerSignupPayload, CustomerSignupResponse } from '../types/signup'

export const useCustomerSignup = () =>
  useMutation<CustomerSignupResponse, Error, CustomerSignupPayload>({
    mutationFn: CustomerSignup,
  })
