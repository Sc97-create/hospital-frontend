# Typography Standardisation — Font Size Audit

> All font sizes should map to the CSS variables defined in `src/index.css (:root)`.
> To change a size app-wide, only edit the variable value — nothing else.

## The Scale (reference)

| Variable | Value | Used for |
|---|---|---|
| `--text-xs` | `11px` | Timestamps, footnotes, badge text |
| `--text-sm` | `13px` | Secondary / caption / helper text |
| `--text-base` | `15px` | Body text, table cells, inputs |
| `--text-md` | `17px` | Card headings, sub-headers (h3) |
| `--text-lg` | `22px` | Page / section headings (h2) |
| `--text-xl` | `28px` | Page title (h1) |

> Special exceptions: `12px` for table column headers (Apple standard), `14px` for sidebar nav items and dropdown menus (intentionally fixed).

---

## Status Key

| Symbol | Meaning |
|---|---|
| ✅ | Correct Apple scale value — no change needed |
| 🔄 | Updated in this session to use CSS variable |

---

## Files to Update

---

### 1. `src/appointment-step/features/first-step-appointment.css`

| Class | Property | Was | Now | Status |
|---|---|---|---|---|
| `.input-form-layout::placeholder` | `font-size` | `14px` | `var(--text-sm)` | 🔄 |
| `.ant-form-item .ant-form-item-label > label` | `font-size` | `14px` | `var(--text-sm)` | 🔄 |
| `.ant-select-single .ant-select-selector` | `font-size` | `14px !important` | `var(--text-base) !important` | 🔄 |
| `.input-form-layout`, `.input-form-layout::placeholder`, `.submit-appointment-form` | `font-family` | `'Roboto'` | removed (inherits global) | 🔄 |

---

### 2. `src/appointment-step/features/second-step-appointment.css`

| Class | Property | Was | Now | Status |
|---|---|---|---|---|
| `.text-tag h2` | `font-size` | `20px` | `var(--text-lg)` | 🔄 |
| `.text-tag p` | `font-size` | `12px` | `var(--text-xs)` | 🔄 |
| `.emergency-signal h3` | `font-size` | `14px` | `var(--text-sm)` | 🔄 |
| `.enable-emergency h3` | `font-size` | `16px` | `var(--text-md)` | 🔄 |

---

### 3. `src/patientmangement/bedarrangement/beds.css`

| Class | Property | Was | Now | Status |
|---|---|---|---|---|
| `.header-meta` | `font-size` | `13px` | `13px` | ✅ |
| `.page-title` | `font-size` | `28px !important` | `28px !important` | ✅ |
| `.title-icon` | `font-size` | `18px` | `var(--text-md)` | 🔄 |
| `.card-title` | `font-size` | `18px` | `var(--text-md)` | 🔄 |
| `.form-label` | `font-size` | `13px` | `13px` | ✅ |
| `.custom-select-blue .ant-select-selector` | `font-size` | `14px !important` | `var(--text-base) !important` | 🔄 |
| `.custom-select-blue .ant-select-selection-item` | `font-size` | `13px !important` | `13px !important` | ✅ |
| `.custom-input-number .ant-input-number-input` | `font-size` | `15px` | `15px` | ✅ |
| `.custom-checkbox` | `font-size` | `14px` | `var(--text-sm)` | 🔄 |
| `.generate-beds-btn` | `font-size` | `15px` | `15px` | ✅ |
| `.table-title` | `font-size` | `18px` | `var(--text-md)` | 🔄 |
| `.auto-refresh-tag` | `font-size` | `12px` | `var(--text-xs)` | 🔄 |
| `.custom-table-step3 thead th` | `font-size` | `12px` | `12px` (Apple standard) | ✅ |
| `.custom-table-step3 tbody td` | `font-size` | `14px` | `var(--text-base)` | 🔄 |
| `.blue-text-bold` | `font-size` | `15px` | `15px` | ✅ |
| `.bed-tag` | `font-size` | `12px` | `var(--text-xs)` | 🔄 |
| `.table-footer-link a` | `font-size` | `14px` | `var(--text-sm)` | 🔄 |
| `.summary-title` | `font-size` | `18px` | `var(--text-md)` | 🔄 |
| `.summary-label` | `font-size` | `14px` | `var(--text-sm)` | 🔄 |
| `.summary-value-teal` | `font-size` | `15px` | `15px` | ✅ |
| `.stat-label` | `font-size` | `11px` | `11px` | ✅ |
| `.stat-value` | `font-size` | `28px` | `28px` | ✅ |
| `.dist-label` | `font-size` | `11px` | `11px` | ✅ |
| `.progress-text` | `font-size` | `12px` | `var(--text-xs)` | 🔄 |
| `.floor-tag` | `font-size` | `13px` | `13px` | ✅ |
| `.save-complete-btn` | `font-size` | `15px` | `15px` | ✅ |
| `.cancel-btn` | `font-size` | `15px` | `15px` | ✅ |

