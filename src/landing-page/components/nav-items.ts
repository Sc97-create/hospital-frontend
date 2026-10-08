import { SOLUTION_LINKS } from '../solutions/links'

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
