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

export type VerifyEmailPayload = {
  code: string
}

export type VerifyEmailResponse = {
  message: string
}
