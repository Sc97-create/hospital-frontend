import { useEffect, useMemo, useState } from 'react'
import { Button, Spin } from 'antd'
import { CheckCircleFilled } from '@ant-design/icons'
import {
  normalizeSubscriptionByTenant,
  persistSubscriptionLookup,
  useGetSubscriptionByTenant,
} from '../subscription'
import './subscription-active.css'

type SubscriptionActiveStepProps = {
  onContinue: () => void
}

function formatDate(value?: string) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString()
}

function formatCycle(cycle?: number | string) {
  const text = String(cycle ?? '').trim()
  if (!text) return null
  if (text === '12') return 'Yearly'
  if (text === '6') return '6 months'
  if (text === '3') return '3 months'
  if (text === '7d') return '7-day trial'
  return text
}

function formatStatus(status?: string) {
  if (!status?.trim()) return 'active'
  return status
    .trim()
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
}

export default function SubscriptionActiveStep({ onContinue }: SubscriptionActiveStepProps) {
  const [tenantId] = useState(() => localStorage.getItem('tenant_id'))
  const { data, isLoading, isError } = useGetSubscriptionByTenant(tenantId)
  const subscription = useMemo(
    () => (data ? normalizeSubscriptionByTenant(data) : null),
    [data],
  )

  useEffect(() => {
    if (subscription) persistSubscriptionLookup(subscription)
  }, [subscription])

  const planLabel = subscription?.plan_name?.trim() || 'Your plan'
  const statusLabel = formatStatus(subscription?.status)
  const cycleLabel = formatCycle(subscription?.billing_cycle)
  const priceLabel =
    subscription?.price != null ? `₹${subscription.price.toLocaleString('en-IN')}` : null
  const startLabel = formatDate(subscription?.start_at)
  const endLabel = formatDate(subscription?.end_at)

  const subtitle = subscription
    ? [priceLabel, cycleLabel, startLabel ? `Started ${startLabel}` : null, endLabel ? `Ends ${endLabel}` : null]
        .filter(Boolean)
        .join(' · ')
    : isError
      ? 'Could not load the subscription for this organisation. You can still continue.'
      : 'Continue to finish organisation setup.'

  return (
    <div className="csa-active">
      {isLoading ? <Spin className="csa-active__loading" size="large" /> : <CheckCircleFilled className="csa-active__icon" />}
      <h1 className="csa-active__title">
        {subscription
          ? subscription.expired
            ? `${planLabel} has expired`
            : `${planLabel} is ${statusLabel}`
          : 'Subscription active'}
      </h1>
      <p className="csa-active__subtitle">{subtitle || 'Continue to finish organisation setup.'}</p>
      <Button type="primary" className="csa-active__submit" block size="large" onClick={onContinue}>
        Continue to Organisation Ready →
      </Button>
    </div>
  )
}
