# Changes Accepted — High & Critical Severity Items

> Filtered from `AUDIT_REPORT.md`. Only **Critical** and **High** severity findings are listed below.

---

## 1. Ant Design Component Audit

| Severity | File | Issue |
|---|---|---|
| **High** | All pages | `Breadcrumb.Item` sub-component is deprecated in Ant Design 5 — use `items` prop |
| **High** | `bed-arrangement-steps.tsx` | `<Step>` sub-component inside `<Steps>` is deprecated — use `items` prop |
| **High** | `add-prescription.tsx` | `<Sider>` used as a form panel inside content area — breaks responsive layout contract |

---

## 2. Responsive Design Review

| Severity | File | Issue |
|---|---|---|
| **High** | `sidebar.css` | `Sider` fixed at `300px` — no responsive breakpoint; overflows on tablets |
| **High** | `add-prescription.tsx` | `Sider width={420}` too large on mobile; collapses to `0`, hiding the form |
| **High** | Multiple files | Tables without `scroll={{ x: ... }}` overflow viewport on mobile |
| **High** | `add-permission.tsx` | Modal `width={900}` overflows viewport on `xs` (~375px) |

### ✅ Fixed

| File | What changed |
|---|---|
| `src/sidebar.tsx` | Added `width={240}`, `breakpoint="lg"`, `onBreakpoint={(broken) => setCollapse(broken)}` — sidebar auto-collapses on tablets |
| `src/sidebar.css` | Removed hardcoded `width: 300px`. Added `@media (max-width: 992px)` rule: sidebar becomes `position: fixed; z-index: 100` so it overlays content instead of pushing it |
| `src/prescriptions/add-prescription.tsx` | Changed `Sider width={420}` → `width={320}`, `breakpoint="lg"` → `breakpoint="md"` (collapses at 768px instead of 992px) |
| `src/prescriptions/add-prescription.css` | Updated `@media (max-width: 1200px)` sidebar width from `350px` → `320px` to match |
| `src/patientmangement/patientlist/patient-list.tsx` | Added `x: 'max-content'` to existing `scroll={{ y: 400 }}` → `scroll={{ x: 'max-content', y: 400 }}` |
| `src/patientmangement/bedarrangement/beds.tsx` | Added `scroll={{ x: 'max-content' }}` to bed preview `<Table>` |
| `src/prescriptions/prescription-preview.tsx` | Added `scroll={{ x: 'max-content' }}` to medicine `<Table>` |
| `src/employees/add-permissions/add-permission.tsx` | Changed `width={900}` → `width="min(900px, 95vw)"` — modal never exceeds viewport width |

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

### ✅ Fixed (Critical)

| File | What changed |
|---|---|
| `src/index.css` | Added `--color-primary`, `--color-primary-hover`, `--color-primary-light`, `--color-primary-border`, `--color-primary-text` CSS variables to `:root`. All `.ant-btn-primary` overrides in `index.css` now use `var(--color-primary)` — single source of truth for brand colour |
| `src/appointment-step/features/first-step-appointment.tsx` | Removed inline `backgroundColor: "#25D366"` from Submit button; changed hardcoded `width: 80` to `minWidth: 100` so label no longer clips |
| `src/appointment-step/features/second-step-appointment.tsx` | Removed inline `backgroundColor: "#25D366"` from Submit button; changed `width: 80` to `minWidth: 100` |
| `src/appointment-step/features/first-step-appointment.css` | Replaced hardcoded `#25D366` / `#20b858` in `.submit-appointment-form` with `var(--color-primary)` / `var(--color-primary-hover)` |
| `src/authentication/Login.css` | Replaced hardcoded `#25D366` in `.login-submit-button` with `var(--color-primary)` |
| `src/prescriptions/prescription-preview.tsx` | Added `message.useMessage()` and `Modal.confirm`. Wired all 5 footer buttons: Print Bill → `window.print()` + toast; Generate Labels → loading → success toast; Discard Order → `Modal.confirm` danger confirmation; Partial Dispense → info toast; Confirm & Dispense → loading → success toast |
| `src/employees/add-employee/add-employee.tsx` | Added `message.useMessage()`. Wired Cancel → `form.resetFields()`; Save Draft → partial validation + loading/success toasts; Create Employee → `form.validateFields()` + loading/success/error toasts |

