# Clinic Overview Dashboard — Product & UI Requirements

> **Purpose:** Design-ready requirements for the Overview (`/dashboard`) screen.  
> Use this document as the single source of truth for UI AI platforms (Figma AI, Galileo, v0, Lovable, etc.) and for engineering implementation later.  
> **Scope of this pass:** Requirements and design specs only — do not implement `src/dashboard.tsx` from this doc alone.

---

## 1. Product context

### 1.1 What we are building

A **multi-tenant clinic OS** for niche outpatient clinics (dermatology / skin, dental / teeth, orthopedics / bones, and similar specialty practices). The product is **not** a full hospital command center (no ICU census, no multi-ward bed boards as primary surfaces).

The Overview dashboard is the **home screen after login** — a “day board” that helps staff run today’s clinic: who is waiting, who is in consult, what still needs a prescription, what money is pending, and (when live) what stock is at risk.

### 1.2 Current product state (ground truth)

| Module | Status | Primary routes |
|--------|--------|----------------|
| Patients | Live | `/patients`, `/patients/add-patient`, `/patients/patient-overview/:patientID` |
| Appointments | Live | `/appointments`, `/appointment/preview/:appointmentID`, `/patients/addappointment/:patientID` |
| Prescriptions | Live | `/prescription`, `/prescription/add-prescription/:appointmentID`, `/prescription/:id` |
| Payments / billing | In progress | Patient profile has Billing tab stub only |
| Medicine inventory / GRN | In progress | `/suppliers` (mock); fill-stock + inventory dashboard specified in `medicine-stock-fill-design.md` |
| Overview dashboard | Stub | `/dashboard` — static mock in `src/dashboard.tsx` |
| Beds / inpatient | Deprioritized | Hide or disable in nav per `requirement.md` |

### 1.3 Product principles for Overview

1. **Action over analytics** — every KPI drills into a list or workflow; no vanity charts without click targets.
2. **Today-first** — default filter is “today” for the logged-in organisation.
3. **Progressive disclosure** — payments and inventory widgets appear when those modules are enabled; never show empty fake numbers.
4. **Specialty-agnostic core + niche plugins** — core widgets work for any clinic; specialty packs (skin / dental / ortho) mount in a reserved plugin slot.
5. **Role-aware layout, one route** — same `/dashboard` URL; widget set changes by role (Admin / Front desk / Doctor / Pharmacist).

### 1.4 Explicitly out of scope (V1)

- Hospital bed occupancy, ICU, ward census
- Multi-location rollup analytics (single org location for V1)
- Custom report builder / BI exports
- Patient-facing portal widgets
- Replacing dedicated list pages (appointments, patients, Rx remain canonical)

---

## 2. Brand, shell, and design system

### 2.1 App shell (must match existing product)

```
┌──────────┬────────────────────────────────────────────────────────────┐
│          │  Header: page title “Overview” | date | search | notif | user │
│ Sidebar  ├────────────────────────────────────────────────────────────┤
│ Overview │                                                            │
│ Patients │                     Dashboard content                      │
│ Appoint. │                                                            │
│ Prescrip.│                                                            │
│ …        │                                                            │
└──────────┴────────────────────────────────────────────────────────────┘
```

- **Sidebar:** collapsible Ant Design `Sider` (240px / 60px), existing nav labels: Overview, Patients, Appointments, Prescription, etc.
- **Header:** reuse `HeaderLayout` patterns — notifications, user menu.
- **Content padding:** align with existing `content-layout` pages.
- **Stack:** React + Ant Design 5 + existing CSS tokens.

### 2.2 Design tokens (locked)

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#25D366` | CTAs, active nav, success accents |
| Primary hover | `#20b858` | Button hover |
| Border radius | `8px` | Cards, inputs, buttons |
| Font | `'Roboto', sans-serif` | All UI text |
| Status green | success / in-stock / completed | Ant Design success |
| Status amber | warning / low stock / waiting | Ant Design warning |
| Status red | error / out of stock / missed / failed payment | Ant Design error |
| Status blue/info | ongoing / in consult | Ant Design processing |
| Neutral bg | light gray page background (existing app) | Content area |

**Do not use (AI design bias to avoid):**

- Purple / indigo gradient themes
- Warm cream `#F4F1EA` + terracotta + serif display
- Dark-mode-first layouts
- Glow effects, multi-layer shadows, emoji as UI
- Pill clusters of unrelated stats in the hero

### 2.3 Visual density

Clinic ops UI: **medium-dense**. Prefer compact list rows and KPI chips over large marketing cards. First viewport must answer: *What needs attention right now?*

---