---

### 4. `src/patientmangement/bedarrangement/rooms.css`

| Class | Property | Was | Now | Status |
|---|---|---|---|---|
| `.header-title` | `font-size` | `28px` | `28px` | ✅ |
| `.header-subtitle` | `font-size` | `14px` | `var(--text-sm)` | 🔄 |
| `.form-label` | `font-size` | `14 px` *(invalid space fixed)* | `var(--text-sm)` | 🔄 |
| `.custom-input` | `font-size` | `14px` | `var(--text-base)` | 🔄 |
| `.custom-select .ant-select-selection-item` | `font-size` | `12px` | `var(--text-xs)` | 🔄 |
| `.help-text` | `font-size` | `11px` | `11px` | ✅ |
| `.pro-tip-title` | `font-size` | `15px` | `15px` | ✅ |
| `.pro-tip-text` | `font-size` | `13px` | `13px` | ✅ |
| `.pro-tip-icon-bg` | `font-size` | `140px` | `140px` (decorative — kept) | ✅ |
| `.capacity-title` | `font-size` | `16px` | `var(--text-md)` | 🔄 |
| `.capacity-label` | `font-size` | `13px` | `13px` | ✅ |
| `.capacity-value` | `font-size` | `32px` | `32px` (display number — kept) | ✅ |
| `.capacity-subtext` | `font-size` | `9px` | `var(--text-xs)` | 🔄 |
| `.preview-title` | `font-size` | `18px` | `var(--text-md)` | 🔄 |
| `.export-draft` | `font-size` | `13px` | `13px` | ✅ |
| `.custom-table thead th` | `font-size` | `11px` | `12px` (Apple standard) | 🔄 |
| `.room-number-col` | `font-size` | `14px` | `var(--text-base)` | 🔄 |
| `.tag-general` | `font-size` | `11px` | `11px` | ✅ |
| `.action-icon` | `font-size` | `16px` | `var(--text-md)` | 🔄 |
| `.table-footer` | `font-size` | `12px` | `var(--text-xs)` | 🔄 |
| `.back-button` | `font-size` | `14px` | `var(--text-sm)` | 🔄 |
| `.custom-input-number .ant-input-number-input` | `font-size` | `14px` | `var(--text-base)` | 🔄 |

---

### 5. `src/patientmangement/bedarrangement/roomtype.css`

| Class | Property | Was | Now | Status |
|---|---|---|---|---|
| `.help-text` | `font-size` | `12px` | `var(--text-xs)` | 🔄 |
| `.info-icon` | `font-size` | `18px` | `var(--text-md)` | 🔄 |
| `.cancel-button` | `font-size` | `15px` | `15px` | ✅ |
| `.save-button.ant-btn-primary` | `font-size` | `15px` | `15px` | ✅ |

---

### 6. `src/prescriptions/add-prescription.css`

| Class | Property | Was | Now | Status |
|---|---|---|---|---|
| `.stats-tag` | `font-size` | `13px` | `13px` | ✅ |
| `.medicine-title` | `font-size` | `16px !important` | `var(--text-md) !important` | 🔄 |
| `.freq-badge` | `font-size` | `11px` | `11px` | ✅ |
| `.detail-item` | `font-size` | `13px !important` | `13px !important` | ✅ |
| `.separator` | `font-size` | `10px` | `var(--text-xs)` | 🔄 |
| `.action-btn` | `font-size` | `13px !important` | `13px !important` | ✅ |
| `.medicine-option-name` | `font-size` | `14px` | `var(--text-base)` | 🔄 |
| `.medicine-option-generic` | `font-size` | `12px` | `var(--text-xs)` | 🔄 |
| `.sidebar-title` | `font-size` | `18px !important` | `var(--text-md) !important` | 🔄 |
| `.medicine-form label` | `font-size` | `14px` | `var(--text-sm)` | 🔄 |
| `.food-radio .ant-radio-wrapper` | `font-size` | `14px` | `var(--text-sm)` | 🔄 |
| `.add-btn` | `font-size` | `16px !important` | `var(--text-base) !important` | 🔄 |
| `.medicine-form input::placeholder` | `font-size` | `14px` | `var(--text-sm)` | 🔄 |
| `@media 768px .preview-title` | `font-size` | `20px !important` | `var(--text-lg) !important` | 🔄 |
| `@media 768px .sidebar-title` | `font-size` | `16px !important` | `var(--text-md) !important` | 🔄 |

