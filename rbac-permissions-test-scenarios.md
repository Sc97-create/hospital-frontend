# RBAC / Permissions — Testing Scenarios

Manual QA for **role-based access control** after login: sidebar visibility, route guards (`AuthGuard`), and action buttons (`canView` / `canCreate` / `can`).

**Result buckets (P / F / B split)**


| Result         | File                                                             |
| -------------- | ---------------------------------------------------------------- |
| Pass           | `[rbac-permissions-passed.md](rbac-permissions-passed.md)`       |
| Fail           | `[rbac-permissions-failed.md](rbac-permissions-failed.md)`       |
| Blocked / skip | `[rbac-permissions-blocked.md](rbac-permissions-blocked.md)`     |
| Index          | `[rbac-permissions-pass-fail.md](rbac-permissions-pass-fail.md)` |


**Related code**

- Login stores access: `src/authentication/Login.tsx` → `setAccess(is_admin, permissions)`
- Context: `src/auth/permissions-context.tsx`
- Route guard: `src/auth/authguard.tsx`
- Sidebar filter: `src/sidebar.tsx`
- Route map: `src/App.tsx`, `src/auth/module-access.ts`

---



## How to sign off each scenario


| Result            | Mark                                       |
| ----------------- | ------------------------------------------ |
| Pass              | `P` or `pass`                              |
| Fail              | `F` or `fail`                              |
| Blocked / not run | `B` / `skip`                               |
| Notes             | Short reason, DevTools evidence, or ticket |


Fill **Result / Tester / Date / Notes** on every case.

---



## Modules & actions (frontend)


| Module (`module_name`) | Sidebar      | Typical routes                            |
| ---------------------- | ------------ | ----------------------------------------- |
| `patient`              | Patients     | `/patients`, overview, add-patient        |
| `appointment`          | Appointments | `/appointments`, preview, add appointment |
| `medicine`             | Suppliers    | `/suppliers`, add supplier, fill-stock    |
| `employee`             | Employees    | `/employees`, add-employee                |
| `prescription`         | Prescription | `/prescription`, add, checkout, receipt   |



| Action   | Meaning in UI                                                               |
| -------- | --------------------------------------------------------------------------- |
| `view`   | See module in sidebar + open list / detail routes                           |
| `create` | “Add …” buttons and create routes                                           |
| `update` | e.g. Fill Stock (`medicine` + `update`)                                     |
| `delete` | Reserved (few UI hooks today — still verify API denial if backend enforces) |


**Always reachable without a module permission (logged-in only):** `/dashboard`, `/profile`, `/update-password`.

**Admin rule:** `is_admin === true` → all modules/actions allowed (sidebar + routes + buttons), even if `permissions` is empty.

---



## Login response shape (fixture)

```json
{
  "user_id": "uuid",
  "token": "...",
  "refresh_token": "...",
  "organisation_id": "uuid",
  "is_admin": false,
  "permissions": [
    {
      "module_name": "patient",
      "permissions": { "view": true, "create": true, "update": false, "delete": false }
    }
  ],
  "password_cleared": true
}
```

After login, confirm in DevTools → Application → Local Storage:


| Key                | Expected                                |
| ------------------ | --------------------------------------- |
| `access_token`     | present                                 |
| `user_id`          | present                                 |
| `organisation_id`  | present                                 |
| `is_admin`         | `"true"` / `"false"`                    |
| `user_permissions` | JSON array matching login `permissions` |


---



## Personas / fixtures (use real org users)


| ID                | Persona            | `is_admin` | Permissions summary                                                                             |
| ----------------- | ------------------ | ---------- | ----------------------------------------------------------------------------------------------- |
| **P-ADMIN**       | Org root / admin   | `true`     | Any (permissions optional)                                                                      |
| **P-RECEPTION**   | Front desk         | `false`    | `patient` view+create; `appointment` view+create; no medicine / employee / prescription         |
| **P-DOCTOR**      | Clinician          | `false`    | `patient` view; `appointment` view; `prescription` view+create; no employee; no medicine create |
| **P-PHARMACY**    | Pharmacist         | `false`    | `medicine` view+create+update; `prescription` view; no patient create; no employee              |
| **P-HR**          | HR / admin ops     | `false`    | `employee` view+create only                                                                     |
| **P-VIEW-ONLY**   | Read-only auditor  | `false`    | All five modules `view: true`, all `create/update/delete: false`                                |
| **P-EMPTY**       | Broken / empty ACL | `false`    | `permissions: []` — dashboard + profile only                                                    |
| **P-MISSING-MOD** | Partial ACL        | `false`    | Has `patient` view; **module omitted** for `appointment` (not present in array)                 |


