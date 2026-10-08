import { Link } from 'react-router-dom'
import ImageSlot from './components/ImageSlot'
import LandingNav from './components/LandingNav'
import { LANDING_NAV_ITEMS } from './components/nav-items'
import './landing-page.css'

const FEATURES: {
  id: string
  title: string
  body: string
  imageLabel: string
  src?: string
  reverse: boolean
  /** contain = show full art (good for padded illustrations) */
  imageFit?: 'cover' | 'contain'
}[] = [
  {
    id: 'patient-journey',
    title: 'One patient. One connected journey.',
    body: 'Unify clinical, administrative, and billing touchpoints so every team works from the same patient record — from first visit to follow-up.',
    imageLabel: 'Patient journey diagram',
    src: '/landing/one-patient-one-journey.png',
    reverse: false,
  },
  {
    id: 'org-boundary',
    title: "Healthcare shouldn't stop at an organisation boundary.",
    body: 'Coordinate referrals, shared care plans, and partner workflows across clinics, hospitals, and networks without losing context.',
    imageLabel: 'Organisation network diagram',
    src: '/landing/shared-data.png',
    reverse: true,
    imageFit: 'contain',
  },
  {
    id: 'people',
    title: 'Your organisation runs on people.',
    body: 'Roster, leave, permissions, and staff profiles live alongside clinical operations so people ops and care delivery stay in sync.',
    imageLabel: 'Staff operations dashboard',
    src: '/landing/hospital-ecosystem-run.png',
    reverse: false,
    imageFit: 'contain',
  },
  {
    id: 'patient-access',
    title: 'Give patients easier access to their information.',
    body: 'Let patients view appointments, prescriptions, and records through a clear portal — less phone tag, more self-serve clarity.',
    imageLabel: 'Patient portal mockup',
    src: '/landing/patient-report.png',
    reverse: true,
    imageFit: 'contain',
  },
]

const TIMELINE = [
  {
    step: 'Step 1: Set up your account',
    desc: 'Create your organisation workspace and configure the basics.',
    active: false,
  },
  {
    step: 'Step 2: Invite your team',
    desc: 'Add roles and permissions so the right people see the right tools.',
    active: false,
  },
  {
    step: 'Step 3: Connect your tools',
    desc: 'Link workflows, departments, and the modules you need on day one.',
    active: true,
  },
  {
    step: 'Step 4: Go live',
    desc: 'Launch with confidence — support stays with you after cutover.',
    active: false,
  },
] as const

