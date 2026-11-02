import type { BillingCycle, MonthlyTerm, PlanDetails } from '../plan/types'

export type CreateSubscriptionPayload = {
  plan_id: string
  tenant_id: string
  /** 3 or 6 for monthly, 12 for yearly. Trial sends 6 when the term picker is hidden. */
  billing_cycle: 3 | 6 | 12
}

/** POST /api/v1/central/subscription/update — expired trial renewal, not first signup. */
export type UpdateSubscriptionPayload = {
  subscription_id: string
  plan_id: string
  hospital_name: string
  billing_cycle: 3 | 6 | 12
  price: 0
}

export type UpdateSubscriptionResponse = {
  message?: string
  subscription_id?: string
  tenant_id?: string
  hospital_name?: string
  price?: number
  billing_cycle?: number | string
  status?: string
  start_at?: string
  end_at?: string
  order_id?: string
  key_id?: string
}

export type CreateSubscriptionResponse = {
  message?: string
  subscription_id?: string
  tenant_id?: string
  plan_id?: string
  plan_name?: string
  hospital_name?: string
  /** Amount used for Razorpay order (currency subunits / paise). */
  price?: number
  /** e.g. "12" (yearly) or "7d" (free trial) */
  billing_cycle?: number | string
  status?: string
  start_at?: string
  end_at?: string
  expired?: boolean
  /** Present for paid plans — Razorpay order id */
  order_id?: string
  /** Present for paid plans — Razorpay public Key ID */
  key_id?: string
}

export type RazorpayCheckoutSession = {
  order_id: string
  key_id: string
  amount: number
  currency: string
  name: string
  description?: string
}

