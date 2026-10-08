import LandingNav from '../components/LandingNav'
import { SOLUTION_NAV_ITEMS } from '../components/nav-items'
import ImageSlot from '../components/ImageSlot'
import '../landing-page.css'
import './products.css'

const PRODUCTS_NAV_ITEMS = SOLUTION_NAV_ITEMS.map((item) =>
  item.type === 'link' && item.label === 'Products'
    ? { ...item, active: true }
    : item,
)

const AHA_FLOW = [
  { kind: 'stage', label: 'Reception' },
  { kind: 'gap', label: 'Manual entry' },
  { kind: 'stage', label: 'Doctor' },
  { kind: 'gap', label: 'Print' },
  { kind: 'stage', label: 'Prescription' },
  { kind: 'gap', label: 'Physical handoff' },
  { kind: 'stage', label: 'Pharmacy' },
  { kind: 'gap', label: 'Manual billing' },
  { kind: 'stage', label: 'Follow-up' },
] as const

const PRODUCT_UI_CHAIN = [
  'Patient',
  'Appointment',
  'Consultation',
  'Prescription',
  'Pharmacy',
  'Billing',
  'Follow-up',
] as const

const PRODUCT_UI_CARDS: {
  id: string
  eyebrow: string
  title: string
  body: string
  slotLabel: string
  imageSrc?: string
}[] = [
  {
    id: 'patient',
    eyebrow: 'UI 1 — Patient',
    title: 'Patient profile',
    body: 'Patient profile / patient history.',
    slotLabel: 'Add patient profile UI',
  },
  {
    id: 'appointment',
    eyebrow: 'UI 2 — Appointment',
    title: 'Appointment',
    body: 'Appointment + patient information.',
    slotLabel: 'Add appointment UI',
  },
  {
    id: 'prescription',
    eyebrow: 'UI 3 — Prescription',
    title: 'Prescription',
    body: 'Doctor creates prescription from structured medicines.',
    slotLabel: 'Add prescription UI',
  },
  {
    id: 'pharmacy',
    eyebrow: 'UI 4 — Pharmacy / Billing',
    title: 'Pharmacy & billing',
    body: 'Prescription received → medicines → billing.',
    slotLabel: 'Add pharmacy / billing UI',
  },
]

const TIME_BEFORE = ['Write', 'Re-enter', 'Print', 'Carry', 'Check', 'Enter again', 'Call'] as const

const TIME_CONNECTED = ['Capture', 'Connect', 'Continue'] as const

const TIME_BENEFITS = [
  {
    title: 'Less repeated entry',
    body: 'Information can be captured once and reused.',
  },
  {
    title: 'Less searching',
    body: 'Relevant patient and visit information stays connected.',
  },
  {
    title: 'Less manual coordination',
    body: 'The next workflow can work from information already available.',
  },
  {
    title: 'Better follow-up visibility',
    body: 'Recurring visits and follow-up activity can be tracked more systematically.',
  },
] as const

const RELATIONSHIP_FLOW = [
  'First Visit',
  'Prescription',
  'Follow-up',
  'Second Visit',
  'New Prescription',
  'Follow-up',
] as const

const CLOSING_PILLARS = [
  'Floato',
  'Patient Management',
  'Clinic Management',
  'Connected Workflows',
  'Future Intelligence',
] as const

