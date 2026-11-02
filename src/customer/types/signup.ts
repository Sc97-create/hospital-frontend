export type CustomerSignupPayload = {
  full_name: string
  work_email: string
  password: string
}

export type CustomerSignupResponse = {
  message: string
  customer_id: string
  work_email: string
  status: string
  access_token: string
}

export type CustomerLoginPayload = {
  work_email: string
  password: string
}

export type CustomerLoginResponse = {
  message?: string
  code?: number | string
  customer_id?: string
  work_email?: string
  status?: string
  access_token?: string
  token?: string
  organisation_id?: string
  tenant_id?: string
  subscription_expired?: boolean | string
}

export type VerifyEmailPayload = {
  code: string
}

export type VerifyEmailResponse = {
  message: string
}
