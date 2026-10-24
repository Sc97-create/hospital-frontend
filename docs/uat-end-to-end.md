# End-to-end UAT — Hospital frontend

User acceptance tests for the full clinic product: signup and login, dashboard, patients, appointments, consultation billing, prescriptions and pharmacy checkout, lab orders, diagnostic centres, suppliers, employees, profile, and role-based access.

Use this as a script. Run the **happy path** first (section 4), then module cases and RBAC.

## 1. How to record results

| Column | Meaning |
|--------|---------|
| Pass | Behaviour matches Expected |
| Fail | Behaviour does not match Expected (note actual result) |
| Blocked | Cannot run (missing data, environment, or permission) |
| N/A | Role or feature does not apply to this tester |

Record: tester, date, build/branch, environment URL, role used, and defect id for every Fail.

## 2. Roles

| Role | Typical permissions | Used for |
|------|---------------------|----------|
| Admin | `is_admin: true` (all modules) | Full happy path |
| Reception | `patient`, `appointment`, `billing` view/create as granted | Register patient, book appointment, collect consultation fee |
| Doctor | `appointment` view, `prescription` create/view | Start consult, write prescription |
| Pharmacist | `prescription` view, `medicine` view/update, `billing` create | Dispense and checkout |
| Lab user | `lab_order` view/create/update, `billing` create | Lab orders and payment |
| Restricted user | Sample: `lab_order.view` only, no create/update | RBAC checks |

Exact flags come from login `permissions`. A module that is absent is denied. Admin bypasses module checks.

## 3. Preconditions

- Frontend pointed at the target API
- At least one organisation with an admin login
- Test users for reception, doctor, pharmacist, and lab (or one admin plus one restricted user)
- Browser with a clean session for each role (log out between roles)
- Network available for signup/payment if those cases are in scope

Test data created during the happy path is reused later (patient, appointment, prescription, lab order, supplier, employee, diagnostic centre).

---

## 4. Happy path (primary UAT script)

Run as **admin** unless a step names another role. Stop and log a defect if a step fails; later steps may be blocked.

| ID | Step | Action | Expected |
|----|------|--------|----------|
| HP-01 | Login | Open `/login`, sign in as admin | Lands on `/dashboard`. Sidebar shows modules the admin can use |
| HP-02 | Dashboard | Review KPIs, today’s queue, recent prescriptions | Data loads. Queue row opens appointment or patient. Empty state is clear when there is no data |
| HP-03 | Add patient | Patients → Add Patient. Complete step 1 (identity) and step 2 (visit details) | Patient is created. User can open the patient from the list |
| HP-04 | Find patient | Search by name, code, or phone | Matching rows appear. Opening a row goes to Patient Overview |
| HP-05 | Overview | Confirm header (name, UHID, gender, age, phone, status) | Values match what was entered. Tabs: Appointments, Prescriptions, and Lab Tests if `lab_order.view` |
| HP-06 | Book appointment | Add Appointment. Choose doctor, date/time, save | Appointment appears on the patient Appointments tab and on Appointments list |
| HP-07 | Consultation fee | From the appointment, collect consultation payment (cash). Amount > 0, swipe to confirm | Invoice is created (`billing_id` = appointment id). Payment confirms. Status reflects paid / next clinical step |
| HP-08 | Start consult | Open appointment preview. Start consultation when status allows | Status moves to ongoing. Add Prescription is available when `prescription.create` |
| HP-09 | Write prescription | Add medicines, quantities, and instructions. Save | Prescription is created and listed under Prescriptions |
| HP-10 | Open prescription | View the prescription | Patient, doctor, items, and status are correct. Complete payment / checkout is available when unpaid |
| HP-11 | Pharmacy checkout | Checkout selected lines. Pay cash (amount due). Confirm | `POST /billing/create` uses `billing_id` = prescription id and `payment_type: prescription`. Payment confirms. Receipt or “Bill paid” is shown. Re-entering checkout does not create a second paid bill |
| HP-12 | Supplier | Suppliers → Add Supplier. Save required fields | Supplier appears in the list and can be used when filling stock |
| HP-13 | Stock | Open supplier → Fill stock for a medicine used above | Stock/batch is saved. Later checkout can allocate that batch |
| HP-14 | Diagnostic centre | Lab → Diagnostic Center (requires `lab_order.create`) → Add. Name, address, email, contact | `POST /diagnostic-centres/create` succeeds. Centre appears in the list and in Add Lab Test dropdown |
| HP-15 | Lab order | Patient Overview → Add Lab Test. Apply a template or select tests. Assign doctor and diagnostic centre. Submit | `POST /lab-orders/create` succeeds. Order shows on the patient Lab Tests tab and on Lab → Tests |
| HP-16 | Lab status | Open the order. Mark tests completed (single and/or Mark all) | `PATCH /lab-orders/bulkupdatestatus` updates status. Progress updates. Cancelled tests are not forced to completed |
| HP-17 | Lab payment | When all tests are completed or cancelled and billing check `count` is 0, Complete Lab Order. Enter amount **greater than ₹1**. Pay cash and swipe | `POST /billing/create` uses `payment_type: lab_order` and `billing_id` = lab order id. Then payment confirm. User is routed to `/lab/tests`. Success toast is shown |
| HP-18 | Lab already billed | Re-open the same lab order | Complete Lab Order stays disabled (`count > 0`) |
| HP-19 | Employee | Employees → Add Employee. Save | Employee appears in the list with code, role, contact, and status |
| HP-20 | Profile | Settings → My Profile | Current user details load. Editable fields save or show a clear validation error |
| HP-21 | Password | Settings → Update Password (use a non-production test account) | Password changes. Old password no longer logs in. New password does |
| HP-22 | Logout | Settings → Logout | Session clears. Protected routes redirect to login |

