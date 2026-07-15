# Prescription Checkout — Testing Scenarios

Manual QA checklist for pharmacist checkout / dispense. Use with a logged-in user and a `sent` prescription that has medicine + batch data.

**Design reference:** [`prescription-checkout-design.md`](prescription-checkout-design.md)

**Routes under test**

| Screen | Path |
|--------|------|
| Prescription list | `/prescription` |
| Prescription detail | `/prescription/:id` |
| Checkout | `/prescription/:id/checkout` |

**API under test**

| Method | Path | Role |
|--------|------|------|
| GET | `/api/v1/prescription/getMedicineInfo/:prescription_id` | Load checkout lines + batches (+ `supplier_id` on batches) |
| POST | `/api/v1/billing/create` | Confirm & Pay — create bill + decrement stock per batch |

**Known test prescription (example)**

| Field | Value |
|-------|-------|
| `prescription_id` | `d0c9aee7-2d51-4949-acba-24d81519bfc0` |
| Checkout URL | `/prescription/d0c9aee7-2d51-4949-acba-24d81519bfc0/checkout` |

---

## Preconditions

- [ ] User is logged in (`access_token`, `user_id`, `organisation_id` in localStorage)
- [ ] Backend reachable at `http://localhost:9069/api/v1`
- [ ] At least one prescription with `prescription_status: "sent"`
- [ ] `getMedicineInfo` returns ≥1 line with `medicine_batches`, pricing, and **`supplier_id` on each batch**
- [ ] Prefer a Rx where the **same `medicine_id` appears on 2+ `prescription_item_id` rows** (e.g. Dolo morning + night)
- [ ] Prefer a line with **2+ batches** to test multi-batch payload flatten
- [ ] `patient_id` available via list `?patientId=`, session cache, or API

---

## A. Entry & navigation

### A1 — Detail → Checkout

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open `/prescription` → **View** a sent Rx | Detail loads at `/prescription/:id` |
| 2 | Click **Proceed to Checkout** | Navigates to `/prescription/:id/checkout` |
| 3 | Check breadcrumb | Prescriptions → Prescription Detail → Checkout |
| 4 | Click breadcrumb **Prescription Detail** | Returns to `/prescription/:id` |

**Pass criteria:** Checkout only reachable from detail (no Checkout button on list).

### A2 — Direct URL

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open `/prescription/{validId}/checkout` | Page loads; calls `getMedicineInfo/{validId}` |
| 2 | Open `/prescription/invalid-id/checkout` | Does not white-screen; falls back to sample data **or** shows warning toast |

### A3 — Back / Discard

| Step | Action | Expected |
|------|--------|----------|
| 1 | On checkout, click **Back** | Returns to detail; no payment toast |
| 2 | Click **Discard** | Confirm modal: “Discard Order?” |
| 3 | Click **Keep Order** | Stays on checkout |
| 4 | Discard → **Yes, Discard** | Warning toast; navigates to detail |

---

## B. Page load & data mapping

### B1 — Live API load

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open checkout for known Rx | Skeleton, then table |
| 2 | Network tab | `GET .../prescription/getMedicineInfo/{id}` → 200 |
| 3 | Tag near title | **Live dispense lines** (not Sample) |
| 4 | Rx code | Matches `prescription_code` from API (e.g. `PRX2607109353`) |
| 5 | RX STATUS (patient strip) | Shows prescription status from API (not patient status) |

### B2 — Row identity (same medicine, two lines)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Rx with two Dolo rows (different `prescription_item_id`) | **Two separate table rows** |
| 2 | Compare secondary text | Different frequency labels (e.g. NIT vs MOR) |
| 3 | Different prescribed qty | e.g. 4 and 7 shown correctly |
| 4 | Uncheck **one** checkbox only | Only that row mutes; other stays billed |

**Pass criteria:** Rows keyed by `prescription_item_id`, never by `medicine_id` alone.

### B3 — Pricing

