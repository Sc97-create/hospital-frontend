export type RazorpaySuccessResponse = {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

export type RazorpayFailureResponse = {
  error: {
    code?: string
    description?: string
    source?: string
    step?: string
    reason?: string
    metadata?: {
      order_id?: string
      payment_id?: string
    }
  }
}

export type RazorpayCheckoutOptions = {
  key: string
  amount: string | number
  currency: string
  name: string
  description?: string
  image?: string
  order_id: string
  handler: (response: RazorpaySuccessResponse) => void
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  notes?: Record<string, string>
  theme?: {
    color?: string
  }
  modal?: {
    ondismiss?: () => void
  }
}

type RazorpayInstance = {
  open: () => void
  on: (event: 'payment.failed', handler: (response: RazorpayFailureResponse) => void) => void
}

type RazorpayConstructor = new (options: RazorpayCheckoutOptions) => RazorpayInstance

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor
  }
}

const CHECKOUT_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'

let checkoutScriptPromise: Promise<void> | null = null

export function loadRazorpayCheckoutScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Razorpay can only load in the browser'))
  }
  if (window.Razorpay) {
    return Promise.resolve()
  }
  if (checkoutScriptPromise) {
    return checkoutScriptPromise
  }

  checkoutScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${CHECKOUT_SCRIPT_SRC}"]`,
    )
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener(
        'error',
        () => {
          checkoutScriptPromise = null
          reject(new Error('Failed to load Razorpay Checkout'))
        },
        { once: true },
      )
      return
    }

    const script = document.createElement('script')
    script.src = CHECKOUT_SCRIPT_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      checkoutScriptPromise = null
      reject(new Error('Failed to load Razorpay Checkout'))
    }
    document.body.appendChild(script)
  })

  return checkoutScriptPromise
}

export type OpenRazorpayCheckoutParams = {
  key: string
  amount: number
  currency?: string
  name: string
  description?: string
  order_id: string
  prefill?: RazorpayCheckoutOptions['prefill']
  onSuccess: (response: RazorpaySuccessResponse) => void
  onFailure?: (response: RazorpayFailureResponse) => void
  onDismiss?: () => void
}

export async function openRazorpayCheckout(params: OpenRazorpayCheckoutParams): Promise<void> {
  await loadRazorpayCheckoutScript()

  if (!window.Razorpay) {
    throw new Error('Razorpay Checkout is unavailable')
  }

  const options: RazorpayCheckoutOptions = {
    key: params.key,
    amount: params.amount,
    currency: params.currency ?? 'INR',
    name: params.name,
    description: params.description,
    order_id: params.order_id,
    handler: (response) => {
      console.log('Razorpay payment success', {
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature,
        response,
      })
      params.onSuccess(response)
    },
    prefill: params.prefill,
    theme: {
      color: '#1B806A',
    },
    modal: {
      ondismiss: () => {
        console.log('Razorpay Checkout dismissed')
        params.onDismiss?.()
      },
    },
  }

  console.log('Razorpay Checkout opening', {
    key: options.key,
    amount: options.amount,
    currency: options.currency,
    name: options.name,
    description: options.description,
    order_id: options.order_id,
    prefill: options.prefill,
  })

  const rzp = new window.Razorpay(options)

  if (params.onFailure) {
    rzp.on('payment.failed', (response) => {
      console.log('Razorpay payment failed', {
        code: response.error?.code,
        description: response.error?.description,
        source: response.error?.source,
        step: response.error?.step,
        reason: response.error?.reason,
        order_id: response.error?.metadata?.order_id,
        payment_id: response.error?.metadata?.payment_id,
        response,
      })
      params.onFailure?.(response)
    })
  }

  rzp.open()
}