**Setup tip:** Prefer backend-assigned roles. If needed for QA, temporarily mock the login response in Network (or seed users) — do not commit mocks.

---



## A. Login & session persistence



### A1 — Admin login stores flags


|                   |                                                                                                                      |
| ----------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Persona**       | P-ADMIN                                                                                                              |
| **Steps**         | 1. Log in. 2. Open Local Storage.                                                                                    |
| **Expected**      | `is_admin` = `"true"`. Navigates to dashboard (or password update if not cleared). All sidebar module items visible. |
| **Result**        | Pass                                                                                                                 |
| **Tester / Date** | Sachin                                                                                                               |
| **Notes**         | -                                                                                                                    |




### A2 — Non-admin login stores permissions array


|                   |                                                                                              |
| ----------------- | -------------------------------------------------------------------------------------------- |
| **Persona**       | P-RECEPTION                                                                                  |
| **Steps**         | 1. Log in. 2. Inspect `user_permissions`.                                                    |
| **Expected**      | `is_admin` = `"false"`. `user_permissions` matches API modules (patient + appointment only). |
| **Result**        | Pass                                                                                         |
| **Tester / Date** | Sachin                                                                                       |
| **Notes**         | -                                                                                            |




### A3 — Hard refresh keeps ACL


|                   |                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------- |
| **Persona**       | P-DOCTOR                                                                                    |
| **Steps**         | 1. Log in. 2. Hard refresh (Cmd/Ctrl+Shift+R). 3. Check sidebar.                            |
| **Expected**      | Same sidebar as before refresh (permissions rehydrated from localStorage). Still logged in. |
| **Result**        | Pass                                                                                        |
| **Tester / Date** | Sachin                                                                                      |
| **Notes**         | -                                                                                           |




### A4 — Logout clears ACL


|                   |                                                                                                                            |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Persona**       | Any                                                                                                                        |
| **Steps**         | 1. Log in. 2. Logout from header menu. 3. Check Local Storage. 4. Visit `/patients` manually.                              |
| **Expected**      | `access_token`, `is_admin`, `user_permissions`, `user_id`, `organisation_id` cleared (or removed). Redirected to `/login`. |
| **Result**        | Pass                                                                                                                       |
| **Tester / Date** | Sachin                                                                                                                     |
| **Notes**         | -                                                                                                                          |




### A5 — First login forces password update when uncleared


|                   |                                                                                           |
| ----------------- | ----------------------------------------------------------------------------------------- |
| **Persona**       | User with `password_cleared` / `passwordcleared` false                                    |
| **Steps**         | Log in.                                                                                   |
| **Expected**      | Redirect to `/update-password` before normal app use. After success, can reach dashboard. |
| **Result**        | Pass                                                                                      |
| **Tester / Date** | Sachin                                                                                    |
| **Notes**         | Auth-only page — no module gate.                                                          |


---



## B. Sidebar visibility (real-time UX)



### B1 — Admin sees all modules


|                      |                                                                      |
| -------------------- | -------------------------------------------------------------------- |
| **Persona**          | P-ADMIN                                                              |
| **Expected sidebar** | Overview, Patients, Appointments, Suppliers, Employees, Prescription |
| **Result**           | Pass                                                                 |
| **Tester / Date**    | Sachin                                                               |
| **Notes**            | -                                                                    |




### B2 — Reception: only patient + appointment


|                      |                                                                              |
| -------------------- | ---------------------------------------------------------------------------- |
| **Persona**          | P-RECEPTION                                                                  |
| **Expected sidebar** | Overview, Patients, Appointments — **no** Suppliers, Employees, Prescription |
| **Result**           | Pass                                                                         |
| **Tester / Date**    | Sachin                                                                       |
| **Notes**            | -                                                                            |




### B3 — Doctor: patients + appointments + prescription


