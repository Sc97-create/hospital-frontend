import { Button, Card, Radio, Spin, Alert, message } from 'antd'
import { useEffect, useMemo } from 'react'
import { useListPlans, type BillingCycle, type Plan, type PlanDetails } from '../plan'
import {
  billingCycleToMonths,
  isPaidSubscriptionResponse,
  persistSubscriptionCreateResponse,
  useCreateSubscription,
} from '../subscription'
import './plan-billing.css'

type PlanBillingStepProps = {
  cycle: BillingCycle
  onCycleChange: (cycle: BillingCycle) => void
  onContinue: (plan: Plan) => void
  onBackToPricing?: () => void
  selectedPlanId?: string
  onPlanSelect?: (plan: Plan) => void
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

function getDisplayPrice(plan: Plan, cycle: BillingCycle) {
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

  return {
    amount: plan.effective_monthly_price,
    unit: '/ month',
    original:
      plan.monthly_price !== plan.effective_monthly_price ? plan.monthly_price : undefined,
    note: 'Monthly billing is for a 6-month commitment, billed each month.',
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
  onContinue,
  onBackToPricing,
  selectedPlanId,
  onPlanSelect,
}: PlanBillingStepProps) {
  const { data, isLoading, isError, error, refetch } = useListPlans()
  const { mutate: createSubscription, isPending } = useCreateSubscription()
  const [messageApi, contextHolder] = message.useMessage()

  const plans = useMemo(
    () => (data?.plans ?? []).filter((plan) => plan.status === 'active'),
    [data?.plans],
  )

  const selectedPlan = useMemo(() => {
    if (!plans.length) return null
    return plans.find((plan) => plan.id === selectedPlanId) ?? plans[0]
  }, [plans, selectedPlanId])

  useEffect(() => {
    if (selectedPlan && onPlanSelect && selectedPlan.id !== selectedPlanId) {
      onPlanSelect(selectedPlan)
    }
  }, [selectedPlan, selectedPlanId, onPlanSelect])

  const freeTrial = selectedPlan ? isFreeTrialPlan(selectedPlan) : false
  const price = selectedPlan ? getDisplayPrice(selectedPlan, cycle) : null
  const features = getPlanFeatures(selectedPlan?.plan_details)

  const handleContinue = () => {
    if (!selectedPlan) return

    const tenantId = localStorage.getItem('tenant_id')
    if (!tenantId) {
      messageApi.error('Missing tenant. Go back and complete organisation setup.')
      return
    }

    const isTrial = isFreeTrialPlan(selectedPlan)

    createSubscription(
      {
        plan_id: selectedPlan.id,
        tenant_id: tenantId,
        // Trial has no monthly/yearly UI; API still expects a cycle value
        billing_cycle: isTrial ? 6 : billingCycleToMonths(cycle),
      },
      {
        onSuccess: (data) => {
          localStorage.setItem('selected_plan_id', selectedPlan.id)
          persistSubscriptionCreateResponse(data)
          messageApi.success(data.message || 'Subscription created successfully')

          if (!isTrial && !isPaidSubscriptionResponse(data)) {
            messageApi.error(
              'Payment order was not created for this plan. Please retry or contact support.',
            )
            return
          }

          onContinue(selectedPlan)
        },
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
          Choose a plan. Free trial skips payment; paid plans continue to checkout.
        </p>
      </div>

      {isLoading ? (
        <div className="cpb-plan__loading">
          <Spin size="large" />
        </div>
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

          {plans.length > 1 ? (
            <Radio.Group
              className="cpb-plan__plans"
              value={selectedPlan.id}
              onChange={(e) => {
                const next = plans.find((plan) => plan.id === e.target.value)
                if (next) onPlanSelect?.(next)
              }}
              optionType="button"
              buttonStyle="solid"
              options={plans.map((plan) => ({
                label: plan.name,
                value: plan.id,
              }))}
            />
          ) : null}

          {!freeTrial ? (
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
