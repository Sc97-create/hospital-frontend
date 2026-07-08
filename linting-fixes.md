# Linting Fixes — CI/CD ESLint & TypeScript Cleanup

> Resolves all **190 ESLint errors** that were failing the Frontend CI pipeline (`npm run lint` → `npm run build`).
> CI workflow: `.github/workflows/frontend.yaml`

---

## Summary

| Metric | Before | After |
|---|---|---|
| ESLint errors | 190 | **0** |
| ESLint warnings | 7 | 7 (non-blocking) |
| Files affected | 37 | 40 |
| `npm run build` | Failed | **Passes** |

### Error breakdown (before)

| Rule | Count | Resolution |
|---|---|---|
| `@typescript-eslint/no-unused-vars` | 147 | Removed dead imports, state, and variables |
| `@typescript-eslint/no-explicit-any` | 39 | Replaced with typed interfaces or `unknown` |
| `react-hooks/rules-of-hooks` | 4 | Renamed mutation helpers to `use*` hooks |

---

## CI Trigger Errors (original report)

These were the first 10 errors surfaced in the GitHub Actions annotations:

| File | Issue | Fix |
|---|---|---|
| `src/App.tsx` | Unused `AddPermission`, `ThirdStep`, `PreviewAppointment` imports | Removed imports |
| `src/Signup.tsx` | Unused `Row`, `Col`, `Form`, `Input`, `Button` imports | Trimmed to `Steps` only |
| `src/appointment-step/features/first-step-appointment.tsx` | Unused `Space`, `Dropdown` imports | Removed along with other dead imports/state |

---

## React Hooks — Mutation Renames

ESLint `react-hooks/rules-of-hooks` requires hook functions to start with `use`.

| File | Before | After |
|---|---|---|
| `signup-step/features/first-step/createOrganisation.ts` | `createOrg()` | `useCreateOrg()` |
| `signup-step/features/first-step/updateOrganisation.ts` | `updateOrg()` | `useUpdateOrg()` |
| `signup-step/features/third-step/createadmin.ts` | `createAdmin()` | `useCreateAdmin()` |
| `signup-step/features/third-step/updateadmin.ts` | `updateAdmin()` | `useUpdateAdmin()` |

Consumers updated in `first-step.tsx` and `third-step.tsx`.

---

## New / Extended Type Definitions

| File | Types added or extended |
|---|---|
| `signup-step/types/common-api.ts` | `OrganisationAddress`, `OrganisationData`, `UserData` |
| `appointment-step/types/first-step-appointment.ts` | `AppointmentCreateData` (replaces `any` on response) |
| `employees/api/add-permissions.tsx` | `Permission`, `PermissionModule`, `GetPermissionsResponse` |
| `employees/add-permissions/add-permission.tsx` | `SelectedPermission` |
| `prescriptions/types/prescriptionmodel.ts` | `SearchMedicineItem`, `UpdateStatusResponse`; `medicines` typed as `medicineResponse[]` |
| `prescriptions/add-prescription.tsx` | `MedicineOption`, `PrescriptionFormValues`, `SearchMedicineItem` |
| `prescriptions/prescription-preview.tsx` | `PrescriptionRow` |
| `appointment-step/features/second-step-appointment.tsx` | `SecondStepFormValues` |
| `patientmangement/bedarrangement/rooms.tsx` | `CreateRoomsFormValues` |
| `patientmangement/bedarrangement/roomtype.tsx` | `RoomTypeFormValues` |
| `lib/api-client.ts` | `QueuedRequest` (refresh token queue) |

---

## Changes by Module

### App shell & routing

| File | What changed |
|---|---|
| `src/App.tsx` | Removed unused route component imports |
| `src/Signup.tsx` | Removed unused antd imports; typed `organisationData` / `userData` state with `OrganisationData \| null` and `UserData \| null` |
| `src/dashboard.tsx` | Removed unused antd/icon imports, `items` array, `hover` state; `const [collapse] = useState(false)` |
| `src/header.tsx` | Removed unused `React` import |
| `src/sidebar.tsx` | Removed unused `React` import |
| `src/auth/authguard.tsx` | Replaced `any` props with `{ children: ReactNode }` |
| `src/authentication/Login.tsx` | Removed unused `Checkbox`, `Space` imports |

### Appointment flow

| File | What changed |
|---|---|
| `src/appointment-step/appointment.tsx` | Removed unused `React` import |
| `src/appointment-step/features/first-step-appointment.tsx` | Removed 20+ unused imports/state hooks; typed API response instead of `any` |
| `src/appointment-step/features/second-step-appointment.tsx` | Removed unused imports/state; added `SecondStepFormValues`; `String(base_price)` for form field |
| `src/appointment-step/features/third-step-appointment.tsx` | Removed unused `patientID` from `useParams` |
| `src/appointment-step/types/first-step-appointment.ts` | Replaced `data: any` with `AppointmentCreateData` |