| Step | Action | Expected |
|------|--------|----------|
| 1 | Batch with `unit_price: 2`, `unit_selling_price: 0` | Unit price shows **₹2.00** (not ₹1.90) |
| 2 | Line total | `dispense_qty × unit_price` |
| 3 | Billing summary | Subtotal = sum of selected line totals; Tax = 5% of subtotal; Total = subtotal + tax |

**Pricing rule to verify**

1. Use `unit_selling_price` if &gt; 0  
2. Else use `unit_price`  
3. Else `selling_price / units_per_box` (last resort)

### B4 — API failure / empty

| Step | Action | Expected |
|------|--------|----------|
| 1 | Stop backend or force 500 | Warning toast; **Sample API data** tag; sample lines still render |
| 2 | API returns `data: []` | Warning + sample fallback |

### B5 — `supplier_id` from getMedicineInfo

| Step | Action | Expected |
|------|--------|----------|
| 1 | Inspect Network → getMedicineInfo | Each `medicine_batches[]` item has `supplier_id` |
| 2 | Confirm & Pay (Cash/QR → confirm) | Request body includes top-level `supplier_id` matching an allocated batch |
| 3 | If batches lack `supplier_id` | Error toast: Missing supplier_id…; no POST |

---

## C. Dispense qty & line selection

### C1 — Default state

| Step | Action | Expected |
|------|--------|----------|
| 1 | Fresh load | All lines **selected**; dispense qty = prescribed qty |
| 2 | Batch chip under medicine | Shows allocation summary (e.g. `BAT-4029 ×4 · 150 avail`) |

### C2 — Partial qty (buy 5 of 10)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Set dispense qty lower than prescribed | Line total and bill update |
| 2 | Expand batches | FEFO reallocates; allocated sum = new dispense qty |
| 3 | Set dispense qty to 0 | Line contributes ₹0 if still selected (or uncheck) |

### C3 — Uncheck line

| Step | Action | Expected |
|------|--------|----------|
| 1 | Uncheck a line | Row muted; removed from billed count and totals |
| 2 | Re-check | Restored to bill |

### C4 — Confirm blocked when nothing billed

| Step | Action | Expected |
|------|--------|----------|
| 1 | Uncheck all lines (or all qty 0) | **Confirm & Pay** → error: select at least one item |

---

## D. Multi-batch FEFO allocation

### D1 — Auto FEFO on load

| Step | Action | Expected |
|------|--------|----------|
| 1 | Line with 2+ batches | Expand row (auto-expanded when &gt;1 batch) |
| 2 | Check Take qty | Earliest `expires_at` filled first |
| 3 | Allocated hint | `Allocated N / dispense N` matches (not danger) |

### D2 — Change dispense qty → re-FEFO

| Step | Action | Expected |
|------|--------|----------|
| 1 | Increase/decrease dispense qty on parent | Nested Take qty recalculates FEFO |
| 2 | Stock insufficient for dispense | Allocation error / danger hint; Confirm blocked |

### D3 — Manual override

| Step | Action | Expected |
|------|--------|----------|
| 1 | Edit Take qty on batch A and B | Parent dispense qty becomes sum of takes |
| 2 | Take qty &gt; on hand | Input max = on hand; Confirm shows stock error if invalid |
| 3 | Allocated ≠ dispense | Danger text + Confirm & Pay blocked with error toast |

### D4 — Single batch

| Step | Action | Expected |
|------|--------|----------|
| 1 | Line with one batch | Expand still works; one Take qty row |
| 2 | Chip | `BAT-xxxx ×qty · N avail` |

### D5 — Billing payload flatten (multi-batch)

When one Rx line takes from **two batches**, Confirm & Pay must send **two** `dispense_items` rows (same `prescription_item_id` / `medicine_id`, different `medicine_inventory_id`).

