import { Button } from 'antd'
import { CheckCircleFilled } from '@ant-design/icons'
import './subscription-active.css'

type SubscriptionActiveStepProps = {
  onContinue: () => void
}

export default function SubscriptionActiveStep({ onContinue }: SubscriptionActiveStepProps) {
  return (
    <div className="csa-active">
      <CheckCircleFilled className="csa-active__icon" />
      <h1 className="csa-active__title">Subscription active</h1>
      <p className="csa-active__subtitle">
        Standard plan is active. Continue to finish organisation setup.
      </p>
      <Button type="primary" className="csa-active__submit" block size="large" onClick={onContinue}>
        Continue to Organisation Ready →
      </Button>
    </div>
  )
}