### Signup flow

| File | What changed |
|---|---|
| `src/signup-step/features/first-step/first-step.tsx` | Hook renames; `OrganisationData \| null` prop type; removed unused `current` state |
| `src/signup-step/features/second-step/second-step.tsx` | `OrganisationData \| null` prop; removed unused audit/emergency state |
| `src/signup-step/features/third-step/third-step.tsx` | Hook renames; `UserData \| null` prop; removed unused `Progress` import |
| `src/signup-step/features/fourth-step/fourth-step.tsx` | Typed props; removed unused `Header`/`Footer`; optional chaining on address fields |

### Patient management

| File | What changed |
|---|---|
| `src/patientmangement/patientlist/patient-list.tsx` | Removed unused imports and erroneous stub `dayjs` function |
| `src/patientmangement/singlepatientdetail/patient-profile.tsx` | Removed unused `Col`, `Row` imports |
| `src/patientmangement/bedarrangement/beds.tsx` | Removed unused imports/vars; removed unused `React` import |
| `src/patientmangement/bedarrangement/rooms.tsx` | Removed unused imports; `RoomData[]` instead of `any[]` |
| `src/patientmangement/bedarrangement/roomtype.tsx` | Removed unused `Steps` import and `roomtypedata` state |
| `src/patientmangement/api/beds.tsx` | Removed unused type import |

### Prescriptions

| File | What changed |
|---|---|
| `src/prescriptions/add-prescription.tsx` | Removed unused imports/mock data; full type coverage for form and search |
| `src/prescriptions/prescription-preview.tsx` | Removed unused `TextArea`; typed table render functions |
| `src/prescriptions/api/prescription.ts` | Removed unused `Medicine` import; typed return values |
| `src/prescriptions/types/prescriptionmodel.ts` | Replaced `any[]` with proper medicine types |

### Employees

| File | What changed |
|---|---|
| `src/employees/add-employee/add-employee.tsx` | Removed unused `CalendarOutlined` import |
| `src/employees/add-permissions/add-permission.tsx` | Typed permission state; removed unused select-all helpers |
| `src/employees/api/add-permissions.tsx` | Added response interfaces (replaces `Promise<any>`) |

### Suppliers

| File | What changed |
|---|---|
| `src/suppliers/pharmacy.tsx` | Removed unused imports, state, and drawer handlers |
| `src/suppliers/add-pharmacy.tsx` | Trimmed to `Tabs` / `TabsProps` only |
| `src/suppliers/add-manual-form.tsx` | Removed unused imports; `Record<string, unknown>` for form values |
| `src/suppliers/upload-inovice.tsx` | Removed unused table/pagination imports and `DataType` interface |

### Shared / lib

| File | What changed |
|---|---|
| `src/lib/api-client.ts` | Typed refresh-token queue with `QueuedRequest` |
| `src/shared/api/shared-api.ts` | `GetDoctors` return type `Promise<unknown>` |

---

## TypeScript Build Fixes

Additional fixes required after lint cleanup for `tsc -b`:

| File | Issue | Fix |
|---|---|---|
| Multiple files | `React` imported but unused (TS6133) | Removed default `React` imports (React 17+ JSX transform) |
| `Signup.tsx` | `useState(null)` incompatible with `OrganisationData` / `UserData` | Explicit generic: `useState<OrganisationData \| null>(null)` |
| `second-step-appointment.tsx` | `number` not assignable to `string` for `bed_charges` | `String(selectedType.base_price)` |

---

## Remaining Warnings (non-blocking)

These do **not** fail CI. They are `react-hooks/exhaustive-deps` warnings:

| File | Missing dependency |
|---|---|
| `src/Signup.tsx` | `FetchUserData`, `fetchorganisationData` |
| `src/patientmangement/bedarrangement/rooms.tsx` | `roomtype` |
| `src/patientmangement/patientlist/patient-list.tsx` | `pagination` |
| `src/prescriptions/add-prescription.tsx` | `currentPage` |
| `src/signup-step/features/first-step/first-step.tsx` | `form` |
| `src/signup-step/features/second-step/second-step.tsx` | `form` |
| `src/signup-step/features/third-step/third-step.tsx` | `form` |

To resolve later: wrap fetch helpers in `useCallback`, or add targeted `eslint-disable-next-line` comments where intentional.

---

## Verification

```bash
npm run lint    # 0 errors, 7 warnings
npm run build   # passes (tsc -b && vite build)
```

---

## Related docs

- [changes-accepted.md](./changes-accepted.md) — UI/UX audit fixes
- [typography-standardisation.md](./typography-standardisation.md) — font size CSS variable audit
- [.github/workflows/frontend.yaml](./.github/workflows/frontend.yaml) — CI pipeline definition
