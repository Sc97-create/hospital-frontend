# Prescription Confirm & Pay — Broken Flow (Fixed)

**Audience:** product, pharmacy ops, frontend, backend, QA  
**Related:** [`prescription-checkout-design.md`](prescription-checkout-design.md), [`prescription-checkout-scenario.md`](prescription-checkout-scenario.md)

This note explains a real production gap in pharmacist **Confirm & Pay**, what went wrong, and what is fixed now so the team shares one mental model.

---

## 1. Intended product rule

| Rule | Meaning |
|------|---------|
| **One prescription → one invoice** | A given `prescription_id` should not mint multiple open/paid bills for the same checkout attempt. |
| **Two-step pay (cash / QR)** | 1) Create invoice → 2) Pharmacist confirms payment (swipe). |
| **Resume, don’t recreate** | If the invoice already exists but payment was not confirmed, the next visit must **reuse** that invoice. |

---

## 2. Happy path (what should happen)

```text
Detail → Proceed to Checkout
       → Confirm & Pay
       → POST /billing/create          ← creates invoice (invoice id returned)
       → Confirm cash/QR popup
       → POST /payment/confirm         ← settles that invoice
       → Success → dispensed / bill paid
```

**Key point:** After step 1 succeeds, an invoice already exists on the backend. Step 2 only confirms payment against that `invoice.id`.

---

## 3. What broke (before the fix)

### Broken sequence

```text
1. Pharmacist opens checkout and taps Confirm & Pay
2. POST /billing/create succeeds → invoice A is created
3. Confirm popup opens (or payment confirm fails / page refresh / Back / close tab)
4. invoice_id lived only in React state → lost when leaving the page
5. Detail still showed “Proceed to Checkout”
6. Pharmacist opens checkout again and taps Confirm & Pay
7. POST /billing/create runs again → risk of invoice B for the same prescription
```

### Why it broke

| Layer | Gap |
|-------|-----|
| **Frontend** | `pendingInvoiceId` was in-memory only. No load-time check for an existing invoice. |
| **UX** | After a failed/incomplete confirm, the CTA still looked like a **new** checkout, not “finish payment”. |
| **Backend contract** | Resume API existed (`getInvoiceByPrescriptionID`) but frontend did not use it. |
| **Guard coverage** | Only `payment_link_created` blocked a second create. Cash/QR “invoice created, not confirmed” had no resume path. |

### Why it mattered

- Duplicate invoices for one Rx (billing / stock / audit mess).
- Pharmacist thinks they are paying once; system may have created two bills.
- Stock decrement / payment status can diverge from what the counter staff expects.

---

## 4. What we fixed

### Fix: resume existing invoice on checkout load

On opening `/prescription/:id/checkout`:

1. Load dispense lines as usual (`GET …/prescription/getMedicineInfo/:id`).
2. Call **`GET /billing/getInvoiceByPrescriptionID/:prescriptionID`**.
3. **If success (invoice found)** → open the **Confirm payment** popup immediately with that invoice’s `id`.  
   Do **not** call `/billing/create` again for this resume.
4. **If 404 / no invoice** → normal first-time checkout (Confirm & Pay still creates the invoice).

```text
Checkout page load
       │
       ├─ getMedicineInfo (lines + batches)
       │
       └─ getInvoiceByPrescriptionID
              ├─ found  → open Confirm popup (invoice.id)
              └─ not found → stay on normal Confirm & Pay → create flow
```

### API used

| Method | Path |
|--------|------|
| GET | `/api/v1/billing/getInvoiceByPrescriptionID/:prescriptionID` |

### Success body (backend shape)

```json
{
  "id": "<invoice-uuid>",
  "invoice_code": "...",
  "prescription_id": "...",
  "patient_id": "...",
  "status": "...",
  "cashier_id": "...",
  "organisation_id": "...",
  "sub_total_amount": 0,
  "tax_amount": 0,
  "total_amount": 0,
  "discount_amount": 0,
  "created_at": "...",
  "updated_at": "..."
}
```