---

## 4. Folder Structure Review

| Severity | Finding | Detail |
|---|---|---|
| **High** | No `components/` or `pages/` sub-folders | Features live directly in `features/` or at module root |
| **High** | No `hooks/` folders | Custom hooks missing or mixed into feature files |
| **High** | No `constants/` folders anywhere | Constants hardcoded inline across files |
| **High** | Folder typo: `patientmangement` | Should be `patient-management` |
| **High** | `src/shared/shared.ts` uses mutable module-level state | Anti-pattern; should be a React Query query or hook |
| **High** | Empty dead files | `App.css`, `patient-overview.css`, `employees/api/add-employee.tsx`, `newdept.tsx`, `newdept.css` |
| **High** | `department/` module is entirely empty stubs | Implement or remove |

---

## 6. Typography Review

| Severity | File | Issue |
|---|---|---|
| **Critical** | `dashboard.css:67` | `font-style: 'Roboto'` — invalid CSS property value; should be `font-family` |
| **High** | `dashboard.css` | Global `h3` selector affects all `h3` in scope — should use a scoped class |
| **High** | Multiple files | Heading levels (`h1`, `h2`, `h3`, `h4`, Ant `Title level={2}`) used without semantic hierarchy |
| **High** | Multiple CSS files | `muted-text` class defined independently in every module with no shared utility |
| **High** | Multiple CSS files | Font sizes hardcoded: `20px`, `18px`, `16px`, `14px`, `13px`, `12px`, `11px` — no type scale |

### ✅ Fixed (Critical)

| File | What changed |
|---|---|
| `src/dashboard.css` | Removed invalid `font-style: 'Roboto'` declaration — cleaned up during typography standardisation pass; font family is now inherited globally from `index.css` |

### ✅ Fixed (High)

| File | What changed |
|---|---|
| `src/index.css` | Added `--color-muted-text` token, global `.muted-text` utility, and `.count-label` for pagination badges. All remaining module-level duplicates consolidated here |
| `src/dashboard.css` | Replaced global `h3` overrides with scoped `.card-section-label` and `.list-item-title` classes; special card `h2` uses `var(--text-lg)` |
| `src/dashboard.tsx` | Card labels and list item names changed from `<h3>` to semantic `<p>`/`<span>` with scoped classes |
| `src/patientmangement/patientlist/patient-list.tsx` | Pagination count changed from `<h3>` to `<span className="count-label">` |
| `src/prescriptions/prescription-details.tsx` | Pagination count changed from `<h3>` to `<span className="count-label">` |
| `src/signup-step/features/second-step/second-step.css` | Removed duplicate `.muted-text` — now inherits from `index.css` |
| `src/signup-step/features/third-step/third-step.css` | Removed duplicate `.muted-text`; `password-rules` and `setup-checkbox` use `var(--text-sm)` |
| `src/employees/add-employee/add-employee.css` | Removed hardcoded `font-family: 'Roboto'`; font sizes use CSS variables |
| **10 CSS modules** | Migrated all remaining hardcoded font sizes (`20px`–`11px`) to CSS variables (`--text-xl` through `--text-xs`) across `beds.css`, `rooms.css`, `roomtype.css`, `add-prescription.css`, `prescription-details.css`, `prescription-preview.css`, `patient-profile.css`, `patient-list.css`, `pharmacy.css`, `employees.css`, `header.css`, `sidebar.css`, `Login.css`, `signup.css`, `add-pharmacy.css` |

---

## 7. Spacing Review

| Severity | Finding | Detail |
|---|---|---|
| **High** | No spacing scale | Arbitrary values: `4px`, `6px`, `8px`, `10px`, `12px`, `16px`, `18px`, `20px`, `24px`, `32px`, `48px` — no 4 or 8-point grid |
| **High** | All modules | Section spacing not standardised — each module defines its own top/bottom margins |
| **High** | `dashboard.tsx` | `totalPatients = patientData.length + 12` — magic number `12` with no business meaning |

### ✅ Fixed

