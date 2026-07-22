# Patient Pages — Testing Scenarios

Manual QA checklist for patient flows. Use with a logged-in user and a valid `organisation_id` in localStorage.

**Routes under test**

| Screen | Path |
|--------|------|
| Patient list | `/patients` |
| Add patient | `/patients/add-patient` |
| Patient profile | `/patients/patient-overview/:patientID` |
| Add appointment (existing) | `/patients/addappointment/:patientID` |

**Related entry points**

| From | Action | Expected |
|------|--------|----------|
| Overview Quick Actions | Add New Patient | `/patients/add-patient` |
| Overview Quick Actions | Book Appointment | `/patients` |
| Overview search (when API live) | Select patient | `/patients/patient-overview/:id` |

---

## Preconditions

- [ ] User is logged in (`access_token` present)
- [ ] `organisation_id` is set in localStorage
- [ ] Backend `GET /patients/getPatients` and `GET /patients/getpatientByID/:id` reachable
- [ ] At least one test org with 0 patients (empty) and one with multiple patients (populated)

---

## A. Patient list (`/patients`)

### A1 — Page load (populated)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open `/patients` | Sidebar shows Patients selected; breadcrumb Home → Patients |
| 2 | Wait for API | Table shows loading spinner, then rows |
| 3 | Inspect columns | Code, Patient Name, Age, Weight, Gender, Issued At, Status |
| 4 | Check Code | Shown as yellow tag with `#` + `patient_code` |
| 5 | Check Status tags | pending=orange, active=green, completed=blue, cancelled=red |
| 6 | Check footer | Pagination visible; total reflects API `total` |

**Pass criteria:** List matches API data for current org; no console crash.

### A2 — Empty list

| Step | Action | Expected |
|------|--------|----------|
| 1 | Use org with 0 patients | Table empty state (Ant empty); total 0 |
| 2 | Click **Add New Patient** | Navigates to `/patients/add-patient` |

### A3 — Loading / error

| Step | Action | Expected |
|------|--------|----------|
| 1 | Throttle network or delay API | Table `loading={true}` |
| 2 | Force API 401/500 | Page does not white-screen (today: error only in console — note as known gap) |
| 3 | Missing `organisation_id` | Request still fires with `""` — note as known gap |

### A4 — Pagination

| Step | Action | Expected |
|------|--------|----------|
| 1 | Org with >10 patients | Page 1 shows ≤10 rows |
| 2 | Go to page 2 | New request with `page_no=2`; rows update |
| 3 | Change page size if available | Refetch with new `limit` |

**Known gap:** Footer label uses `response?.data?.length` (page size), not `response.total`.

### A5 — Sort & filter

| Step | Action | Expected |
|------|--------|----------|
| 1 | Sort Age | Client-side reorder |
| 2 | Sort Issued At | Client-side by date |
| 3 | Filter Gender Male/Female | Rows filter client-side |

### A6 — Navigation from list

| Step | Action | Expected |
|------|--------|----------|
| 1 | Click patient name | `/patients/patient-overview/:patient_id` |
| 2 | Click **Add New Patient** | `/patients/add-patient` |
| 3 | Breadcrumb Home | `/dashboard` |

### A7 — Search (current behavior)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Type in “search patients” | **Known gap:** input is UI-only; does not filter or call API |
| 2 | Click search icon | No filter applied |

**Future pass criteria (when wired):** debounce search by name / UHID / phone; empty → “No patients found”.

---

## B. Add patient (`/patients/add-patient`)

### B1 — Happy path

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open add patient | Patient Details form (name, phone, etc.) |
| 2 | Fill required fields | Validation passes |
| 3 | Submit | API create succeeds; navigate to `/patients` |
| 4 | Open list | New patient appears (may need refresh/page 1) |

### B2 — Validation

| Step | Action | Expected |
|------|--------|----------|
| 1 | Submit empty form | Field errors; no API call |
| 2 | Invalid phone / missing name | Inline validation messages |

### B3 — API failure

| Step | Action | Expected |
|------|--------|----------|
| 1 | Force create API error | Error logged; user stays on form (improve toast later) |
| 2 | Success without `patient_id` in response | Stays / logs “Missing patient ID” — note as edge case |

### B4 — Auth / org context

