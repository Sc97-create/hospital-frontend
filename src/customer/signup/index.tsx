import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button, Form, Input, message } from 'antd'
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons'
import VerifyEmailStep from '../verify'
import OrganisationCreateStep, { type OrganisationCreateForm } from '../organisation-create'
import PlanBillingStep from '../plan-billing'
import PaymentStep from '../payment'
import SubscriptionActiveStep from '../subscription-active'
import ReadyStep, { type ReadyOrganisationSummary } from '../ready'
import { useCustomerSignup } from '../api/use-customer-signup'
import type { BillingCycle, Plan } from '../plan'
import './signup.css'

export type PlanAction = 'free_trial' | 'choose'

type SignupStep =
  | 'account'
  | 'verify'
  | 'organisation'
  | 'plan'
  | 'payment'
  | 'active'
  | 'ready'

type AccountForm = {
  fullName: string
  workEmail: string
  password: string
}

const ORG_TYPE_LABELS: Record<string, string> = {
  hospital: 'Hospital',
  clinic: 'Clinic',
  diagnostic: 'Diagnostic Center',
  private: 'Private Hospital',
  government: 'Government Hospital',
}

const PREVIEW_ORGANISATION: ReadyOrganisationSummary = {
  legalName: 'Sachin Healthcare Pvt Ltd',
  facilityName: 'Sachin Hospital',
  organisationTypeLabel: 'Hospital',
}

const STEP_FROM_PARAM: Record<string, SignupStep> = {
  account: 'account',
  verify: 'verify',
  organisation: 'organisation',
  plan: 'plan',
  payment: 'payment',
  active: 'active',
  ready: 'ready',
  '0': 'account',
  '1': 'verify',
  '2': 'organisation',
  '3': 'ready',
}

function toReadySummary(values: OrganisationCreateForm): ReadyOrganisationSummary {
  return {
    legalName: values.legalName,
    facilityName: values.facilityName,
    organisationTypeLabel: ORG_TYPE_LABELS[values.organisationType] ?? values.organisationType,
  }
}

function resolvePlan(raw: string | null | undefined): PlanAction {
  // Prefer plan selection on the Plan page. free_trial URL is a shortcut that skips plan/payment.
  if (raw === 'free_trial') return 'free_trial'
  return 'choose'
}

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

