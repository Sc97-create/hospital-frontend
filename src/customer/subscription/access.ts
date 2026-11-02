export const SUBSCRIPTION_EXPIRED_KEY = 'subscription_expired'
export const SUBSCRIPTION_RENEW_PATH = '/subscription/renew'

export function isSubscriptionExpiredFlag(value: unknown): boolean {
  return value === true || value === 'true'
}

export function isSubscriptionExpired(): boolean {
  return localStorage.getItem(SUBSCRIPTION_EXPIRED_KEY) === 'true'
}

export function setSubscriptionExpired(expired: boolean) {
  if (expired) {
    localStorage.setItem(SUBSCRIPTION_EXPIRED_KEY, 'true')
    return
  }
  localStorage.removeItem(SUBSCRIPTION_EXPIRED_KEY)
}
