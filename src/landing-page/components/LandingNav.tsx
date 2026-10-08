import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { SOLUTION_LINKS } from '../solutions/links'

type NavItem =
  | { type: 'link'; label: string; href: string; active?: boolean }
  | { type: 'dropdown'; label: string; items: readonly { label: string; href: string }[] }

type LandingNavProps = {
  logoHref?: string
  items: readonly NavItem[]
  brandClassPrefix?: 'lp' | 'pp'
}

function LogoMark({ prefix }: { prefix: 'lp' | 'pp' }) {
  return (
    <svg className={`${prefix}-logo__mark`} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="15" fill={prefix === 'pp' ? '#25D366' : '#1B806A'} />
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

function isHashLink(href: string) {
  return href.startsWith('#')
}

function NavAnchor({
  href,
  className,
  children,
  onClick,
}: {
  href: string
  className?: string
  children: ReactNode
  onClick?: () => void
}) {
  if (isHashLink(href)) {
    return (
      <a href={href} className={className} onClick={onClick}>
        {children}
      </a>
    )
  }
  return (
    <Link to={href} className={className} onClick={onClick}>
      {children}
    </Link>
  )
}

export default function LandingNav({
  logoHref = '/landing-page',
  items,
  brandClassPrefix = 'lp',
}: LandingNavProps) {
  const p = brandClassPrefix
  const [menuOpen, setMenuOpen] = useState(false)
  const [solutionsOpen, setSolutionsOpen] = useState(false)
  const dropdownRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    if (!solutionsOpen) return

    const onPointerDown = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setSolutionsOpen(false)
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSolutionsOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [solutionsOpen])

  return (
    <header className={`${p}-nav${menuOpen ? ` ${p}-nav--menu-open` : ''}`}>
      <div className={`${p}-container ${p}-nav__inner`}>
        <NavAnchor href={logoHref} className={`${p}-logo`} onClick={() => setMenuOpen(false)}>
          <LogoMark prefix={p} />
          {p === 'pp' ? 'floato' : 'Floato'}
        </NavAnchor>

        <nav aria-label="Primary">
          <ul className={`${p}-nav__links`}>
            {items.map((item) => {
              if (item.type === 'dropdown') {
                return (
                  <li
                    key={item.label}
                    className={`${p}-nav__dropdown${solutionsOpen ? ' is-open' : ''}`}
                    ref={dropdownRef}
                  >
                    <button
                      type="button"
                      className={`${p}-nav__dropdown-trigger`}
                      aria-expanded={solutionsOpen}
                      aria-haspopup="true"
                      onClick={() => setSolutionsOpen((open) => !open)}
                      onMouseEnter={() => setSolutionsOpen(true)}
                    >
                      {item.label}
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                        <path
                          d="M2.5 4.5 6 8l3.5-3.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <div
                      className={`${p}-nav__dropdown-menu${solutionsOpen ? ' is-open' : ''}`}
                      role="menu"
                      onMouseEnter={() => setSolutionsOpen(true)}
                    >
                      <div className={`${p}-nav__dropdown-panel`}>
                        {item.items.map((sub) => (
                          <Link
                            key={sub.href}
                            to={sub.href}
                            role="menuitem"
                            className={`${p}-nav__dropdown-item`}
                            onClick={() => {
                              setSolutionsOpen(false)
                              setMenuOpen(false)
                            }}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </li>
                )
              }

              return (
                <li key={`${item.label}-${item.href}`}>
                  <NavAnchor href={item.href} className={item.active ? 'is-active' : undefined}>
                    {item.label}
                  </NavAnchor>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className={`${p}-nav__actions`}>
          <Link to="/login" className={`${p}-text-link`}>
            {p === 'pp' ? 'Sign In' : 'Log In'}
          </Link>
          <Link to="/signup" className={`${p}-btn ${p}-btn--primary ${p}-btn--sm`}>
            {p === 'pp' ? (
              <>
                Start Free Trial <span aria-hidden="true">→</span>
              </>
            ) : (
              'Create Account'
            )}
          </Link>
          <button
            type="button"
            className={`${p}-nav__toggle`}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {menuOpen ? (
                <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <div className={`${p}-container ${p}-nav__mobile`}>
        {items.map((item) => {
          if (item.type === 'dropdown') {
            return (
              <div key={item.label} className={`${p}-nav__mobile-group`}>
                <p className={`${p}-nav__mobile-label`}>{item.label}</p>
                {item.items.map((sub) => (
                  <Link key={sub.href} to={sub.href} onClick={() => setMenuOpen(false)}>
                    {sub.label}
                  </Link>
                ))}
              </div>
            )
          }

          return (
            <NavAnchor
              key={`${item.label}-${item.href}`}
              href={item.href}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </NavAnchor>
          )
        })}
        <Link to="/login" onClick={() => setMenuOpen(false)}>
          {p === 'pp' ? 'Sign In' : 'Log In'}
        </Link>
        <Link
          to="/signup"
          className={`${p}-btn ${p}-btn--primary`}
          onClick={() => setMenuOpen(false)}
        >
          {p === 'pp' ? 'Start Free Trial →' : 'Create Account'}
        </Link>
      </div>
    </header>
  )
}

export const LANDING_NAV_ITEMS = [
  { type: 'link' as const, label: 'Products', href: '/landing-page/products' },
  {
    type: 'dropdown' as const,
    label: 'Solutions',
    items: SOLUTION_LINKS,
  },
  { type: 'link' as const, label: 'Pricing', href: '/landing-page/pricing' },
  { type: 'link' as const, label: 'About', href: '/landing-page/about' },
]

export const PRICING_NAV_ITEMS = [
  { type: 'link' as const, label: 'Why Floato', href: '/landing-page' },
  {
    type: 'dropdown' as const,
    label: 'Solutions',
    items: SOLUTION_LINKS,
  },
  { type: 'link' as const, label: 'Pricing', href: '/landing-page/pricing', active: true },
  { type: 'link' as const, label: 'About', href: '/landing-page/about' },
]

export const SOLUTION_NAV_ITEMS = [
  { type: 'link' as const, label: 'Products', href: '/landing-page/products' },
  {
    type: 'dropdown' as const,
    label: 'Solutions',
    items: SOLUTION_LINKS,
  },
  { type: 'link' as const, label: 'Pricing', href: '/landing-page/pricing' },
  { type: 'link' as const, label: 'About', href: '/landing-page/about' },
]