function passwordStrength(password: string): 0 | 1 | 2 | 3 {
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1
  return score as 0 | 1 | 2 | 3
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

function AccountStep({
  plan,
  values,
  onChange,
  onSubmit,
}: {
  plan: PlanAction
  values: AccountForm
  onChange: (next: Partial<AccountForm>) => void
  onSubmit: (values: AccountForm) => void
}) {
  const [form] = Form.useForm<AccountForm>()
  const strength = useMemo(() => passwordStrength(values.password), [values.password])
  const { mutate: signup, isPending } = useCustomerSignup()
  const [messageApi, contextHolder] = message.useMessage()

  const handleFinish = (formValues: AccountForm) => {
    onChange(formValues)
    signup(
      {
        full_name: formValues.fullName.trim(),
        work_email: formValues.workEmail.trim(),
        password: formValues.password,
      },
      {
        onSuccess: (data) => {
          localStorage.setItem('access_token', data.access_token)
          localStorage.setItem('customer_id', data.customer_id)
          localStorage.setItem('customer_email', data.work_email)
          localStorage.setItem('customer_status', data.status)
          // Fresh signup — don't reuse tenant/org from a previous attempt or hospital session
          localStorage.removeItem('tenant_id')
          localStorage.removeItem('organisation_id')
          messageApi.success(data.message || 'customer signed up successfully')
          onSubmit({
            ...formValues,
            workEmail: data.work_email || formValues.workEmail,
          })
        },
        onError: (error) => {
          messageApi.error(getApiErrorMessage(error, 'Signup failed. Please try again.'))
        },
      },
    )
  }

  return (
    <div className="cs-form">
      {contextHolder}
      <div className="cs-form__header">
        <h1 className="cs-form__title">Create Floato account</h1>
        <p className="cs-form__subtitle">
          {plan === 'choose'
            ? 'Create an account, set up organisation, then choose a plan.'
            : 'Start free trial and set up the organisation.'}
        </p>
      </div>

      <Form
        form={form}
        name="customer-signup-account"
        layout="vertical"
        className="cs-ant-form"
        requiredMark={false}
        initialValues={values}
        onValuesChange={(_, all) => onChange(all)}
        onFinish={handleFinish}
        autoComplete="on"
        disabled={isPending}
      >
        <Form.Item
          label="Full name"
          name="fullName"
          rules={[{ required: true, message: 'Please enter full name' }]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Full name"
            allowClear
            autoComplete="name"
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="Work email"
          name="workEmail"
          rules={[
            { required: true, message: 'Please enter work email' },
            { type: 'email', message: 'Enter a valid work email' },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="Work email"
            allowClear
            autoComplete="email"
            size="large"
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="cs-password-label">
              <span>Password</span>
              <span className="cs-field__hint">Minimum 8 characters</span>
            </span>
          }
          name="password"
          rules={[
            { required: true, message: 'Please create a password' },
            { min: 8, message: 'Minimum 8 characters' },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Create a password"
            autoComplete="new-password"
            size="large"
          />
        </Form.Item>

        <div className="cs-strength" aria-hidden="true">
          {[1, 2, 3].map((level) => (
            <span
              key={level}
              className={`cs-strength__bar${strength >= level ? ` cs-strength__bar--${strength}` : ''}`}
            />
          ))}
        </div>

        <Form.Item className="cs-submit-item">
          <Button
            htmlType="submit"
            type="primary"
            className="cs-submit-button"
            block
            size="large"
            loading={isPending}
          >
            Sign Up
          </Button>
        </Form.Item>
      </Form>

      <p className="cs-signin">
        Already have an account?{' '}
        <Link to="/login">
          Sign in <span aria-hidden="true">↗</span>
        </Link>
      </p>
    </div>
  )
}

type CustomerSignupProps = {
  /** @deprecated prefer `initialStepName` or URL `?step=` */
  initialStep?: number
  initialStepName?: SignupStep
  plan?: PlanAction
  previewEmail?: string
}

export default function CustomerSignup({
  initialStep,
  initialStepName,
  plan: planProp,
  previewEmail = 'dr.sachin@sachinhealthcare.com',
}: CustomerSignupProps = {}) {
  const [searchParams] = useSearchParams()

  const plan = resolvePlan(planProp ?? searchParams.get('plan'))
  const stepFromUrl = searchParams.get('step')
  const resolvedInitial =
    initialStepName ??
    (stepFromUrl ? STEP_FROM_PARAM[stepFromUrl] : undefined) ??
    (typeof initialStep === 'number'
      ? (['account', 'verify', 'organisation', 'ready'][initialStep] as SignupStep | undefined)
      : undefined) ??
    'account'

  const [step, setStep] = useState<SignupStep>(resolvedInitial)
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [account, setAccount] = useState<AccountForm>({
    fullName: '',
    workEmail: resolvedInitial !== 'account' ? previewEmail : '',
    password: '',
  })
  const [organisation, setOrganisation] = useState<ReadyOrganisationSummary | null>(
    resolvedInitial === 'ready' ||
      resolvedInitial === 'plan' ||
      resolvedInitial === 'payment' ||
      resolvedInitial === 'active'
      ? PREVIEW_ORGANISATION
      : null,
  )

  const brandSupport =
    plan === 'choose'
      ? 'Finish signup and organisation setup, then choose a plan.'
      : 'Start free trial and set up the organisation with Floato.'

  const handleOrganisationContinue = (values: OrganisationCreateForm) => {
    setOrganisation(toReadySummary(values))
    if (plan === 'choose') {
      setStep('plan')
      return
    }
    setStep('ready')
  }

  return (
    <div className="customer-signup">
      <aside className="cs-brand">
        <div className="cs-brand__logo">
          <LogoMark />
          <div>
            <div className="cs-brand__name">Floato</div>
            <div className="cs-brand__tag">Healthcare OS</div>
          </div>
        </div>

        <div className="cs-brand__copy">
          <h2 className="cs-brand__headline">Healthcare operations, made simpler.</h2>
          <p className="cs-brand__support">{brandSupport}</p>
        </div>
      </aside>

      <main className="cs-panel">
        <div className="cs-panel__inner">
          {step === 'account' ? (
            <AccountStep
              plan={plan}
              values={account}
              onChange={(next) => setAccount((prev) => ({ ...prev, ...next }))}
              onSubmit={(formValues) => {
                setAccount(formValues)
                setStep('verify')
              }}
            />
          ) : null}

          {step === 'verify' ? (
            <VerifyEmailStep
              email={account.workEmail || previewEmail}
              onVerified={() => setStep('organisation')}
              onChangeEmail={() => setStep('account')}
            />
          ) : null}

          {step === 'organisation' ? (
            <OrganisationCreateStep onContinue={handleOrganisationContinue} />
          ) : null}

          {step === 'plan' && plan === 'choose' ? (
            <PlanBillingStep
              cycle={billingCycle}
              onCycleChange={setBillingCycle}
              selectedPlanId={selectedPlan?.id}
              onPlanSelect={setSelectedPlan}
              onContinue={(nextPlan) => {
                setSelectedPlan(nextPlan)
                localStorage.setItem('selected_plan_id', nextPlan.id)
                const name = nextPlan.name.toLowerCase()
                const isTrial = name.includes('free') || name.includes('trial')
                // Free trial skips payment entirely
                setStep(isTrial ? 'ready' : 'payment')
              }}
              onBackToPricing={() => setStep('organisation')}
            />
          ) : null}

          {step === 'payment' && plan === 'choose' ? (
            <PaymentStep
              cycle={billingCycle}
              plan={selectedPlan}
              prefillName={account.fullName}
              prefillEmail={account.workEmail}
              onSuccess={() => {
                setStep('ready')
              }}
              onBack={() => setStep('plan')}
            />
          ) : null}

          {step === 'active' && plan === 'choose' ? (
            <SubscriptionActiveStep onContinue={() => setStep('ready')} />
          ) : null}

          {step === 'ready' ? (
            <ReadyStep organisation={organisation ?? PREVIEW_ORGANISATION} />
          ) : null}
        </div>
      </main>
    </div>
  )
}
