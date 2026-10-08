# Frontend OS

## Purpose

This document defines the engineering standards for the frontend application.

Every AI Agent contributing to this project **must** read this document before making any code changes.

The agent should:
- Understand the existing architecture
- Follow the established design system
- Maintain consistency across the application
- Avoid introducing duplicate components
- Produce an audit report before making significant UI changes

---

# Mandatory Review Checklist

Before writing any code, perform the following review.

---

# 1. Ant Design Component Audit

Review every screen and identify all Ant Design components used.

Verify:

- List every Ant Design component
- Identify duplicated implementations
- Identify components that can be replaced with native Ant Design components
- Detect deprecated Ant Design APIs
- Check incorrect component usage
- Identify reusable shared components

Deliverable:

- Complete list of Ant Design components
- Duplicate component report
- Missing reusable component suggestions

---

# 2. Responsive Design Review

Verify responsiveness across:

- xs
- sm
- md
- lg
- xl
- xxl

Review:

- Layout alignment
- Overflow issues
- Grid consistency
- Responsive typography
- Responsive tables
- Responsive forms
- Responsive drawers
- Responsive modals
- Responsive spacing

Flag any responsive issues.

---

# 3. CTA Consistency Review

Review every CTA in the application.

Verify:

Primary Button

- Height
- Width
- Font
- Border radius
- Loading state
- Disabled state
- Hover state
- Icon alignment

Secondary Button

- Styling consistency
- Hover consistency
- Disabled consistency

Danger Button

- Color consistency
- Confirmation behaviour

Review:

- Labels
- Position
- Alignment
- Padding
- Spacing

---

# 4. Folder Structure Review

Every module should follow:

src/
module/
├── components
├── pages
├── services
├── hooks
├── utils
├── constants
├── types
├── styles
└── index.ts

Identify:

- Duplicate utilities
- Dead files
- Unused exports
- Improper folder placement

---

# 5. Design Token Review

Never hardcode:

- Colors
- Font sizes
- Border radius
- Shadows
- Z-index
- Spacing

Use centralized design tokens.

Flag:

- Hardcoded colors
- Hardcoded spacing
- Hardcoded typography

---

# 6. Typography Review

Review:

- Heading hierarchy
- Font sizes
- Font weights
- Line height
- Paragraph spacing

---

# 7. Spacing Review

Ensure consistent:

- Margin
- Padding
- Section spacing
- Card spacing
- Grid spacing

Avoid magic numbers.

---

# 8. Color Consistency

Review:

- Primary
- Secondary
- Success
- Error
- Warning
- Info

Avoid arbitrary hex values.

---

# 9. Icon Review

Ensure:

- Single icon library
- Consistent icon sizes
- Proper semantic icons

---

# 10. Form Review

Review:

- Labels
- Validation
- Placeholder consistency
- Required indicators
- Helper text
- Error handling
- Disabled states

---

# 11. Table Review

Review:

- Pagination
- Sorting
- Filtering
- Empty state
- Loading state
- Sticky headers
- Responsive columns

---

# 12. Modal & Drawer Review

Review:

- Width
- Footer consistency
- Close behaviour
- ESC support
- Overlay
- Scroll locking

---

# 13. Loading State Review

Every async operation should have:

- Skeleton
- Spinner
- Button loading
- Table loading
- Card loading

No blank screens.

---

# 14. Empty State Review

Every page should define:

- Illustration
- Title
- Description
- CTA

---

# 15. Error Handling Review

Review:

- API failures
- Retry behaviour
- Toast notifications
- Error boundaries
- Validation messages

---

# 16. Accessibility Review

Review:

- Keyboard navigation
- Focus states
- Tab order
- ARIA labels
- Color contrast

---

# 17. Performance Review

Review:

- Lazy loading
- Code splitting
- Memoization
- Virtualized tables
- Bundle size
- Unused dependencies

---

# 18. Code Quality Review

Review:

- Duplicate JSX
- Magic numbers
- Inline styles
- Anonymous JSX callbacks
- Dead code
- Hook usage

---

# 19. Theme Review

Verify:

- Theme token usage
- Dark mode compatibility
- No hardcoded colors

---

# 20. Navigation Review

Review:

- Sidebar consistency
- Breadcrumbs
- Active menu
- Route naming
- Navigation flow

---

# 21. Naming Convention Review

Review:

- Components
- Hooks
- Services
- Types
- Constants
- Files
- Folders

---

# 22. State Management Review

Review:

- Local state
- Global state
- Context usage
- API caching
- Derived state

Identify unnecessary re-renders.

---

# 23. Reusability Review

Identify opportunities for shared components:

- Table
- Form
- Search
- Filter
- Empty State
- Status Badge
- Dialog
- Cards
- Action Bar

---

# 24. UX Consistency Review

Review:

- Hover states
- Active states
- Disabled states
- Focus states
- Animations
- Transition timing

---

# 25. Best Practices Review

Review:

- TypeScript typing quality
- ESLint compliance
- Prettier compliance
- Import ordering
- File organization
- Dependency usage
- Error boundaries
- Security best practices

---

# 26. Technical Debt Review

Identify:

- Duplicate code
- Overly complex components
- Large files (>300 LOC recommended review)
- Components with multiple responsibilities
- Missing abstractions
- Potential refactoring opportunities

---

# 27. Deliverables

After the review, generate a report containing:

## Executive Summary

Overall frontend health score (/100)

---

## Component Inventory

List all Ant Design components used.

---

## Responsive Issues

List all responsive problems.

---

## Design Consistency

- CTA consistency
- Typography consistency
- Spacing consistency
- Color consistency

---

## Code Quality

- Inline styles
- Dead code
- Duplicate components
- Hardcoded values

---

## Accessibility Findings

---

## Performance Findings

---

## Technical Debt

---

## Reusability Opportunities

---

## High Priority Fixes

---

## Medium Priority Fixes

---

## Low Priority Fixes

---

## Recommended Refactoring

---

## Final Verdict

Provide:

- Overall project maturity
- Estimated maintainability
- Design consistency score
- Engineering quality score
- Suggested next improvements