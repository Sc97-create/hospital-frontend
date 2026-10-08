import { useMemo, useState } from 'react'
import { Alert, Button, message } from 'antd'
import type { BillingCycle, Plan } from '../plan'
import {
  ConfirmCheckout,
  clearRazorpayCheckoutSession,
  readRazorpayCheckoutSession,
} from '../subscription'
import { openRazorpayCheckout } from './razorpay-checkout'
import './payment.css'

type PaymentStepProps = {
  cycle: BillingCycle
  plan?: Plan | null
  prefillName?: string
  prefillEmail?: string
  onSuccess: () => void
  onBack: () => void
}

function formatInr(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`
}

function isFreeTrialPlan(plan?: Plan | null) {
  if (!plan) return false
  const name = plan.name.toLowerCase()
  return name.includes('free') || name.includes('trial')
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

/** Display label from plan catalog (rupees). Checkout amount still comes from subscription/create. */
function getAmountLabel(cycle: BillingCycle, plan?: Plan | null, checkoutAmount?: number) {
  if (isFreeTrialPlan(plan)) return '₹0 / 7 days'
  if (plan) {
    if (cycle === 'yearly') {
      const yearly =
        plan.effective_yearly_price ??
        plan.yearly_price ??
        plan.effective_monthly_price * 12
      return `${formatInr(yearly)} / year`
    }
    return `${formatInr(plan.effective_monthly_price)} / month`
  }
  if (checkoutAmount != null) {
    // subscription/create price is Razorpay subunits (paise)
    return `${formatInr(checkoutAmount / 100)}`
  }
  return cycle === 'monthly' ? '₹X / month' : '₹Y / year'
}

export default function PaymentStep({
  cycle,
  plan,
  prefillName,
  prefillEmail,
  onSuccess,
  onBack,
}: PaymentStepProps) {
  const [messageApi, contextHolder] = message.useMessage()
  const [status, setStatus] = useState<'idle' | 'opening' | 'confirming' | 'failed'>('idle')
  const [errorDetail, setErrorDetail] = useState<string | null>(null)

  const session = useMemo(() => readRazorpayCheckoutSession(), [])
  const planName = plan?.name ?? 'Standard'
  const isBusy = status === 'opening' || status === 'confirming'
  const amountLabel = getAmountLabel(cycle, plan, session?.amount)

  const handlePay = async () => {
    const checkout = readRazorpayCheckoutSession()
    if (!checkout) {
      setStatus('failed')
      setErrorDetail(
        'Missing Razorpay order details. Go back to Plan & Billing and continue again.',
      )
      return
    }

    setStatus('opening')
    setErrorDetail(null)

    try {
      await openRazorpayCheckout({
        key: checkout.key_id,
        amount: checkout.amount,
        currency: checkout.currency,
        name: checkout.name,
        description: `${planName} subscription`,
        order_id: checkout.order_id,
        prefill: {
          name: prefillName || undefined,
          email: prefillEmail || undefined,
        },
        onSuccess: (response) => {
          console.log('Payment step received Razorpay success', {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          })

          localStorage.setItem('razorpay_payment_id', response.razorpay_payment_id)
          localStorage.setItem('razorpay_order_id', response.razorpay_order_id)
          localStorage.setItem('razorpay_signature', response.razorpay_signature)

          setStatus('confirming')
          void (async () => {
            try {
              const confirmResponse = await ConfirmCheckout({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              })
              console.log('confirmCheckout response', confirmResponse)

              if (confirmResponse.subscription_id) {
                localStorage.setItem('subscription_id', confirmResponse.subscription_id)
              }
              if (confirmResponse.status) {
                localStorage.setItem('subscription_status', confirmResponse.status)
              }
              if (confirmResponse.payment_id) {
                localStorage.setItem('razorpay_payment_id', confirmResponse.payment_id)
              }
              if (confirmResponse.order_id) {
                localStorage.setItem('razorpay_order_id', confirmResponse.order_id)
              }

              clearRazorpayCheckoutSession()
              messageApi.success(confirmResponse.message || 'Payment successful')
              setStatus('idle')
              onSuccess()
            } catch (error) {
              console.error('confirmCheckout failed:', error)
              setErrorDetail(
                getApiErrorMessage(error, 'Payment succeeded but confirmation failed. Please retry.'),
              )
              setStatus('failed')
            }
          })()
        },
        onFailure: (response) => {
          console.log('Payment step received Razorpay failure', response)
          const description =
            response.error?.description ||
            response.error?.reason ||
            'The payment could not be completed.'
          setErrorDetail(description)
          setStatus('failed')
        },
        onDismiss: () => {
          setStatus((prev) => (prev === 'opening' ? 'idle' : prev))
        },
      })
    } catch (error) {
      console.error('Razorpay Checkout failed to open:', error)
      setErrorDetail(
        error instanceof Error ? error.message : 'Failed to open Razorpay Checkout',
      )
      setStatus('failed')
    }
  }

  if (!session) {
    return (
      <div className="cpay-payment">
        {contextHolder}
        <div className="cpay-payment__header">
          <h1 className="cpay-payment__title">Payment</h1>
          <p className="cpay-payment__subtitle">
            Checkout details are missing for this subscription.
          </p>
        </div>
        <Alert
          className="cpay-payment__alert"
          type="error"
          showIcon
          message="Missing payment order"
          description="Go back to Plan & Billing and continue again so a Razorpay order can be created."
        />
        <button type="button" className="cpay-payment__back" onClick={onBack}>
          Back to Plan and Billing
        </button>
      </div>
    )
  }

  return (
    <div className="cpay-payment">
      {contextHolder}
      <div className="cpay-payment__header">
        <h1 className="cpay-payment__title">Payment</h1>
        <p className="cpay-payment__subtitle">
          Pay for {planName} ({amountLabel}) to activate the subscription.
        </p>
      </div>

      {status === 'failed' ? (
        <Alert
          className="cpay-payment__alert"
          type="error"
          showIcon
          message="Payment failed"
          description={errorDetail || 'The payment could not be completed. Retry payment to continue.'}
        />
      ) : null}

      <div className="cpay-payment__summary">
        <span>{planName} plan</span>
        <strong>{amountLabel}</strong>
      </div>

      <p className="cpay-payment__hint">
        Card, UPI, and netbanking are handled securely in Razorpay Checkout.
      </p>

      <Button
        type="primary"
        className="cpay-payment__submit"
        block
        size="large"
        loading={isBusy}
        onClick={() => {
          void handlePay()
        }}
      >
        {status === 'confirming'
          ? 'Confirming payment…'
          : isBusy
            ? 'Opening Checkout…'
            : status === 'failed'
              ? 'Retry with Razorpay →'
              : 'Pay with Razorpay →'}
      </Button>
    </div>
  )
}