export type ConfirmCheckoutPayload = {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

/** Nested plan on GET /central/subscription/getByTenant/:tenant_id */
export type SubscriptionPlanSummary = {
  name: string
  status: string
  monthly_price: number
  discount: number
  plan_details?: PlanDetails
}

/** GET /api/v1/central/subscription/getByTenant/:tenant_id */
export type SubscriptionByTenantRecord = {
  subscription_id: string
  tenant_id: string
  plan_id: string
  status: string
  billing_cycle: string
  price: number
  order_id?: string
  start_at?: string
  end_at?: string
  expired: boolean
  hospital_name?: string
  plan?: SubscriptionPlanSummary
}

export type GetSubscriptionByTenantResponse = {
  message: string
  subscription: SubscriptionByTenantRecord
}

export type ConfirmCheckoutResponse = {
  message?: string
  subscription_id?: string
  order_id?: string
  payment_id?: string
  status?: string
}

const STORAGE = {
  orderId: 'razorpay_order_id',
  keyId: 'razorpay_key_id',
  amount: 'razorpay_amount',
  hospitalName: 'razorpay_hospital_name',
  subscriptionId: 'subscription_id',
  tenantId: 'tenant_id',
  status: 'subscription_status',
  price: 'subscription_price',
  billingCycle: 'subscription_billing_cycle',
  startAt: 'subscription_start_at',
  endAt: 'subscription_end_at',
} as const

export function normalizeSubscriptionByTenant(
  response: GetSubscriptionByTenantResponse | null | undefined,
): CreateSubscriptionResponse | null {
  const record = response?.subscription
  if (!record?.subscription_id) return null
  return {
    message: response?.message,
    subscription_id: record.subscription_id,
    tenant_id: record.tenant_id,
    plan_id: record.plan_id,
    plan_name: record.plan?.name,
    price: record.price,
    billing_cycle: record.billing_cycle,
    status: record.status,
    start_at: record.start_at,
    end_at: record.end_at,
    expired: record.expired,
    hospital_name: record.hospital_name,
    order_id: record.order_id,
  }
}

/** Save lookup fields without clearing an in-progress Razorpay checkout. */
export function persistSubscriptionLookup(data: CreateSubscriptionResponse) {
  if (data.subscription_id) {
    localStorage.setItem(STORAGE.subscriptionId, String(data.subscription_id))
  }
  if (data.tenant_id) {
    localStorage.setItem(STORAGE.tenantId, String(data.tenant_id))
  }
  if (data.status) {
    localStorage.setItem(STORAGE.status, String(data.status))
  }
  if (data.price != null) {
    localStorage.setItem(STORAGE.price, String(data.price))
  }
  if (data.billing_cycle != null) {
    localStorage.setItem(STORAGE.billingCycle, String(data.billing_cycle))
  }
  if (data.start_at) {
    localStorage.setItem(STORAGE.startAt, data.start_at)
  }
  if (data.end_at) {
    localStorage.setItem(STORAGE.endAt, data.end_at)
  }
  if (data.plan_id) {
    localStorage.setItem('selected_plan_id', data.plan_id)
  }
  if (data.order_id && data.key_id && data.price != null && data.price > 0) {
    localStorage.setItem(STORAGE.orderId, data.order_id)
    localStorage.setItem(STORAGE.keyId, data.key_id)
    localStorage.setItem(STORAGE.amount, String(data.price))
    if (data.hospital_name) {
      localStorage.setItem(STORAGE.hospitalName, data.hospital_name)
    }
  }
}

export function persistSubscriptionCreateResponse(data: CreateSubscriptionResponse) {
  if (data.subscription_id) {
    localStorage.setItem(STORAGE.subscriptionId, String(data.subscription_id))
  }
  if (data.tenant_id) {
    localStorage.setItem(STORAGE.tenantId, String(data.tenant_id))
  }
  if (data.status) {
    localStorage.setItem(STORAGE.status, String(data.status))
  }
  if (data.price != null) {
    localStorage.setItem(STORAGE.price, String(data.price))
  }
  if (data.billing_cycle != null) {
    localStorage.setItem(STORAGE.billingCycle, String(data.billing_cycle))
  }
  if (data.start_at) {
    localStorage.setItem(STORAGE.startAt, data.start_at)
  }
  if (data.end_at) {
    localStorage.setItem(STORAGE.endAt, data.end_at)
  }

  if (data.order_id && data.key_id && data.price != null && data.price > 0) {
    localStorage.setItem(STORAGE.orderId, data.order_id)
    localStorage.setItem(STORAGE.keyId, data.key_id)
    localStorage.setItem(STORAGE.amount, String(data.price))
    if (data.hospital_name) {
      localStorage.setItem(STORAGE.hospitalName, data.hospital_name)
    }
  } else {
    clearRazorpayCheckoutSession()
  }
}

export function clearRazorpayCheckoutSession() {
  localStorage.removeItem(STORAGE.orderId)
  localStorage.removeItem(STORAGE.keyId)
  localStorage.removeItem(STORAGE.amount)
  localStorage.removeItem(STORAGE.hospitalName)
}

export function readRazorpayCheckoutSession(
  fallbackName = 'Hospital Management System',
): RazorpayCheckoutSession | null {
  const order_id = localStorage.getItem(STORAGE.orderId)
  const key_id = localStorage.getItem(STORAGE.keyId)
  const amountRaw = localStorage.getItem(STORAGE.amount)
  const amount = amountRaw != null ? Number(amountRaw) : NaN
  const name = localStorage.getItem(STORAGE.hospitalName) || fallbackName

  if (!order_id || !key_id || !Number.isFinite(amount) || amount <= 0) {
    return null
  }

  return {
    order_id,
    key_id,
    amount,
    currency: 'INR',
    name,
  }
}

export function billingCycleToMonths(cycle: BillingCycle, monthlyTerm: MonthlyTerm): 3 | 6 | 12 {
  if (cycle === 'yearly') return 12
  return monthlyTerm
}

export function isPaidSubscriptionResponse(data: CreateSubscriptionResponse): boolean {
  return Boolean(data.order_id && data.key_id && data.price != null && data.price > 0)
}