| Step | Action | Expected |
|------|--------|----------|
| 1 | Allocate e.g. 7 from BAT-A + 3 from BAT-B | Two takes &gt; 0 |
| 2 | Confirm & Pay → inspect POST body | `dispense_items.length === 2` |
| 3 | Each item | `medicine_inventory_id` = that batch’s `batch_id`; `quantity_sold_units` = take qty |
| 4 | Per-batch price | `unit_price_charged` = that batch’s resolved unit price (not a line average) |
| 5 | Line totals | `computed_item_total` = `quantity_sold_units * unit_price_charged` (= `total_amount`) |

**Backend effect:** each inventory row decrements by its own `quantity_sold_units`.

---

## E. Payment & billing/create

### E1 — Payment method & notes

| Step | Action | Expected |
|------|--------|----------|
| 1 | Switch **Cash / QR / Link** | Segmented control updates; hint text changes |
| 2 | Cash or QR selected | Hint: confirm collection in a popup before finishing |
| 3 | Link selected | Hint: finishes automatically when the patient pays |
| 4 | Enter notes | Value retained through pay (shown on success if set); **not** sent on billing/create v1 |

### E2 — Cash / QR (manual confirm)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Select Cash → **Confirm & Pay** | Popup: “Confirm cash payment”; amount shown |
| 2 | Select QR → **Confirm & Pay** | Popup: “Confirm QR payment”; QR placeholder + amount |
| 3 | Click **Cancel** on popup | Stays on checkout; no POST |
| 4 | Click **Confirm payment** | Loading; Network **`POST /billing/create`** → 2xx |
| 5 | Success | Toast + receipt modal (no “(mock)” copy) |
| 6 | Receipt | Shows “Confirmed at counter (Cash / QR)” |

**Pass criteria:** Cash/QR never POST without the confirmation popup.

### E3 — Link

| Step | Action | Expected |
|------|--------|----------|
| 1 | Select Link → **Confirm & Pay** | No confirm popup; loader “Waiting for payment link…” |
| 2 | Network | **`POST /billing/create`** with same payload shape |
| 3 | Success | Toast + receipt; “Completed via payment link” |
| 4 | After backend sets status | List / reload may show **Payment link created** (see section H) |

### E4 — Billing create payload map

Inspect `POST /api/v1/billing/create` body:

| Field | Source | Notes |
|-------|--------|-------|
| `prescription_id` | Route / getMedicineInfo | |
| `patient_id` | Resolved patient (query / cache / API) | Error if missing |
| `cashier_id` | `localStorage.user_id` | Error if missing |
| `organisation_id` | `localStorage.organisation_id` | Error if missing |
| `supplier_id` | getMedicineInfo `medicine_batches[].supplier_id` | First allocated batch |
| `financials.discount_amount` | `0` | No discount UI yet |
| `financials.sub_total_amount` | Checkout subtotal | FE |
| `financials.tax_amount` | 5% of subtotal | FE |
| `financials.total_amount` | Subtotal + tax | FE |
| `dispense_items[].medicine_id` | Line | getMedicineInfo |
| `dispense_items[].medicine_inventory_id` | `batch_id` | Alias confirmed |
| `dispense_items[].prescription_item_id` | Line | getMedicineInfo |
| `dispense_items[].batch_no` | Batch | getMedicineInfo |
| `dispense_items[].current_stock_units` | Batch | Pre-sale stock |
| `dispense_items[].quantity_sold_units` | `allocate_qty` | **Dynamic FE** |
| `dispense_items[].unit_price_charged` | Batch resolved price | Per batch |
| `dispense_items[].computed_item_total` | qty × unit price | FE |
| `dispense_items[].total_amount` | Same as computed | v1 |

### E5 — Billing create errors

| Step | Action | Expected |
|------|--------|----------|
| 1 | Force API 4xx/5xx on create | Error toast (API message if present); stay on checkout; editable |
| 2 | Missing patient / cashier / org / supplier | Specific error toast; **no** POST |
| 3 | Allocation errors | Confirm blocked; no popup / no POST |

### E6 — Receipt actions

