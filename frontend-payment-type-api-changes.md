# Frontend API changes — Consultation vs Prescription billing

Guide for frontend: what to change in create-invoice and related payment APIs after backend `payment_type` support.

**Backend refs:** `docs/payment-type-invoice-design.md`, `docs/payment-type-invoice-implementation.md`

**Base path:** `/api/v1` (same as today)

---

## 1. What changed (summary)

| Area | Change for frontend |
|---|---|
| `POST /billing/create` | New optional `payment_type` + `appointment_id`. Consultation omits prescription/dispense fields. |
| `GET /billing/getInvoiceByAppointmentID/:appointmentID` | **New** — look up consultation invoice by appointment. |
| `GET /billing/getInvoiceByPrescriptionID/:prescriptionID` | Response now includes `payment_type`, `appointment_id` (optional). |
| `POST /payment/confirm` | **No contract change** — same body; works for consultation invoices too. |
| Appointment book | **No change** — still create appointment first; then create invoice separately. |
| Payment link for consultation | **Out of scope for now** — use `cash` / `qr` only for consultation. |

Existing prescription checkout that does **not** send `payment_type` still works (backend defaults to `prescription`).

---

## 2. UI flow — consultation payment (new)

```
Book appointment success
        │
        ▼
Payment popup
  • Cash (default selected)
  • QR
  • (Link / swipe — not for consultation in this pass)
        │
        ▼
POST /billing/create
  payment_type = "consultation"
  appointment_id = <booked appointment id>
  payment_mode = "cash" | "qr"
  financials = consultation fee (± tax)
        │
        ▼
Keep invoice_id from response
        │
        ▼
Cashier collects cash / patient pays QR in person
        │
        ▼
POST /payment/confirm
  invoice_id, organisation_id, payment_mode, transaction_reference?
        │
        ▼
Show paid / success
```

Optional: before showing popup again, call  
`GET /billing/getInvoiceByAppointmentID/:appointmentID`  
to see if an unpaid (or paid) consultation invoice already exists.

---

## 3. `POST /billing/create` — request changes

**Headers (unchanged, still required)**

| Header | Notes |
|---|---|
| `Idempotency-Key` | Required. Same key + same checkout → replay, no duplicate invoice. Generate a new UUID per user action (e.g. each “Create & charge” tap). |
| Auth | Same as existing billing routes. |

### 3.1 Prescription (pharmacy) — mostly unchanged

You can keep current payload. Optionally add `"payment_type": "prescription"`.

```json
{
  "payment_type": "prescription",
  "prescription_id": "<uuid>",
  "patient_id": "<uuid>",
  "cashier_id": "<uuid>",
  "organisation_id": "<uuid>",
  "supplier_id": "<uuid>",
  "payment_mode": "cash" | "qr" | "link",
  "financials": {
    "sub_total_amount": 1000,
    "tax_amount": 50,
    "discount_amount": 0,
    "total_amount": 1050
  },
  "dispense_items": [ /* same shape as today */ ]
}
```

If `payment_type` is omitted → backend treats as prescription (back-compat).

### 3.2 Consultation (reception) — new payload shape

```json
{
  "payment_type": "consultation",
  "appointment_id": "<uuid from book-appointment success>",
  "patient_id": "<uuid>",
  "cashier_id": "<uuid>",
  "organisation_id": "<uuid>",
  "payment_mode": "cash",
  "financials": {
    "sub_total_amount": 500,
    "tax_amount": 0,
    "discount_amount": 0,
    "total_amount": 500
  }
}
```

**Do not send** for consultation:

- `prescription_id`
- `dispense_items` / dispensed medicines list
- (optional) `supplier_id` — not needed

**Do send:**

| Field | Rule |
|---|---|
| `payment_type` | Must be `"consultation"` |
| `appointment_id` | Required — same appointment just booked |
| `patient_id` / `organisation_id` | Must match the appointment’s patient & org |
| `payment_mode` | `"cash"` or `"qr"` for this pass (UI: cash default) |
| `financials` | Required — fee with or without tax (see §4) |

### 3.3 Success response (unchanged shape)

```json
{
  "message": "stored",
  "payment": {
    "invoice_id": "<uuid>",
    "payment_url": ""
  }
}
```

For cash/QR, `payment_url` is typically empty (no Razorpay link). Store `invoice_id` for confirm.

---

## 4. Consultation amount / tax (`financials`)

There is **no separate “consultation_fee” field**. Use the same `financials` object as prescription:

| Field | Meaning |
|---|---|
| `sub_total_amount` | Amount before tax |
| `tax_amount` | Tax (use `0` if no tax) |
| `discount_amount` | Discount |
| `total_amount` | Final amount charged (what confirm/payment uses) |

**With tax example**

```json
"financials": {
  "sub_total_amount": 500,
  "tax_amount": 25,
  "discount_amount": 0,
  "total_amount": 525
}
```

**Without tax example**

```json
"financials": {
  "sub_total_amount": 500,
  "tax_amount": 0,
  "discount_amount": 0,
  "total_amount": 500
}
```

Backend does **not** recalculate tax or look up a fixed consultation fee — frontend (or your fee config UI) owns the numbers. Prefer keeping  
`total_amount ≈ sub_total_amount + tax_amount - discount_amount`.

---

## 5. `POST /payment/confirm` — no API change

Same endpoint for consultation and prescription after money is collected in person.

```
POST /api/v1/payment/confirm
```

```json
{
  "invoice_id": "<from create response>",
  "organisation_id": "<uuid>",
  "payment_mode": "cash" | "qr",
  "transaction_reference": "optional string"
}
```

