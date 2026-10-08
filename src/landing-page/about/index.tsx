import LandingNav from '../components/LandingNav'
import { SOLUTION_NAV_ITEMS } from '../components/nav-items'
import '../landing-page.css'
import './about.css'

const ABOUT_NAV_ITEMS = SOLUTION_NAV_ITEMS.map((item) =>
  item.type === 'link' && item.label === 'About' ? { ...item, active: true } : item,
)

const TRIANGLE = [
  {
    label: 'Doctors',
    body: 'Understand the clinical workflow, patient needs and realities of healthcare.',
  },
  {
    label: 'Engineers',
    body: 'Turn those problems into reliable software, architecture and connected workflows.',
  },
  {
    label: 'Floato',
    body: 'Brings both perspectives together to build a simpler, connected healthcare experience.',
  },
] as const

const ARCH_QUESTIONS = [
  'Which data belongs where?',
  'How should organisations and tenants relate?',
  'What happens when a patient returns?',
  'How should prescriptions connect to pharmacy?',
  "Will today's design still work tomorrow?",
] as const

const ARCH_LOOP = ['Design', 'Build', 'Test', 'Question', 'Redesign', 'Build again'] as const

export default function AboutPage() {
  return (
    <div className="landing-page about-page">
      <LandingNav items={ABOUT_NAV_ITEMS} />

      <main>
        <section className="about-collab" aria-labelledby="about-collab-title">
          <div className="lp-container about-collab__intro">
            <h1 id="about-collab-title" className="about-collab__title">
              Technology meets healthcare.
            </h1>
            <p className="about-collab__lede">
              Floato is built by bringing two perspectives together — the people who understand
              healthcare and the people who build technology.
            </p>
            <p className="about-collab__lede">
              Doctors and healthcare professionals help us understand how care actually happens.
              Engineers turn those real-world workflows into systems, data and connected experiences.
            </p>
            <p className="about-collab__neither">Neither works alone.</p>
          </div>

          <div className="about-collab__visual">
            <img
              src="/landing/team.png"
              alt="Floato at the center, connecting doctors and clinical teams with engineers and clinic operations"
              className="about-collab__img"
            />
          </div>

          <div className="lp-container about-collab__triangle">
            <ul className="about-collab__points">
              {TRIANGLE.map((point) => (
                <li key={point.label} className="about-collab__point">
                  <h2 className="about-collab__point-label">{point.label}</h2>
                  <p className="about-collab__point-body">{point.body}</p>
                </li>
              ))}
            </ul>

            <p className="about-collab__strong">
              Built from real healthcare problems. Engineered for real-world workflows.
            </p>
          </div>
        </section>

        <section className="about-arch" aria-labelledby="about-arch-title">
          <div className="lp-container about-arch__intro">
            <p className="about-arch__bridge">
              But bringing these perspectives together is only the beginning.
            </p>
            <p className="lp-eyebrow">Behind the product</p>
            <h2 id="about-arch-title" className="about-arch__title">
              The part nobody sees.
            </h2>
            <p className="about-arch__lede">
              A simple workflow on the screen can hide hundreds of decisions underneath it.
            </p>
          </div>

          <div className="about-arch__visual">
            <img
              src="/landing/about-arch-design.png"
              alt="Architecture and design decisions behind Floato — systems, data, and workflows under the product surface"
              className="about-arch__img"
            />
          </div>

          <div className="lp-container about-arch__after">
            <p className="about-arch__breath">Every decision creates another question.</p>

            <ul className="about-arch__questions">
              {ARCH_QUESTIONS.map((question) => (
                <li key={question} className="about-arch__question">
                  {question}
                </li>
              ))}
            </ul>

            <ol className="about-arch__loop" aria-label="How the work continues">
              {ARCH_LOOP.map((step) => (
                <li key={step} className="about-arch__loop-step">
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="about-human" aria-labelledby="about-human-title">
          <div className="lp-container about-human__inner">
            <h2 id="about-human-title" className="about-human__title">
              Some decisions take minutes. Some take nights.
            </h2>

            <div className="about-human__body">
              <p>
                We have redesigned database schemas, changed relationships, rewritten APIs, removed
                things we thought we needed, and questioned decisions we had already made.
              </p>
              <p>Sometimes that means going back to the drawing board.</p>
              <p>
                Sometimes it means opening the laptop again at 2 AM and asking:
                <br />
                <span className="about-human__quote">“Can we build this better?”</span>
              </p>
            </div>

            <p className="about-human__line">
              Doubt isn&apos;t where the work stops.
              <br />
              It&apos;s where we rethink it.
            </p>

            <div className="about-human__connect">
              <p className="about-human__connect-lead">
                Because healthcare deserves thoughtful systems.
              </p>
              <p>
                Every architectural decision eventually reaches the person using Floato.
              </p>
              <p>A database decision affects a workflow.</p>
              <p>A workflow affects a clinic employee.</p>
              <p>And that workflow ultimately affects the patient&apos;s experience.</p>
              <p className="about-human__connect-close">
                That&apos;s why we keep questioning the details.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
