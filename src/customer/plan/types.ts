export type PlanDetails =
  | string[]
  | {
      features?: string[]
      [key: string]: unknown
    }

export type Plan = {
  id: string
  name: string
  status: string
  monthly_price: number
  discount: number
  effective_monthly_price: number
  plan_details: PlanDetails
  yearly_price?: number
  discount_yearly?: number
  effective_yearly_price?: number
}

export type ListPlansResponse = {
  message: string
  plans: Plan[]
}

export type BillingCycle = 'monthly' | 'yearly'