| Step | Action | Expected |
|------|--------|----------|
| 1 | Submit with valid session | Payload includes `organisation_id` and `user_id` from localStorage |
| 2 | Clear org id and submit | Request may fail or create under wrong scope — note as risk |

---

## C. Patient profile (`/patients/patient-overview/:patientID`)

### C1 — Load populated profile

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open valid patient ID | `findOne` loads; header shows name, UHID, gender, age, phone, status |
| 2 | Breadcrumb | Home → Patient List → Patient Overview |
| 3 | Click Patient List | `/patients` |

### C2 — Header actions

| Step | Action | Expected |
|------|--------|----------|
| 1 | **Add Appointment** | `/patients/addappointment/:patientID` |
| 2 | **Prescription** | `/prescription` |
| 3 | Vitals / Lab Report / Billing | Buttons visible; **known gap:** no navigation yet |

### C3 — Tabs

| Tab | Expected today |
|-----|----------------|
| Overview | Renders `PatientOverview` with patient data |
| Appointments | Renders `PatientAppointmentHistory` |
| Prescriptions | Tab clickable; **no content** (stub) |
| Vitals | Stub |
| Lab Reports | Stub |
| Documents | Stub |
| Billing | Stub |
| Timeline | Stub |

### C4 — Invalid / missing patient

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open unknown `patientID` | API error in console |
| 2 | Observe header | **Known gap:** fallbacks show placeholder name/age/phone (`Rajesh`, `34`, etc.) instead of clear “Patient not found” |

### C5 — Loading

| Step | Action | Expected |
|------|--------|----------|
| 1 | Slow `findOne` | **Known gap:** no skeleton; placeholders may flash before data |

---

## D. Add appointment for existing patient

### D1 — From profile

| Step | Action | Expected |
|------|--------|----------|
| 1 | Profile → Add Appointment | Form for that `patientID` |
| 2 | Pick doctor, date, slot, visit type | Slots load for org/doctor/date |
| 3 | Save | Appointment created; can verify on Appointments tab / `/appointments` |

### D2 — Validation

| Step | Action | Expected |
|------|--------|----------|
| 1 | Submit without slot/doctor | Validation errors |
| 2 | Past date / blocked slot | Slot not selectable or API rejects |

---

## E. Cross-flow scenarios (clinic day board → patients)

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| E1 | Empty Overview → add patient | Dashboard empty → Add New Patient → create → list | Patient on `/patients` |
| E2 | Empty Overview → book | Dashboard → Book Appointment → land on list → open patient → Add Appointment | Appointment created |
| E3 | List → profile → appointments | List name click → Appointments tab | History loads for patient |
| E4 | Org isolation | Login as Org A; list patients | No Org B patients |

---

## F. Responsive / iPad

| Step | Action | Expected |
|------|--------|----------|
| 1 | Width ~768–1024 | Table scrolls horizontally if needed; Add button reachable |
| 2 | Sidebar collapse | Content usable; no overlap |
| 3 | Profile header actions | Buttons wrap; still tappable (≥44px where possible) |

---

## G. Regression checklist (quick smoke)

- [ ] `/patients` loads with spinner then data
- [ ] Add New Patient creates and returns to list
- [ ] Click name opens profile with correct UHID
- [ ] Add Appointment from profile works
- [ ] Appointments tab shows history
- [ ] Breadcrumbs Home / Patient List work
- [ ] Status tags color-coded on list
- [ ] Pagination changes page without crash

---

## Known gaps to track (not failures of “happy path” if documented)

1. List search input not wired to API/filter  
2. List total count label uses page `data.length`, not `total`  
3. Profile shows hardcoded fallbacks while loading / on error  
4. Profile tabs Prescriptions / Vitals / Lab / Documents / Billing / Timeline are stubs  
5. Profile action buttons Vitals / Lab / Billing not routed  
6. List/profile error states are console-only (no user-facing Retry)  
7. Allergy / chronic tags on profile appear static (not from API)

---

## Suggested test data

| Field | Example |
|-------|---------|
| Name | Anita Desai |
| Phone | 9876543210 |
| Gender | Female |
| Age | 34 |
| Status | active |
| Second patient | Rohan Kulkarni / 9876543211 / Male / 22 |

---

## Sign-off

