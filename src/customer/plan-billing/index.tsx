import { Button, Card, Radio, Select, Spin, Alert, message } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { useGetTenantById } from '../api/use-create-tenant'
import { useListPlans, type BillingCycle, type MonthlyTerm, type Plan, type PlanDetails } from '../plan'
import {
  billingCycleToMonths,
  isPaidSubscriptionResponse,
  normalizeSubscriptionByTenant,
  persistSubscriptionCreateResponse,
  persistSubscriptionLookup,
  useCreateSubscription,
  useGetSubscriptionByTenant,
  useUpdateSubscription,
} from '../subscription'
import { normalizeGetTenantByIdResponse } from '../types/tenant'
import './plan-billing.css'

type PlanBillingStepProps = {
  cycle: BillingCycle
  onCycleChange: (cycle: BillingCycle) => void
  monthlyTerm: MonthlyTerm
  onMonthlyTermChange: (term: MonthlyTerm) => void
  onContinue: (plan: Plan) => void
  onBackToPricing?: () => void
  selectedPlanId?: string
  onPlanSelect?: (plan: Plan) => void
  showExistingSubscription?: boolean
  /** Expired-trial renewal uses POST /subscription/update. First signup stays on create. */
  subscriptionMode?: 'create' | 'update'
}

const FALLBACK_SUMMARY = [
  'Manage up to 3 organisations',
  'Up to 10 team members per organisation',
  'Unlimited patient records',
  'Unlimited appointments',
  'Unlimited payment transactions',
  'Full patient history',
] as const