(May be wrapped in `{ "data": { ... } }` — FE parser accepts both.)

Frontend maps **`id` → `invoice_id`** for `POST /payment/confirm`.

### Code touchpoints

| File | Role |
|------|------|
| `src/prescriptions/api/prescription.ts` | `GetInvoiceByPrescriptionID`, `parseInvoiceByPrescriptionResponse` |
| `src/prescriptions/types/prescriptionmodel.ts` | `InvoiceByPrescription` types |
| `src/prescriptions/prescription-checkout.tsx` | On load: fetch invoice → open confirm modal |

---

## 5. How to verify (QA)

| # | Scenario | Expected |
|---|----------|----------|
| 1 | First checkout, no invoice yet | `getInvoice…` → 404; Confirm & Pay creates invoice, then confirm popup |
| 2 | Create succeeds, leave page **before** swipe confirm | Re-open checkout → confirm popup opens with **same** invoice `id`; no second create |
| 3 | Confirm payment fails, reload checkout | Same as #2 — resume confirm, do not create again |
| 4 | After successful confirm | Normal success / dispensed path (no unpaid resume) |
| 5 | Network: watch calls on resume open | Should see `getInvoiceByPrescriptionID`; should **not** see a new `billing/create` until user intentionally starts a fresh create when no invoice exists |

---

## 6. Related checkout guard (same area)

**Over-allocate stock:** if batch **take qty > current stock**, Confirm & Pay is blocked with a warning to reduce take qty to stock or less. Take qty is also clamped when edited above stock.

This is separate from the invoice-resume fix but lives on the same Confirm & Pay button.

---

## 7. Partial dispense — scenarios to decide (not built yet)

Checkout design v1 allows **light partial** (give less now and bill for that) but **not** a full “remaining balance” lifecycle. The resume-invoice fix above does **not** solve partial dispense. Use this section to agree product behaviour before building.

### 7.1 Example (stock-out / come tomorrow)

| Field | Value |
|-------|--------|
| Prescribed | Dolo 650 — **12** tablets |
| Available today | **6** on hand |
| Visit 1 | Pharmacist sets dispense qty = 6, Confirm & Pay, patient takes 6 home |
| Visit 2 (later) | Patient returns for the other **6** |

**Question the whole team must answer:** On visit 2, do we finish the **same** prescription, or create a **new** one?

### 7.2 What exists today vs what does not

| Today (v1) | Not designed / not built |
|------------|---------------------------|
| **`getprescriptionbyPid` → `prescription_status: "partially_dispensed"`** blocks Proceed / Complete payment | Tracking **remaining qty** per line after a paid partial |
| Popup: **Get new prescription** | List CTA to create remaining-balance Rx |
| Checkout does **not** auto-open Complete payment swipe when status is partially dispensed | Second checkout on same Rx for remaining qty |

**UI guard (shipped):** when `prescription_status` is `partially_dispensed` / `partial_dispensed`:

> **Get new prescription** — This prescription is partially dispensed. Create a new prescription to continue — partial dispense checkout is not available yet.

### 7.3 Option A — Same prescription (remaining balance)

```text
Visit 1: Rx sent → checkout dispense 6/12 → pay invoice #1
         → status: partially_dispensed (remaining 6)

Visit 2: Open SAME Rx → checkout shows remaining 6
         → pay invoice #2 (or new line on billing model)
         → status: dispensed / fully_dispensed
```

| Pros | Cons |
|------|------|
| Matches clinical Rx and real pharmacy practice for stock-outs | Breaks strict **1 Rx → 1 invoice** unless billing allows multiple invoices per Rx |
| One audit trail for doctor’s order | Needs remaining-qty on items, status machine, list filters, second checkout UX |
| Patient doesn’t need a new doctor visit | Must define: unpaid resume vs new invoice for remaining |