| File | What changed |
|---|---|
| `src/index.css` | Added full **8-point spacing scale** to `:root`: `--space-1` (4px) through `--space-12` (48px). Added semantic aliases `--spacing-page` (24px), `--spacing-section` (18px), `--spacing-card` (20px). Added global rules: `.ant-layout-content` baseline padding, `.ant-card + .ant-card` gap, `.ant-breadcrumb` inset, `.ant-form-item` vertical rhythm |
| `src/prescriptions/prescription-preview.css` | Replaced `padding: 20px` → `var(--spacing-page)`, `margin-bottom: 18px` on cards → `var(--spacing-section)`, `margin-bottom: 14px` on alerts → `var(--space-3)` |
| `src/suppliers/pharmacy.css` | Replaced `padding: 16px 24px` → `var(--space-4) var(--spacing-page)`, `margin-bottom: 12px` header → `var(--space-3)`, `margin-bottom: 20px` search bar → `var(--space-5)`, `gap: 12px` → `var(--space-3)` |
| `src/patientmangement/bedarrangement/beds.css` | Replaced oversized `padding: 40px` → `var(--spacing-page)` — was creating excessive dead space on the bed arrangement page |
| `src/dashboard.tsx` | Magic number `+ 12` confirmed absent from current code — already clean |

---

## 8. Color Consistency Review

| Severity | Finding | Detail |
|---|---|---|
| **Critical** | Ant Design theme not configured | No `ConfigProvider` — all Ant components use default blue; global CSS overrides fight the library |
| **Critical** | 4 different green hover shades | `#20b858`, `#1fb857`, `#16a34a`, `#15803d` — no canonical hover colour |
| **High** | 3 different muted-text greys | `#6B7280`, `#374151`, `#667085` |
| **High** | 3 different page background whites | `#F9FAFB`, `#f8fafc`, `#f8fff9` |
| **High** | Status colours not standardised | `getStatusColor` function defined independently per file |

### ✅ Fixed (Critical)

| File | What changed |
|---|---|
| `src/App.tsx` | Added `ConfigProvider` wrapping the entire app with `theme.token`: `colorPrimary: '#25D366'`, `colorPrimaryHover: '#20b858'`, `borderRadius: 8`, `fontFamily: 'Roboto'`. Ant Design now uses the brand green natively — no more CSS-in-JS vs `!important` fights |
| `src/index.css` | Added `--color-primary-hover: #20b858` as the single canonical hover shade. Shades `#1fb857`, `#16a34a`, `#15803d` were already absent from the codebase — confirmed clean |

---

## 9. Icon Review

| Severity | File | Issue |
|---|---|---|
| **High** | Multiple files | Emojis used as icons (`✔`, `📍`, `🛡`, `⚠`) — do not inherit colour, scale badly, read verbatim by screen readers |

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

### ✅ Fixed (Critical)

| File | What changed |
|---|---|
| `src/appointment-step/features/first-step-appointment.tsx` | Added `rules` to all 8 fields: Name (required), Blood Group (required), Age (required + number 0–150), Phone (required + 10-digit regex), Gender (required), Email (optional + email format), Weight (optional + number 0–500), Address (required). Form now blocks submission on any invalid/empty required field |
| `src/employees/add-employee/add-employee.tsx` | Added `rules` to all required personal and employee fields: First Name (required), Last Name (required), Gender (required), Date of Birth (required), Mobile (required + 10-digit regex), Email (required + email format), Address (required), Department (required). `handleCreateEmployee` already calls `form.validateFields()` so invalid submissions are blocked |
| `src/signup-step/features/third-step/third-step.tsx` | Replaced `first_name: 'random'` and `last_name: 'shit'` fallbacks with `first_name: ''` and `last_name: ''` using nullish coalescing (`??`) |

---

## 11. Table Review

| Severity | File | Issue |
|---|---|---|
| **Critical** | `patient-list.tsx` | Search input has no `onChange` handler — completely non-functional |
| **High** | `patient-list.tsx` | Total count shows `response?.data?.length` (page size) not `response?.total` — incorrect count displayed |
| **High** | `patient-list.tsx`, `prescription-details.tsx` | No empty state defined — falls back to Ant Design default "No data" text |
| **High** | `prescription-details.tsx` | Search and filter buttons (All / Sent / Pending) have no state or handlers |

---

## 12. Modal & Drawer Review