const FOOTER_COLS = [
  {
    title: 'Platform',
    links: [
      { label: 'Overview', href: '#products' },
      { label: 'Patients', href: '#products' },
      { label: 'Appointments', href: '#products' },
      { label: 'Pharmacy', href: '#products' },
      { label: 'Reports', href: '#products' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { label: 'Clinic Management', href: '/landing-page/solutions/clinic-management' },
      { label: 'Patient Management', href: '/landing-page/solutions/patient-management' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '#resources' },
      { label: 'Product tour', href: '#resources' },
    ],
  },
  {
    title: 'Company',
    links: [{ label: 'About', href: '/landing-page/about' }],
  },
] as const

function LogoMark() {
  return (
    <svg className="lp-logo__mark" viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="15" fill="#1B806A" />
      <path
        d="M10 17.5c2.2 3.2 5.2 5 9.5 5.5M14.5 10.5c1.8-.4 3.6-.3 5.4.4 1.6.6 2.9 1.7 3.6 3.1"
        fill="none"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="12.2" cy="13.2" r="1.6" fill="#fff" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg className="lp-play-icon" viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 6.5v7l6-3.5-6-3.5z" fill="currentColor" />
    </svg>
  )
}

function StepIcon({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      {active ? (
        <path
          d="M4 9.5 7.2 12.5 14 5.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <circle cx="9" cy="9" r="3.5" fill="currentColor" />
      )}
    </svg>
  )
}

export default function LandingPage() {
  return (
    <div className="landing-page">
      <LandingNav items={LANDING_NAV_ITEMS} logoHref="#top" />

      <main id="top">
        <section className="lp-hero">
          <div className="lp-container">
            <div className="lp-hero__content">
              <p className="lp-eyebrow lp-eyebrow--center">The operating system for modern healthcare</p>
              <h1 className="lp-heading lp-hero__heading">
                Healthcare should be <em>simpler.</em>
              </h1>
              <p className="lp-lede lp-lede--center">
                Floato brings patients, people, and operations into one calm workspace — so your organisation
                spends less time stitching tools together and more time delivering care.
              </p>
            </div>

            <div className="lp-hero__media">
              <ImageSlot
                src="/landing/hero-image.png"
                alt="Floato product overview"
              />
            </div>

            <div className="lp-hero__ctas">
              <Link to="/signup" className="lp-btn lp-btn--primary">
                Get Started
              </Link>
              <a href="#product-tour" className="lp-btn lp-btn--outline">
                <PlayIcon />
                Watch product tour
              </a>
            </div>
          </div>
        </section>

        <section className="lp-platform" id="products">
          <div className="lp-container">
            <p className="lp-eyebrow lp-eyebrow--center">The platform</p>
            <h2 className="lp-heading lp-platform__heading">
              Everything your organisation needs, <em>in one place.</em>
            </h2>

            <div className="lp-platform__card">
              <div className="lp-platform__media">
                <ImageSlot
                  src="/landing/organisation-connect.png"
                  alt="Floato platform connecting organisation workflows"
                />
              </div>
            </div>

            <a href="#solutions" className="lp-platform__footer">
              See how Floato helps your organisation scale →
            </a>
          </div>
        </section>

        <section className="lp-ecosystem" id="solutions">
          <div className="lp-container">
            <div className="lp-ecosystem__intro">
              <p className="lp-eyebrow lp-eyebrow--center">Connected care</p>
              <h2 className="lp-heading lp-ecosystem__heading">
                Healthcare works as an <em>ecosystem.</em> Your technology should too.
              </h2>
            </div>

            {FEATURES.map((feature) => (
              <article
                key={feature.id}
                className={`lp-feature${feature.reverse ? ' lp-feature--reverse' : ''}`}
              >
                <div className="lp-feature__copy">
                  <h3 className="lp-feature__title">{feature.title}</h3>
                  <p className="lp-feature__body">{feature.body}</p>
                </div>
                <div className="lp-feature__media-wrap">
                  <div
                    className={`lp-feature__media${
                      feature.imageFit === 'contain' ? ' lp-feature__media--contain' : ''
                    }`}
                  >
                    <ImageSlot
                      src={feature.src}
                      alt={feature.title}
                      label={feature.imageLabel}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="lp-timeline" id="pricing">
          <div className="lp-container">
            <p className="lp-eyebrow lp-eyebrow--center">Implementation</p>
            <h2 className="lp-heading lp-timeline__heading">
              From first sign-in to your <em>first day on Floato.</em>
            </h2>

            <ol className="lp-timeline__track">
              {TIMELINE.map((item) => (
                <li
                  key={item.step}
                  className={`lp-timeline__step${item.active ? ' lp-timeline__step--active' : ''}`}
                >
                  <div className="lp-timeline__icon">
                    <StepIcon active={item.active} />
                  </div>
                  <div>
                    <p className="lp-timeline__label">{item.step}</p>
                    <p className="lp-timeline__desc">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="lp-support" id="about">
          <div className="lp-container">
            <div className="lp-support__card">
              <div className="lp-support__media">
                <ImageSlot
                  src="/landing/last-section.png"
                  alt="Floato customer success partnership"
                />
              </div>
              <div>
                <p className="lp-eyebrow">Customer success</p>
                <h2 className="lp-heading lp-support__heading">With you along the way</h2>
                <p className="lp-lede">
                  From onboarding to everyday operations, our team helps you configure Floato for how your
                  organisation actually works — not the other way around.
                </p>
                <a href="mailto:hello@floato.health" className="lp-btn lp-btn--primary">
                  Book a demo
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer__grid">
            <div className="lp-footer__brand">
              <div className="lp-logo">
                <LogoMark />
                Floato
              </div>
              <p>
                The operating system for modern healthcare — built for clinics, hospitals, and care networks.
              </p>
              <div className="lp-footer__social">
                <a href="https://linkedin.com" aria-label="LinkedIn" target="_blank" rel="noreferrer">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8.5h4V23h-4V8.5zM8.5 8.5h3.8v2h.05c.53-1 1.82-2.05 3.75-2.05 4 0 4.75 2.65 4.75 6.1V23h-4v-6.6c0-1.57-.03-3.6-2.2-3.6-2.2 0-2.54 1.72-2.54 3.5V23h-4V8.5z" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="lp-footer__cols">
              {FOOTER_COLS.map((col) => (
                <div key={col.title} className="lp-footer__col">
                  <h4>{col.title}</h4>
                  <ul>
                    {col.links.map((link) => (
                      <li key={link.label}>
                        {link.href.startsWith('/') ? (
                          <Link to={link.href}>{link.label}</Link>
                        ) : (
                          <a href={link.href}>{link.label}</a>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="lp-footer__bottom">
            <span>© {new Date().getFullYear()} Floato. All rights reserved.</span>
            <div className="lp-footer__legal">
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <a href="#cookies">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
