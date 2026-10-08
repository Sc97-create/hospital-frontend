import apiClient from '../../lib/api-client'
import type { ListPlansResponse } from './types'

/** GET /api/v1/central/plan/list */
export const ListPlans = async (): Promise<ListPlansResponse> => {
  const response = await apiClient.get<ListPlansResponse>('/central/plan/list')
  return response.data
}