## 3. Personas and goals

### 3.1 Clinic admin / owner (primary V1)

**Goals:** See clinic health for today — volume, completions, collections, stock risk. Spot bottlenecks (long waits, missed slots, unpaid bills).

**Success:** Within 10 seconds, know if the day is on track and what to escalate.

### 3.2 Front desk / receptionist (primary V1, shared day board)

**Goals:** Check in patients, manage queue, book next appointments, collect payment, find patients fast.

**Success:** Never leave Overview to answer “who’s next?” or “where is this patient?”

### 3.3 Doctor / clinician

**Goals:** See my queue, start consult, finish prescriptions before patient leaves, see follow-ups due (specialty).

**Success:** One click from “next patient” → appointment preview → start → add prescription.

### 3.4 Pharmacist

**Goals:** Low stock, expiring batches, pending GRNs, prescriptions waiting to dispense.

**Success:** Overview surfaces pharmacy alerts; deep work happens on inventory / Rx screens (see `medicine-stock-fill-design.md`).

---

## 4. Information architecture

### 4.1 Route

| Item | Value |
|------|-------|
| Path | `/dashboard` |
| Nav label | Overview |
| Auth | `AuthGuard` (access token) |
| Org scope | `organisationID` from localStorage |

### 4.2 Widget → deep-link map

| Widget / action | Destination |
|-----------------|-------------|
| KPI: Today’s appointments | `/appointments` with today + status filters |
| Queue row / next appointment | `/appointment/preview/:appointmentID` |
| Start consult (from queue) | Update status → `ongoing`, then `/prescription/add-prescription/:appointmentID` |
| Draft prescriptions | `/prescription` filtered to `draft` |
| Prescription row | `/prescription/:id` |
| Add patient | `/patients/add-patient` |
| Book appointment (existing patient) | `/patients/addappointment/:patientID` or appointments flow |
| Patient search result | `/patients/patient-overview/:patientID` |
| Pending payments (P1) | Billing list / patient billing tab (when built) |
| Low stock / expiring / pending GRN (P2) | `/pharmacy/inventory` or `/suppliers` fill-stock (per inventory design) |
| Specialty follow-up row | Patient overview or appointment create |

### 4.3 Role → widget visibility matrix

| Widget | Admin | Front desk | Doctor | Pharmacist |
|--------|:-----:|:----------:|:------:|:----------:|
| Global patient search | Y | Y | Y | Y |
| Today at a glance (KPIs) | Y | Y | Y (own) | Partial |
| Live queue / now serving | Y | Y | Y (own) | N |
| Next appointments | Y | Y | Y (own) | N |
| Draft / pending Rx | Y | Y | Y (own) | Y (dispense) |
| Quick actions | Y | Y | Y | Limited |
| Today’s collections | Y | Y | N | N |
| Pending payments | Y | Y | N | N |
| Payment alerts | Y | Y | N | N |
| Low stock / expiring / GRN | Y | N | Alert only | Y |
| Specialty plugin slot | Y | Y | Y | N |

*(own) = filtered to logged-in doctor_id when role is Doctor.*

---

## 5. Screen inventory

| Screen ID | Name | Viewport | Priority |
|-----------|------|----------|----------|
| DASH-01 | Overview — Admin / Front desk | Desktop ≥1280 | P0 |
| DASH-02 | Overview — Doctor | Desktop ≥1280 | P0 |
| DASH-03 | Overview — Pharmacist | Desktop ≥1280 | P2 (with inventory) |
| DASH-04 | Overview — Tablet / iPad | 768–1024 | P0 (responsive) |
| DASH-05 | Overview — Specialty pack example (Dermatology) | Desktop | P3 |

Design **DASH-01** as the master frame. Derive other roles by showing/hiding widgets, not by inventing a different visual language.

---

## 6. Layout wireframe (textual)

