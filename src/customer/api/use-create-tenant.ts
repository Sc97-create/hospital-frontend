import { useMutation, useQuery } from '@tanstack/react-query'
import { CreateTenant, GetTenantById, UpdateTenant } from './create-tenant'
import type {
  CreateTenantPayload,
  CreateTenantResponse,
  GetTenantByIdResponse,
  UpdateTenantPayload,
  UpdateTenantResponse,
} from '../types/tenant'

export const useCreateTenant = () =>
  useMutation<CreateTenantResponse, Error, CreateTenantPayload>({
    mutationFn: CreateTenant,
  })

export const useUpdateTenant = () =>
  useMutation<UpdateTenantResponse, Error, UpdateTenantPayload>({
    mutationFn: UpdateTenant,
  })

export const useGetTenantById = (tenantId: string | null | undefined) =>
  useQuery<GetTenantByIdResponse, Error>({
    queryKey: ['central', 'tenant', 'getById', tenantId],
    queryFn: () => GetTenantById(tenantId as string),
    enabled: Boolean(tenantId),
    retry: 1,
  })