```json
{ "message": "payment confirmed" }
```

Use the same `payment_mode` the cashier selected (or allow override if they switched cash ↔ QR at confirm time — backend supports updating source on confirm).

---

## 6. New lookup API

```
GET /api/v1/billing/getInvoiceByAppointmentID/:appointmentID
```

**Use when:** after booking, reopen payment UI, or show “already billed / unpaid / paid” for that appointment.

**Success**

```json
{
  "code": 200,
  "data": {
    "id": "...",
    "invoice_code": "...",
    "payment_type": "consultation",
    "appointment_id": "...",
    "patient_id": "...",
    "status": "unpaid" | "paid" | ...,
    "cashier_id": "...",
    "organisation_id": "...",
    "payment_mode": "cash",
    "sub_total_amount": 500,
    "tax_amount": 0,
    "total_amount": 500,
    "discount_amount": 0,
    "created_at": "...",
    "updated_at": "..."
  }
}
```

`prescription_id` is omitted when null (`omitempty`).

**Not found** → treat as “no consultation invoice yet” → allow create.

---

## 7. Existing lookup — response fields added

```
GET /api/v1/billing/getInvoiceByPrescriptionID/:prescriptionID
```

Same response shape as above; now also returns:

- `payment_type` (usually `"prescription"`)
- `appointment_id` (may be empty for older / non-backfilled rows)

Update TypeScript/interfaces to include these fields if you type the invoice model.

---

## 8. Errors frontend should handle

| Situation | Typical HTTP | Message / meaning | UI suggestion |
|---|---|---|---|
| Missing required fields / bad body | 400 | invalid request | Fix form validation |
| `payment_type` not `consultation` / `prescription` | 400 | invalid or unsupported payment type | Don’t send other values |
| Appointment not found | 404 | appointment not found | Don’t create invoice; refresh booking |
| Patient/org ≠ appointment | 400 | appointment does not belong to this patient/organisation | Stale IDs — reload appointment |
| Consultation already billed | 409 | appointment already has a consultation invoice | Fetch by appointment; show existing invoice / confirm if unpaid |
| Prescription already has invoice | 409 | invoice already exists for this prescription | Existing pharmacy behavior |
| Unsupported `payment_mode` | 400 | unsupported payment mode | Only send `cash` / `qr` / `link` as allowed |
| Missing `Idempotency-Key` | 400 | invalid request | Always send header |

---

## 9. Frontend checklist

### Prescription screens

- [ ] Optional: send `payment_type: "prescription"` (safe; omit still works).
- [ ] Extend invoice types with `payment_type`, `appointment_id`.
- [ ] No change required to confirm flow.

### Consultation / book-appointment screens

- [ ] After book success → open payment popup (Cash default, QR option).
- [ ] Call `POST /billing/create` with `payment_type: "consultation"` + `appointment_id` + `financials` + `cash`/`qr`.
- [ ] Do **not** send `prescription_id` / `dispense_items`.
- [ ] Persist `invoice_id` from response.
- [ ] On “Paid” → `POST /payment/confirm`.
- [ ] Wire `GET .../getInvoiceByAppointmentID/:id` for reopen / already-paid checks.
- [ ] Map 409 “already billed” to “show existing invoice” UX.
- [ ] Fee UI: collect amount; set `tax_amount` to `0` or computed tax; always set `total_amount`.

### Out of scope this pass

- [ ] Do **not** offer Razorpay **link** for consultation until product reopens that.
- [ ] Card / POS “swipe” mode is not supported on confirm yet (`cash` / `qr` only).

---

## 10. Quick reference — two create payloads

| | Prescription | Consultation |
|---|---|---|
| `payment_type` | omit or `"prescription"` | `"consultation"` |
| `prescription_id` | required | omit |
| `appointment_id` | omit (optional later) | **required** |
| `dispense_items` | required | omit |
| `payment_mode` | `cash` / `qr` / `link` | `cash` / `qr` only (for now) |
| `financials` | required | required (consultation fee) |
| Lookup later | by `prescriptionID` | by `appointmentID` |
| Confirm | same `/payment/confirm` | same `/payment/confirm` |

---

## 11. Suggested TypeScript shapes (illustrative)

```ts
type PaymentType = "consultation" | "prescription";
type PaymentMode = "cash" | "qr" | "link";

interface Financials {
  sub_total_amount: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
}

interface ConsultationCheckoutBody {
  payment_type: "consultation";
  appointment_id: string;
  patient_id: string;
  cashier_id: string;
  organisation_id: string;
  payment_mode: "cash" | "qr";
  financials: Financials;
}

interface InvoiceDetail {
  id: string;
  invoice_code: string;
  payment_type: PaymentType;
  prescription_id?: string;
  appointment_id?: string;
  patient_id: string;
  status: string;
  cashier_id: string;
  organisation_id: string;
  payment_mode: string;
  sub_total_amount: number;
  tax_amount: number;
  total_amount: number;
  discount_amount: number;
  created_at: string;
  updated_at: string;
}
```

---

## 12. Testing suggestions (frontend)

1. Book appointment → create consultation invoice with tax `0` → confirm cash → status paid.
2. Same appointment → create again → expect **409** already billed.
3. Create with wrong `patient_id` vs appointment → expect **400** mismatch.
4. Omit `Idempotency-Key` → **400**; retry same key after success → no second invoice.
5. Prescription checkout without `payment_type` → still works (regression).
6. Lookup by appointment before create → 404; after create → unpaid invoice; after confirm → paid.