|                      |                                                                                                |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| **Persona**          | P-DOCTOR                                                                                       |
| **Expected sidebar** | Overview, Patients, Appointments, Prescription — **no** Suppliers / Employees (unless granted) |
| **Result**           | Pass                                                                                           |
| **Tester / Date**    | Sachin                                                                                         |
| **Notes**            | -                                                                                              |




### B4 — Pharmacy: suppliers + prescription


|                      |                                                                   |
| -------------------- | ----------------------------------------------------------------- |
| **Persona**          | P-PHARMACY                                                        |
| **Expected sidebar** | Overview, Suppliers, Prescription (and any other modules granted) |
| **Result**           | Fail                                                              |
| **Tester / Date**    | Sachin                                                            |
| **Notes**            | -                                                                 |




### B5 — Empty permissions: Overview only


|                      |               |
| -------------------- | ------------- |
| **Persona**          | P-EMPTY       |
| **Expected sidebar** | Overview only |
| **Result**           | -             |
| **Tester / Date**    | -             |
| **Notes**            | -             |




### B6 — Module missing from array is hidden (not just false flags)


|                   |                                                                                     |
| ----------------- | ----------------------------------------------------------------------------------- |
| **Persona**       | P-MISSING-MOD                                                                       |
| **Steps**         | Confirm login payload has **no** `appointment` entry (not `view: false`).           |
| **Expected**      | Appointments **not** in sidebar. Deep link `/appointments` → redirect `/dashboard`. |
| **Result**        | Pass                                                                                |
| **Tester / Date** | Sachin                                                                              |
| **Notes**         | Frontend treats absent module as deny.                                              |


---



## C. Route guards (deep links / URL paste)

For each case: log in as persona → paste URL in address bar → Enter.

### C1 — View denied → dashboard


| ID  | Persona     | URL             | Expected              |
| --- | ----------- | --------------- | --------------------- |
| C1a | P-RECEPTION | `/suppliers`    | Redirect `/dashboard` |
| C1b | P-RECEPTION | `/employees`    | Redirect `/dashboard` |
| C1c | P-RECEPTION | `/prescription` | Redirect `/dashboard` |
| C1d | P-PHARMACY  | `/employees`    | Redirect `/dashboard` |
| C1e | P-EMPTY     | `/patients`     | Redirect `/dashboard` |



|                   |                                  |
| ----------------- | -------------------------------- |
| **Result**        | Pass                             |
| **Tester / Date** | Sachin                           |
| **Notes**         | Mark each sub-case P/F in Notes. |




### C2 — View allowed → page loads


| ID  | Persona     | URL             | Expected                |
| --- | ----------- | --------------- | ----------------------- |
| C2a | P-RECEPTION | `/patients`     | Patient list loads      |
| C2b | P-RECEPTION | `/appointments` | Appointment list loads  |
| C2c | P-DOCTOR    | `/prescription` | Prescription list loads |
| C2d | P-PHARMACY  | `/suppliers`    | Supplier list loads     |
| C2e | P-HR        | `/employees`    | Employee list loads     |



|                   |        |
| ----------------- | ------ |
| **Result**        | Pass   |
| **Tester / Date** | Sachin |
| **Notes**         |        |




### C3 — Create route denied without `create`


| ID  | Persona     | URL                                                   | Expected              |
| --- | ----------- | ----------------------------------------------------- | --------------------- |
| C3a | P-VIEW-ONLY | `/patients/add-patient`                               | Redirect `/dashboard` |
| C3b | P-VIEW-ONLY | `/employees/add-employee`                             | Redirect `/dashboard` |
| C3c | P-VIEW-ONLY | `/suppliers/add`                                      | Redirect `/dashboard` |
| C3d | P-VIEW-ONLY | `/patients/addappointment/{validPatientId}`           | Redirect `/dashboard` |
| C3e | P-VIEW-ONLY | `/prescription/add-prescription/{validAppointmentId}` | Redirect `/dashboard` |



|                   |                                                                                   |
| ----------------- | --------------------------------------------------------------------------------- |
| **Result**        | Pass                                                                              |
| **Tester / Date** | Sachin                                                                            |
| **Notes**         | Need valid IDs in URL path even though redirect should happen before useful work. |




### C4 — Create route allowed with `create`