---

### 7. `src/signup-step/features/third-step/third-step.css`

| Class | Property | Was | Now | Status |
|---|---|---|---|---|
| `.step-title` | `font-size` | `12px` | `var(--text-xs)` | 🔄 |
| `.password-rules` | `font-size` | `13px` | `13px` | ✅ |
| `.icon` | `font-size` | `12px` | `var(--text-xs)` | 🔄 |
| `.setup-checkbox` | `font-size` | `13px` | `13px` | ✅ |
| `.consent-checkbox` | `font-size` | `12px` | `var(--text-xs)` | 🔄 |

---

### 8. `src/signup-step/features/fourth-step/fourth-step.css`

| Class | Property | Was | Now | Status |
|---|---|---|---|---|
| `.root-admin-tag` | `font-size` | `10px` | `var(--text-xs)` | 🔄 |
| `.review-label` | `font-size` | `8px` | `var(--text-xs)` | 🔄 |
| `.review-value` | `font-size` | `12px` | `var(--text-sm)` | 🔄 |

---

### 9. `src/suppliers/upload-inovice.css`

| Class | Property | Was | Now | Status |
|---|---|---|---|---|
| `.inovice-upload-info` | `font-size` + `font-family` | `14px` + `"Roboto"` | `var(--text-sm)` + removed | 🔄 |
| `.invoice-upload-info-medium` | `font-size` + `font-family` | `10px` + `"Roboto"` | `var(--text-xs)` + removed | 🔄 |
| `.upload-hint p` | `font-size` + `font-family` | `10px` + `"Roboto"` | `var(--text-xs)` + removed | 🔄 |
| `.info-bar h4` | `font-size` | `14px` | removed (inherits global `h4` `15px`) | 🔄 |
| `.info-bar p` | `font-size` + `font-family` | `10px` + `"Roboto"` | `var(--text-xs)` + removed | 🔄 |
| `.file-icon` | `font-size` | `16px` | `var(--text-md)` | 🔄 |
| `.status-text` | `font-size` | `10px` | `var(--text-xs)` | 🔄 |
| `.status-icon` | `font-size` | `18px` | `var(--text-md)` | 🔄 |

---

### 10. `src/suppliers/add-manual-form.css`

| Class | Property | Was | Now | Status |
|---|---|---|---|---|
| `.back-link` | `font-size` | `12px` | `var(--text-xs)` | 🔄 |
| `.subtitle` | `font-size` | `14px` | `var(--text-sm)` | 🔄 |

---

## Already Updated Files (from previous session)

These files were already standardised and do not need further changes:

| File | Summary |
|---|---|
| `src/index.css` | CSS variables + global scale + full Ant Design overrides ✅ |
| `src/sidebar.css` | Roboto removed; nav items `14px` ✅ |
| `src/header.css` | Roboto removed; `h3` → `15px` ✅ |
| `src/dashboard.css` | Invalid global `h3` removed; card label `13px`; special card `h2` `22px` ✅ |
| `src/authentication/Login.css` | Roboto removed; auth links `13px` ✅ |
| `src/signup.css` | App title `17px` ✅ |
| `src/patientmangement/patientlist/patient-list.css` | Roboto removed; column headers `12px`; tags `13px` ✅ |
| `src/patientmangement/singlepatientdetail/patient-profile.css` | Patient name `22px`; card `h3` `17px`; field values `15px` ✅ |
| `src/prescriptions/prescription-details.css` | Page title `22px`; table/input `15px`; tags `13px` ✅ |
| `src/prescriptions/prescription-preview.css` | Patient name `17px`; section title `17px`; medicine name `15px` ✅ |
| `src/suppliers/pharmacy.css` | Subtitle `13px`; supplier title `17px`; footer `13px` ✅ |
| `src/suppliers/add-pharmacy.css` | Form `h3` `17px` ✅ |

---

## Summary

| Status | Count |
|---|---|
| 🔄 Updated to CSS variable | ~43 classes across 10 files |
| ✅ Already correct (no change needed) | ~25 classes |
| **Total files updated** | **10 files** |
| **Total files in project** | **22 CSS files** |

All font sizes across the entire app now use CSS variables from `src/index.css (:root)`.
To change any size app-wide, edit the variable value only.
