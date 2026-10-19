# Labs & Diagnostic Center — QA Test Scenarios

Manual test plan for lab orders, add-lab-test, patient lab tab, billing completion, and diagnostic centre usage.

## Preconditions

- Logged-in user with `organisation_id` and `user_id` in session
- At least one patient, doctor, and diagnostic centre available
- Lab routes: `/lab/tests`, `/lab/tests/:id`, `/lab/diagnostic-center`
- Patient routes: `/patients/patient-overview/:id`, `/patients/:id/add-lab-test`

---

## A. Navigation & Diagnostic Center

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| A1 | Open Lab menu | Sidebar → Lab | Shows **Tests** and **Diagnostic Center** |
| A2 | Lab Tests page | Open Tests | List loads via `GET /lab-orders/list` |
| A3 | Diagnostic Center page | Open Diagnostic Center | Placeholder page (“No diagnostic centers”); no create/list UI yet |
| A4 | Centre picker elsewhere | Add Lab Test → Diagnostic Centre dropdown | Uses `GET /diagnostic-centres/list` (search works) |

---

## B. Lab order list (`/lab/tests`)

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| B1 | Default list | Open Tests | Page 1, 10 rows, total count |
| B2 | Status filters | Pending / Completed / Cancelled / All | API called with matching `status`; page resets to 1 |
| B3 | Pagination | Go to page 2+ | Correct range text (“Showing X–Y of Z”) |
| B4 | Search | Type patient/doctor/order text | Filters **current loaded rows** (client-side) |
| B5 | View order | Click **View** | Opens `/lab/tests/:labId` |
| B6 | Missing org | Clear `organisation_id` | Empty list, no API call |

---

## C. Add Lab Test (from patient)

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| C1 | Entry | Patient Overview → **Add Lab Test** | Loads `GET /lab-test-templates/defaults?organisation_id=` |
| C2 | Defaults + templates | Open page | Default tests in table; saved templates as chips |
| C3 | Apply template | Click a template | Those tests selected, moved to top, page 1 |
| C4 | Deselect template | Click **active** template again | Selection cleared |
| C5 | Manual select | Check/uncheck rows | Template highlight clears |
| C6 | Category / search | Filter category + search | Correct subset |
| C7 | Save template | Select tests → Save Template → name + tags → Save | `POST /lab-test-templates/create`; chip appears |
| C8 | Save template validation | Empty name or no tests | Save disabled / blocked |
| C9 | Assign doctor + centre | Pick Assigned by + Diagnostic Centre | Required for submit |
| C10 | Submit order | Submit Lab Test | `POST /lab-orders/create` → toast → back to patient overview |
| C11 | Submit validation | Submit without tests/doctor/centre | Warning toasts |
| C12 | Cancel | Cancel | Returns to patient overview |

---

## D. Patient Lab Tests tab

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| D1 | Tab load | Patient Overview → **Lab Tests** | `GET /lab-orders/list` with `patient_id` |
| D2 | Empty | Patient with no orders | “No lab orders for this patient” |
| D3 | View from tab | Click View | Opens global lab details `/lab/tests/:id` |
| D4 | After create | Create order (C10) then open tab | New order appears |

---

## E. Lab order details & status

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| E1 | Load details | Open any order | `GET /lab-orders/getbyID/:id` + `GET /billing/checkByBillingID/:id` |
| E2 | Single status | Status dropdown → Pending / Completed / Cancelled | `PATCH /lab-orders/bulkupdatestatus` with one `test_id` |
| E3 | Mark all completed | Click **Mark all as Completed** | Bulk PATCH for all non-cancelled tests |
| E4 | Mark all disabled | All non-cancelled already completed | Button disabled |
| E5 | Progress | Mix pending/completed | Progress % updates |

---

## F. Complete Lab Order (billing)

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| F1 | Button disabled – tests | Some tests still pending | **Complete Lab Order** disabled |
| F2 | Button enabled – billing | All tests completed/cancelled **and** billing `count === 0` | Button enabled |
| F3 | Button disabled – billed | Billing `count > 0` | Button disabled; click warns “already billed” |
| F4 | Billing check fail | Force API failure | Button stays disabled (fail-closed) |
| F5 | Amount validation | Amount ≤ ₹1, try swipe | Swipe disabled; error if confirm attempted |
| F6 | Amount ok | Amount > ₹1 | Can complete |
| F7 | Cash pay | Complete → Cash → swipe | `POST /billing/create` + `POST /payment/confirm` → toast → `/lab/tests` |
| F8 | QR pay | Same with QR (+ optional txn ref) | Same as F7 |
| F9 | Link pay | Payment = Link → swipe | Create only; opens payment URL if returned → list |
| F10 | Re-open after pay | Open same order again | Complete stays disabled (`count > 0`) |

---

## G. Generate Invoice / Checkout page

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| G1 | Open checkout | Details → **Generate Invoice** | `/lab/tests/:id/checkout` loads order |
| G2 | Line selection | Uncheck items | Totals update |
| G3 | Timer expiry | Wait 2 min | Confirm disabled |
| G4 | Mock pay | Confirm & Pay | Local success only (**no billing API** on this page) |

> Prefer **F7–F9** for real payment QA. Section G is a separate invoice UI path (mock confirm).

---

## H. Regression / edge cases

| ID | Scenario | Expected |
|----|----------|----------|
| H1 | Deep link unknown lab id | Error / not found state |
| H2 | Rapid double-swipe on pay | Idempotency; no duplicate bill |
| H3 | Template test code missing from defaults | Only available codes applied |
| H4 | Doctor/centre search debounce | No spam requests while typing |

---

## Smoke path (happy path)

1. Patient → Add Lab Test → pick template → assign doctor/centre → Submit  
2. Patient Lab Tests tab → View order  
3. Mark all Completed → Complete Lab Order (amount > ₹1, Cash) → lands on `/lab/tests`  
4. Re-open order → Complete stays disabled  
5. Sidebar Lab → Tests list shows completed order  

---

## API quick reference

| Flow | Paths |
|------|--------|
| Orders | `POST /lab-orders/create`, `GET /lab-orders/list`, `GET /lab-orders/getbyID/:id`, `PATCH /lab-orders/bulkupdatestatus` |
| Templates | `GET /lab-test-templates/defaults`, `POST /lab-test-templates/create` |
| Diagnostic centres | `GET /diagnostic-centres/list` |
| Billing (complete order) | `GET /billing/checkByBillingID/:id`, `POST /billing/create`, `POST /payment/confirm` |
| Patient / doctors | `GET /patients/getpatientByID/:id`, `GET /employee/getDoctors` |
