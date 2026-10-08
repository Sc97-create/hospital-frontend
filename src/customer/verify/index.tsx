import { useEffect, useState } from 'react'
import { Button, Form, Input, message } from 'antd'
import { EditOutlined, FieldTimeOutlined } from '@ant-design/icons'
import { useVerifyCustomerEmail } from '../api/use-verify-email'
import './verify.css'

type VerifyEmailStepProps = {
  email: string
  onVerified: () => void
  onChangeEmail: () => void
}

const RESEND_SECONDS = 60

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
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

export default function VerifyEmailStep({ email, onVerified, onChangeEmail }: VerifyEmailStepProps) {
  const [form] = Form.useForm<{ code: string }>()
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS)
  const [resending, setResending] = useState(false)
  const { mutate: verifyEmail, isPending } = useVerifyCustomerEmail()
  const [messageApi, contextHolder] = message.useMessage()

  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = window.setTimeout(() => setSecondsLeft((value) => value - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [secondsLeft])

  const handleResend = async () => {
    if (secondsLeft > 0 || resending) return
    setResending(true)
    try {
      // Placeholder until resend API is wired
      await new Promise((resolve) => setTimeout(resolve, 400))
      setSecondsLeft(RESEND_SECONDS)
      form.resetFields(['code'])
    } finally {
      setResending(false)
    }
  }

  const handleFinish = (values: { code: string }) => {
    verifyEmail(
      { code: String(values.code).trim() },
      {
        onSuccess: (data) => {
          messageApi.success(data.message || 'email verified successfully')
          onVerified()
        },
        onError: (error) => {
          messageApi.error(getApiErrorMessage(error, 'Verification failed. Please try again.'))
        },
      },
    )
  }

  return (
    <div className="cv-verify">
      {contextHolder}
      <div className="cv-verify__header">
        <h1 className="cv-verify__title">Verify email</h1>
        <p className="cv-verify__subtitle">
          We sent a 6-digit verification code to the work email{' '}
          <span className="cv-verify__email-wrap">
            <span className="cv-verify__email">{email}</span>.
          </span>
        </p>
      </div>

      <Form
        form={form}
        name="customer-verify-email"
        layout="vertical"
        className="cv-verify-form"
        requiredMark={false}
        onFinish={handleFinish}
        disabled={isPending}
      >
        <Form.Item
          label="6-digit verification code"
          name="code"
          rules={[
            { required: true, message: 'Please enter the verification code' },
            { len: 6, message: 'Enter all 6 digits' },
          ]}
        >
          <Input.OTP length={6} size="large" formatter={(str) => str.replace(/\D/g, '')} />
        </Form.Item>

        <Form.Item className="cv-verify__submit-item">
          <Button
            htmlType="submit"
            type="primary"
            className="cv-verify__submit"
            block
            size="large"
            loading={isPending}
          >
            Verify Email →
          </Button>
        </Form.Item>
      </Form>

      <div className="cv-verify__actions">
        {secondsLeft > 0 ? (
          <span className="cv-verify__timer">
            <FieldTimeOutlined />
            Resend code in {formatCountdown(secondsLeft)}
          </span>
        ) : (
          <button type="button" className="cv-verify__link-btn" onClick={handleResend} disabled={resending || isPending}>
            <FieldTimeOutlined />
            {resending ? 'Sending…' : 'Resend code'}
          </button>
        )}

        <button type="button" className="cv-verify__link-btn" onClick={onChangeEmail} disabled={isPending}>
          <EditOutlined />
          Change email
        </button>
      </div>
    </div>
  )
}