| Severity | File | Issue |
|---|---|---|
| **High** | `add-permission.tsx` | Modal `width={900}` overflows viewport on mobile |
| **High** | `beds.tsx` | `cancelButtonProps={{ display: 'none' }}` hides Cancel — accessibility violation |
| **High** | `add-prescription.tsx` | `<Sider>` used as form panel — cannot be dismissed; collapses to `0` on `lg` breakpoint, hiding form |
| **High** | Multiple files | Destructive actions (Delete medicine, Discard Order) have no `Popconfirm` confirmation |

### ✅ Fixed

| File | What changed |
|---|---|
| `src/employees/add-permissions/add-permission.tsx` | Modal `width` → `min(900px, 95vw)` — no viewport overflow on mobile (also listed in §2 Responsive) |
| `src/patientmangement/bedarrangement/beds.tsx` | Removed hidden Cancel via `cancelButtonProps`; success modal uses custom `footer` with a single accessible **Done** button |
| `src/prescriptions/add-prescription.tsx` | Replaced `<Sider>` with desktop sidebar `div` + mobile `<Drawer>` (`Grid.useBreakpoint`, opens via **Add Medicine** button); form no longer collapses to `0` |
| `src/prescriptions/add-prescription.tsx` | Delete medicine button wrapped in `<Popconfirm>` with danger confirmation |
| `src/prescriptions/prescription-preview.tsx` | Discard Order uses `Modal.confirm` danger dialog (also listed in §3 CTA) |

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

---

## 14. Empty State Review

| Severity | Page | Current Empty State |
|---|---|---|
| **Critical** | Employee list | No list rendered at all (shell page) |
| **Critical** | Supplier list | Static mock data only |
| **High** | Patient list | Ant default "No data" |
| **High** | Prescription list | Ant default "No data" |
| **High** | Bed preview table | No message |
| **High** | Permission modal | No message if modules empty |

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
| **High** | App-wide | No `:focus-visible` CSS styles defined beyond browser defaults |

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

---

## 19. Theme Review

| Severity | Finding | Detail |
|---|---|---|
| **Critical** | No `ConfigProvider` | Ant Design 5 theme is not configured — brand colour applied via global CSS `!important` hacks |
| **Critical** | No design token file | No `theme.ts`, no CSS custom properties (`:root` variables), no Ant `token` overrides |
| **High** | Dark mode incompatible | All colours are hardcoded hex — dark mode would require a full CSS rewrite |
| **High** | `index.css` | Global `!important` overrides on `.ant-btn-primary` fight Ant's internal cascade on every button |

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

---

## 21. Naming Convention Review

| Severity | Finding | Detail |
|---|---|---|
| **High** | Folder typo | `patientmangement` → should be `patient-management` |
| **High** | Interfaces not PascalCase | `loginPayload`, `loginResponse`, `bedAllotment`, `patientlist`, `medicineResponse`, `createPrescResponse` |
| **High** | Prop casing inconsistency | `OnNext` vs `onNext`, `OnUpdate` vs `onBack` — should all be camelCase |
| **High** | File vs export name mismatches | `pharmacy.tsx` exports `AddPharmacy`; `prescription-details.tsx` exports `PrescriptionList`; `first-step-appointment.tsx` exports `FirstStep` |
| **High** | CSS class naming chaos | `button-row` vs `button-row1`, `search-input1`, `custom-primary-btn` vs `appointment-button` — no naming system |

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

---

---

## 26. Apple Typography Implementation Plan

> Addresses severity items from **Section 6 (Typography Review)**. Covers font family replacement and a consistent type scale applied per-component.

---

### Font Stack Replacement

**Single change point: `src/index.css`**

Replace every occurrence of `font-family: 'Roboto', sans-serif` with:

```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text",
             "Helvetica Neue", Helvetica, Arial, sans-serif;
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
```

Additional files that hardcode `font-family: 'Roboto'` and need the same replacement:

| File | Location |
|---|---|
| `src/sidebar.css` | `.logo-layout span` and `.ant-menu-item > .ant-menu-title-content` |
| `src/header.css` | `.ant-dropdown-menu .ant-dropdown-menu-title-content` |
| `src/authentication/Login.css` | `.login-card h2` |
| `src/patientmangement/patientlist/patient-list.css` | `.search-input1 .ant-input` (appears twice) |
| `src/dashboard.css` | `h3` global selector (`font-style: 'Roboto'` — also invalid CSS, must be fixed) |