export default function ProductsPage() {
  return (
    <div className="landing-page products-page">
      <LandingNav items={PRODUCTS_NAV_ITEMS} />

      <main>
        <section className="products-story products-story--first" aria-labelledby="products-story-1-title">
          <div className="lp-container products-story__intro">
            <h1 id="products-story-1-title" className="products-story__title">
              It started with a visit to the hospital.
            </h1>
            <p className="products-story__lede">
              I took my mother to a hospital for a consultation. What I saw wasn&apos;t a lack of
              technology. It was something more subtle — technology, people and information working
              in separate steps.
            </p>
          </div>

          <div className="products-story__media">
            <img
              src="/landing/first-product-story1.png"
              alt="A son and his mother at a hospital reception desk while staff write in a paper register"
              className="products-story__img"
            />
          </div>

          <div className="products-story__scroll">
            <a href="#journey" className="products-story__scroll-link">
              Follow the journey <span aria-hidden="true">↓</span>
            </a>
          </div>
        </section>

        <section
          id="journey"
          className="products-story products-story--second"
          aria-labelledby="products-story-2-title"
        >
          <div className="lp-container products-story__intro">
            <h2 id="products-story-2-title" className="products-story__title">
              We followed what actually happens.
            </h2>
            <p className="products-story__lede">
              A patient journey may look simple from the outside. Behind the scenes, information can
              move between registers, screens, paper files and people.
            </p>
          </div>

          <div className="products-story__media products-story__media--diagram">
            <img
              src="/landing/second-product-story.png"
              alt="Seven steps of a hospital visit: arrival, register, appointment, doctor, printed prescription, file, and pharmacy"
              className="products-story__img products-story__img--diagram"
            />
          </div>

          <div className="lp-container products-story__insight">
            <p className="products-story__insight-text">
              The hospital had digital tools. But the journey was still fragmented.
            </p>
          </div>
        </section>

        <section
          id="aha"
          className="products-story products-story--aha"
          aria-labelledby="products-story-aha-title"
        >
          <div className="lp-container products-story__intro">
            <h2 id="products-story-aha-title" className="products-story__title">
              Then we started asking why.
            </h2>
          </div>

          <div className="lp-container products-aha">
            <p className="products-aha__question products-aha__question--1">
              Why enter the same information twice?
            </p>
            <p className="products-aha__question products-aha__question--2">
              Why print a prescription that already exists digitally?
            </p>

            <div className="products-aha__flow-wrap">
              <ol className="products-aha__flow" aria-label="Where the workflow breaks">
                {AHA_FLOW.map((item) => (
                  <li
                    key={`${item.kind}-${item.label}`}
                    className={
                      item.kind === 'stage'
                        ? 'products-aha__node products-aha__node--stage'
                        : 'products-aha__node products-aha__node--gap'
                    }
                  >
                    {item.kind === 'gap' ? (
                      <>
                        <span className="products-aha__gap-mark" aria-hidden="true" />
                        <span className="products-aha__gap-label">{item.label}</span>
                      </>
                    ) : (
                      <span className="products-aha__stage-label">{item.label}</span>
                    )}
                  </li>
                ))}
              </ol>

              <div className="products-aha__visual">
                <img
                  src="/landing/sixth-product-story.png"
                  alt="Reception, appointment, doctor, prescription, pharmacy and billing as separate steps in one visit"
                  className="products-aha__img"
                />
              </div>
            </div>

            <p className="products-aha__question products-aha__question--3">
              Why does information have to travel with the patient?
            </p>
            <p className="products-aha__question products-aha__question--4">
              Why is follow-up still dependent on manual tracking?
            </p>

            <p className="products-story__insight-text products-aha__closing">
              The problem wasn&apos;t simply paper.
              <br />
              The problem was the gaps between workflows.
            </p>
          </div>
        </section>

        <section
          id="connected"
          className="products-story products-story--concept"
          aria-labelledby="products-story-concept-title"
        >
          <div className="lp-container products-concept">
            <header className="products-story__intro products-concept__intro">
              <h2 id="products-story-concept-title" className="products-story__title">
                What if the workflow was connected?
              </h2>
            </header>

            <div className="products-concept__tree" role="img" aria-label="Patient at the center, branching to appointment, consultation and prescription, then prescription to pharmacy, billing and follow-up">
              <div className="products-concept__tree-inner">
              <div className="products-concept__root">Patient</div>

              <div className="products-concept__level products-concept__level--mid">
                <div className="products-concept__connector products-concept__connector--down" aria-hidden="true" />
                <div className="products-concept__rail" aria-hidden="true" />
                <div className="products-concept__nodes">
                  <div className="products-concept__col">
                    <span className="products-concept__drop" aria-hidden="true" />
                    <span className="products-concept__node">Appointment</span>
                  </div>
                  <div className="products-concept__col">
                    <span className="products-concept__drop" aria-hidden="true" />
                    <span className="products-concept__node">Consultation</span>
                  </div>
                  <div className="products-concept__col products-concept__col--fork">
                    <span className="products-concept__drop" aria-hidden="true" />
                    <span className="products-concept__node">Prescription</span>

                    <div className="products-concept__level products-concept__level--low">
                      <div className="products-concept__connector products-concept__connector--down" aria-hidden="true" />
                      <div className="products-concept__rail" aria-hidden="true" />
                      <div className="products-concept__nodes">
                        <div className="products-concept__col">
                          <span className="products-concept__drop" aria-hidden="true" />
                          <span className="products-concept__node">Pharmacy</span>
                        </div>
                        <div className="products-concept__col">
                          <span className="products-concept__drop" aria-hidden="true" />
                          <span className="products-concept__node">Billing</span>
                        </div>
                        <div className="products-concept__col">
                          <span className="products-concept__drop" aria-hidden="true" />
                          <span className="products-concept__node">Follow-up</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </div>

            <p className="products-concept__copy">
              What if information captured once could move through the patient&apos;s journey instead of
              being recreated at every step?
            </p>

            <p className="products-story__insight-text products-concept__closing">
              One patient. One connected journey.
            </p>
          </div>
        </section>

        <section
          id="floato"
          className="products-story products-story--floato"
          aria-labelledby="products-story-floato-title"
        >
          <div className="lp-container products-story__intro products-floato__intro">
            <h2 id="products-story-floato-title" className="products-story__title">
              That&apos;s the idea behind Floato.
            </h2>
            <p className="products-story__lede">
              Floato connects the everyday workflows around a patient — from appointment and
              consultation to prescription, pharmacy, billing and follow-up.
            </p>
          </div>

          <div className="products-story__media products-story__media--diagram">
            <img
              src="/landing/third-product-story.png"
              alt="Floato connecting a nine-step patient journey from arrival through follow-up"
              className="products-story__img products-story__img--diagram"
            />
          </div>

          <div className="lp-container products-floato__closing-wrap">
            <p className="products-story__insight-text products-floato__closing">
              Capture once. Connect the workflow. Continue the journey.
            </p>
          </div>
        </section>

        <section
          id="product-ui"
          className="products-story products-story--ui"
          aria-labelledby="products-story-ui-title"
        >
          <div className="lp-container products-ui">
            <header className="products-story__intro products-ui__intro">
              <h2 id="products-story-ui-title" className="products-story__title">
                One workflow. Different people. One shared context.
              </h2>
              <p className="products-story__lede">
                Reception doesn&apos;t need to recreate what the doctor already captured. Pharmacy
                doesn&apos;t need to wait for a paper prescription. The patient&apos;s visit remains
                connected across the workflow.
              </p>
            </header>

            <ol className="products-ui__chain" aria-label="Connected product workflow">
              {PRODUCT_UI_CHAIN.map((step) => (
                <li key={step} className="products-ui__chain-step">
                  <span className="products-ui__chain-label">{step}</span>
                </li>
              ))}
            </ol>

            <div className="products-ui__cards">
              {PRODUCT_UI_CARDS.map((card) => (
                <article key={card.id} className="products-ui__card">
                  <div className="products-ui__card-screen">
                    <ImageSlot
                      src={card.imageSrc}
                      alt={card.title}
                      label={card.slotLabel}
                      className="products-ui__card-slot"
                    />
                  </div>
                  <div className="products-ui__card-copy">
                    <p className="products-ui__card-eyebrow">{card.eyebrow}</p>
                    <h3 className="products-ui__card-title">{card.title}</h3>
                    <p className="products-ui__card-body">{card.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="time"
          className="products-story products-story--time"
          aria-labelledby="products-story-time-title"
        >
          <div className="lp-container products-time">
            <header className="products-story__intro products-time__intro">
              <h2 id="products-story-time-title" className="products-story__title">
                When the handoffs disappear, time comes back.
              </h2>
            </header>

            <div className="products-time__compare">
              <div className="products-time__col products-time__col--before">
                <p className="products-time__col-label">Before</p>
                <ol className="products-time__flow">
                  {TIME_BEFORE.map((step) => (
                    <li key={step} className="products-time__flow-step">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="products-time__col products-time__col--connected">
                <p className="products-time__col-label">Connected</p>
                <ol className="products-time__flow">
                  {TIME_CONNECTED.map((step) => (
                    <li key={step} className="products-time__flow-step">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="products-time__illustration">
              <img
                src="/landing/fifth-product-story.png"
                alt="Before: disconnected handoffs across reception, doctor, pharmacy and follow-up. With Floato: one connected workflow around the patient."
                className="products-time__illustration-img"
              />
            </div>

            <ul className="products-time__benefits">
              {TIME_BENEFITS.map((benefit) => (
                <li key={benefit.title} className="products-time__benefit">
                  <h3 className="products-time__benefit-title">{benefit.title}</h3>
                  <p className="products-time__benefit-body">{benefit.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          id="relationships"
          className="products-story products-story--relationships"
          aria-labelledby="products-story-relationships-title"
        >
          <div className="lp-container products-relationships">
            <header className="products-story__intro products-relationships__intro">
              <h2 id="products-story-relationships-title" className="products-story__title">
                Because a patient&apos;s journey doesn&apos;t end when they leave.
              </h2>
            </header>

            <ol className="products-relationships__flow" aria-label="A continuing patient journey">
              {RELATIONSHIP_FLOW.map((step, index) => (
                <li key={`${step}-${index}`} className="products-relationships__flow-step">
                  {step}
                </li>
              ))}
            </ol>

            <p className="products-relationships__copy">
              A clinic doesn&apos;t only manage today&apos;s visit. It manages relationships that continue
              over time.
            </p>

            <div className="products-relationships__ui">
              <ImageSlot
                label="Add follow-up / recurring patients UI"
                className="products-relationships__ui-slot"
              />
            </div>
          </div>
        </section>

        <section
          id="evolution"
          className="products-story products-story--evolution"
          aria-labelledby="products-story-evolution-title"
        >
          <div className="lp-container products-evolution">
            <header className="products-story__intro products-evolution__intro">
              <h2 id="products-story-evolution-title" className="products-story__title">
                This is bigger than replacing paper.
              </h2>
            </header>

            <div className="products-evolution__visual">
              <img
                src="/landing/fourth-product-story.png"
                alt="The evolution of clinic operations from paper to digital to connected to intelligent"
                className="products-evolution__img"
              />
            </div>
          </div>
        </section>

        <section
          id="closing"
          className="products-story products-story--closing"
          aria-labelledby="products-story-closing-title"
        >
          <div className="lp-container products-closing">
            <header className="products-story__intro products-closing__intro">
              <h2 id="products-story-closing-title" className="products-story__title products-closing__title">
                Connect the workflow first.
                <br />
                Then make it intelligent.
              </h2>
              <p className="products-story__lede products-closing__lede">
                We believe the next generation of clinic operations won&apos;t be defined simply by
                having more software.
                <br />
                It will be defined by how well people, information and workflows work together.
              </p>
            </header>

            <ul className="products-closing__pillars" aria-label="Floato direction">
              {CLOSING_PILLARS.map((pillar) => (
                <li key={pillar} className="products-closing__pillar">
                  {pillar}
                </li>
              ))}
            </ul>

            <p className="products-story__insight-text products-closing__line">
              One patient. One connected journey.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
