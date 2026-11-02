import { useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Button, Spin } from 'antd'
import PlanBillingStep from '../plan-billing'
import PaymentStep from '../payment'
import type { BillingCycle, MonthlyTerm, Plan } from '../plan'
import {
  normalizeSubscriptionByTenant,
  useGetSubscriptionByTenant,
} from '../subscription'
import { setSubscriptionExpired } from '../subscription/access'
import '../signup/signup.css'
import './subscription-renew.css'

type RenewStep = 'plan' | 'payment' | 'done'

function LogoMark() {
  return (
    <svg className="cs-logo__mark" viewBox="0 0 36 36" aria-hidden="true">
      <rect width="36" height="36" rx="10" fill="#1B806A" />
      <path
        d="M11 19c2.4 3.4 5.5 5.3 10 5.8M15.5 11.5c1.9-.4 3.8-.3 5.7.4 1.7.6 3 1.8 3.8 3.3"
        fill="none"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="13.2" cy="14.2" r="1.7" fill="#fff" />
    </svg>
  )
}

function formatDate(value?: string) {
  if (!value || value === '...') return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString()
}

function formatCycle(cycle?: number | string) {
  const text = String(cycle ?? '').trim()
  if (text === '12') return 'Yearly'
  if (text === '6') return '6 months'
  if (text === '3') return '3 months'
  if (text === '7d') return '7-day trial'
  return text || null
}

function isFreeTrialPlan(plan: Plan) {
  const name = plan.name.toLowerCase()
  return name.includes('free') || name.includes('trial')
}

export default function SubscriptionRenewPage() {
  const token = localStorage.getItem('access_token')
  const [tenantId] = useState(() => localStorage.getItem('tenant_id'))
  const [cycle, setCycle] = useState<BillingCycle>('yearly')
  const [monthlyTerm, setMonthlyTerm] = useState<MonthlyTerm>(3)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [step, setStep] = useState<RenewStep>('plan')

  const { data, isLoading, isError } = useGetSubscriptionByTenant(tenantId)
  const subscription = useMemo(
    () => (data ? normalizeSubscriptionByTenant(data) : null),
    [data],
  )

  if (!token) {
    return <Navigate to="/customer/login" replace />
  }

  const planName = subscription?.plan_name?.trim() || 'Current plan'
  const cycleLabel = formatCycle(subscription?.billing_cycle)
  const priceLabel =
    subscription?.price != null ? `₹${subscription.price.toLocaleString('en-IN')}` : null
  const startLabel = formatDate(subscription?.start_at)
  const endLabel = formatDate(subscription?.end_at)
  const details = [
    subscription?.status,
    priceLabel,
    cycleLabel,
    startLabel ? `Started ${startLabel}` : null,
    endLabel ? `Ended ${endLabel}` : null,
  ].filter(Boolean)

  const finishRenewal = () => {
    setSubscriptionExpired(false)
    setStep('done')
  }

  return (
    <div className="customer-signup subscription-renew">
      <aside className="cs-brand">
        <div className="cs-brand__logo">
          <LogoMark />
          <div>
            <div className="cs-brand__name">Floato</div>
            <div className="cs-brand__tag">Healthcare OS</div>
          </div>
        </div>
        <div className="cs-brand__copy">
          <h2 className="cs-brand__headline">Your subscription has expired.</h2>
          <p className="cs-brand__support">
            Choose a plan and complete payment to use Floato again. The workspace stays closed until then.
          </p>
        </div>
      </aside>

      <main className="cs-panel">
        <div className="cs-panel__inner">
          <section className="renew-current" aria-label="Current subscription">
            <p className="renew-current__label">Current subscription</p>
            {isLoading ? <Spin /> : null}
            {!isLoading && subscription ? (
              <>
                <h1 className="renew-current__title">{planName}</h1>
                <p className="renew-current__status">Expired</p>
                {details.length > 0 ? <p className="renew-current__meta">{details.join(' · ')}</p> : null}
              </>
            ) : null}
            {!isLoading && !subscription ? (
              <p className="renew-current__meta">
                {isError
                  ? 'The current subscription could not be loaded. You can still choose a plan and pay.'
                  : 'No current subscription was found. Choose a plan and complete payment.'}
              </p>
            ) : null}
          </section>

          {step === 'plan' ? (
            <PlanBillingStep
              cycle={cycle}
              onCycleChange={setCycle}
              monthlyTerm={monthlyTerm}
              onMonthlyTermChange={setMonthlyTerm}
              selectedPlanId={selectedPlan?.id ?? subscription?.plan_id}
              onPlanSelect={setSelectedPlan}
              showExistingSubscription={false}
              subscriptionMode="update"
              onContinue={(plan) => {
                setSelectedPlan(plan)
                if (isFreeTrialPlan(plan)) {
                  finishRenewal()
                  return
                }
                setStep('payment')
              }}
            />
          ) : null}

          {step === 'payment' ? (
            <PaymentStep
              cycle={cycle}
              monthlyTerm={monthlyTerm}
              plan={selectedPlan}
              prefillEmail={localStorage.getItem('customer_email') || undefined}
              onSuccess={finishRenewal}
              onBack={() => setStep('plan')}
            />
          ) : null}

          {step === 'done' ? (
            <div className="renew-done">
              <h1 className="renew-current__title">Payment received</h1>
              <p className="renew-current__meta">
                {selectedPlan?.name || planName} is renewed. Sign in with your staff account to open the workspace.
              </p>
              <Link to="/login">
                <Button type="primary" className="renew-done__button" block size="large">
                  Go to staff sign in
                </Button>
              </Link>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  )
}