---

### Global Type Scale to Add to `src/index.css`

```css
h1 { font-size: 28px; font-weight: 700; line-height: 1.2;  letter-spacing: -0.02em; }
h2 { font-size: 22px; font-weight: 600; line-height: 1.25; letter-spacing: -0.01em; }
h3 { font-size: 17px; font-weight: 600; line-height: 1.3; }
h4 { font-size: 15px; font-weight: 600; line-height: 1.4; }
p  { font-size: 15px; font-weight: 400; line-height: 1.6; color: #1d1d1f; }
```

---

### Per-File Changes

#### `src/sidebar.css`

| Class | Current | Target |
|---|---|---|
| `.logo-layout span` | `font-family: 'Roboto'; font-size: 16px` | Remove `font-family`, keep `16px` |
| `.ant-menu-item > .ant-menu-title-content` | `font-family: 'Roboto'; font-size: 14px` | Remove `font-family`, keep `14px` |

---

#### `src/header.css`

| Class | Current | Target |
|---|---|---|
| `.account-class h3` | `font-size: 16px` | Change to `15px` (sub-header / user name display) |
| `.ant-dropdown-menu .ant-dropdown-menu-title-content` | `font-family: 'Roboto'; font-size: 14px` | Remove `font-family`, keep `14px` |

---

#### `src/dashboard.css`

| Class | Current | Target |
|---|---|---|
| `h3` (global override at line 60) | `font-size: 14px; font-style: 'Roboto'` | **Remove entirely** — conflicts with global scale; use a scoped class |
| `.title-class h3` | `font-size: 14px` | Change to `13px` (card label / secondary) |
| `.special-card h2` | no font-size set | Add `font-size: 22px; font-weight: 600` (section heading) |

---

#### `src/authentication/Login.css`

| Class | Current | Target |
|---|---|---|
| `.login-card h2` | `font-family: 'Roboto'; font-weight: bold` | Remove `font-family: 'Roboto'` — inherits global `h2` scale (22px / 600) |
| `.auth-links` | `font-size: 14px` | Change to `13px` (secondary / helper text) |

---

#### `src/signup.css`

| Class | Current | Target |
|---|---|---|
| `.app-title` | `font-size: 16px; font-weight: 600` | Change to `17px` (app title / brand name) |

---

#### `src/employees.css`

| Class | Current | Target |
|---|---|---|
| `.upload-text` | `font-size: 12px` | Keep — caption / hint text |
| `.role-title` | `font-size: 13px; font-weight: 600` | Keep — field label |
| `.preview-id` | `font-size: 12px` | Keep — tag / timestamp |

No font-family overrides needed in this file.

---

#### `src/patientmangement/patientlist/patient-list.css`

| Class | Current | Target |
|---|---|---|
| `.search-input1 .ant-input` | `font-family: 'Roboto'; font-size: 14px` | Remove `font-family`, keep `14px` |
| `.column-layout` | no font-size | Add `font-size: 12px; font-weight: 600` (table column header) |
| `.tag-layout` | `font-size: 14px` | Change to `13px` (status tag) |
| `.pagination-tab h3` | `font-size: 14px` | Change to `13px` (count badge — not a heading) |

---

#### `src/patientmangement/patient-appointment/appointment-list.css`

| Class | Current | Target |
|---|---|---|
| `.page-header h4.ant-typography` | `font-size: 20px; font-weight: 600` | Change to `22px` (page title — use `h2` scale) |
| `.page-header .ant-typography-secondary` | `font-size: 12px` | Keep — subtitle / secondary |
| `.ant-table-thead > tr > th` | `font-size: 12px; font-weight: 600; text-transform: uppercase` | Keep — table column headers are correct |
| `.patient-name` | `font-size: 14px` | Change to `15px` (primary cell data) |
| `.doctor-name` | `font-size: 14px` | Change to `15px` |
| `.time-text` | `font-size: 12px` | Keep — secondary / metadata |
| `.sub-text` | `font-size: 10px` | Change to `11px` (Apple minimum) |
| `.next-tag` | `font-size: 8px` | Change to `10px` (Apple minimum) |