### 6.1 Desktop — Admin / Front desk (DASH-01)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ HEADER: Overview · Friday, 10 Jul 2026 · [Search patients…] · 🔔 · Avatar   │
├──────────────────────────────────────────────────────────────────────────────┤
│ KPI STRIP (4–5 equal cards, single row)                                      │
│ [Scheduled 18] [Ongoing 2] [Completed 11] [Missed 1] [Waiting 4]            │
├───────────────────────────────────┬──────────────────────────────────────────┤
│ MAIN (≈65%)                       │ RIGHT RAIL (≈35%)                        │
│                                   │                                          │
│ A. Live queue / Now serving       │ D. Quick actions                         │
│    (list, max ~8 visible)         │    Add patient | Book appt | New Rx*     │
│                                   │                                          │
│ B. Next appointments (next 5)     │ E. Draft / pending prescriptions         │
│                                   │                                          │
│ C. Specialty plugin slot          │ F. Payments block (P1)                   │
│    (hidden if no specialty)       │    Today’s collections + pending         │
│                                   │                                          │
│                                   │ G. Inventory alerts (P2)                 │
│                                   │    Low / Expiring / Pending GRN          │
└───────────────────────────────────┴──────────────────────────────────────────┘
```

\*New Rx only when an ongoing appointment is selected or from queue action.

### 6.2 Desktop — Doctor (DASH-02)

```
│ KPI: My scheduled | My ongoing | My completed | My drafts Rx                 │
│ MAIN: My queue (large) + Next 5 (mine)                                       │
│ RAIL: Quick start consult | Draft Rx | Specialty follow-ups                  │
│ Hide: collections, pending payments, full inventory (optional low-stock chip)│
```

### 6.3 Desktop — Pharmacist (DASH-03)

```
│ KPI: Low stock | Expiring 30d | Pending GRN | Rx awaiting dispense           │
│ MAIN: Alert lists (stock + Rx to dispense)                                   │
│ RAIL: Quick → Fill stock | Inventory | Prescription list                     │
```

### 6.4 Tablet / iPad (DASH-04)

- KPI strip wraps to 2 rows (2–3 cards per row).
- Main + rail stack vertically: Queue → Next → Rx drafts → Quick actions → Payments → Inventory.
- Search remains sticky under header.
- Touch targets ≥ 44px height for primary row actions.

### 6.5 First-viewport content budget

Above the fold on desktop should include:

1. Search  
2. KPI strip  
3. Live queue (at least 3–4 rows)  
4. Quick actions  

Do **not** put large charts, marketing banners, or more than one specialty promo block above the fold.

---

## 7. Component-level specifications

### 7.0 Shared interaction rules

- Every list row is clickable (entire row) unless a nested button captures the click.
- Primary row action buttons use primary green; secondary use default/ghost.
- Loading: Ant Design `Skeleton` or `Spin` inside the widget card — never blank white.
- Empty: short sentence + one CTA (e.g. “No appointments today” + “Book appointment”).
- Error: inline alert “Couldn’t load. Retry” with retry control; do not toast-only.
- Refresh: soft auto-refresh every 60s for queue/KPIs **or** manual refresh icon in header; document both, implement one consistently.

---

### 7.1 Global patient search (header or top bar)

| Field | Spec |
|-------|------|
| **ID** | `W-SEARCH` |
| **Purpose** | Fastest path to a patient record |
| **Placeholder** | “Search by name, UHID, or phone” |
| **Behavior** | Debounced typeahead (300ms); show up to 8 results |
| **Result row** | `patient_name` · `patient_code` (UHID) · `patient_phone` · age/gender |
| **Click** | Navigate to `/patients/patient-overview/:patientID` |
| **Empty query** | No dropdown |
| **No results** | “No patients found” + link “Add new patient” |
| **Keyboard** | ↑↓ select, Enter open, Esc close |
| **Roles** | All |

**Data fields:** `patient_id`, `patient_code`, `patient_name`, `patient_phone`, `patient_age`, `patient_gender` from patients API.

---

### 7.2 Today at a glance (KPI strip)

| Field | Spec |
|-------|------|
| **ID** | `W-KPI` |
| **Purpose** | Instant clinic pulse for today |
| **Layout** | Horizontal equal-width cards (5 on desktop; wrap on tablet) |
| **Metrics** | See table below |
| **Click** | Each card navigates to `/appointments` with matching status + today’s date |
| **Loading** | Skeleton bars inside each card |
| **Empty day** | All zeros still shown; queue empty state handles narrative |

| KPI key | Label | Appointment statuses counted | Color accent |
|---------|-------|------------------------------|--------------|
| `scheduled` | Scheduled | `scheduled`, `upcoming` | Neutral / primary |
| `ongoing` | In consult | `ongoing` | Blue / processing |
| `completed` | Completed | `completed` | Green |
| `missed` | Missed | `missed` | Red |
| `waiting` | Waiting | Derived: scheduled + arrived/waiting flag if available; else use patients with waiting context / front-desk check-in — **V1:** count `scheduled` where `start_time` has passed and status not ongoing/completed, **or** show “Waiting” from check-in when that field exists | Amber |

**Optional 6th KPI (Admin only, P1):** `collections_today` — currency total (see payments).

**Doctor variant:** same labels prefixed mentally as “My …” and filtered by `doctor_id`.

**Copy examples:**

- Card title: `In consult`
- Value: `2`
- Subtext (optional): `of 18 today`

---

### 7.3 Live queue / Now serving

| Field | Spec |
|-------|------|
| **ID** | `W-QUEUE` |
| **Purpose** | Operational queue for front desk and doctors |
| **Section title** | “Live queue” |
| **Subtitle** | “Today · sorted by time” |
| **Max visible** | 8 rows + “View all appointments” link → `/appointments` |
| **Sort** | `ongoing` first, then by `start_time` ascending |

**Row content:**

| Element | Source |
|---------|--------|
| Time range | `start_time` – `end_time` |
| Patient name | `patient_name` |
| Meta | age/gender if available; else phone `mobile_no` |
| Doctor | `doctor_name` (hide on Doctor role view of own queue) |
| Visit type chip | `visit_type`: `new_patient` → “New”, `follow_up` → “Follow-up”, `opd` → “OPD” |
| Status chip | `status` mapped to colors (see §8.2) |
| `next` flag | If `next === true`, show subtle “Next” marker |

**Row actions (by role):**

| Action | Admin / Front desk | Doctor |
|--------|--------------------|--------|
| Open details | Always | Always |
| Check in / mark waiting | Yes (when status allows) | No |
| Start consult | Yes | Yes (primary) |
| Cancel / reschedule | Yes | No (or request only) |

**Start consult flow:**

1. Confirm if needed (optional modal: “Start consult for {patient}?”).
2. `PATCH` status → `ongoing`.
3. Navigate to `/prescription/add-prescription/:appointmentID`.

**States:**

| State | UI |
|-------|-----|
| Loading | 4 skeleton rows |
| Empty | Illustration or simple empty: “No patients in queue” + CTA “Book appointment” |
| Error | Alert + Retry |
| Populated | List as specified |

---

### 7.4 Next appointments

| Field | Spec |
|-------|------|
| **ID** | `W-NEXT` |
| **Purpose** | Prep for upcoming slots (procedures, chair time, casting) |
| **Title** | “Up next” |
| **Count** | Next 5 appointments with `start_time` ≥ now and status in `scheduled` / `upcoming` |
| **Row** | Time · Patient · Doctor · Visit type |
| **Click** | `/appointment/preview/:appointmentID` |
| **Empty** | “No more appointments today” |

---

### 7.5 Draft / pending prescriptions

| Field | Spec |
|-------|------|
| **ID** | `W-RX` |
| **Purpose** | Close consult loop before patient leaves; pharmacist prep |
| **Title** | “Prescriptions needing attention” |
| **Filters** | Statuses: `draft`, `pending` (and `sent` awaiting dispense for pharmacist) |
| **Row** | `code` · patient name if available · `prescribed_by` · `prescription_date` · status chip |
| **Click** | `/prescription/:id` or continue edit via appointment if draft tied to appointment |
| **CTA** | “View all” → `/prescription` |
| **Empty** | “All prescriptions are up to date” |
| **Badge** | Count on section title |

**Pharmacist variant:** prioritize `sent` / awaiting dispense; action “Open to dispense”.

---

### 7.6 Quick actions

| Field | Spec |
|-------|------|
| **ID** | `W-QA` |
| **Purpose** | One-tap entry into highest-frequency workflows |
| **Layout** | Vertical stack of large touch-friendly buttons or icon+label tiles (2×2 grid acceptable) |
| **Title** | “Quick actions” |

| Action | Label | Route / behavior | Roles |
|--------|-------|------------------|-------|
| Add patient | Add new patient | `/patients/add-patient` | Admin, Front desk, Doctor |
| Book appointment | Book appointment | Opens patient picker then `/patients/addappointment/:patientID`, or appointments create flow | Admin, Front desk |
| View today’s appointments | Today’s schedule | `/appointments` today | All clinical |
| Fill stock | Receive stock | `/suppliers` or fill-stock (P2) | Pharmacist, Admin |
| Inventory | Inventory | `/pharmacy/inventory` (P2) | Pharmacist, Admin |

**Visual:** One primary tile (Add patient) uses green filled button; others outline/default. Do not use a decorative “add.png” hero as the only affordance — keep it a clear button/tile.

---

### 7.7 Payments block (Phase 1)

| Field | Spec |
|-------|------|
| **ID** | `W-PAY` |
| **Purpose** | Cashflow awareness for private niche clinics |
| **Visibility** | Hidden until payments module flag enabled; show “Coming soon” skeleton **only** if product wants teaser — prefer hide |
| **Title** | “Payments today” |

**Sub-components:**

1. **Today’s collections**
   - Total amount (₹)
   - Breakdown chips: Cash / UPI / Card / Other
   - Click → payments/collections report (future route)

2. **Pending payments**
   - Count + total unpaid amount
   - List top 5: patient name · amount · appointment/service · age of debt
   - Click row → patient billing / collect payment flow
   - CTA: “Collect payment”

3. **Alerts strip** (when gateway live)
   - Failed transactions count
   - Refunds pending count
   - Red/amber badges; click → payment ops list

**Empty:** “No collections yet today”  
**Loading / error:** standard shared rules  

**Placeholder data contract (future API):**

```ts
interface DashboardPaymentsSummary {
  organisation_id: string;
  date: string; // YYYY-MM-DD
  collected_total: number;
  currency: "INR";
  by_method: { method: "cash" | "upi" | "card" | "other"; amount: number }[];
  pending_count: number;
  pending_total: number;
  failed_count: number;
  refunds_pending_count: number;
}
```

---

### 7.8 Inventory alerts (Phase 2)

Align with **Pharmacist Inventory Dashboard** in `medicine-stock-fill-design.md` §6. Overview shows a **compact alert widget**, not the full inventory table.

| Field | Spec |
|-------|------|
| **ID** | `W-INV` |
| **Title** | “Pharmacy alerts” |
| **KPIs (mini)** | Low stock count · Expiring in 30 days · Pending GRN |
| **Lists** | Top 5 low-stock SKUs; top 5 expiring; link to pending GRNs |
| **Status chips** | Reuse prescription stock pattern: In Stock (green) / Low (amber) / Out (red) |
| **CTAs** | “Open inventory” → `/pharmacy/inventory`; “Fill stock” → suppliers fill-stock flow |
| **Roles** | Pharmacist (full), Admin (full), Doctor (optional single “Low stock affecting Rx” chip) |

**Row (low stock):** medicine name · on-hand · reorder level · status  
**Row (expiring):** medicine name · batch · expiry date · days left  

**Cross-links:**

- Full inventory UX: `medicine-stock-fill-design.md` §6  
- GRN / Fill Stock: `medicine-stock-fill-design.md` §4–5  
- Existing mock suppliers: `/suppliers`  
- Stock chips already used in `src/prescriptions/prescription-preview.tsx`

---

### 7.9 Specialty plugin slot (Phase 3)

| Field | Spec |
|-------|------|
| **ID** | `W-SPEC` |
| **Purpose** | Niche clinic differentiators without forking the whole dashboard |
| **Placement** | Bottom of main column (or second row under queue on wide screens) |
| **Config** | Org setting `clinic_specialty`: `general` \| `dermatology` \| `dental` \| `orthopedics` |
| **If `general`** | Slot hidden |
| **Chrome** | Section title from pack; same card/list grammar as core widgets |

Full Dermatology pack: §9. Dental / Ortho: §9.3–9.4 (same layout grammar).

---

## 8. Data contracts

### 8.1 Organisation & user context

```ts
// From localStorage / auth session
organisation_id: string;
user_id: string;
role: "admin" | "receptionist" | "doctor" | "pharmacist" | "nurse" | ...;
doctor_id?: string; // when role === doctor
clinic_specialty?: "general" | "dermatology" | "dental" | "orthopedics";
feature_flags?: {
  payments_enabled: boolean;
  inventory_enabled: boolean;
};
```

### 8.2 Appointment statuses (existing)

Canonical values used in app today:

| Status | Chip color | Queue priority |
|--------|------------|----------------|
| `scheduled` | Default | Normal |
| `upcoming` | Default | Normal |
| `ongoing` | Processing (blue) | Highest |
| `completed` | Success | Hidden from live queue |
| `cancelled` | Default muted | Hidden |
| `missed` | Error | Show in KPI; optional queue section |
| `reschedule_required` | Warning | Show in alerts if needed |

**Visit types:** `new_patient` | `follow_up` | `opd`

**Appointment list fields (from `AppointmentOrg`):**

- `appointment_id`, `appointment_code`
- `doctor_id`, `doctor_name`
- `patient_id`, `patient_name`
- `appointment_date`, `start_time`, `end_time`
- `visit_type`, `status`, `mobile_no`, `next`

**Preview extras:** `notes`, `medicines`, `patient_age`, `patient_gender`, `department_name`, `slot_duration`

### 8.3 Patient fields (existing)

From `patientlist`:

- `patient_id`, `patient_code`, `patient_name`
- `patient_age`, `patient_gender`, `patient_phone`, `patient_email`
- `patient_weight`, `patient_status`, `admission_date`
- `patient_address`, `patient_bg`, `waiting_time`, `patient_lvd`

### 8.4 Prescription fields (existing)

From `PrescriptionListItem`:

- `id`, `code`, `prescribed_by`, `prescription_date`, `status`
- UI statuses in use: `draft`, `sent`, `pending`, `dispensed`, `expired`
- List filters today: `all` | `draft` | `sent`

### 8.5 Suggested dashboard aggregate API (backend — future)

Prefer one endpoint for Overview to avoid N+1:

```
GET /api/v1/dashboard/overview?organisation_id=&date=&doctor_id?
```

```ts
interface DashboardOverviewResponse {
  date: string;
  kpis: {
    scheduled: number;
    ongoing: number;
    completed: number;
    missed: number;
    waiting: number;
  };
  queue: AppointmentOrg[];
  up_next: AppointmentOrg[];
  prescriptions_attention: PrescriptionListItem[];
  payments?: DashboardPaymentsSummary; // if enabled
  inventory?: {
    low_stock_count: number;
    expiring_30d_count: number;
    pending_grn_count: number;
    low_stock_preview: InventoryAlertItem[];
    expiring_preview: InventoryAlertItem[];
  };
  specialty?: SpecialtyPluginPayload;
}
```

Until this exists, frontend may compose from:

- Appointments by org (existing)
- Prescriptions list / by status (existing)
- Patients search (existing)
- Payments / inventory APIs when ready

### 8.6 Inventory alert item (align with stock design)

```ts
interface InventoryAlertItem {
  medicine_id: string;
  medicine_name: string;
  batch_no?: string;
  expiry_date?: string;
  on_hand: number;
  reorder_level?: number;
  status: "in_stock" | "low" | "out";
}
```

---

## 9. Specialty plugin system

### 9.1 Mounting rules

1. Core widgets always render (subject to role + feature flags).
2. Plugin pack loads only when `clinic_specialty` matches.
3. Plugins **add** widgets; they do not remove core queue/KPI.
4. Max **one** specialty pack active per organisation (V1).
5. Plugin widgets use the same card, list, chip, and empty-state patterns.

### 9.2 Dermatology / skin pack (fully specified for UI AI)

**Pack ID:** `specialty.dermatology`  
**Section title:** “Dermatology today”  
**Subtitle:** “Procedures, follow-ups, and consents”

#### Widget D1 — Today’s procedures

| Spec | Detail |
|------|--------|
| Purpose | Track procedure slots (peel, laser, biopsy, PRP, etc.) |
| Row | Time · Patient · Procedure type · Room/chair (optional) · Status |
| Procedure types (chips) | Chemical peel, Laser, Biopsy, Intralesional, Other |
| Actions | Open appointment; Mark complete |
| Empty | “No procedures scheduled today” |
| Data (future) | Appointment tagged `procedure_type` or linked service code |

#### Widget D2 — Follow-ups due

| Spec | Detail |
|------|--------|
| Purpose | Acne / post-procedure / chronic derm recalls |
| Row | Patient · Reason · Due date · Last visit · CTA “Book” |
| Sort | Overdue first, then due today |
| Click Book | `/patients/addappointment/:patientID` |
| Empty | “No follow-ups due” |

#### Widget D3 — Photo consent pending

| Spec | Detail |
|------|--------|
| Purpose | Clinical photography compliance before/after |
| Row | Patient · Appointment time · Consent status `pending` |
| Action | “Capture consent” → future consent flow or patient documents tab |
| Empty | “No pending consents” |
| Sensitivity | No thumbnail images on Overview — names/status only |

**Dermatology layout inside `W-SPEC`:**

```
┌─────────────────────────────────────────────┐
│ Dermatology today                           │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────┐ │
│ │ Procedures  │ │ Follow-ups  │ │ Consent │ │
│ │ (list)      │ │ (list)      │ │ (list)  │ │
│ └─────────────┘ └─────────────┘ └─────────┘ │
└─────────────────────────────────────────────┘
```

On tablet: stack the three lists vertically.

### 9.3 Dental pack (same grammar — summary for design variants)

**Pack ID:** `specialty.dental`  
**Section title:** “Dental floor”

| Widget | Content |
|--------|---------|
| Chair utilization | Chairs 1–N: Free / Occupied / Cleaning; patient name if occupied |
| Hygiene recalls due | Patient · last cleaning · due date · Book CTA |
| Lab cases outstanding | Patient · case type (crown, aligner, denture) · lab · due date · status |

### 9.4 Orthopedics / bones pack (summary)

**Pack ID:** `specialty.orthopedics`  
**Section title:** “Ortho today”

| Widget | Content |
|--------|---------|
| Cast / brace follow-ups due | Patient · type · apply date · due date · Book |
| Physio referrals pending | Patient · referral date · status |
| Imaging pending | Patient · modality (X-ray/MRI) · ordered date · status |

---

## 10. Visual / UX rules (for UI AI)

1. **Shell first:** Always show existing-style sidebar + header; do not invent a new navigation paradigm.
2. **Cards:** Use cards as interactive containers for widgets; avoid nested cards inside cards.
3. **Typography:** Roboto only. Section titles ~16–18px medium; KPI numbers ~28–32px semibold; row titles 14px; meta 12px secondary.
4. **Spacing:** 8px grid; widget gap 16px; page padding 16–24px.
5. **Chips:** Ant Design `Tag` style; status colors per §8.2; visit-type chips neutral outline.
6. **Icons:** Ant Design icons only (Calendar, User, MedicineBox, etc.) — no emoji.
7. **Imagery:** No stock photo heroes on Overview. Optional empty-state simple illustration in brand green/gray.
8. **Motion:** Subtle only — skeleton pulse, chip appear; no parallax or celebratory confetti.
9. **Accessibility:** Contrast AA for text on backgrounds; focus rings on interactive rows; do not rely on color alone for status (include label text).
10. **iPad:** Per `requirement.md` — usable in landscape; no horizontal page scroll; sticky search.

---

## 11. Phased rollout

### Phase 0 — Live data day board (ship first)

- Replace static `dashboard.tsx` mock
- Widgets: `W-SEARCH`, `W-KPI`, `W-QUEUE`, `W-NEXT`, `W-RX`, `W-QA`
- Role variants: Admin/Front desk + Doctor
- Compose from existing appointments / prescriptions / patients APIs
- Responsive tablet layout

### Phase 1 — Payments

- Enable `W-PAY` behind `payments_enabled`
- Today’s collections, pending list, failed/refund alerts when gateway supports them
- Deep links into billing collect flow

### Phase 2 — Inventory

- Enable `W-INV` behind `inventory_enabled`
- Align counts and previews with `medicine-stock-fill-design.md`
- Pharmacist Overview variant (DASH-03)
- Links to `/pharmacy/inventory` and Fill Stock / GRN

### Phase 3 — Specialty packs

- Org specialty setting
- Ship Dermatology pack fully
- Add Dental and Ortho packs with same slot
- Optional: specialty-specific quick actions

---

## 12. Acceptance criteria

### 12.1 Design acceptance (UI AI / design review)

- [ ] Desktop Admin/Front desk frame matches §6.1 structure
- [ ] Doctor and Pharmacist variants documented as alternate frames, same visual system
- [ ] Every widget has loading, empty, and populated examples
- [ ] KPI cards and queue rows show clear click affordance
- [ ] Specialty Dermatology pack designed inside plugin slot (not a separate app shell)
- [ ] Payments and inventory blocks designed as **optional** right-rail modules
- [ ] Brand green `#25D366`, Roboto, 8px radius — no purple/cream AI default theme
- [ ] iPad stacked layout provided
- [ ] No bed/ICU/hospital census widgets