| ID  | Persona     | URL                       | Expected                 |
| --- | ----------- | ------------------------- | ------------------------ |
| C4a | P-RECEPTION | `/patients/add-patient`   | Add-patient wizard opens |
| C4b | P-HR        | `/employees/add-employee` | Add employee form opens  |
| C4c | P-PHARMACY  | `/suppliers/add`          | Add supplier form opens  |



|                   |        |
| ----------------- | ------ |
| **Result**        | Pass   |
| **Tester / Date** | Sachin |
| **Notes**         |        |




### C5 — Update route: Fill Stock


| ID  | Persona                             | URL                          | Expected              |
| --- | ----------------------------------- | ---------------------------- | --------------------- |
| C5a | P-VIEW-ONLY (medicine view only)    | `/suppliers/{id}/fill-stock` | Redirect `/dashboard` |
| C5b | P-PHARMACY (`medicine.update` true) | `/suppliers/{id}/fill-stock` | Fill stock page opens |



|                   |                               |
| ----------------- | ----------------------------- |
| **Result**        |                               |
| **Tester / Date** |                               |
| **Notes**         | Guard uses `action="update"`. |




### C6 — Auth-only routes never module-gated


| ID  | Persona | URL                | Expected           |
| --- | ------- | ------------------ | ------------------ |
| C6a | P-EMPTY | `/dashboard`       | Loads              |
| C6b | P-EMPTY | `/profile`         | Loads (My Profile) |
| C6c | P-EMPTY | `/update-password` | Loads              |



|                   |     |
| ----------------- | --- |
| **Result**        |     |
| **Tester / Date** |     |
| **Notes**         |     |




### C7 — No token → login


|                   |                                                         |
| ----------------- | ------------------------------------------------------- |
| **Steps**         | 1. Logout / clear `access_token`. 2. Visit `/patients`. |
| **Expected**      | Redirect `/login`.                                      |
| **Result**        |                                                         |
| **Tester / Date** |                                                         |
| **Notes**         |                                                         |


---



## D. Button / CTA hiding (same session, real clicks)



### D1 — Patient list “Add Patient”


| Persona                        | Expected                           |
| ------------------------------ | ---------------------------------- |
| P-RECEPTION (`patient.create`) | Button **visible**; opens add flow |
| P-VIEW-ONLY                    | Button **hidden**                  |
| P-ADMIN                        | Button **visible**                 |



|                   |        |
| ----------------- | ------ |
| **Result**        | Pass   |
| **Tester / Date** | Sachin |
| **Notes**         |        |




### D2 — Employees “Add Employee”


| Persona                       | Expected |
| ----------------------------- | -------- |
| P-HR                          | Visible  |
| P-DOCTOR (no employee create) | Hidden   |
| P-ADMIN                       | Visible  |



|                   |        |
| ----------------- | ------ |
| **Result**        | Pass   |
| **Tester / Date** | Sachin |
| **Notes**         |        |




### D3 — Suppliers “Add Supplier” + Fill Stock action


| Persona                     | Expected                                                                 |
| --------------------------- | ------------------------------------------------------------------------ |
| P-PHARMACY                  | Add visible; Fill Stock / update action available when `medicine.update` |
| P-VIEW-ONLY (medicine view) | Add **hidden**; fill-stock entry **hidden** or blocked                   |
| P-RECEPTION                 | Suppliers not in sidebar; cannot reach page                              |



|                   |     |
| ----------------- | --- |
| **Result**        |     |
| **Tester / Date** |     |
| **Notes**         |     |




### D4 — Patient overview “Add Appointment”


| Persona                             | Path                             | Expected                                 |
| ----------------------------------- | -------------------------------- | ---------------------------------------- |
| P-RECEPTION                         | `/patients/patient-overview/:id` | Add appointment CTA visible              |
| P-VIEW-ONLY                         | same                             | CTA hidden                               |
| P-DOCTOR with appointment view only | same                             | CTA hidden if `appointment.create` false |



|                   |                                  |
| ----------------- | -------------------------------- |
| **Result**        |                                  |
| **Tester / Date** |                                  |
| **Notes**         | Uses `canCreate("appointment")`. |




### D5 — Appointment details → start / add prescription