---

#### `src/patientmangement/singlepatientdetail/patient-profile.css`

| Class | Current | Target |
|---|---|---|
| `.patient-main-info h2` | `font-size: 20px; font-weight: 700` | Change to `22px` (patient name — page-level heading) |
| `.card-title h3` | `font-size: 15px; font-weight: 600` | Change to `17px` (card section heading — use `h3` scale) |
| `.info-grid label` | `font-size: 11px; font-weight: 700; text-transform: uppercase` | Keep — Apple-correct field label style |
| `.info-grid p` | `font-size: 14px; font-weight: 500` | Change to `15px` (body / field value) |
| `.patient-meta-grid` | `font-size: 13px` | Keep — secondary metadata |
| `.patient-tabs span` | `font-size: 13px` | Keep — navigation tabs |

---

#### `src/prescriptions/prescription-details.css`

| Class | Current | Target |
|---|---|---|
| `.page-title` | `font-size: 20px !important; font-weight: 600 !important` | Change to `22px` (page heading) |
| `.search-input .ant-input` | `font-size: 14px` | Change to `15px` |
| `.prescription-table .ant-table` | `font-size: 14px` | Change to `15px` |
| `.prescription-table .ant-table-thead > tr > th` | `font-size: 12px; font-weight: 600` | Keep — table column header |
| `.more-tag` | `font-size: 11px` | Keep — tag |
| `.status-tag` | `font-size: 14px` | Change to `13px` (status tag) |

---

#### `src/suppliers/pharmacy.css` (Prescription Preview)

| Class | Current | Target |
|---|---|---|
| `.patient-name` | `font-size: 16px` | Change to `17px` (patient heading) |
| `.patient-subtext` | `font-size: 13px` | Keep — secondary info |
| `.info-label` | `font-size: 11px; font-weight: 600` | Keep — Apple-correct field label |
| `.table-title` | `font-size: 15px` | Change to `17px` (section heading — `h3` scale) |
| `.medicine-table .ant-table` | `font-size: 13px` | Change to `14px` |
| `.medicine-table thead th` | `font-size: 11px; font-weight: 700` | Keep — column header |
| `.medicine-name` | `font-size: 14px; font-weight: 600` | Change to `15px` |
| `.medicine-generic` | `font-size: 11px` | Keep — generic / secondary label |
| `.schedule-tag` | `font-size: 10px` | Change to `11px` (Apple minimum) |
| `.summary-row` | `font-size: 13px` | Keep — billing summary |
| `.dispense-btn` | `font-size: 12px; font-weight: 600` | Change to `13px` |

---

#### `src/suppliers/pharmacy.css` (Supplier Grid)

| Class | Current | Target |
|---|---|---|
| `.subtitle` | `font-size: 14px` | Change to `13px` (page subtitle) |
| `.supplier-title` | `font-size: 15px` | Change to `17px` (supplier card name — `h3` scale) |
| `.supplier-info` | `font-size: 13px` | Keep — secondary info |
| `.contracts-label` | `font-size: 12px` | Keep — label |
| `.footer-text` | no font-size set | Add `font-size: 13px` |

---

### Quick Reference Summary

| Action | Files Affected |
|---|---|
| Replace `font-family: 'Roboto'` | `index.css`, `sidebar.css`, `header.css`, `Login.css`, `patient-list.css`, `dashboard.css` |
| Page titles → `22px / 600` | `appointment-list.css`, `prescription-details.css`, `patient-profile.css` |
| Card / section headings → `17px / 600` | `patient-profile.css`, `pharmacy.css`, `header.css` |
| Body / primary cell text → `15px` | `appointment-list.css`, `prescription-details.css`, `pharmacy.css`, `patient-profile.css` |
| Secondary / helper text → `13px` | `suppliers/pharmacy.css`, `Login.css`, `patient-list.css` |
| Status tags → `13px` | `prescription-details.css`, `patient-list.css`, `pharmacy.css` |
| Minimum tag size → `11px` | `appointment-list.css`, `pharmacy.css` |
| Table column headers `12px uppercase 600` | Already correct — keep as-is |
| Field labels `11px uppercase 700` | Already correct — keep as-is |

---

*Filtered from AUDIT_REPORT.md — Critical and High severity only.*
