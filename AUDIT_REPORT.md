# Hospital Frontend — Comprehensive Audit Report

> **Status: AUDIT ONLY — No code has been changed.**
> Scope: all ~110 source files under `src/`, measured against every rule in `frontend-os-readme.md`.
> Metrics snapshot: **51** inline `style={{}}` blocks · **377** hardcoded hex values in CSS · **64** `console.*` calls · **8** hardcoded org UUIDs across 6 files.

---

## Executive Summary

| Metric | Score |
|---|---|
| Overall Frontend Health | **42 / 100** |
| Design Consistency | **35 / 100** |
| Maintainability | **38 / 100** |
| Accessibility | **28 / 100** |
| Performance Readiness | **45 / 100** |

**Project maturity:** Early prototype. Core routing and API layers are established, but significant portions of the UI are static mocks, the design system is entirely absent (no tokens, no shared theme config), and several pages have broken flows, hardcoded credentials, and no error handling.

---

## Table of Contents

1. [Ant Design Component Audit](#1-ant-design-component-audit)
2. [Responsive Design Review](#2-responsive-design-review)
3. [CTA Consistency Review](#3-cta-consistency-review)
4. [Folder Structure Review](#4-folder-structure-review)
5. [Design Token Review](#5-design-token-review)
6. [Typography Review](#6-typography-review)
7. [Spacing Review](#7-spacing-review)
8. [Color Consistency Review](#8-color-consistency-review)
9. [Icon Review](#9-icon-review)
10. [Form Review](#10-form-review)
11. [Table Review](#11-table-review)
12. [Modal & Drawer Review](#12-modal--drawer-review)
13. [Loading State Review](#13-loading-state-review)
14. [Empty State Review](#14-empty-state-review)
15. [Error Handling Review](#15-error-handling-review)
16. [Accessibility Review](#16-accessibility-review)
17. [Performance Review](#17-performance-review)
18. [Code Quality Review](#18-code-quality-review)
19. [Theme Review](#19-theme-review)
20. [Navigation Review](#20-navigation-review)
21. [Naming Convention Review](#21-naming-convention-review)
22. [State Management Review](#22-state-management-review)
23. [Reusability Review](#23-reusability-review)
24. [UX Consistency Review](#24-ux-consistency-review)
25. [Best Practices Review](#25-best-practices-review)
26. [Technical Debt Review](#26-technical-debt-review)
27. [Final Verdict & Executive Recommendations](#27-final-verdict--executive-recommendations)

---

## 1. Ant Design Component Audit

### Components in use across the codebase

**Layout family:** `Layout`, `Layout.Sider`, `Layout.Header`, `Layout.Content`

**Navigation:** `Menu`, `Breadcrumb`, `Breadcrumb.Item`, `Steps`, `Tabs`

**Data entry:** `Form`, `Form.Item`, `Input`, `Input.Password`, `Select`, `Select.Option`, `Switch`, `Checkbox`, `Radio`, `Radio.Group`, `DatePicker`, `TimePicker`, `Upload`, `Upload.Dragger`, `AutoComplete`, `InputNumber`

**Data display:** `Table`, `Card`, `List`, `List.Item`, `List.Item.Meta`, `Avatar`, `Badge`, `Tag`, `Progress`, `Pagination`, `Typography (Title · Text · Link)`, `Divider`, `Space`, `Alert`

**Feedback:** `Button`, `Modal`, `Popconfirm`, `Spin`, `Skeleton`, `message`, `notification`

**Icons:** `@ant-design/icons` — mixed set (no size standardisation)

**Total distinct components used: 45**

---

### Deprecated / Incorrect API Usage

| Severity | File | Issue |
|---|---|---|
| **High** | All pages | `Breadcrumb.Item` sub-component is deprecated in Ant Design 5 — use `items` prop |
| **High** | `bed-arrangement-steps.tsx` | `<Step>` sub-component inside `<Steps>` is deprecated — use `items` prop |
| **Medium** | Multiple files | `Select.Option` children pattern — should use `options` prop |
| **Medium** | `Signup.tsx`, `appointment.tsx`, `employees.tsx` | `Content` imported from `antd/es/layout/layout` — use `Layout.Content` from `antd` |
| **High** | `add-prescription.tsx` | `<Sider>` used as a form panel inside content area — breaks responsive layout contract |
| **Low** | `second-step.tsx` | `bordered` prop on `Card` is deprecated in Ant Design 5 |
| **Medium** | `sidebar.tsx` | `defaultSelectedKeys={['1']}` conflicts with path-based `selectedKeys` — causes flicker |

---

### Missing Reusable Shared Components

The following should be created under `src/shared/components/`:

- `PageShell` — shared Layout + Sidebar + Header wrapper (currently copy-pasted into every page)
- `PageBreadcrumb` — shared breadcrumb using the `items` API
- `StatusBadge` — shared Tag with status-to-colour mapping
- `EmptyState` — illustration + title + description + CTA
- `ConfirmDialog` — shared `Popconfirm` / `Modal.confirm` wrapper
- `DataTable` — Table with pagination, loading, and empty state baked in

---

## 2. Responsive Design Review

| Severity | File | Issue |
|---|---|---|
| **High** | `sidebar.css` | `Sider` fixed at `300px` — no responsive breakpoint; overflows on tablets |
| **High** | `add-prescription.tsx` | `Sider width={420}` too large on mobile; collapses to `0`, hiding the form |
| **High** | Multiple files | Tables without `scroll={{ x: ... }}` overflow viewport on mobile |
| **High** | `add-permission.tsx` | Modal `width={900}` overflows viewport on `xs` (~375px) |
| **Medium** | `dashboard.tsx` | 4-column card layout has no `xs`/`sm` column spans |
| **Medium** | `second-step-appointment.tsx` | Form inputs have no `xs` column spans — run edge-to-edge on mobile |
| **Medium** | `patient-list.css` | Search input fixed at `width: 300px` — overflows on `xs` |
| **Medium** | `signup.css` | `margin: 48px` on content causes horizontal overflow on small screens |
| **Medium** | `dashboard.css` | Only one breakpoint at `768px` — missing `xl` / `xxl` media queries |
| **Low** | `add-employee.tsx` | Preview card CSS columns collapse poorly below `lg` |

---

## 3. CTA Consistency Review

| Severity | File | Issue |
|---|---|---|
| **Critical** | `index.css`, `Login.css`, `first-step-appointment.tsx` | Primary button colour `#25D366` defined 4 ways: global `!important`, per-component class, AND inline `backgroundColor` — impossible to maintain |
| **Critical** | `prescription-preview.tsx` | All footer buttons (Print, Labels, Discard, Partial Dispense, Confirm) have no handlers — dead UI |
| **Critical** | `add-employee.tsx` | "Create Employee" and "Save Draft" buttons have no handlers |
| **High** | `first-step-appointment.tsx`, `second-step-appointment.tsx` | Submit button `width: 80` — too narrow; label clips |
| **High** | `Login.tsx` | Button heights inconsistent across app: `44px` (Login), `40px` (patient list), default (appointment), `large` (prescription) |
| **High** | `Signup.tsx` | "Save & Exit" is a `<span>` — not keyboard-accessible; not an Ant `Button` |
| **High** | `fourth-step.tsx` | Edit `Link` components have no `href` or `onClick` — dead controls |
| **High** | `fourth-step.tsx` | "Acknowledge" button has no `onClick` |
| **High** | `prescription-details.tsx`, `employees.tsx`, `patient-list.tsx` | Search inputs and filter buttons have no state or handlers |
| **High** | `roomtype.tsx` | "Cancel" button has no `onClick` |
| **Medium** | `Login.tsx` | "Forgot Password?" is a non-interactive `<span>` with `cursor: not-allowed` — misleading UX |

---

## 4. Folder Structure Review

### Required per-module structure (from README)

```
src/
  module/
  ├── components/
  ├── pages/
  ├── services/
  ├── hooks/
  ├── utils/
  ├── constants/
  ├── types/
  └── index.ts
```

### Findings

| Severity | Finding | Detail |
|---|---|---|
| **High** | No `components/` or `pages/` sub-folders | Features live directly in `features/` or at module root |
| **High** | No `hooks/` folders (one exception: `signup-step/features/second-step/`) | Custom hooks missing or mixed into feature files |
| **High** | No `constants/` folders anywhere | Constants hardcoded inline across files |
| **Medium** | No `utils/` folders in any module | Date formatting, colour maps duplicated per file |
| **Medium** | No `index.ts` barrel exports | Deep direct imports used across all modules |
| **Medium** | API files use `.tsx` extension | `second-step.tsx` (API), `beds.tsx` (types) — no JSX; should be `.ts` |
| **High** | Folder typo: `patientmangement` | Should be `patient-management` |
| **Medium** | `src/employees.tsx`, `src/dashboard.tsx`, `src/sidebar.tsx`, `src/header.tsx` at root level | Should live inside their respective module folders |
| **High** | `src/shared/shared.ts` uses mutable module-level state | Anti-pattern; should be a React Query query or hook |
| **High** | Empty dead files | `App.css`, `patient-overview.css`, `employees/api/add-employee.tsx`, `newdept.tsx`, `newdept.css` |
| **High** | `department/` module is entirely empty stubs | Implement or remove |

---

## 5. Design Token Review

> **There are zero design tokens in this project.**
> No `ConfigProvider`, no CSS custom properties file, no theme object.

All styling is done through raw hex values in CSS (377 occurrences), inline `style={{}}` in TSX (51 occurrences), and global `!important` overrides in `index.css`.

### Hardcoded Color Inventory

| Token Role | Value(s) Used | Problem |
|---|---|---|
| Brand green (primary) | `#25D366` | Correct value but hardcoded everywhere |
| Brand green hover | `#20b858`, `#1fb857`, `#16a34a`, `#15803d` | **4 different hover greens** — no canonical value |
| Light green background | `#E6F9EF` | |
| Green border | `#B7E9D1` | |
| Dark text | `#111827`, `#1F2937` | 2 different values for the same role |
| Muted text | `#6B7280`, `#374151`, `#667085` | **3 different values** for secondary text |
| Page background | `#F9FAFB`, `#f8fafc`, `#f8fff9` | **3 different near-whites** |
| Card border | `#E5E7EB`, `#e5e7eb` | Same value, different casing |

**No tokens defined for:** font sizes, border radius, shadows, z-index, spacing scale, breakpoints.

---

## 6. Typography Review

| Severity | File | Issue |
|---|---|---|
| **Critical** | `dashboard.css:67` | `font-style: 'Roboto'` — invalid CSS property value; should be `font-family` |
| **High** | `dashboard.css` | Global `h3` selector affects all `h3` in scope — should use a scoped class |
| **High** | Multiple files | Heading levels (`h1`, `h2`, `h3`, `h4`, Ant `Title level={2}`) used without semantic hierarchy |
| **High** | Multiple CSS files | `muted-text` class defined independently in every module with no shared utility |
| **Medium** | `index.css` | Roboto referenced but never `@import`ed or `@font-face`d — relies on system fallback |
| **High** | Multiple CSS files | Font sizes hardcoded: `20px`, `18px`, `16px`, `14px`, `13px`, `12px`, `11px` — no type scale |
| **Medium** | `Signup.tsx` | `<p>` used for app title — semantic mismatch; should be `<h1>` |

---

## 7. Spacing Review

| Severity | Finding | Detail |
|---|---|---|
| **High** | No spacing scale | Arbitrary values: `4px`, `6px`, `8px`, `10px`, `12px`, `16px`, `18px`, `20px`, `24px`, `32px`, `48px` — no 4 or 8-point grid |
| **Medium** | `signup.css` | `margin: 48px` causes horizontal overflow on small screens |
| **Medium** | `dashboard.css` | `calc(100vh - 56px)` — `56px` is undocumented magic number (header height) |
| **Medium** | Multiple files | `gutter` values inconsistent: `[16,16]`, `[32,0]`, `[32,20]`, `12`, `8`, `16` |
| **High** | All modules | Section spacing not standardised — each module defines its own top/bottom margins |
| **High** | `dashboard.tsx` | `totalPatients = patientData.length + 12` — magic number `12` with no business meaning |

---

## 8. Color Consistency Review

| Severity | Finding | Detail |
|---|---|---|
| **Critical** | Ant Design theme not configured | No `ConfigProvider` — all Ant components use default blue; global CSS overrides fight the library |
| **Critical** | 4 different green hover shades | `#20b858`, `#1fb857`, `#16a34a`, `#15803d` — no canonical hover colour |
| **High** | 3 different muted-text greys | `#6B7280`, `#374151`, `#667085` |
| **High** | 3 different page background whites | `#F9FAFB`, `#f8fafc`, `#f8fff9` |
| **High** | Status colours not standardised | `getStatusColor` function defined independently per file |
| **Low** | `dashboard.tsx` | `Badge color="green"` — Ant preset, not the brand green |

---

## 9. Icon Review

| Severity | File | Issue |
|---|---|---|
| **High** | Multiple files | Emojis used as icons (`✔`, `📍`, `🛡`, `⚠`) — do not inherit colour, scale badly, read verbatim by screen readers |
| **Medium** | `sidebar.tsx` | `UserOutlined` used for "Bed Arrangement" menu item — wrong semantic icon |
| **Medium** | Multiple files | Icon sizes not standardised — no consistent `fontSize` or `style` across screens |
| **Medium** | Multiple files | Decorative icons missing `aria-hidden="true"` |
| **Low** | `upload-inovice.tsx` | `HighlightOutlined style={{ marginRight: 8 }}` — spacing should be a CSS class |

---

## 10. Form Review

| Severity | File | Issue |
|---|---|---|
| **Critical** | `first-step-appointment.tsx` | No validation rules on any field — form submits empty values silently |
| **Critical** | `add-employee.tsx` | 546-line form with zero validation rules |
| **Critical** | `third-step.tsx` | Offensive placeholder defaults: `first_name: 'random'`, `last_name: 'shit'` — dev test data left in production code |
| **High** | `first-step.tsx` | `hospital_type` Select has `required` prop but no `rules` — does not block submit |
| **High** | `second-step.tsx` | State, city, timezone fields have `required` prop but no `rules` |
| **High** | `third-step.tsx` | Password validation uses `disabled={!cansubmit}` instead of `Form.Item rules` — bypassable |
| **High** | `add-prescription.tsx` | `Input min={0}` — invalid prop on Ant `Input`; has no effect (valid only on `InputNumber`) |
| **High** | `second-step-appointment.tsx` | `DatePicker onChange` logs ISO string but never calls `form.setFieldValue` — dates lost |
| **High** | `first-step.tsx` | Hospital code `"HOSP-9921-2024"` hardcoded — fake/static, not from API |
| **Medium** | `Login.tsx`, `third-step.tsx` | Email fields have no `type: 'email'` format validation rule |

---

## 11. Table Review

| Severity | File | Issue |
|---|---|---|
| **Critical** | `patient-list.tsx` | Search input has no `onChange` handler — completely non-functional |
| **High** | `patient-list.tsx` | Total count shows `response?.data?.length` (page size) not `response?.total` — incorrect count displayed |
| **High** | `patient-list.tsx`, `prescription-details.tsx` | No empty state defined — falls back to Ant Design default "No data" text |
| **High** | `prescription-details.tsx` | Search and filter buttons (All / Sent / Pending) have no state or handlers |
| **Medium** | `patient-list.tsx` | Two columns with `defaultSortOrder: 'descend'` — conflicting sort defaults |
| **Medium** | `beds.tsx` | Bed preview "View More" link has no handler |
| **Low** | All tables | `sticky` header prop not used |
| **Low** | Multiple files | Column-level `filters` / `onFilter` not implemented |

---

## 12. Modal & Drawer Review

| Severity | File | Issue |
|---|---|---|
| **High** | `add-permission.tsx` | Modal `width={900}` overflows viewport on mobile |
| **High** | `beds.tsx` | `cancelButtonProps={{ display: 'none' }}` hides Cancel — accessibility violation |
| **High** | `add-prescription.tsx` | `<Sider>` used as form panel — cannot be dismissed; collapses to `0` on `lg` breakpoint, hiding form |
| **High** | Multiple files | Destructive actions (Delete medicine, Discard Order) have no `Popconfirm` confirmation |

---

## 13. Loading State Review

| Severity | File | Issue |
|---|---|---|
| **Critical** | `patient-profile.tsx` | No loading state — shows hardcoded placeholder names while API call is in-flight |
| **Critical** | `patient-overview.tsx` | Entirely static mock data; no loading state |
| **Critical** | `third-step-appointment.tsx` | Preview screen shows hardcoded mock `previewData` for all three cards |
| **Critical** | `fourth-step.tsx` | "Create Organisation" button navigates immediately — no API call, no loading |
| **Critical** | `prescription-preview.tsx` | 322-line screen with zero API integration — fully static mock |
| **High** | `first-step-appointment.tsx` | No loading indicator on submit — button gives no feedback during API call |
| **High** | `beds.tsx` | "Generate Beds" action has no loading feedback |
| **High** | `add-employee.tsx` | No loading anywhere — no API calls connected |
| **High** | `second-step-appointment.tsx` | `loading={roomtype?.length === 0}` — incorrect; shows permanent spinner when list is empty |
| **Medium** | `dashboard.tsx` | `<Skeleton loading={false}>` wrapper is pointless — loading is always false |

---

## 14. Empty State Review

No page defines a proper empty state (illustration + title + description + CTA) as required by the standard.

| Page | Current Empty State | Severity |
|---|---|---|
| Patient list | Ant default "No data" | **High** |
| Employee list | No list rendered at all (shell page) | **Critical** |
| Prescription list | Ant default "No data" | **High** |
| Supplier list | Static mock data only | **Critical** |
| Dashboard patient list | "No patients" text only | **Medium** |
| Bed preview table | No message | **High** |
| Permission modal | No message if modules empty | **High** |

---

## 15. Error Handling Review

| Severity | File | Issue |
|---|---|---|
| **Critical** | `fourth-step.tsx` | `useEffect` missing dependency array — fires on every render; will cause infinite API calls when connected |
| **Critical** | Signup steps 2, 3, 4 | `onError: (error) => console.error(...)` — user sees nothing on API failure |
| **Critical** | `add-permission.tsx` | `fetchPermissions` has no try/catch — loading state can get permanently stuck |
| **Critical** | App-wide | No error boundaries — uncaught render errors crash the entire app |
| **Critical** | `api-client.ts` | `baseURL: "http://localhost:9069/api/v1"` hardcoded — will fail in all non-local environments |
| **High** | `patient-profile.tsx` | API failure shows hardcoded placeholder data as if it were real patient data |
| **High** | `add-prescription.tsx` | `searchMedicine` and `findonePresc` missing try/catch — silent failures |
| **High** | `add-prescription.tsx` | `handleUpdateStatus` has no error path |
| **High** | `shared.ts` | `setDeptArray` appends rather than replaces — repeated calls duplicate data indefinitely |
| **High** | App-wide | 64 `console.*` calls — debug logs in production code paths |

---

## 16. Accessibility Review

| Severity | File | Issue |
|---|---|---|
| **High** | `Signup.tsx` | "Save & Exit" is a `<span onClick>` — not keyboard-focusable; no `role="button"` or `tabIndex` |
| **High** | `patient-profile.tsx` | Custom tab headers are `<span onClick>` — no `role="tab"` or keyboard support |
| **High** | `sidebar.tsx` | Collapse button is icon-only with no `aria-label` |
| **High** | `header.tsx` | Bell icon has `cursor: pointer` in CSS but no `onClick`, no `role`, no `tabIndex` |
| **High** | `header.tsx` | Logout inside `<span onClick>` inside Dropdown — keyboard inaccessible |
| **High** | `header.tsx` | `<a onClick={(e) => e.preventDefault()}>` pattern — use `<button>` |
| **High** | `third-step.tsx` | Password rule indicators have no `aria-live` — screen readers do not announce validity changes |
| **High** | `App.tsx` | Empty `<nav>` with no `aria-label` or content — misleads screen readers |
| **High** | App-wide | No skip link — keyboard users cannot skip repeated navigation |
| **High** | Multiple files | Emojis in headings and buttons announced verbatim by screen readers |
| **Medium** | `second-step.tsx`, `roomtype.tsx` | Switch controls lack associated `<label htmlFor>` |
| **Medium** | `header.tsx` | `<h3>` inside Dropdown trigger — heading inside interactive element confuses hierarchy |
| **Medium** | Multiple pages | No `aria-current="page"` on breadcrumb last item |
| **High** | App-wide | No `:focus-visible` CSS styles defined beyond browser defaults |
| **Medium** | Multiple files | Decorative icons missing `aria-hidden="true"` |

---

## 17. Performance Review

| Severity | File | Issue |
|---|---|---|
| **Critical** | `App.tsx` | No `React.lazy` / code splitting — entire bundle loads on `/login` |
| **Critical** | `fourth-step.tsx` | `useEffect` with no dep array runs on every render — infinite re-render potential |
| **High** | `patient-list.tsx` | `columns` defined inside component body — re-created on every render |
| **High** | Multiple Table files | Anonymous render functions `render: () => <Component />` — new reference every render |
| **High** | App-wide | No `useMemo` / `useCallback` / `React.memo` used anywhere |
| **High** | `shared.ts` | Module-level mutable state — not React-aware; causes stale data and memory leaks |
| **High** | `dashboard.tsx` | Large static mock patient array compiled into the JavaScript bundle |
| **Medium** | Multiple files | No `React.memo` on `Sidebar` or `HeaderLayout` — re-render on every parent update |
| **Medium** | Patient list, medicine list | No virtualized list — can grow arbitrarily large |
| **Low** | `patient-list.tsx` | `dayjs` imported as `datecheck` alias — misleading |

---

## 18. Code Quality Review

| Severity | File | Issue |
|---|---|---|
| **Critical** | `add-prescription.tsx` | `medicines` state is always `[]` — each save sends only the latest medicine; accumulated list is never built (data loss) |
| **Critical** | `third-step.tsx:88` | Offensive placeholder defaults: `first_name: 'random'`, `last_name: 'shit'` |
| **High** | App-wide | 51 inline `style={{}}` blocks in TSX files |
| **High** | App-wide | 64 `console.*` calls left in production code paths |
| **High** | App-wide | `any` type used 30+ times across props, API responses, and form values |
| **High** | Multiple files | Anonymous JSX callbacks in Table renders — unstable references on every render |
| **Medium** | `sidebar.tsx` | Duplicate `antd` import on two separate lines |
| **Medium** | Multiple files | Commented-out code left in (`first-step-appointment.tsx`, `second-step-appointment.tsx`, `Signup.tsx`) |
| **Medium** | `add-permission.tsx` | `SetModules` — uppercase `S` violates React setter convention; should be `setModules` |
| **Medium** | `add-permission.tsx` | Typo in className: `"preview-button\`"` — stray backtick |
| **Medium** | `add-prescription.tsx` | Typo in variable name: `findoneesponse` |
| **Medium** | `types/patients.tsx` | `admission_date: Date` / `patient_lvd: Date` — JSON returns `string`, not `Date` |
| **Low** | `add-prescription.tsx` | Success message reads "Prescription updated successfully!" on initial create |
| **Low** | `second-step-appointment.tsx` | `appointment_id: ""` always empty in payload |

---

## 19. Theme Review

| Severity | Finding | Detail |
|---|---|---|
| **Critical** | No `ConfigProvider` | Ant Design 5 theme is not configured — brand colour applied via global CSS `!important` hacks |
| **Critical** | No design token file | No `theme.ts`, no CSS custom properties (`:root` variables), no Ant `token` overrides |
| **High** | Dark mode incompatible | All colours are hardcoded hex — dark mode would require a full CSS rewrite |
| **High** | `index.css` | Global `!important` overrides on `.ant-btn-primary` fight Ant's internal cascade on every button |
| **Medium** | `index.css` | Universal `*` reset conflicts with Ant Design component margins and paddings |

---

## 20. Navigation Review

| Severity | File | Issue |
|---|---|---|
| **Critical** | `App.tsx` | Bed-arrangement routes (`/bed-arrangement`, `/step-2`, `/step-3`) not behind `AuthGuard` — publicly accessible |
| **Critical** | `first-step-appointment.tsx` | Step 1 navigates to `/patients` on success — should navigate to `/:patientID/step2` |
| **Critical** | `App.tsx` | Step 3 of appointment (`third-step-appointment.tsx`) exists but is not registered as a route |
| **High** | `App.tsx` | No 404 / catch-all route — unknown URLs are unhandled |
| **High** | `App.tsx` | Empty `<nav>` element with no content or `aria-label` |
| **High** | `sidebar.tsx` | `/appointment` in `routeMap` but no corresponding route exists — dead mapping |
| **Medium** | `sidebar.tsx` | `/dashboard` not in `routeMap` — works accidentally via fallback |
| **Medium** | `sidebar.tsx` | `defaultSelectedKeys={['1']}` conflicts with path-based `selectedKeys` |
| **Medium** | All pages | `Breadcrumb.Item` deprecated — use `items` array prop |
| **Medium** | `Signup.tsx` | "Save & Exit" discards unsaved data without warning |

---

## 21. Naming Convention Review

| Severity | Finding | Detail |
|---|---|---|
| **High** | Folder typo | `patientmangement` → should be `patient-management` |
| **Medium** | File typo | `upload-inovice.tsx` → should be `upload-invoice.tsx` |
| **High** | Interfaces not PascalCase | `loginPayload`, `loginResponse`, `bedAllotment`, `patientlist`, `medicineResponse`, `createPrescResponse` |
| **Medium** | File naming inconsistency | `second-step.appointment.ts` (dot) vs `first-step-appointment.ts` (hyphen) — pick one convention |
| **Medium** | `.tsx` extension on non-JSX files | `second-step.tsx` (API), `beds.tsx` (types), `add-employee.tsx` (API), `add-permissions.tsx` (API) |
| **High** | Prop casing inconsistency | `OnNext` vs `onNext`, `OnUpdate` vs `onBack` — should all be camelCase |
| **High** | File vs export name mismatches | `pharmacy.tsx` exports `AddPharmacy`; `prescription-details.tsx` exports `PrescriptionList`; `first-step-appointment.tsx` exports `FirstStep` |
| **High** | CSS class naming chaos | `button-row` vs `button-row1`, `search-input1`, `custom-primary-btn` vs `appointment-button` — no naming system |
| **Medium** | `appointment-button` class on employee page | CSS class name has wrong context |
| **Medium** | `SetModules` uppercase setter | `add-permission.tsx` — should be `setModules` |

---

## 22. State Management Review

| Severity | File | Issue |
|---|---|---|
| **Critical** | `fourth-step.tsx` | `useEffect` missing dependency array — fires on every render |
| **Critical** | `shared.ts` | `export let deptArray = []` — mutable module-level state mutated outside React lifecycle |
| **High** | `shared.ts` | `setDeptArray` appends rather than replaces — repeated calls duplicate data indefinitely |
| **High** | `Signup.tsx` | `useState(null)` without types — `organisationData` / `userData` inferred as `null` only |
| **High** | `Signup.tsx` | `refreshOrg` counter state — hack to trigger refetch; should use React Query `invalidateQueries` |
| **High** | `second-step-appointment.tsx` | `loading={roomtype?.length === 0}` — incorrect loading logic |
| **High** | `third-step.tsx` | 6 password validity booleans computed inline on every render without `useMemo` |
| **Medium** | App-wide | React Query configured globally but used inconsistently — some flows use it, others use manual `useState` + `useEffect` + API |
| **Medium** | `Signup.tsx` | Step data passed as props through parent — tightly coupled; hard to extend |
| **Medium** | `Signup.tsx` | `organisationID: string | ''` — redundant union type |

---

## 23. Reusability Review

The following abstractions are duplicated across the codebase and should become shared components:

| Missing Component | Currently Duplicated In |
|---|---|
| `PageShell` (Layout + Sidebar + Header) | Every page component — 10+ files |
| `PageHeader` (title + breadcrumb + primary action) | `patient-list`, `prescription-details`, `employees`, `add-prescription` |
| `StatusTag` (status → colour map + Tag) | `patient-list`, `prescription-details`, `pharmacy`, `patient-profile` |
| `DataTable` (Table + Pagination + empty + loading) | `patient-list`, `prescription-details`, `beds` |
| `SearchInput` | `patient-list`, `prescription-details`, `employees`, `pharmacy` |
| `ConfirmDialog` | Destructive actions across multiple files |
| `EmptyState` | All listing pages |
| `FormSection` (Card-wrapped form block) | Signup steps, appointment steps, add-employee |
| `DateDisplay` (formatted date string) | `prescription-details`, `add-prescription`, `patient-list` |
| `LoadingSpinner` (centred) | `add-permission.tsx` inline style hack |

---

## 24. UX Consistency Review

| Severity | File | Issue |
|---|---|---|
| **Critical** | `add-prescription.tsx` | Success message says "Prescription **updated** successfully!" on initial **create** |
| **High** | `fourth-step.tsx` | Review screen shows `Userdata?.username` but Step 3 stores `first_name`/`last_name` — name will always be blank |
| **High** | `rooms.tsx` | Capacity gauge shows static `02`, `20%`, `8%` — not computed from form values |
| **High** | `beds.tsx` | Progress bar hardcoded at `75%` — not derived from data |
| **High** | `prescription-preview.tsx` | Billing amounts `$142.50`, `$7.12`, `$149.62` are static mock values |
| **High** | Multiple files | Dead buttons give no affordance that they are non-functional |
| **Medium** | `Signup.tsx` | Step 4 icon is always `<LoadingOutlined />` (spinning) — static and misleading |
| **Medium** | `sidebar.tsx` | Logo click only expands sidebar, never collapses — asymmetric UX |
| **Medium** | `add-permission.tsx` | Every module card shows **all** permissions (nested loop bug) — logic is wrong |
| **Medium** | `patient-profile.tsx` | External avatar placeholder `https://i.pravatar.cc/100` — fails offline, privacy concern |

---

## 25. Best Practices Review

| Severity | Finding | Detail |
|---|---|---|
| **Critical** | `api-client.ts` | `baseURL: "http://localhost:9069/api/v1"` in version-controlled file — should be `import.meta.env.VITE_API_URL` |
| **Critical** | App-wide | No `React.lazy` / `Suspense` — zero code splitting |
| **High** | App-wide | No error boundary component — uncaught render errors crash entire app |
| **High** | App-wide | No `.env.example` file — environment variables not documented |
| **High** | `authguard.tsx` | `children: any` — should be `React.ReactNode` |
| **High** | `authguard.tsx` | Token check is presence-only — no expiry or validity validation |
| **Medium** | Multiple files | TypeScript `strict` mode appears off or unenforced — widespread `any` |
| **Medium** | Multiple files | Import ordering inconsistent — no `eslint-plugin-import` configured |
| **Medium** | `login-api.ts` | `withCredentials: true` on login but not on other requests — inconsistent |
| **Medium** | `authguard.tsx` | Token stored in `localStorage` — vulnerable to XSS; `httpOnly` cookie preferred |
| **Low** | Multiple files | `antd/dist/reset.css` (`main.tsx`) vs `antd/es/` (`Content` imports) — mixed import paths |

---

## 26. Technical Debt Review

### Files Exceeding 300 LOC (Require Decomposition)

| File | Lines | Multiple Responsibilities |
|---|---|---|
| `add-employee.tsx` | 545 | Form, preview card, role grid, shift assignment, no API |
| `add-prescription.tsx` | 520 | Sidebar form, medicine list, pagination, finalize flow |
| `prescription-preview.tsx` | 322 | Patient card, alerts, medicine table, billing summary, footer actions |
| `beds.tsx` | 314 | Form, bed generation, preview table, modal, hardcoded org ID |
| `second-step-appointment.tsx` | 290 | Bed allotment form, room/bed selects, skip flow, date handling |
| `prescription-details.tsx` | 248 | Table, search, filters, pagination, status colour map |
| `patient-list.tsx` | 231 | Table, columns, search, pagination, breadcrumb, layout |

### Hardcoded Values Summary

| Type | Count | Locations |
|---|---|---|
| Hardcoded organisation UUIDs | 8 occurrences (3 distinct values) | `beds.tsx` (3×), `rooms.tsx`, `roomtype.tsx`, `first-step-appointment.tsx`, `add-prescription.tsx`, `prescription-details.tsx`, `shared.ts` |
| Hardcoded doctor UUID | 1 | `add-prescription.tsx` |
| Hardcoded `localhost` API URL | 1 | `api-client.ts` |
| Inline `style={{}}` blocks | 51 | Across TSX files |
| Hardcoded hex values in CSS | 377 | Across CSS files |
| `console.*` calls | 64 | Across TSX and TS files |

### Completely Static / Mock Screens

| Screen | File | Status |
|---|---|---|
| Prescription Preview (Pharmacist) | `prescription-preview.tsx` | 100% mock — all data hardcoded |
| Appointment Step 3 (Preview) | `third-step-appointment.tsx` | 100% mock — `previewData` array |
| Add Employee | `add-employee.tsx` | UI only — no API calls |
| Supplier List | `pharmacy.tsx` | Static 5 suppliers — "Showing 5 of 124" is fake |
| Signup Step 4 | `fourth-step.tsx` | "Create Organisation" navigates immediately — no API |

### Duplicate Code Patterns

| Pattern | Repetitions |
|---|---|
| Layout shell (Sidebar + Header + Breadcrumb) | 10+ page files |
| Date formatting (`toLocaleDateString`) | 4 files |
| Status-to-colour mapping function | 3 files |
| Organisation ID from `localStorage` | 4+ files |
| Green submit button inline styles | 3 appointment/signup step files |
| Green primary button CSS class | 5 CSS files |

---

## 27. Final Verdict & Executive Recommendations

### Final Verdict

| Dimension | Assessment |
|---|---|
| Overall project maturity | Early prototype / pre-MVP |
| Design consistency | Very low — no token system; 4 competing button implementations; 3+ colour variants per role |
| Estimated maintainability | Low — large files, no shared components, no constants, copy-paste architecture |
| Engineering quality | Low-medium — good library choices (Vite, Ant 5, React Query, TypeScript) but patterns applied inconsistently |
| Accessibility | Not compliant — multiple interactive elements inaccessible by keyboard |
| Deployment readiness | Blocked — localhost API URL, hardcoded UUIDs, offensive placeholders, broken multi-step flows |

---

### Top 10 Recommended Improvements (Priority Order)

| # | Priority | Improvement | Impact |
|---|---|---|---|
| 1 | **Critical** | Fix `medicines` accumulation bug in `add-prescription.tsx` — each save currently sends only the latest medicine, discarding all previous entries | Data integrity |
| 2 | **Critical** | Configure Ant Design 5 `ConfigProvider` with brand colour token (`#25D366`) — eliminates all `!important` overrides and centralises theming | Design consistency |
| 3 | **Critical** | Move `baseURL` and all hardcoded organisation/doctor UUIDs to environment variables (`.env`) | Deployment blocker |
| 4 | **Critical** | Remove offensive placeholder defaults from `third-step.tsx` (`first_name: 'random'`, `last_name: 'shit'`) | Data integrity |
| 5 | **Critical** | Fix `useEffect` missing dependency array in `fourth-step.tsx` — current code runs on every render | Performance / correctness |
| 6 | **Critical** | Add `React.lazy` + `Suspense` to all routes in `App.tsx` — zero-configuration performance win | Performance |
| 7 | **High** | Guard bed-arrangement routes behind `AuthGuard`; register appointment Step 3; fix Step 1 navigation to route to `:patientID/step2` | Security / UX |
| 8 | **High** | Create shared `PageShell` component — eliminates 10+ copy-pasted layout shells | Maintainability |
| 9 | **High** | Add `rules` validation to all required `Form.Item` fields missing them (Step 1 appointment, Step 3 admin, `add-employee`) | Correctness |
| 10 | **High** | Fix `add-permission.tsx` logic bug — all permissions currently render under every module; add Save API call | Correctness |

---

### Remediation Roadmap

**Phase 1 — Critical Bugs (before any further feature work)**
- Fix `medicines` accumulation
- Remove offensive placeholders
- Fix `useEffect` dep array
- Move API URL and UUIDs to `.env`
- Guard bed-arrangement routes

**Phase 2 — Design System Foundation**
- Create `ConfigProvider` + token file
- Create `PageShell`, `DataTable`, `StatusTag`, `EmptyState` shared components
- Define CSS custom properties for spacing, typography, colour

**Phase 3 — Form & Validation Hardening**
- Add `rules` to all Form.Items
- Wire all dead CTA buttons
- Fix appointment multi-step flow
- Fix search/filter inputs

**Phase 4 — Performance & Accessibility**
- Add `React.lazy` to all routes
- Add error boundaries
- Fix keyboard-inaccessible interactive elements
- Add `aria-label` to icon-only controls
- Remove emoji icons

**Phase 5 — Architecture Cleanup**
- Rename `patientmangement` folder
- Restructure modules to match required folder pattern
- Add `index.ts` barrel exports
- Replace deprecated Ant Design APIs
- Remove all dead files

---

*Report generated: June 30, 2026*
*Audited against: `frontend-os-readme.md` (all 26 review categories)*
*No code was modified during this audit.*
