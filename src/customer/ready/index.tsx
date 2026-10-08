import { Button } from 'antd'
import { MailOutlined, PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import './ready.css'

export type ReadyOrganisationSummary = {
  legalName: string
  facilityName: string
  organisationTypeLabel: string
}

type ReadyStepProps = {
  organisation: ReadyOrganisationSummary
  onGoToFloato?: () => void
}

export default function ReadyStep({ organisation, onGoToFloato }: ReadyStepProps) {
  const navigate = useNavigate()

  const handleGoToFloato = () => {
    if (onGoToFloato) {
      onGoToFloato()
      return
    }
    navigate('/login')
  }

  return (
    <div className="cr-ready">
      <div className="cr-ready__icon" aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 12.5 9.5 17 19 7.5"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="cr-ready__header">
        <h1 className="cr-ready__title">Organisation is ready</h1>
        <p className="cr-ready__subtitle">Floato organisation has been set up successfully.</p>
      </div>

      <div className="cr-ready__org">
        <div className="cr-ready__org-icon" aria-hidden="true">
          <PlusOutlined />
        </div>
        <div className="cr-ready__org-copy">
          <p className="cr-ready__org-name">{organisation.legalName}</p>
          <p className="cr-ready__org-meta">
            {organisation.facilityName} • {organisation.organisationTypeLabel}
          </p>
        </div>
      </div>

      <div className="cr-ready__banner">
        <MailOutlined />
        <span>We've sent a link to the registered email to access Floato.</span>
      </div>

      <Button type="primary" className="cr-ready__submit" block size="large" onClick={handleGoToFloato}>
        Go to Floato →
      </Button>

      <p className="cr-ready__footnote">You can also use the link from the email anytime.</p>
    </div>
  )
}