**Happy path sign-off:** Pass only if HP-01 through HP-22 pass or are explicitly N/A with a reason (for example stock already exists).

---

## 5. Access, signup, and session

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| AC-01 | Unauthenticated | Open `/dashboard` while logged out | Redirect to login. No clinical data shown |
| AC-02 | Invalid login | Wrong password | Error message. Stay on login. No token stored |
| AC-03 | First login password | User with password-not-cleared flag | Routed to update password before the app |
| AC-04 | Forgot password | Request reset, open link, set new password | Can log in with the new password only |
| AC-05 | Default route | Log in as a non-admin with only `lab_order.view` | Lands on `/lab/tests` (first allowed home), not a denied module |
| AC-06 | Signup | Complete customer signup through organisation (and plan/payment if in scope) | Account reaches ready/active. Can log in to the new organisation |
| AC-07 | Session expiry | Use an expired token or wait for refresh failure | User is returned to login. Stale screens do not keep calling APIs silently forever |

---

## 6. Dashboard

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| DB-01 | KPI filters | Click a status KPI | Appointments list opens with that status |
| DB-02 | Queue action | Start or open a queued appointment | Correct appointment or prescription route |
| DB-03 | Recent Rx | Open a recent prescription | Prescription detail for that id |
| DB-04 | No dashboard permission | User without `dashboard.view` | Overview is hidden. Direct `/dashboard` is denied |

---

## 7. Patients

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| PT-01 | List | Open Patients | Paginated list. Total count matches pages |
| PT-02 | Search | Search name / code / phone, then refresh | Results filter while typing (debounced). **Refresh clears search** and shows the default list. This is expected |
| PT-03 | Validation | Submit Add Patient with required fields empty | Field errors. No patient created |
| PT-04 | Duplicate / invalid phone | Enter an invalid phone if validated | Rejected with a clear message |
| PT-05 | No create | User with `patient.view` and `create: false` | List works. Add Patient is hidden or route is denied |
| PT-06 | Overview consistency | Create appointment and prescription, return to overview | Both tabs show the new records for that patient only |

---

## 8. Appointments and consultation billing

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| AP-01 | List filters | Filter by status and date if available. Paginate | Only matching appointments. Page resets when the filter changes |
| AP-02 | Status change | Change status from the list where allowed | Status tag updates. Illegal transitions are blocked |
| AP-03 | Reschedule | Appointment in reschedule-required | Reschedule action is available and saves a new slot |
| AP-04 | Cash payment | Consultation modal, cash, amount > 0, swipe | Billing create payload uses `billing_id` (appointment UUID), not `appointment_id`. Confirm succeeds |
| AP-05 | QR payment | Same flow with QR | QR step shown. Confirm uses the same invoice |
| AP-06 | Amount 0 | Try to pay ₹0 | Blocked with a validation message |
| AP-07 | Already paid | Open payment again for a paid appointment | Does not create a second paid invoice. Shows paid / resume state |
| AP-08 | No billing create | User without `billing.create` | Cannot complete payment (control hidden or API denied) |
| AP-09 | Refresh during booking | Fill the form, refresh | Unsaved form is cleared. No half-created appointment unless Save already succeeded |

---