### 12.2 Engineering acceptance (later implementation)

- [ ] No hardcoded patient names; all lists API-backed for P0 widgets
- [ ] Org scoped via `organisationID` from localStorage
- [ ] Queue “Start consult” updates status and routes to add prescription
- [ ] Feature flags hide payments/inventory until ready
- [ ] Deep links match §4.2
- [ ] Matches `frontend-os-readme.md` empty/loading/CTA standards

---

## 13. Copy-paste prompts for UI AI platforms

Use these prompts with this file attached or pasted.

### 13.1 Master desktop prompt (DASH-01)

```
Design a clinic operations Overview dashboard for a niche outpatient clinic OS (dermatology/dental/ortho capable).

App shell: left collapsible sidebar (Overview, Patients, Appointments, Prescription, …), top header with title “Overview”, today’s date, global patient search, notifications, user avatar.

Brand: primary green #25D366, Roboto, 8px corner radius, Ant Design-like medical SaaS, light gray content background. No purple gradients, no cream/serif editorial look, no dark mode, no emoji.

Layout (desktop 1440px):
1) KPI strip: 5 equal cards — Scheduled, In consult, Completed, Missed, Waiting — large numbers, clickable.
2) Main column (~65%): “Live queue” list (time, patient, doctor, visit-type chip, status chip, Start consult button on rows); below it “Up next” (5 rows); below that a specialty plugin section titled “Dermatology today” with three compact lists: Today’s procedures, Follow-ups due, Photo consent pending.
3) Right rail (~35%): Quick actions (Add new patient primary green, Book appointment, Today’s schedule); Prescriptions needing attention (draft/pending); Payments today (collections total + pending list); Pharmacy alerts (low stock, expiring, pending GRN).

Density: medium-compact ops UI. Cards as widget containers. Status chips with text labels. Show populated state with realistic Indian clinic sample data (names, ₹ amounts, UHID codes). Also provide empty and loading skeleton variants as separate frames.
```