| Persona                          | Expected                                             |
| -------------------------------- | ---------------------------------------------------- |
| P-DOCTOR (`prescription.create`) | Prescription create CTA available when status allows |
| P-RECEPTION (no prescription)    | CTA hidden                                           |
| P-VIEW-ONLY                      | CTA hidden                                           |



|                   |                                                                                  |
| ----------------- | -------------------------------------------------------------------------------- |
| **Result**        |                                                                                  |
| **Tester / Date** |                                                                                  |
| **Notes**         | Also covered on dashboard queue “Start Consult” via `canCreate("prescription")`. |




### D6 — Dashboard quick actions


| Persona     | Expected                                                                                             |
| ----------- | ---------------------------------------------------------------------------------------------------- |
| P-RECEPTION | “Add patient” style actions if `canCreate("patient")`; appointment links if `canView("appointment")` |
| P-EMPTY     | No module CTAs that require create/view; dashboard still loads                                       |
| P-ADMIN     | All relevant CTAs visible                                                                            |



|                   |                                     |
| ----------------- | ----------------------------------- |
| **Result**        |                                     |
| **Tester / Date** |                                     |
| **Notes**         | Walk Overview KPIs / queue buttons. |


---



## E. End-to-end real workflows (happy + deny)



### E1 — Reception day: register + book (allowed)


|                   |                                                                                                                                           |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Persona**       | P-RECEPTION                                                                                                                               |
| **Steps**         | 1. Login. 2. Patients → Add Patient → complete. 3. Open patient → Add Appointment → book. 4. Confirm appointment appears in Appointments. |
| **Expected**      | Full flow succeeds. Cannot open Suppliers / Prescription / Employees.                                                                     |
| **Result**        |                                                                                                                                           |
| **Tester / Date** |                                                                                                                                           |
| **Notes**         |                                                                                                                                           |




### E2 — Reception tries pharmacy URL (denied)


|                   |                                                                          |
| ----------------- | ------------------------------------------------------------------------ |
| **Persona**       | P-RECEPTION                                                              |
| **Steps**         | Paste `/suppliers` and `/prescription/add-prescription/{anyId}`.         |
| **Expected**      | Both redirect to `/dashboard`. No flash of protected UI (or only brief). |
| **Result**        |                                                                          |
| **Tester / Date** |                                                                          |
| **Notes**         |                                                                          |




### E3 — Doctor consult: prescribe (allowed)


|                   |                                                                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Persona**       | P-DOCTOR                                                                                                                                         |
| **Steps**         | 1. Open Appointments / dashboard queue. 2. Open appointment. 3. Start consult / add prescription when CTA shown. 4. Save draft/sent as designed. |
| **Expected**      | Works if `prescription.create`. Employee / supplier modules stay inaccessible if not granted.                                                    |
| **Result**        |                                                                                                                                                  |
| **Tester / Date** |                                                                                                                                                  |
| **Notes**         |                                                                                                                                                  |




### E4 — Pharmacist dispense path (allowed)


|                   |                                                                                                             |
| ----------------- | ----------------------------------------------------------------------------------------------------------- |
| **Persona**       | P-PHARMACY                                                                                                  |
| **Steps**         | 1. Prescription list → open sent Rx → checkout / pay as designed. 2. Suppliers → Fill Stock for a supplier. |
| **Expected**      | Prescription view + medicine update flows work. Patient **create** and Employees blocked if not in ACL.     |
| **Result**        |                                                                                                             |
| **Tester / Date** |                                                                                                             |
| **Notes**         |                                                                                                             |




### E5 — View-only auditor browse (no mutations)


|                   |                                                                                                       |
| ----------------- | ----------------------------------------------------------------------------------------------------- |
| **Persona**       | P-VIEW-ONLY                                                                                           |
| **Steps**         | Open every sidebar list. Confirm no Add buttons. Paste all create URLs from C3.                       |
| **Expected**      | Lists load; creates blocked by UI + route guard.                                                      |
| **Result**        |                                                                                                       |
| **Tester / Date** |                                                                                                       |
| **Notes**         | Backend should also reject create APIs — note if UI is blocked but API still succeeds (security gap). |




### E6 — Admin does everything