## 9. Prescriptions and pharmacy

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| RX-01 | List | Open Prescription | List loads for the organisation. Search/filter and pagination work |
| RX-02 | Add from appointment | Add prescription with at least one medicine | Items, doctor, and patient are stored. Draft/status is correct |
| RX-03 | Empty items | Save with no medicines | Validation prevents save |
| RX-04 | Detail | Open prescription | Medicines, qty, and status match what was saved |
| RX-05 | Checkout lines | Uncheck a line, change qty within stock | Totals update. Cannot sell more than available stock |
| RX-06 | Cash / QR | Confirm and pay | Payload `billing_id` is the prescription id, `payment_type` is `prescription`. Dispense lines included. Payment confirm succeeds |
| RX-07 | Payment link | Choose Link if offered | Link is created. Cash/QR confirm step is not required for link |
| RX-08 | Double submit | Swipe or click pay twice quickly | One invoice only (idempotency) |
| RX-09 | Bill paid | Return to a paid prescription | “Bill paid” / completed. Checkout does not charge again |
| RX-10 | Receipt | Open receipt | Patient, items, amounts, and payment mode match the paid bill |
| RX-11 | No prescription create | User with view only | Cannot open add-prescription. List and view still work |
| RX-12 | Refresh on checkout | Start checkout, refresh | Returns to a safe state. Unpaid invoice can be resumed. Paid invoice is not duplicated |

---

## 10. Suppliers and stock

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| SU-01 | List and search | Open Suppliers. Search. Refresh | List and search work. Refresh clears the search box |
| SU-02 | Create | Add supplier with name, email, phone, licence/GST as required | Created and listed |
| SU-03 | Validation | Invalid email or missing name | Form errors. No create call success |
| SU-04 | Fill stock | Add a batch with quantity, expiry, and price | Batch is saved. Medicine is available on prescription checkout |
| SU-05 | Permissions | `medicine.view` without `create` / `update` | List only. Add and fill-stock denied |

---

## 11. Lab orders

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| LB-01 | Menu | User with `lab_order.view` only | Lab → **Tests** is visible. **Diagnostic Center** is hidden (`create` is false) |
| LB-02 | Menu create | User with `lab_order.create` | Diagnostic Center is visible |
| LB-03 | No lab module | User without `lab_order` | Lab menu hidden. `/lab/tests` denied |
| LB-04 | List | Lab → Tests. Filter All / Pending / Completed / Cancelled. Paginate | `GET /lab-orders/list` with status. Page size 10 |
| LB-05 | Search then refresh | Search by doctor or patient, then refresh | Search clears. Full default list returns. **Valid** |
| LB-06 | Patient tab | Patient with `lab_order.view` | Lab Tests tab lists only that patient’s orders |
| LB-07 | Add lab test hidden | `lab_order.create` false | Add Lab Test button hidden. Direct URL denied |
| LB-08 | Templates | On Add Lab Test, load defaults | Tests and saved templates come from `GET /lab-test-templates/defaults?organisation_id=` |
| LB-09 | Apply template | Click a template | Selected tests move to the top of page 1 |
| LB-10 | Deselect template | Click the active template again | Selection clears |
| LB-11 | Save template | Save selected tests with a name | `POST /lab-test-templates/create`. New chip appears |
| LB-12 | Submit rules | Submit without tests, doctor, or centre | Warnings. No order created |
| LB-13 | Submit success | Valid submit | Returns to patient overview. Order is pending |
| LB-14 | Status permission | `lab_order.update` false | Status dropdown and Mark all completed are disabled |
| LB-15 | Status update | Update one test and Mark all | Same bulk API. Single update sends one id in `test_ids` |
| LB-16 | Complete disabled | Pending tests remain, or billing `count > 0`, or billing check failed | Complete Lab Order disabled. Failed check stays disabled (fail closed) |
| LB-17 | Amount | Amount ≤ ₹1 | Swipe disabled. Error if confirm is forced |
| LB-18 | Cash / QR / Link | Complete with each method when allowed | Cash and QR create bill then confirm. Link creates bill and opens payment URL when returned. All use `billing_id` = lab order id |
| LB-19 | Invalid billing request | `billing/create` returns `{ code: 400, error: "invalid request" }` | Modal closes. **No error toast** |
| LB-20 | After pay | Success | Navigates to `/lab/tests`. Re-open keeps Complete disabled |
| LB-21 | Generate Invoice page | Details → Generate Invoice | Checkout page loads the order. Timer and line selection work. This page does **not** call billing create (mock confirm). Real payment is Complete Lab Order |

---

## 12. Diagnostic centres

