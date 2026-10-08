import { Link } from 'react-router-dom'
import ImageSlot from '../components/ImageSlot'
import LandingNav from '../components/LandingNav'
import { SOLUTION_NAV_ITEMS } from '../components/nav-items'
import '../landing-page.css'
import './solution-page.css'

export type SolutionStoryBlock = {
  id: string
  imageSrc?: string
  imageLabel: string
  /** Main heading beside the image */
  title?: string
  /** Body paragraphs */
  description?: string[]
  /** Closing line under the description */
  bottomMessage?: string
  /** Optional flow summary under the bottom message */
  flow?: string
}

export type SolutionDifference = {
  title: string
  beforeLabel: string
  beforeFlow: string
  afterLabel: string
  afterFlow: string
  meansLabel: string
  benefits: { title: string; body: string }[]
}

type SolutionPlaceholderProps = {
  title: string
  eyebrow: string
  lede?: string
  blocks: SolutionStoryBlock[]
  difference?: SolutionDifference
}

export default function SolutionPlaceholder({
  title,
  eyebrow,
  lede,
  blocks,
  difference,
}: SolutionPlaceholderProps) {
  return (
    <div className="landing-page solution-page">
      <LandingNav items={SOLUTION_NAV_ITEMS} />
      <main className="solution-page__main">
        <div className="lp-container">
          <header className="solution-page__intro">
            <p className="lp-eyebrow">{eyebrow}</p>
            <h1 className="lp-heading solution-page__title">{title}</h1>
            {lede ? <p className="lp-lede solution-page__lede">{lede}</p> : null}
          </header>

          <div className="solution-page__blocks">
            {blocks.map((block, index) => (
              <section
                key={block.id}
                className={`solution-page__block${index % 2 === 1 ? ' solution-page__block--reverse' : ''}`}
              >
                <div className="solution-page__media">
                  <ImageSlot
                    src={block.imageSrc}
                    alt={block.title || block.imageLabel}
                    label={block.imageLabel}
                  />
                </div>
                <div className="solution-page__story">
                  {block.title ? (
                    <h2 className="solution-page__story-title">{block.title}</h2>
                  ) : (
                    <h2 className="solution-page__story-title solution-page__story-title--muted">
                      Story section {index + 1}
                    </h2>
                  )}

                  {(block.description ?? []).map((paragraph) => (
                    <p key={paragraph} className="solution-page__story-body">
                      {paragraph}
                    </p>
                  ))}

                  {block.bottomMessage ? (
                    <p className="solution-page__story-bottom">{block.bottomMessage}</p>
                  ) : null}

                  {block.flow ? (
                    <p className="solution-page__story-flow">{block.flow}</p>
                  ) : null}
                </div>
              </section>
            ))}
          </div>

          {difference ? (
            <section className="solution-page__difference" aria-labelledby="solution-difference-title">
              <h2 id="solution-difference-title" className="solution-page__difference-title">
                {difference.title}
              </h2>

              <div className="solution-page__difference-flows">
                <div className="solution-page__difference-flow solution-page__difference-flow--before">
                  <p className="solution-page__difference-flow-label">{difference.beforeLabel}</p>
                  <p className="solution-page__difference-flow-steps">{difference.beforeFlow}</p>
                </div>
                <div className="solution-page__difference-flow solution-page__difference-flow--after">
                  <p className="solution-page__difference-flow-label">{difference.afterLabel}</p>
                  <p className="solution-page__difference-flow-steps">{difference.afterFlow}</p>
                </div>
              </div>

              <p className="solution-page__difference-means">{difference.meansLabel}</p>

              <ul className="solution-page__difference-benefits">
                {difference.benefits.map((benefit) => (
                  <li key={benefit.title} className="solution-page__difference-benefit">
                    <h3 className="solution-page__difference-benefit-title">{benefit.title}</h3>
                    <p className="solution-page__difference-benefit-body">{benefit.body}</p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <div className="solution-page__actions">
            <Link to="/signup" className="lp-btn lp-btn--primary">
              Create Account
            </Link>
            <Link to="/landing-page" className="lp-btn lp-btn--outline">
              Back to overview
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