|                   |                                                                                                 |
| ----------------- | ----------------------------------------------------------------------------------------------- |
| **Persona**       | P-ADMIN                                                                                         |
| **Steps**         | Spot-check: add patient, add employee, open suppliers fill-stock, open prescription create CTA. |
| **Expected**      | All succeed regardless of empty `permissions` array.                                            |
| **Result**        |                                                                                                 |
| **Tester / Date** |                                                                                                 |
| **Notes**         |                                                                                                 |


---



## F. Edge / regression



### F1 — `view: false` but module present in array


|                   |                                                                                                |
| ----------------- | ---------------------------------------------------------------------------------------------- |
| **Setup**         | Permission entry for `patient` with `view: false` (all false).                                 |
| **Expected**      | Patients **not** in sidebar; `/patients` → `/dashboard`. Same as omitted module for `canView`. |
| **Result**        |                                                                                                |
| **Tester / Date** |                                                                                                |
| **Notes**         |                                                                                                |




### F2 — Create without view (misconfigured role)


|                   |                                                                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Setup**         | `patient`: `view: false`, `create: true`.                                                                                                         |
| **Expected**      | Document actual behaviour: sidebar hidden; `/patients/add-patient` may still pass create guard. Flag as product bug if create works without view. |
| **Result**        |                                                                                                                                                   |
| **Tester / Date** |                                                                                                                                                   |
| **Notes**         |                                                                                                                                                   |




### F3 — Tamper localStorage permissions


|                   |                                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Persona**       | P-RECEPTION                                                                                                              |
| **Steps**         | 1. Login. 2. Edit `user_permissions` to add `employee` view+create. 3. Refresh. 4. Open `/employees`.                    |
| **Expected**      | **Frontend** may show Employees (client-side only). **Backend** list/create APIs must still return 401/403. Record both. |
| **Result**        |                                                                                                                          |
| **Tester / Date** |                                                                                                                          |
| **Notes**         | Critical: UI ACL is not security; API must enforce.                                                                      |




### F4 — Tamper `is_admin` to true


|                   |                                                                       |
| ----------------- | --------------------------------------------------------------------- |
| **Steps**         | As P-RECEPTION set `is_admin` = `"true"`, refresh.                    |
| **Expected**      | Frontend unlocks all modules. API must still deny unauthorized calls. |
| **Result**        |                                                                       |
| **Tester / Date** |                                                                       |
| **Notes**         |                                                                       |




### F5 — Switch user without full logout (if possible)


|                   |                                                                          |
| ----------------- | ------------------------------------------------------------------------ |
| **Steps**         | Login as P-RECEPTION → logout → login as P-DOCTOR.                       |
| **Expected**      | Sidebar and buttons match doctor ACL; no leftover reception permissions. |
| **Result**        |                                                                          |
| **Tester / Date** |                                                                          |
| **Notes**         |                                                                          |




### F6 — Bed arrangement routes (known gap)


|                   |                                                                                                                                     |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Steps**         | Logged out or as P-EMPTY: visit `/bed-arrangement`.                                                                                 |
| **Expected**      | Document current behaviour. **Desired:** require login (+ permissions). If still public, mark **Fail** / ticket (see AUDIT_REPORT). |
| **Result**        |                                                                                                                                     |
| **Tester / Date** |                                                                                                                                     |
| **Notes**         |                                                                                                                                     |


---



## G. Smoke matrix (quick daily check)

Run after any RBAC / login / sidebar change. Mark whole matrix P/F.


| Persona     | Sidebar OK | Deep-link deny OK | Create buttons OK | One happy E2E |
| ----------- | ---------- | ----------------- | ----------------- | ------------- |
| P-ADMIN     |            |                   |                   |               |
| P-RECEPTION |            |                   |                   |               |
| P-DOCTOR    |            |                   |                   |               |
| P-PHARMACY  |            |                   |                   |               |
| P-VIEW-ONLY |            |                   |                   |               |
| P-EMPTY     |            |                   |                   |               |



|                   |     |
| ----------------- | --- |
| **Tester / Date** |     |
| **Notes**         |     |


---



## Out of scope / follow-ups

- Backend role/permission admin UI (assigning modules to roles) — test separately when shipped.
- `delete` action UI (minimal today).
- Fine-grained field-level ACL.
- Fixing public bed-arrangement routes (tracked as product bug, still listed in F6).