function formatInr(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`
}

function getPlanFeatures(details: PlanDetails | undefined): string[] {
  if (!details) return [...FALLBACK_SUMMARY]
  if (Array.isArray(details)) {
    return details.map(String)
  }
  if (Array.isArray(details.features)) {
    return details.features.map(String)
  }

  const fromObject = Object.entries(details)
    .filter(([key, value]) => key !== 'features' && (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'))
    .map(([key, value]) => {
      if (typeof value === 'boolean') return value ? key : null
      return `${key}: ${value}`
    })
    .filter((item): item is string => Boolean(item))

  return fromObject.length > 0 ? fromObject : [...FALLBACK_SUMMARY]
}

function isFreeTrialPlan(plan: Plan) {
  const name = plan.name.toLowerCase()
  return name.includes('free') || name.includes('trial')
}

function subscriptionUsesFreeTrial(
  subscription: { plan_name?: string; billing_cycle?: number | string; status?: string; plan_id?: string } | null,
  plans: Plan[],
) {
  if (!subscription) return false
  const name = subscription.plan_name?.trim().toLowerCase() ?? ''
  const status = subscription.status?.trim().toLowerCase() ?? ''
  const cycle = String(subscription.billing_cycle ?? '').trim().toLowerCase()
  if (name.includes('free') || name.includes('trial')) return true
  if (status === 'trial' || status === 'free_trial' || status === 'trialing') return true
  if (cycle === '7d' || cycle === '7') return true
  const matched = plans.find((plan) => plan.id === subscription.plan_id)
  return matched ? isFreeTrialPlan(matched) : false
}

function getDisplayPrice(plan: Plan, cycle: BillingCycle, monthlyTerm: MonthlyTerm) {
  if (isFreeTrialPlan(plan)) {
    return {
      amount: plan.effective_monthly_price || 0,
      unit: '/ 7 days',
      original: undefined as number | undefined,
      note: 'Free trial expires in 7 days. No monthly or yearly billing.',
    }
  }

  if (cycle === 'yearly') {
    const yearly =
      plan.effective_yearly_price ??
      plan.yearly_price ??
      plan.effective_monthly_price * 12
    return {
      amount: yearly,
      unit: '/ year',
      original:
        plan.yearly_price && plan.effective_yearly_price && plan.yearly_price !== plan.effective_yearly_price
          ? plan.yearly_price
          : plan.monthly_price * 12 !== yearly
            ? plan.monthly_price * 12
            : undefined,
      note: 'Yearly billing is a 12-month plan paid once per year.',
    }
  }

  const total = plan.effective_monthly_price * monthlyTerm
  const listTotal = plan.monthly_price * monthlyTerm
  return {
    amount: total,
    unit: `/ ${monthlyTerm} months`,
    original: listTotal !== total ? listTotal : undefined,
    note: `${formatInr(plan.effective_monthly_price)} × ${monthlyTerm} months`,
  }
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response &&
    error.response.data &&
    typeof error.response.data === 'object' &&
    'message' in error.response.data &&
    typeof error.response.data.message === 'string'
  ) {
    return error.response.data.message
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return fallback
}

export type { BillingCycle }

export default function PlanBillingStep({
  cycle,
  onCycleChange,
  monthlyTerm,
  onMonthlyTermChange,
  onContinue,
  onBackToPricing,
  selectedPlanId,
  onPlanSelect,
  showExistingSubscription = true,
  subscriptionMode = 'create',
}: PlanBillingStepProps) {
  const { data, isLoading, isError, error, refetch } = useListPlans()
  const [tenantId] = useState(() => localStorage.getItem('tenant_id'))
  const {
    data: subscriptionResponse,
    isError: isSubscriptionError,
    error: subscriptionError,
  } = useGetSubscriptionByTenant(tenantId)
  const existingSubscription = useMemo(
    () => (subscriptionResponse ? normalizeSubscriptionByTenant(subscriptionResponse) : null),
    [subscriptionResponse],
  )
  const { mutate: createSubscription, isPending: isCreating } = useCreateSubscription()
  const { mutate: updateSubscription, isPending: isUpdating } = useUpdateSubscription()
  const isPending = isCreating || isUpdating
  const renewingExpiredTrial = subscriptionMode === 'update'
  const { data: tenantResponse } = useGetTenantById(renewingExpiredTrial ? tenantId : null)
  const [messageApi, contextHolder] = message.useMessage()
  const hospitalName = useMemo(() => {
    const fromSubscription = existingSubscription?.hospital_name?.trim()
    if (fromSubscription) return fromSubscription
    const stored = localStorage.getItem('razorpay_hospital_name')?.trim()
    if (stored) return stored
    const tenant = tenantResponse ? normalizeGetTenantByIdResponse(tenantResponse) : null
    return tenant?.facility_name?.trim() || tenant?.legal_entity_name?.trim() || ''
  }, [existingSubscription?.hospital_name, tenantResponse])

  const plans = useMemo(
    () => (data?.plans ?? []).filter((plan) => plan.status === 'active'),
    [data?.plans],
  )
  const trialAlreadyUsed = subscriptionUsesFreeTrial(existingSubscription, plans)
  const payablePlans = useMemo(
    () => plans.filter((plan) => !(trialAlreadyUsed && isFreeTrialPlan(plan))),
    [plans, trialAlreadyUsed],
  )

  const selectedPlan = useMemo(() => {
    if (!payablePlans.length) return null
    return payablePlans.find((plan) => plan.id === selectedPlanId) ?? payablePlans[0]
  }, [payablePlans, selectedPlanId])

  useEffect(() => {
    if (selectedPlan && onPlanSelect && selectedPlan.id !== selectedPlanId) {
      onPlanSelect(selectedPlan)
    }
  }, [selectedPlan, selectedPlanId, onPlanSelect])

  useEffect(() => {
    if (!existingSubscription) return
    persistSubscriptionLookup(existingSubscription)
    if (!onPlanSelect) return
    if (subscriptionUsesFreeTrial(existingSubscription, plans)) {
      const paidPlan = plans.find((plan) => !isFreeTrialPlan(plan))
      if (paidPlan && paidPlan.id !== selectedPlanId) onPlanSelect(paidPlan)
      return
    }
    if (!existingSubscription.plan_id) return
    const matched = plans.find((plan) => plan.id === existingSubscription.plan_id)
    if (matched && matched.id !== selectedPlanId) onPlanSelect(matched)
  }, [existingSubscription, plans, onPlanSelect, selectedPlanId])

  useEffect(() => {
    if (!isSubscriptionError || !tenantId) return
    const status =
      subscriptionError &&
      typeof subscriptionError === 'object' &&
      'response' in subscriptionError &&
      subscriptionError.response &&
      typeof subscriptionError.response === 'object' &&
      'status' in subscriptionError.response
        ? subscriptionError.response.status
        : undefined
    if (status === 404) return
    messageApi.error(
      getApiErrorMessage(subscriptionError, 'Could not load the current subscription.'),
    )
  }, [isSubscriptionError, subscriptionError, tenantId, messageApi])

  const freeTrial = selectedPlan ? isFreeTrialPlan(selectedPlan) : false
  const price = selectedPlan ? getDisplayPrice(selectedPlan, cycle, monthlyTerm) : null
  const features = getPlanFeatures(selectedPlan?.plan_details)

  const handleContinue = () => {
    if (!selectedPlan) return

    const tenantId = localStorage.getItem('tenant_id')
    if (!tenantId) {
      messageApi.error('Missing tenant. Go back and complete organisation setup.')
      return
    }

    if (trialAlreadyUsed && isFreeTrialPlan(selectedPlan)) {
      messageApi.error('Free trial has already been used. Choose a paid plan.')
      return
    }

    const isTrial = isFreeTrialPlan(selectedPlan)
    const billing_cycle = isTrial ? 6 : billingCycleToMonths(cycle, monthlyTerm)

    const onSaved = (
      data: {
        message?: string
        order_id?: string
        key_id?: string
        price?: number
      },
      successFallback: string,
    ) => {
      localStorage.setItem('selected_plan_id', selectedPlan.id)
      persistSubscriptionCreateResponse(data)
      messageApi.success(data.message || successFallback)

      if (!isTrial && !isPaidSubscriptionResponse(data)) {
        messageApi.error(
          'Payment order was not created for this plan. Please retry or contact support.',
        )
        return
      }

      onContinue(selectedPlan)
    }

    if (renewingExpiredTrial) {
      const subscriptionId = existingSubscription?.subscription_id
      if (!subscriptionId) {
        messageApi.error('Missing subscription. Refresh and try again.')
        return
      }
      if (!hospitalName) {
        messageApi.error('Missing hospital name. Refresh and try again.')
        return
      }

      updateSubscription(
        {
          subscription_id: subscriptionId,
          plan_id: selectedPlan.id,
          hospital_name: hospitalName,
          billing_cycle,
          price: 0,
        },
        {
          onSuccess: (data) => onSaved(data, 'Subscription updated successfully'),
          onError: (err) => {
            messageApi.error(getApiErrorMessage(err, 'Could not update subscription. Please retry.'))
          },
        },
      )
      return
    }

    createSubscription(
      {
        plan_id: selectedPlan.id,
        tenant_id: tenantId,
        billing_cycle,
      },
      {
        onSuccess: (data) => onSaved(data, 'Subscription created successfully'),
        onError: (err) => {
          messageApi.error(getApiErrorMessage(err, 'Could not create subscription. Please retry.'))
        },
      },
    )
  }

  return (
    <div className="cpb-plan">
      {contextHolder}
      <div className="cpb-plan__header">
        <h1 className="cpb-plan__title">Plan & Billing</h1>
        <p className="cpb-plan__subtitle">
          {trialAlreadyUsed
            ? 'Free trial has already been used. Choose a paid plan to continue.'
            : 'Choose a plan. Free trial skips payment; paid plans continue to checkout.'}
        </p>
      </div>

      {isLoading ? (
        <div className="cpb-plan__loading">
          <Spin size="large" />
        </div>
      ) : null}

      {showExistingSubscription && existingSubscription ? (
        <Alert
          showIcon
          className="cpb-plan__alert"
          type={existingSubscription.expired ? 'warning' : 'info'}
          message={
            existingSubscription.expired
              ? `${existingSubscription.plan_name || 'This subscription'} has expired`
              : `${existingSubscription.plan_name || 'This subscription'} is ${existingSubscription.status || 'active'}`
          }
        />
      ) : null}

      {isError ? (
        <Alert
          type="error"
          showIcon
          className="cpb-plan__alert"
          message="Could not load plans"
          description={error.message || 'Please try again.'}
          action={
            <Button size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      ) : null}

      {!isLoading && !isError && plans.length === 0 ? (
        <Alert type="warning" showIcon message="No active plans available right now." />
      ) : null}

      {selectedPlan && price ? (
        <Card className="cpb-plan__card" bordered={false}>
          <div className="cpb-plan__card-top">
            <span className="cpb-plan__badge">{selectedPlan.name}</span>
            <p className="cpb-plan__price">
              {formatInr(price.amount)}
              <span>{price.unit}</span>
            </p>
            {price.original ? (
              <p className="cpb-plan__price-original">
                <span>{formatInr(price.original)}</span>
                {selectedPlan.discount > 0 ? (
                  <em>{selectedPlan.discount}% off</em>
                ) : null}
              </p>
            ) : null}
          </div>

          {(plans.length > 1 || trialAlreadyUsed) ? (
            <Radio.Group
              className="cpb-plan__plans"
              value={selectedPlan.id}
              onChange={(e) => {
                const next = payablePlans.find((plan) => plan.id === e.target.value)
                if (next) onPlanSelect?.(next)
              }}
              optionType="button"
              buttonStyle="solid"
            >
              {plans.map((plan) => {
                const used = trialAlreadyUsed && isFreeTrialPlan(plan)
                return (
                  <Radio.Button key={plan.id} value={plan.id} disabled={used}>
                    <span className="cpb-plan__option">
                      <span>{plan.name}</span>
                      {used ? <span className="cpb-plan__option-used">Already used</span> : null}
                    </span>
                  </Radio.Button>
                )
              })}
            </Radio.Group>
          ) : null}

          {!freeTrial ? (
            <>
              <Radio.Group
                className="cpb-plan__cycle"
                value={cycle}
                onChange={(e) => onCycleChange(e.target.value)}
                optionType="button"
                buttonStyle="solid"
                options={[
                  { label: 'Monthly', value: 'monthly' },
                  { label: 'Yearly', value: 'yearly' },
                ]}
              />
              {cycle === 'monthly' ? (
                <Select<MonthlyTerm>
                  className="cpb-plan__term"
                  size="large"
                  value={monthlyTerm}
                  aria-label="Monthly term"
                  onChange={onMonthlyTermChange}
                  options={[
                    { value: 3, label: '3 months' },
                    { value: 6, label: '6 months' },
                  ]}
                />
              ) : null}
            </>
          ) : null}

          {price.note ? <p className="cpb-plan__cycle-note">{price.note}</p> : null}

          <ul className="cpb-plan__list">
            {features.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Button
        type="primary"
        className="cpb-plan__submit"
        block
        size="large"
        loading={isPending}
        disabled={!selectedPlan || isLoading || isPending}
        onClick={handleContinue}
      >
        Continue {freeTrial ? '' : 'to Payment '}→
      </Button>

      {onBackToPricing ? (
        <button type="button" className="cpb-plan__back" onClick={onBackToPricing} disabled={isPending}>
          Back
        </button>
      ) : null}
    </div>
  )
}
