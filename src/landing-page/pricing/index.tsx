import { useState } from 'react'
import { Link } from 'react-router-dom'
import LandingNav from '../components/LandingNav'
import { PRICING_NAV_ITEMS } from '../components/nav-items'
import './pricing.css'

const FREE_FEATURES = [
  '1 organisation',
  'Up to 5 team members',
  'Up to 100 patient records',
  '20 payment transactions',
  'Unlimited appointments',
  '7 days of patient history',
] as const

const STANDARD_FEATURES = [
  'Everything in Free Trial',
  'Core healthcare operations',
  'Patients & appointments',
  'Staff management',
  'Departments & services',
  'Billing',
  'Organisation management',
  'Support',
  'Manage up to 3 organisations',
  'Up to 10 team members per organisation',
  'Unlimited patient records',
  'Unlimited appointments',
  'Unlimited payment transactions',
  'Full patient history',
] as const

const FAQS = [
  {
    q: 'How long is the free trial?',
    a: 'The free trial lasts 7 days. Use that time to set up organisation, invite the team, and try core Floato workflows before upgrading.',
  },
  {
    q: 'Do I need to provide payment details to start the trial?',
    a: 'No. Start the free trial without a card. Add payment details only when upgrading to Standard.',
  },
  {
    q: 'Can I upgrade from the trial to Standard?',
    a: 'Yes. Upgrade anytime from the trial. Organisation data and setup carry over to Standard.',
  },
  {
    q: 'Can I add more organisations later?',
    a: 'Yes. Additional organisations can be added later based on plan and account needs.',
  },
  {
    q: 'Can I change my plan later?',
    a: 'Yes. Move between trial exploration and Standard when ready — plan changes are supported from account settings.',
  },
  {
    q: 'What happens when my trial ends?',
    a: 'When the trial ends, upgrade to Standard to keep full access. Organisation setup remains available after upgrade.',
  },
] as const

function LogoMark({ light = false }: { light?: boolean }) {
  return (
    <svg className="pp-logo__mark" viewBox="0 0 28 28" aria-hidden="true">
      <path
        d="M14 2.5 16.8 11.2 25.5 14 16.8 16.8 14 25.5 11.2 16.8 2.5 14 11.2 11.2 14 2.5z"
        fill={light ? '#25D366' : '#1B806A'}
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="pp-check" viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="10" fill="#E6F9EF" />
      <path
        d="M5.8 10.3 8.6 13l5.6-6"
        fill="none"
        stroke="#1B806A"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="pricing-page">
      <LandingNav items={PRICING_NAV_ITEMS} brandClassPrefix="pp" />

      <main>
        <section className="pp-hero">
          <div className="pp-container">
            <p className="pp-badge">+ Pricing</p>
            <h1 className="pp-hero__title">
              Simple pricing. <em>Start when ready.</em>
            </h1>
            <p className="pp-hero__lede">
              Try Floato with a free trial, then upgrade to Standard when ready to run organisation with
              Floato.
            </p>

            <div className="pp-plans">
              <article className="pp-card">
                <span className="pp-card__tag">Free Trial</span>
                <h2 className="pp-card__price">
                  ₹0 <span className="pp-card__price-unit">/ 7 days</span>
                </h2>
                <p className="pp-card__desc">Explore Floato before committing. Expires in 7 days.</p>
                <p className="pp-card__list-label">Included in trial</p>
                <ul className="pp-card__list">
                  {FREE_FEATURES.map((item) => (
                    <li key={item}>
                      <CheckIcon />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="pp-card__footer">
                  <Link to="/signup" className="pp-btn pp-btn--dark pp-btn--block">
                    Start Free Trial <span aria-hidden="true">→</span>
                  </Link>
                  <p className="pp-card__footnote" aria-hidden="true">&nbsp;</p>
                </div>
              </article>

              <article className="pp-card pp-card--featured">
                <span className="pp-card__recommended">Recommended</span>
                <span className="pp-card__tag pp-card__tag--green">Standard</span>
                <h2 className="pp-card__price">
                  ₹X <span className="pp-card__price-unit">/ month</span>
                </h2>
                <p className="pp-card__desc">
                  Everything in Free Trial, plus everything needed to run organisation.
                </p>
                <p className="pp-card__list-label">Everything in trial, plus</p>
                <ul className="pp-card__list">
                  {STANDARD_FEATURES.map((item) => (
                    <li key={item}>
                      <CheckIcon />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="pp-card__footer">
                  <Link to="/signup" className="pp-btn pp-btn--primary pp-btn--block">
                    Get Started <span aria-hidden="true">→</span>
                  </Link>
                  <p className="pp-card__footnote">Upgrade to Standard anytime</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="pp-cta">
          <div className="pp-container">
            <div className="pp-cta__box">
              <h2 className="pp-cta__title">Not sure which one to choose?</h2>
              <p className="pp-cta__text">
                Start with the free trial. Upgrade to Standard whenever ready.
              </p>
              <Link to="/signup" className="pp-btn pp-btn--primary">
                Start Free Trial <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="pp-faq" id="faq">
          <div className="pp-container pp-faq__inner">
            <p className="pp-faq__eyebrow">Questions & answers</p>
            <h2 className="pp-faq__title">Frequently asked questions</h2>

            <div className="pp-faq__list">
              {FAQS.map((item, index) => {
                const open = openFaq === index
                return (
                  <div key={item.q} className={`pp-faq__item${open ? ' is-open' : ''}`}>
                    <button
                      type="button"
                      className="pp-faq__question"
                      aria-expanded={open}
                      onClick={() => setOpenFaq(open ? null : index)}
                    >
                      <span className="pp-faq__index">{String(index + 1).padStart(2, '0')}</span>
                      <span className="pp-faq__q-text">{item.q}</span>
                      <span className="pp-faq__chevron" aria-hidden="true">
                        {open ? '−' : '+'}
                      </span>
                    </button>
                    {open ? <p className="pp-faq__answer">{item.a}</p> : null}
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="pp-footer">
        <div className="pp-container">
          <div className="pp-footer__grid">
            <div className="pp-footer__brand">
              <div className="pp-logo pp-logo--light">
                <LogoMark light />
                floato
              </div>
              <p className="pp-footer__tagline">
                Healthcare, <em>connected</em>
              </p>
              <p>
                A connected platform designed to simplify healthcare operations and help organisations
                grow.
              </p>
            </div>

            <div className="pp-footer__cols">
              <div className="pp-footer__col">
                <h4>Platform</h4>
                <ul>
                  <li>
                    <Link to="/landing-page">Features</Link>
                  </li>
                  <li>
                    <Link to="/landing-page">Why Floato</Link>
                  </li>
                  <li>
                    <Link to="/landing-page/pricing" className="is-active">
                      Pricing
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="pp-footer__col">
                <h4>Company</h4>
                <ul>
                  <li>
                    <Link to="/landing-page/about">About</Link>
                  </li>
                  <li>
                    <a href="mailto:hello@floato.health">Contact</a>
                  </li>
                </ul>
              </div>
              <div className="pp-footer__col">
                <h4>Resources</h4>
                <ul>
                  <li>
                    <Link to="/landing-page/pricing">Pricing</Link>
                  </li>
                  <li>
                    <a href="#faq">FAQs</a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pp-footer__cta">
              <Link to="/signup" className="pp-btn pp-btn--primary pp-btn--sm">
                Start Free Trial <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <div className="pp-footer__bottom">
            <span>© {new Date().getFullYear()} Floato Health Systems. All rights reserved.</span>
            <div className="pp-footer__legal">
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <a href="#security">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