### 7.4 Option B — New prescription for the rest

```text
Visit 1: Rx A → dispense 6/12 → pay → mark dispensed (or closed partial)
Visit 2: Doctor/clinic issues Rx B for remaining 6 → normal full checkout
```

| Pros | Cons |
|------|------|
| Keeps **1 Rx → 1 invoice** simple | Extra clinical / admin work |
| Current POS + resume-invoice model stays valid | Weaker link to original order; easy to lose “why only 6 first time” |
| Less backend complexity short-term | Bad fit for “come tomorrow for the rest” |

### 7.5 How this collides with “one prescription → one invoice”

| If we choose… | Invoice implication |
|---------------|---------------------|
| **Option A (same Rx)** | Likely **two invoices** (visit 1 + visit 2) on one `prescription_id`, **or** one invoice with multiple payment/dispense events — product + backend must pick. |
| **Option B (new Rx)** | Still **one invoice per prescription**; remaining qty is a new Rx. |
| **Resume unpaid only** (what we fixed) | Same invoice, payment not finished — **not** the same as partial dispense of qty. |

Do not confuse:

- **Broken Confirm & Pay resume** = invoice created, money not confirmed yet → reuse invoice.  
- **Partial dispense** = money confirmed for 6 units; 6 units still clinically owed → different problem.

### 7.6 Thinking scenarios (for product / QA / backend)

Use these in workshops; expected results are **TBD** until Option A or B is chosen.

| # | Scenario | What to decide |
|---|----------|----------------|
| P1 | Prescribed 12, stock 6; pay for 6 | Status after pay: `dispensed` vs `partially_dispensed`? |
| P2 | Same patient returns next day for remaining 6 | Same Rx checkout or new Rx? |
| P3 | Visit 1 paid for 6; visit 2 still on same Rx | Second `billing/create` allowed? Or refuse and force new Rx? |
| P4 | Visit 1: invoice created for 6, confirm fails; pharmacist later tries to change qty to 12 | Resume unpaid invoice (fixed flow) vs void/recreate? |
| P5 | Two lines: give full of A, partial of B | Per-line remaining vs whole-Rx status? |
| P6 | Partial because patient only wants 6 (not stock-out) | Same rules as stock-out, or close Rx as complete with note? |
| P7 | Partial then doctor changes dose | Always new Rx? Cancel remaining on old Rx? |
| P8 | List / dashboard | Show “Partially dispensed — 6 remaining” and deep-link to checkout? |

### 7.7 Suggested default to debate (not a decision)

For **stock-out / come tomorrow**, most hospital pharmacies expect **Option A (same Rx + remaining balance)**.  
That almost certainly means relaxing **1 Rx → 1 invoice** to **1 Rx → N paid invoices (one per dispense visit)** or an equivalent billing model.

Until product signs that off, frontend should **not** assume visit 2 can reopen the same Rx and create another bill safely.

---

## 8. Still open / not solved by the Confirm & Pay resume fix

| Topic | Status |
|-------|--------|
| Full **partial dispense** lifecycle (§7) | **Open** for product; **UI blocks** Confirm & Pay on partial for now |
| Strict backend unique constraint “one open **unpaid** invoice per prescription” | Recommended so FE resume cannot be bypassed |
| Auto-refresh list status after pay | Known gap in scenario doc |
| Detail CTA when unpaid invoice exists (“Complete payment” vs “Proceed to Checkout”) | Not changed yet — resume happens after entering checkout |

---

## 9. One-line summary

**Before:** Failed or abandoned Confirm & Pay could send the pharmacist through Proceed to Checkout again and create a **second** invoice.  
**After:** Checkout loads the existing invoice by `prescription_id` and opens **Confirm payment** so they finish the **same** invoice.  

**Still to decide:** If only part of the prescribed qty is given and paid, how does the patient get the rest — **same Rx remaining balance** or **new prescription** (§7).