| Build / date | Tester | A List | B Add | C Profile | D Appt | E Cross | Notes |
|--------------|--------|--------|-------|-----------|--------|---------|-------|
| | | ☐ | ☐ | ☐ | ☐ | ☐ | |

*When automation is added later (Playwright/Vitest), convert §A–E into specs; this file remains the source of truth for coverage.*

## Added bugs
| ID | Module | Feature | Bug Title | Steps to Reproduce | Expected Result | Suggested Solution |
|----|--------|---------|-----------|--------------------|-----------------|--------------------|
| 1 | Authentication | Login | Wrong Password Error Not Displayed | Enter a valid email and incorrect password, then click Login. | System should display a "Wrong Password" error message. | Add backend validation and show appropriate error message on failed login. |
| 2 | Authentication | Forgot Password | Forgot Password Not Working | Click the "Forgot Password" link from the login page. | User should be redirected to the password reset process. | Verify routing, API, and email reset functionality. |
| 3 | Organization Setup | Time Zone | Time Zone List Incomplete | Start organization signup and open the Time Zone dropdown. | All available time zones should be displayed. | Populate the dropdown with complete time zone data. |
| 4 | Organization Setup | Permissions | All Permissions Assigned by Default | Sign up a new organization and review assigned permissions. | Users should receive permissions based on their selected role only. | Implement Role-Based Access Control (RBAC). |
| 5 | Support | Contact Support | Contact Platform Support Not Working | Click **Need Help? Contact Platform Support**. | Support page or contact form should open. | Fix navigation or support API endpoint. |
| 6 | Security | Root Access Warning | Acknowledge Button Not Working | Open Root Access Warning popup and click **Acknowledge**. | Warning popup should close after acknowledgement. | Fix button click event and popup state handling. |
| 7 | Organization Setup | Final Review | Edit Button Not Working | Navigate to Final Review page and click **Edit**. | User should be able to edit previously entered information. | Verify Edit button navigation and form binding. |
| 8 | Organization Setup | Registration Details | Tax ID/Registration Number Should Be Optional | Leave Tax ID/Registration Number blank during registration. | User should be able to continue registration successfully. | Make the field optional in UI and backend validation. |
| 9 | Authentication | Login Security | Failed Login Attempt Handling Missing | Enter an incorrect password multiple times. | System should display an error and optionally show remaining login attempts. | Implement failed login tracking and user notifications. |
| 10 | Branch Management | Default Branch | Incorrect Default Branch Displayed | Login and observe the default branch shown in the top-right corner. | User's assigned default branch should be displayed. | Load the correct branch from the user's profile. |
| 11 | Patient Management | Patient Details | Duplicate Patient Number Validation Missing | Create a patient using an existing patient number. | System should prevent duplicate entries and show an error. | Add unique validation in frontend and backend. |
| 12 | Appointment | Time Slot | Multiple Time Slots Cannot Be Added | Try adding multiple appointment time slots. | System should allow adding multiple valid time slots. | Fix time slot creation logic. |
| 13 | Appointment | Book Appointment | Book Appointment Not Working | Fill appointment details and click **Book Appointment**. | Appointment should be created successfully. | Verify API request and backend appointment creation logic. |
| 14 | Employee Management | Employee Creation | Default Employee Details Already Present | Open Employee Creation page. | Form should be blank for new employee creation. | Remove unwanted default values from the form. |
| 15 | Employee Management | Date of Birth | Future Date Allowed in DOB | Select today's date or a future date as Date of Birth. | Future dates should not be allowed. | Restrict Date of Birth to past dates only. |
| 16 | Appointment | Time Slot | Start Time and End Time Can Be Same | Create a time slot with identical start and end times. | System should prevent identical start and end times. | Add validation to ensure End Time is greater than Start Time. |
| 17 | Employee Management | Employee Creation | Employee Not Added After Success Message | Add a new employee and observe the success message. Check the employee list. | Employee should appear in the employee list immediately. | Verify database insertion and refresh the employee list after creation. |
| 18 | Notifications | Notification Center | Notification Icon Not Working | Login to the application and click the notification (bell) icon in the header. | The notification panel should open and display the user's notifications. | Verify the notification icon click event, API integration, and ensure the notification panel loads correctly. |
