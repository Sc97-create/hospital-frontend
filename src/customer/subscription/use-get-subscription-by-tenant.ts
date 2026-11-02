import { useQuery } from '@tanstack/react-query'
import { GetSubscriptionByTenant } from './api'
import type { GetSubscriptionByTenantResponse } from './types'

function isMissingSubscription(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null &&
    'status' in error.response &&
    error.response.status === 404
  )
}

export const useGetSubscriptionByTenant = (tenantId: string | null | undefined) =>
  useQuery<GetSubscriptionByTenantResponse, Error>({
    queryKey: ['central', 'subscription', 'getByTenant', tenantId],
    queryFn: () => GetSubscriptionByTenant(tenantId as string),
    enabled: Boolean(tenantId),
    retry: (failureCount, error) => !isMissingSubscription(error) && failureCount < 1,
  })