### 13.2 Doctor variant prompt (DASH-02)

```
Using the same clinic Overview design system (#25D366, Roboto, sidebar shell), create the Doctor role variant:

- KPIs filtered to “My” appointments only
- Large Live queue for this doctor with primary “Start consult” actions
- Right rail: quick start, draft prescriptions, dermatology follow-ups
- Hide payments collections and full pharmacy inventory; optional single low-stock warning chip is OK
- Same visual language as the Admin day board — only widget set changes
```

### 13.3 Tablet prompt (DASH-04)

```
Adapt the Admin clinic Overview dashboard to iPad landscape (1024px) and portrait (768px):

- KPI cards wrap to 2 rows
- Main and right rail stack vertically
- Touch targets ≥44px
- Sticky patient search under header
- No horizontal scrolling
- Keep brand green #25D366 and Roboto
```

### 13.4 Pharmacist + inventory prompt (DASH-03)

```
Design Pharmacist Overview for the same clinic OS shell:

KPI row: Low stock | Expiring in 30 days | Pending GRN | Rx awaiting dispense
Main: alert lists for low/expiring stock and prescriptions to dispense
Right rail: Quick actions — Fill stock, Open inventory, Prescriptions list
Reuse stock status chips: In Stock (green), Low (amber), Out (red)
Align with goods-receipt / inventory concepts (batch, expiry, GRN) but keep this screen as an alert day board, not a full inventory table.
```

