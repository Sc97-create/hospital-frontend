import { useQuery } from '@tanstack/react-query'
import { ListPlans } from './api'
import type { ListPlansResponse } from './types'

export const useListPlans = () =>
  useQuery<ListPlansResponse, Error>({
    queryKey: ['central', 'plan', 'list'],
    queryFn: ListPlans,
  })
