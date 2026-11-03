function trimTrailingSlash(url: string) {
  return url.replace(/\/+$/, '')
}

/** Backend origin from `.env` — e.g. `http://localhost:9069` */
export const API_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:9069',
)

/** Axios / API root — `{VITE_API_BASE_URL}/api/v1` */
export const API_V1_URL = `${API_BASE_URL}/api/v1`

/** Frontend origin from `.env` — e.g. `http://localhost:5173` */
export const APP_URL = trimTrailingSlash(
  import.meta.env.VITE_APP_URL || (typeof window !== 'undefined' ? window.location.origin : ''),
)
