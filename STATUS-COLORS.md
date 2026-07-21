# Status Color System

The hospital frontend uses **exactly four semantic status colors** everywhere. No other tag or status colors (cyan, purple, gold, volcano, yellow, orange, etc.) are permitted.

## The four types

| Type | Role | Default | Use when |
|------|------|---------|----------|
| **Info** | In progress / informational | `#2563EB` | Scheduled, sent, payment link created, codes, visit types, new items |
| **Success** | Complete / healthy | `#16A34A` | Active, completed, dispensed, paid, bill paid |
| **Warning** | Needs attention | `#D97706` | Pending, waiting, partial dispense, on leave, draft, yet to pay |
| **Danger** | Blocked / negative | `#DC2626` | Cancelled, inactive, expired, missed |

## CSS variables

Defined in `src/index.css`:

```css
--status-info-lightest / --status-info-lighter / --status-info-default / --status-info-darker / --status-info-darkest
--status-success-lightest / … / --status-success-darkest
--status-warning-lightest / … / --status-warning-darkest
--status-danger-lightest / … / --status-danger-darkest
```

Use **lighter** shades for tag backgrounds, **darker** for tag text, and **default** for borders and emphasis.

## How to use in code

### 1. Prefer `StatusTag` component

```tsx
import { StatusTag } from '../components/status-tag';
import { getAppointmentStatusType } from '../constants/status-colors';

<StatusTag type={getAppointmentStatusType(row.status)}>
  {row.status}
</StatusTag>
```

**Do not** pass Ant Design's `color` prop on `<Tag>` for status or labels.

### 2. Status mappers

| Helper | Module |
|--------|--------|
| `getPatientStatusType()` | Patient list, profile |
| `getAppointmentStatusType()` | Appointments |
| `getPrescriptionStatusType()` | Prescriptions, checkout |
| `getEmployeeStatusType()` | Employees |
| `getSupplierStatusType()` | Pharmacy / suppliers |
| `getQueueStatusType()` | Dashboard queue |

For neutral identifiers (appointment code, RX code, medicine form, visit type), use `STATUS_INFO` (`'info'`).

### 3. CSS classes

If you cannot use the component, apply:

```html
<Tag className="status-tag status-tag--info app-tag" bordered>...</Tag>
```

Classes: `status-tag--info` | `status-tag--success` | `status-tag--warning` | `status-tag--danger`

## Domain mapping reference

### Patient

| Status | Color |
|--------|-------|
| Active, Completed | Success |
| Pending | Warning |
| Cancelled, Inactive | Danger |

### Appointment

| Status | Color |
|--------|-------|
| Scheduled, Upcoming, Ongoing | Info |
| Completed | Success |
| Reschedule required | Warning |
| Cancelled, Missed | Danger |

### Prescription

| Status | Color |
|--------|-------|
| Sent, Payment link created | Info |
| Dispensed / Fully dispensed | Success |
| Draft, Pending, Partially dispensed | Warning |
| Expired, Cancelled | Danger |

### Employee

| Status | Color |
|--------|-------|
| Active | Success |
| On leave | Warning |
| Inactive | Danger |

### Supplier

| Status | Color |
|--------|-------|
| Active | Success |
| Inactive | Danger |

## Ant Design theme

`App.tsx` sets global tokens so messages, alerts, and progress indicators align:

- `colorInfo` → info blue  
- `colorSuccess` → success green  
- `colorWarning` → warning amber  
- `colorError` → danger red  

Brand primary (`#25D366`) remains for **CTA buttons only**, not status tags.

## Rules for contributors

1. Never use `<Tag color="…">` with Ant Design preset names.
2. Never introduce a fifth status color.
3. Use `StatusTag` + mapper helpers for all workflow states.
4. Use `STATUS_INFO` for codes and categorical labels (visit type, medicine form).
5. Use CSS variables (`var(--status-*-*)`) in custom CSS instead of hard-coded hex for status UI.
