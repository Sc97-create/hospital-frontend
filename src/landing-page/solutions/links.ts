export const SOLUTION_LINKS = [
  {
    label: 'Clinic Management',
    href: '/landing-page/solutions/clinic-management',
  },
  {
    label: 'Patient Management',
    href: '/landing-page/solutions/patient-management',
  },
] as const

export type SolutionLink = (typeof SOLUTION_LINKS)[number]