| Step | Action | Expected |
|------|--------|----------|
| 1 | **Print Bill** | Print dialog / toast “Sending to printer…” |
| 2 | **Back to prescriptions** | Navigates to `/prescription` |
| 3 | Close modal (X) | Modal closes; still on checkout |

---

## F. Responsive / layout smoke

| Step | Action | Expected |
|------|--------|----------|
| 1 | Desktop ~1440px | Table + payment left / billing right; sticky footer |
| 2 | Narrow &lt;768px | Billing stacks under payment; footer buttons wrap |
| 3 | Horizontal scroll on table | No clipped columns without scroll |

---

## G. Regression with detail page

| Step | Action | Expected |
|------|--------|----------|
| 1 | Detail still loads clinical table | `FindOnePrescription` unchanged |
| 2 | Detail primary CTA | **Proceed to Checkout** (not Confirm & Dispense) |
| 3 | Print Bill / Generate Labels / Discard on detail | Still work as before (toasts / print) |

### Patient header (detail + checkout)

| Step | Action | Expected |
|------|--------|----------|
| 1 | List row has `patient_id` → **View** | Navigates to `/prescription/:id?patientId=…` |
| 2 | Detail loads | `GET /patients/getpatientByID/{patientId}` → name, UHID, age/gender, status, phone |
| 3 | **Proceed to Checkout** | Checkout URL keeps `?patientId=…`; same patient header |
| 4 | Missing list `patient_id` | Falls back to `patient_id` from `getMedicineInfo` / find-one if present |
| 5 | Patient API fails | Header shows `—`; medicines/checkout still usable |

---

## H. Status: `payment_link_created`

### H1 — Prescription list

| Step | Action | Expected |
|------|--------|----------|
| 1 | Rx with status `payment_link_created` | Pharma Status tag is **blue** |
| 2 | Tag label | **Payment link created** (not raw snake_case) |

### H2 — Checkout when link already created

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open checkout for Rx with `prescription_status: payment_link_created` | Loads lines as usual |
| 2 | RX STATUS / order tag | Blue **Yet to pay** |
| 3 | Primary footer button | **Disabled**; label **Yet to pay** (not Confirm & Pay) |
| 4 | Click disabled / guarded path | No billing POST; warning if triggered |

**Pass criteria:** Cannot create a second bill while awaiting payment link settlement.

---

## Known gaps (track, do not fail QA as product bugs yet)

1. Tax rate hardcoded at 5%  
2. After successful pay, list may not refresh to `dispensed` until user reloads / navigates back (no live list invalidate)  
3. If `getMedicineInfo` fails, UI shows sample lines — do not treat sample as live stock; sample Confirm & Pay may still POST if IDs resolve  
4. Discount UI not implemented (`discount_amount` always `0`)  
5. `payment_method` / notes not included on `billing/create` v1  

---

## Pending work

| # | Issue | Status |
|---|--------|--------|
| 1 | Back from checkout dropped `patientId`, so detail patient header showed empty | **Fixed** — Back/Discard/breadcrumb keep `?patientId=`; also cached in `sessionStorage` per Rx |
| 2 | Confirm & Pay → real `POST /billing/create` + stock decrement via flattened batches | **Done** |
| 3 | Map `supplier_id` / `batch_id` → `medicine_inventory_id` from getMedicineInfo | **Done** |
| 4 | `payment_link_created` list label + disable Confirm & Pay / Yet to pay on checkout | **Done** |
| 5 | Tax rate hardcoded at 5% | Open |
| 6 | After pay, auto-refresh list status to `dispensed` / `payment_link_created` | Open |

---

## Sign-off

| Area | Tester | Date | Pass? |
|------|--------|------|-------|
| A Navigation | | | |
| B Data / pricing / supplier | | | |
| C Qty / selection | | | |
| D Batches / FEFO / flatten | | | |
| E Pay / billing/create | | | |
| F Layout | | | |
| G Detail regression | | | |
| H payment_link_created | | | |
