# Mobile responsiveness — QA Test Scenarios

Manual test plan for the `mobile-responsiveness` branch: app shell, lists, patient overview, labs, auth banners, and session `user_id` recovery.

## Preconditions

- Dev server running (`npm run dev`)
- Staff account with `organisation_id` and `user_id` after login
- At least one patient with appointments and a lab order
- Chrome DevTools (or Safari) device toolbar

## Viewports

| Label | Width | Notes |
|-------|-------|--------|
| Phone | **390px** | Primary acceptance width |
| Tablet | **768px** | Sidebar may still be drawer or narrow sider |
| Desktop | **1280px+** | Desktop layout must not regress |

**Pass rule:** no page-level horizontal scroll; text must not wrap letter-by-letter; breadcrumbs must not sit under the Floato top bar.

---

## A. App shell & navigation

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| A1 | Mobile top bar | Open any authenticated page at 390px | Fixed **Floato** bar with hamburger; content starts below it |
| A2 | Open drawer | Tap hamburger | Left drawer shows main menu + settings |
| A3 | Navigate via drawer | Tap **Patients** (or another item) | Route changes; drawer closes |
| A4 | Breadcrumb clearance | Open Patients / Patient Overview / Add Patient | Breadcrumbs fully visible under the top bar (no overlap) |
| A5 | Desktop sidebar | Resize to 1280px | Classic sticky sidebar; no mobile top bar |
| A6 | Logout from drawer | Settings → Logout | Session cleared; lands on login |

---

## B. Auth banners (login / signup)

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| B1 | Staff login mobile banner | `/login` at 390px | Mint **Floato / Healthcare OS** banner on **top**; form below; no bottom green panel |
| B2 | Customer login mobile banner | `/customer/login` at 390px | Same Floato top banner + form |
| B3 | Signup mobile banner | `/signup` (or customer signup) at 390px | Logo above headline; **no overlap** on “Healthcare operations, made simpler.” |
| B4 | Login desktop | `/login` at 1280px | Left brand panel + right form (unchanged split) |
| B5 | Staff login works | Submit valid credentials | Dashboard (or default permitted route); `user_id` present in localStorage |

---

## C. Session / “Missing user”

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| C1 | Fresh login stores user | Staff login → Application → Local Storage | `access_token`, `user_id`, `organisation_id` set |
| C2 | My Profile after login | Header/menu → My Profile | Profile loads; **no** “Missing user — please log in again” |
| C3 | Missing user_id recovery | While logged in, delete only `user_id` from localStorage → open My Profile | `user_id` restored from JWT when possible; profile loads **or** redirect to `/login` if token also missing |
| C4 | No session | Clear storage → `/profile` | Redirect to `/login` |

---

## D. Dashboard (390px)

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| D1 | Header | Open `/dashboard` | Title + truncated branch/org; search usable; no overflow |
| D2 | KPIs | View KPI cards | Stack or wrap without horizontal page scroll |
| D3 | Queue table | Scroll appointment queue | Scrolls inside card if needed; page itself does not slide sideways |

---

## E. Patients list & add patient

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| E1 | List columns | `/patients` at 390px | Shows **Code / Name / Status** (extra columns hidden); no clipped mid-column |
| E2 | Full-width actions | Same page | **Add New Patient** and search are full width |
| E3 | Pagination / total | Scroll to footer | Total bar and pagination fit; no side clip |
| E4 | Add patient form | Add New Patient | Form fields full width; title not under top bar; Submit usable |
| E5 | Tablet columns | 768px | Age / Issued (and more) may reappear; still no letter wrapping |

---

## F. Patient overview

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| F1 | Header card | Open patient overview at 390px | Avatar initial, name, tags wrap cleanly; meta stacks (UHID / Gender / Age / Phone) |
| F2 | Actions | View action buttons | Edit / Add Appointment / Add Lab Test stack full width |
| F3 | Tabs | Switch Appointments / Prescriptions / Lab Tests | Tabs scroll horizontally if needed; content readable |

---

## G. Patient appointments tab

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| G1 | Mobile card rows | Appointments tab at 390px | Each row: date + time (no broken year/time), doctor + avatar, status |
| G2 | Filters | Use All / Upcoming / Completed / Cancelled | Segmented control scrolls if needed; filter works |
| G3 | Desktop table | 1280px | Full columns (Date, Doctor, Department, Type, Status) |

---

## H. Patient lab orders tab

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| H1 | Mobile card | Lab Tests tab at 390px | Card shows order id badge, status, doctor, test count, received date, **View** — no horizontal scrollbar |
| H2 | View | Tap View | Opens lab order detail |
| H3 | Desktop table | 1280px | Full Order ID / Doctor / Tests / Received On / Status / Action |

---

## I. Add Lab Test

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| I1 | Test list mobile | Add Lab Test at 390px | Name + code + specimen under name; TAT on right; **no** vertical letter wrapping |
| I2 | Select + submit | Select tests, doctor, centre → Submit | Order creates; no “Missing user id” if session valid |
| I3 | Desktop columns | 1280px | Separate Code / Specimen columns visible |

---

## J. Employees & appointments list

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| J1 | Employees list | `/employees` at 390px | Code / Name / Status primary; no page overflow |
| J2 | Org appointments | `/appointments` at 390px | Reduced columns (e.g. Code / Patient / Status); readable |

---

## K. Pharmacy fill-stock drawer

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| K1 | Add medicine drawer | Fill stock → Add medicine at 390px | Drawer is full width (or nearly); form usable |

---

## L. Regression (desktop)

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| L1 | Sidebar + dashboard | 1280px dashboard | Desktop layout unchanged |
| L2 | Patient list columns | 1280px patients | All columns visible |
| L3 | Login split | 1280px login | Left Floato panel + right form |

---

## Sign-off checklist

- [ ] Phone 390px: A1–A4, B1–B3, D1–D3, E1–E4, F1–F3, G1–G2, H1–H2, I1–I2 pass  
- [ ] Tablet 768px: shell + patients + overview acceptable  
- [ ] Desktop 1280px: L1–L3 pass  
- [ ] C1–C2 pass after a fresh staff login  

**Branch:** `mobile-responsiveness`  
**Related ticket:** `docs/tickets/mobile-responsiveness.md`