There is **no** `diagnostic_centre` permission. Access follows `lab_order`.

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| DG-01 | List | User with `lab_order.create` opens Diagnostic Center | Paginated list: name, address, email, contact, status. Search then refresh clears search |
| DG-02 | Create | Add centre with the four fields | Payload: `organisation_id`, `name`, `address`, `contact_number`, `email`. Success returns to the list |
| DG-03 | Validation | Blank name, bad email, short phone | Form errors |
| DG-04 | Use on lab order | Create centre, then Add Lab Test | New centre is selectable and saved on the order |
| DG-05 | View only | `lab_order.view` without create | Sidebar item hidden. `/lab/diagnostic-center/add` denied. List route requires view; add requires create |

---

## 13. Employees

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| EM-01 | List | Open Employees. Search. Paginate | Rows show code, name, role, department, phone, email, status |
| EM-02 | Create | Add employee with required fields | Appears in the list |
| EM-03 | Permission | No `employee.view` | Menu hidden and route denied. Create route needs `employee.create` |

---

## 14. RBAC matrix (spot check)

Log in as the restricted user from section 2. For each row, check the sidebar **and** paste the URL.

| ID | Module action | Sidebar | Direct URL | Expected |
|----|---------------|---------|------------|----------|
| RB-01 | `dashboard.view` false | Overview hidden | `/dashboard` | Denied |
| RB-02 | `patient.view` true, `create` false | Patients shown | `/patients/add-patient` | List ok. Create denied |
| RB-03 | `appointment.create` false | — | Add Appointment | Button hidden or route denied |
| RB-04 | `prescription.view` true, `create` false | Prescription shown | Add prescription URL | View ok. Create denied |
| RB-05 | `lab_order.view` true, `create` false, `update` false | Lab → Tests only | `/lab/tests`, `/lab/diagnostic-center/add`, add-lab-test URL | Tests ok. Diagnostic add and Add Lab Test denied. Status controls disabled |
| RB-06 | `lab_order` absent | Lab hidden | `/lab/tests` | Denied |
| RB-07 | `billing.create` false | — | Complete lab order / consultation pay / Rx checkout pay | Cannot create a bill |
| RB-08 | `medicine.update` false | Suppliers if view | Fill stock URL | Update denied |
| RB-09 | Admin | All permitted menus | Any in-scope URL | Allowed |
| RB-10 | Logout and login as another role | Menus match the new user | — | Previous user’s menus are gone |

---

## 15. Cross-module regression

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| RG-01 | One patient, three bills | Consultation fee, prescription checkout, lab complete | Three separate bills. Each `billing_id` is the appointment, prescription, or lab order id. Paying one does not mark the others paid |
| RG-02 | Navigation back | Use breadcrumbs and Back from detail pages | Returns to the correct list without losing organisation context |
| RG-03 | Pagination boundaries | Go to last page, delete or complete the only row on that page if possible | Page clamps. No blank error |
| RG-04 | Concurrent tabs | Start checkout in two tabs. Pay in one | Second tab does not double-charge. Shows already paid or a safe error |
| RG-05 | Refresh on every list | Patients, appointments, prescriptions, suppliers, employees, lab tests, diagnostic centres | Lists reload from page 1 defaults. In-memory search is cleared. **Valid** |
| RG-06 | Mobile width | Repeat HP-04, HP-06, HP-11, HP-17 at ~390px width | Primary actions remain reachable. No overlap that blocks Save or Pay |

---

## 16. Out of scope / known behaviour

- Lab **Generate Invoice** checkout page confirms locally. It is not the billing API. Accept payment only via **Complete Lab Order**, consultation payment, and prescription checkout.
- Diagnostic Centre visibility is tied to `lab_order.create` until a dedicated module exists.
- Bed arrangement routes exist but are not part of the sidebar RBAC menu. Do not fail UAT if they are unused, unless the release notes include them.
- Category chips on Add Lab Test (Blood, Biochemistry, and so on) are UI-only. They are not stored on the backend.

---

## 17. Exit criteria

UAT is accepted when:

1. Happy path HP-01–HP-22 is Pass (or N/A with written reason).
2. No open Sev-1 (cannot log in, cannot register a patient, cannot take payment, data shown for the wrong organisation).
3. Sev-2 defects (wrong status, permission leak, duplicate bill) are either fixed or accepted in writing.
4. RBAC spot check RB-01–RB-10 has no case where a denied module is usable.
5. RG-01 confirms the three billing types stay independent.

## 18. Sign-off

| Role | Name | Date | Result (Accept / Reject) | Notes |
|------|------|------|---------------------------|-------|
| Product owner | | | | |
| Clinic operations | | | | |
| QA | | | | |
| Engineering | | | | |