---

## 14. Related documents & code anchors

| Resource | Why it matters |
|----------|----------------|
| `src/dashboard.tsx` | Current static stub to replace |
| `src/sidebar.tsx` / `src/header.tsx` | Shell chrome |
| `src/App.tsx` | Routes and theme tokens |
| `src/patientmangement/types/appointments.tsx` | Appointment fields & statuses |
| `src/patientmangement/types/patients.tsx` | Patient fields |
| `src/prescriptions/types/prescriptionmodel.ts` | Prescription list/status |
| `medicine-stock-fill-design.md` | GRN, fill-stock, inventory KPI dashboard (§6) — Overview `W-INV` is the compact cousin |
| `frontend-os-readme.md` | Engineering UI standards (tokens, empty states, CTAs) |
| `requirement.md` | Org ID from localStorage; iPad; disable unfinished suppliers/beds nav when needed |
| `IMPROVEMENTS.md` / `changes-accepted.md` | Prior polish notes on dashboard/header |

---

## 15. Sample populated content (for designers)

Use this sample set so UI AI does not invent hospital ICU data.

**Clinic:** “ClearSkin Clinic — Hubli” (dermatology specialty)  
**Date:** Friday, 10 Jul 2026  

**KPIs:** Scheduled 18 · In consult 2 · Completed 11 · Missed 1 · Waiting 4  

