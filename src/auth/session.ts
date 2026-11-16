/** Resolve staff user id from login payload shapes. */
export function pickUserId(data: Record<string, unknown> | null | undefined): string {
  if (!data) return ''
  const direct = data.user_id ?? data.userid ?? data.userId ?? data.id
  if (typeof direct === 'string' && direct.trim()) return direct.trim()
  const nested = data.user
  if (nested && typeof nested === 'object') {
    const fromUser = (nested as Record<string, unknown>).id ?? (nested as Record<string, unknown>).user_id
    if (typeof fromUser === 'string' && fromUser.trim()) return fromUser.trim()
  }
  return ''
}

export function pickAccessToken(data: Record<string, unknown> | null | undefined): string {
  if (!data) return ''
  const token = data.token ?? data.access_token ?? data.accessToken
  return typeof token === 'string' ? token.trim() : ''
}

export function pickOrganisationId(data: Record<string, unknown> | null | undefined): string {
  if (!data) return ''
  const org = data.organisation_id ?? data.organization_id ?? data.organisationId
  return typeof org === 'string' ? org.trim() : ''
}

/** Read `sub` / `user_id` from a JWT payload when localStorage lost user_id. */
export function userIdFromAccessToken(token?: string | null): string {
  const raw = (token ?? localStorage.getItem('access_token') ?? '').trim()
  if (!raw || !raw.includes('.')) return ''
  try {
    const payloadPart = raw.split('.')[1]
    const json = atob(payloadPart.replace(/-/g, '+').replace(/_/g, '/'))
    const payload = JSON.parse(json) as Record<string, unknown>
    const sub = payload.sub ?? payload.user_id ?? payload.userid
    return typeof sub === 'string' ? sub.trim() : ''
  } catch {
    return ''
  }
}

/** Current staff user id, restoring from JWT when needed. */
export function getSessionUserId(): string {
  const stored = localStorage.getItem('user_id')?.trim() || ''
  if (stored) return stored
  const fromToken = userIdFromAccessToken()
  if (fromToken) {
    localStorage.setItem('user_id', fromToken)
  }
  return fromToken
}
