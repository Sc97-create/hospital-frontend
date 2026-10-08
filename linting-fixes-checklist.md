# Linting Fixes — Checklist

Quick reference for CI lint/build cleanup. Full details: [linting-fixes.md](./linting-fixes.md).

## CI status

- [x] `npm run lint` — 0 errors
- [x] `npm run build` — passes
- [ ] Resolve 7 `react-hooks/exhaustive-deps` warnings (optional, non-blocking)

## Fix categories

- [x] Remove unused imports and variables (`no-unused-vars`) — 147 fixes
- [x] Replace `any` with typed interfaces (`no-explicit-any`) — 39 fixes
- [x] Rename mutation hooks to `use*` prefix (`rules-of-hooks`) — 4 fixes
- [x] TypeScript build errors (unused `React`, state generics, type mismatches)

## Files changed (40)

### App shell
- [x] `src/App.tsx`
- [x] `src/Signup.tsx`
- [x] `src/dashboard.tsx`
- [x] `src/header.tsx`
- [x] `src/sidebar.tsx`
- [x] `src/auth/authguard.tsx`
- [x] `src/authentication/Login.tsx`
- [x] `src/lib/api-client.ts`
- [x] `src/shared/api/shared-api.ts`

### Appointments
- [x] `src/appointment-step/appointment.tsx`
- [x] `src/appointment-step/features/first-step-appointment.tsx`
- [x] `src/appointment-step/features/second-step-appointment.tsx`
- [x] `src/appointment-step/features/third-step-appointment.tsx`
- [x] `src/appointment-step/types/first-step-appointment.ts`

### Signup
- [x] `src/signup-step/features/first-step/createOrganisation.ts`
- [x] `src/signup-step/features/first-step/updateOrganisation.ts`
- [x] `src/signup-step/features/first-step/first-step.tsx`
- [x] `src/signup-step/features/second-step/second-step.tsx`
- [x] `src/signup-step/features/third-step/createadmin.ts`
- [x] `src/signup-step/features/third-step/updateadmin.ts`
- [x] `src/signup-step/features/third-step/third-step.tsx`
- [x] `src/signup-step/features/fourth-step/fourth-step.tsx`
- [x] `src/signup-step/types/common-api.ts`

### Patient management
- [x] `src/patientmangement/patientlist/patient-list.tsx`
- [x] `src/patientmangement/singlepatientdetail/patient-profile.tsx`
- [x] `src/patientmangement/bedarrangement/beds.tsx`
- [x] `src/patientmangement/bedarrangement/rooms.tsx`
- [x] `src/patientmangement/bedarrangement/roomtype.tsx`
- [x] `src/patientmangement/api/beds.tsx`

### Prescriptions
- [x] `src/prescriptions/add-prescription.tsx`
- [x] `src/prescriptions/prescription-preview.tsx`
- [x] `src/prescriptions/api/prescription.ts`
- [x] `src/prescriptions/types/prescriptionmodel.ts`

### Employees
- [x] `src/employees/add-employee/add-employee.tsx`
- [x] `src/employees/add-permissions/add-permission.tsx`
- [x] `src/employees/api/add-permissions.tsx`

### Suppliers
- [x] `src/suppliers/pharmacy.tsx`
- [x] `src/suppliers/add-pharmacy.tsx`
- [x] `src/suppliers/add-manual-form.tsx`
- [x] `src/suppliers/upload-inovice.tsx`