**Queue rows (examples):**

| Time | Patient | Doctor | Type | Status |
|------|---------|--------|------|--------|
| 10:00–10:15 | Anita Desai · F · 34 | Dr Hiremath | Follow-up | In consult |
| 10:15–10:30 | Rohan Kulkarni · M · 22 | Dr Hiremath | New | Waiting |
| 10:30–10:45 | Priya Shetty · F · 29 | Dr Patil | OPD | Scheduled |

**Rx attention:** RX-1042 draft · RX-1039 pending  

**Payments:** Collected ₹24,800 (UPI ₹16,200 · Cash ₹6,100 · Card ₹2,500); Pending 3 · ₹4,200  

**Pharmacy:** Low stock 7 · Expiring 30d 3 · Pending GRN 1  

**Dermatology:** Laser ×2, Peel ×1; Follow-ups due 5; Consents pending 2  

---

## 16. Open product decisions (resolved for this spec)

| Decision | Resolution |
|----------|------------|
| Primary audience V1 | Admin + Front desk shared day board |
| Architecture | Specialty-agnostic core + plugin slot |
| Example specialty pack | Dermatology fully specified; dental/ortho same grammar |
| Payments / inventory on Overview | Progressive widgets with feature flags |
| Beds on Overview | Excluded |
| Analytics charts | Excluded from V1 first viewport |

---

*End of requirements. Hand this file to a UI AI platform using §13 prompts, then implement against accepted designs in a later engineering pass.*
