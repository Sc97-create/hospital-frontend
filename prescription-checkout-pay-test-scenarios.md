# Checkout & Pay — Testing Scenarios

Manual QA for pharmacist **detail → checkout → confirm & pay**.  
Includes happy paths **and** complex / failure / edge paths.

**Related**

- `[prescription-checkout-design.md](prescription-checkout-design.md)`
- `[prescription-confirm-pay-broke-flow.md](prescription-confirm-pay-broke-flow.md)`
- `[prescription-checkout-scenario.md](prescription-checkout-scenario.md)` (older checklist; prefer this file for current behaviour)

**How to sign off each scenario**


| Result            | Mark                              |
| ----------------- | --------------------------------- |
| Pass              | `P` or `pass`                     |
| Fail              | `F` or `fail`                     |
| Blocked / not run | `B` / `skip`                      |
| Notes             | Short reason, ticket, or evidence |


---



## Status vocabulary (current)


| Status            | Meaning                       | Detail CTA          | Checkout                      |
| ----------------- | ----------------------------- | ------------------- | ----------------------------- |
| `draft`           | Not sent                      | No Proceed          | N/A                           |
| `sent`            | Ready to dispense             | Proceed to Checkout | Full pay flow                 |
| `payment-pending` | Link generated, waiting       | Payment pending tag | Confirm disabled / Yet to pay |
| `completed`       | Paid / finished               | Bill paid           | Should not re-bill            |
| `tentative`       | Partial / stock-out remaining | Get-new-Rx popup    | Blocked + popup               |


Item-level (from `getMedicineInfo`): `remaining_quantity`, `prescription_item_status`, `out_of_stock`.

---



## APIs under test


| Method | Path                                      | When                                   |
| ------ | ----------------------------------------- | -------------------------------------- |
| GET    | `/prescription/getMedicineInfo/:id`       | Detail + checkout load                 |
| GET    | `/billing/getInvoiceByPrescriptionID/:id` | Checkout resume unpaid invoice         |
| POST   | `/billing/create`                         | Confirm & Pay — `payment_mode`: `cash` |
| POST   | `/payment/confirm`                        | Cash / QR swipe confirm                |
| PATCH  | `/prescription/updateStatus`              | Discard → cancelled                    |


---



## Preconditions / fixtures


| Fixture                      | Setup                                                                   |
| ---------------------------- | ----------------------------------------------------------------------- |
| **F1 Sent full stock**       | `sent`, all lines stock ≥ prescribed, `remaining_quantity` = prescribed |
| **F2 Multi-batch**           | One line with **2+ batches** (same medicine), different expiry / stock  |
| **F3 Same medicine 2 lines** | Same `medicine_id`, different `prescription_item_id` (e.g. MOR + NIT)   |
| **F4 Low stock**             | Stock < prescribed on ≥1 line; optionally `out_of_stock: true`          |
| **F5 Unpaid invoice**        | `billing/create` succeeded; `/payment/confirm` never done               |
| **F6 Payment pending**       | Status `payment-pending` after link mode                                |
| **F7 Completed**             | Status `completed`; items `fully_dispensed` / remaining 0               |
| **F8 Tentative**             | Status `tentative`; mixed remaining (some 0, some > 0)                  |
| **F9 Mixed item states**     | One fully dispensed, one partial, one out of stock                      |


---



## 1. Happy paths



### H1 — Cash full dispense


| Step | Action                                 | Expected                                           |
| ---- | -------------------------------------- | -------------------------------------------------- |
| 1    | Detail **F1** → Proceed to Checkout    | Checkout loads live lines                          |
| 2    | Payment = Cash, leave qty = prescribed | Totals match qty × price + tax                     |
| 3    | Confirm & Pay                          | `POST /billing/create` with `payment_mode: "cash"` |
| 4    | Swipe confirm                          | `POST /payment/confirm` with same invoice `id`     |
| 5    | Success modal                          | Amount / Cash / item count; Back to list           |
| 6    | Re-open detail                         | Status `completed`; **Bill paid**; no Proceed      |



| ID     | Result (P/F/B) | Tester | Date | Notes |
| ------ | -------------- | ------ | ---- | ----- |
| **H1** |                |        |      |       |




### H2 — QR full dispense


| Step | Action                | Expected                                   |
| ---- | --------------------- | ------------------------------------------ |
| 1–2  | As H1, Payment = QR   | Confirm QR modal                           |
| 3    | Confirm & Pay → swipe | create + confirm with `payment_mode: "qr"` |
| 4    | Success               | Shows QR / method label                    |



| ID     | Result (P/F/B) | Tester | Date | Notes |
| ------ | -------------- | ------ | ---- | ----- |
| **H2** |                |        |      |       |




### H3 — Link pay


| Step | Action                          | Expected                                       |
| ---- | ------------------------------- | ---------------------------------------------- |
| 1    | Checkout **F1**, Payment = Link | Hint: finishes when patient pays               |
| 2    | Confirm & Pay                   | `payment_mode: "link"` (not `payment_link`)    |
| 3    | Success / awaiting              | Link may open; Rx → `payment-pending`          |
| 4    | Detail after link created       | **Payment pending** / Yet to pay — not Proceed |



| ID     | Result (P/F/B) | Tester | Date | Notes |
| ------ | -------------- | ------ | ---- | ----- |
| **H3** |                |        |      |       |




### H4 — Partial qty allowed (less tablets)


| Step | Action                                                  | Expected                                               |
| ---- | ------------------------------------------------------- | ------------------------------------------------------ |
| 1    | Checkout **F1**, set one line dispense qty < prescribed | Allowed — **not** blocked                              |
| 2    | Uncheck one line                                        | Line muted; totals exclude it                          |
| 3    | Confirm & Pay → cash swipe                              | Bill only for selected / reduced qty                   |
| 4    | After success                                           | Detail shows remaining / tentative or completed per BE |



| ID     | Result (P/F/B) | Tester | Date | Notes |
| ------ | -------------- | ------ | ---- | ----- |
| **H4** |                |        |      |       |


---



## 2. Detail gates (before checkout)



### D1 — Completed → Bill paid


| Step | Action                    | Expected                               |
| ---- | ------------------------- | -------------------------------------- |
| 1    | Open **F7** detail        | RX Status **Completed**; **Bill paid** |
| 2    | Footer                    | No Proceed to Checkout                 |
| 3    | If Proceed somehow forced | Toast: already completed / Bill paid   |



| ID     | Result (P/F/B) | Tester | Date       | Notes |
| ------ | -------------- | ------ | ---------- | ----- |
| **D1** | P              | NA     | 28-07-2026 | NA    |




### D2 — Payment pending


| Step | Action      | Expected                             |
| ---- | ----------- | ------------------------------------ |
| 1    | Open **F6** | Tag **Payment pending** / Yet to pay |
| 2    | Footer      | No Proceed (Payment pending tag)     |



| ID     | Result (P/F/B) | Tester | Date       | Notes |
| ------ | -------------- | ------ | ---------- | ----- |
| **D2** | P              | NA     | 28-07-2026 | NA    |




### D3 — Tentative → popup


| Step | Action        | Expected                                |
| ---- | ------------- | --------------------------------------- |
| 1    | Open **F8**   | On load: **Get new prescription** modal |
| 2    | Proceed click | Same popup; no navigation to checkout   |



| ID     | Result (P/F/B) | Tester | Date       | Notes |
| ------ | -------------- | ------ | ---------- | ----- |
| **D3** | P              | NA     | 28-07-2026 | NA    |




### D4 — Tags from getMedicineInfo


| Step | Action                    | Expected                                                       |
| ---- | ------------------------- | -------------------------------------------------------------- |
| 1    | Open **F9**               | Per line: Remaining N, item status, **Out of stock** when true |
| 2    | Header                    | Remaining qty tag if any remaining > 0                         |
| 3    | No `getprescriptionbyPid` | Network: only `getMedicineInfo` (+ patient)                    |



| ID     | Result (P/F/B) | Tester | Date       | Notes                                                        |
| ------ | -------------- | ------ | ---------- | ------------------------------------------------------------ |
| **D4** | B              | NA     | 28-07-2026 | when oos comes we can check whether it is set properly or no |




### D5 — Draft / cancelled


| Step | Action    | Expected                            |
| ---- | --------- | ----------------------------------- |
| 1    | Draft     | No Proceed                          |
| 2    | Cancelled | Footer actions hidden / no checkout |



| ID     | Result (P/F/B) | Tester | Date | Notes |
| ------ | -------------- | ------ | ---- | ----- |
| **D5** |                |        |      |       |


---



## 3. Invoice resume (complex — must not double-bill)



### R1 — Create OK, leave before swipe


| Step | Action                                    | Expected                                                       |
| ---- | ----------------------------------------- | -------------------------------------------------------------- |
| 1    | Checkout → Confirm & Pay (cash)           | Invoice created; modal open                                    |
| 2    | Cancel modal / Back / refresh / close tab | Leave without `/payment/confirm`                               |
| 3    | Open checkout again                       | `getInvoiceByPrescriptionID` → **same** invoice; confirm popup |
| 4    | Network                                   | **No** second `billing/create`                                 |
| 5    | Swipe                                     | Confirms existing invoice only                                 |



| ID     | Result (P/F/B) | Tester | Date       | Notes                                                                           |
| ------ | -------------- | ------ | ---------- | ------------------------------------------------------------------------------- |
| **R1** | F              | sachin | 28-07-2026 | Related: after refresh, payment-pending / Yet to pay blocked swipe — see **R5** |




### R2 — Confirm fails, retry


| Step | Action                                        | Expected                                      |
| ---- | --------------------------------------------- | --------------------------------------------- |
| 1    | Create succeeds; force `/payment/confirm` 5xx | Error toast; modal can stay / retry           |
| 2    | Swipe again                                   | Same `invoice_id`; confirm idempotency reused |
| 3    | Success                                       | One paid bill                                 |



| ID     | Result (P/F/B) | Tester | Date       | Notes                  |
| ------ | -------------- | ------ | ---------- | ---------------------- |
| **R2** | B              | sachin | 28-07-2026 | need to reproduce this |




### R3 — Double-click Confirm & Pay


| Step | Action                           | Expected                          |
| ---- | -------------------------------- | --------------------------------- |
| 1    | Rapid double-click Confirm & Pay | At most one create                |
| 2    | Network                          | Not two invoices for same attempt |



| ID     | Result (P/F/B) | Tester | Date     | Notes                                                                             |
| ------ | -------------- | ------ | -------- | --------------------------------------------------------------------------------- |
| **R3** | P              | Sachin | 28-07-26 | clicked many times still only one invoice is created and pop up appears everytime |




### R4 — Detail after unpaid create


| Step | Action                           | Expected                                    |
| ---- | -------------------------------- | ------------------------------------------- |
| 1    | After R1 (unpaid invoice exists) | Detail still navigable                      |
| 2    | Proceed → checkout               | Resume confirm (R1), not a blind new create |



| ID     | Result (P/F/B) | Tester | Date       | Notes                                                            |
| ------ | -------------- | ------ | ---------- | ---------------------------------------------------------------- |
| **R4** | P              | sachin | 28-07-2026 | not creating new invoice and we have introduced complete payment |




### R5 — Refresh + close (X) confirm → Yet to pay with no swipe

**Bug (failed):** After unpaid invoice exists, refresh opens swipe confirm. Clicking **X** / Cancel closes it; footer shows **Yet to pay** (disabled / no reopen). Pharmacist cannot bring swipe back without a full redesign path.


| Step | Action                                                      | Expected (after fix)                                                |
| ---- | ----------------------------------------------------------- | ------------------------------------------------------------------- |
| 1    | Confirm & Pay (cash/QR) → invoice created; swipe modal open | Invoice exists unpaid                                               |
| 2    | Refresh checkout page                                       | `getInvoiceByPrescriptionID` finds invoice; swipe modal opens again |
| 3    | Click **X** / Cancel on modal                               | Modal closes; **invoice id kept** (not cleared)                     |
| 4    | Footer button                                               | Enabled **Complete payment** (not dead Yet to pay)                  |
| 5    | Click **Complete payment**                                  | Swipe confirm modal reopens for **same** invoice                    |
| 6    | Network                                                     | No second `billing/create`                                          |
| 7    | Swipe success                                               | `/payment/confirm` on existing invoice                              |



| ID     | Result (P/F/B) | Tester | Date       | Notes                                                                                                 |
| ------ | -------------- | ------ | ---------- | ----------------------------------------------------------------------------------------------------- |
| **R5** | F → fixed      | sachin | 28-07-2026 | Was: refresh → X → Yet to pay, swipe gone. Fix: dismiss keeps invoice; Complete payment reopens swipe |


---



## 4. Stock / allocation (complex)



### S0 — Dispense / take qty > prescribed

Pharmacist **cannot** choose more than prescribed. Partial (less) is allowed.


| Step | Action                                          | Expected                                      |
| ---- | ----------------------------------------------- | --------------------------------------------- |
| 1    | Set **DISPENSE QTY** > prescribed               | Clamped to prescribed; warning toast          |
| 2    | Or raise batch **Take qty** so sum > prescribed | Clamped; warning — room left under prescribed |
| 3    | Confirm & Pay                                   | Blocked if somehow over prescribed            |



| ID     | Result (P/F/B) | Tester | Date       | Notes                                                          |
| ------ | -------------- | ------ | ---------- | -------------------------------------------------------------- |
| **S0** | F->fixed       | Sachin | 28-07-2026 | it didnt block when more qty were selected, now it is resolved |




### S1 — Take qty > on-hand


| Step | Action                               | Expected                          |
| ---- | ------------------------------------ | --------------------------------- |
| 1    | Expand batches; set take qty > stock | Clamped or warning                |
| 2    | Confirm & Pay                        | Blocked — reduce to stock or less |



| ID     | Result (P/F/B) | Tester | Date       | Notes                                      |
| ------ | -------------- | ------ | ---------- | ------------------------------------------ |
| **S1** | F              | Sachin | 28-07-2026 | i was able to add more qty then prescribed |




### S2 — Allocated ≠ dispense qty


| Step | Action                                 | Expected                |
| ---- | -------------------------------------- | ----------------------- |
| 1    | Break FEFO so sum(allocate) ≠ dispense | Allocation error banner |
| 2    | Confirm & Pay                          | Blocked until fixed     |



| ID     | Result (P/F/B) | Tester | Date       | Notes                                             |
| ------ | -------------- | ------ | ---------- | ------------------------------------------------- |
| **S2** | P              | Sachin | 28-07-2026 | Confirm and pay able to click but message pops up |




### S3 — Multi-batch FEFO


| Step | Action                       | Expected                                |
| ---- | ---------------------------- | --------------------------------------- |
| 1    | **F2**: load checkout        | Earliest expiry filled first            |
| 2    | Override take across batches | Payload flattens multiple dispense rows |
| 3    | Pay                          | Stock decrements per batch on BE        |



| ID     | Result (P/F/B) | Tester | Date       | Notes               |
| ------ | -------------- | ------ | ---------- | ------------------- |
| **S3** | P              | Sachin | 28-07-2026 | Working as expected |




### S4 — Two batches, same medicine — take from one only

**Fixture:** **F2** — one prescription line with ≥2 batches (e.g. BAT-A and BAT-B).


| Step | Action                                                                      | Expected                                                             |
| ---- | --------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 1    | Open checkout for **F2**; expand the line                                   | Both batches visible (batch no, on-hand, take qty)                   |
| 2    | Note FEFO defaults (may allocate across both)                               | Optional baseline                                                    |
| 3    | Set **BAT-A** take qty = full dispense need; set **BAT-B** take qty = **0** | Dispense qty = BAT-A only; allocation sum OK                         |
| 4    | Confirm & Pay → inspect `POST /billing/create` body                         | `dispense_items` has **only BAT-A** (`quantity_sold_units` > 0)      |
| 5    | BAT-B in payload                                                            | **Absent** (or not sent with sold qty) — unchanged / not decremented |
| 6    | After pay, stock                                                            | Only BAT-A stock reduced on BE; BAT-B stock unchanged                |


**How to verify payload**

```text
dispense_items: [
  { batch_no: "BAT-A", quantity_sold_units: <n>, medicine_inventory_id: "..." }
  // BAT-B must NOT appear when take qty was 0
]
```


| ID     | Result (P/F/B) | Tester | Date       | Notes |
| ------ | -------------- | ------ | ---------- | ----- |
| **S4** | P              | Sachin | 28-07-2026 | NA    |




### S4b — Same medicine, two prescription lines

**Fixture:** **F3** — same `medicine_id`, two `prescription_item_id`s (e.g. MOR + NIT).


| Step | Action                                    | Expected                                                                                                        |
| ---- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 1    | Open checkout **F3**                      | Two separate table rows (not merged)                                                                            |
| 2    | Change qty / batches on **one** line only | Other line unchanged                                                                                            |
| 3    | Pay                                       | Payload includes **both** `prescription_item_id`s (if both billed); edits on line A do not alter line B batches |



| ID      | Result (P/F/B) | Tester | Date     | Notes |
| ------- | -------------- | ------ | -------- | ----- |
| **S4b** | P              | Sachin | 28-07-26 | NA    |




### S5 — Out of stock flag


| Step | Action                    | Expected                          |
| ---- | ------------------------- | --------------------------------- |
| 1    | Detail **F4** / **F9**    | Small **Out of stock** tag        |
| 2    | Checkout if status `sent` | Can reduce/omit line and pay rest |



| ID     | Result (P/F/B) | Tester | Date | Notes                             |
| ------ | -------------- | ------ | ---- | --------------------------------- |
| **S5** | -              | -      | -    | need to reproduce when stock is 0 |




### S6 — Zero billed lines


| Step | Action                  | Expected                              |
| ---- | ----------------------- | ------------------------------------- |
| 1    | Uncheck all / qty 0 all | Confirm & Pay blocked; select ≥1 item |



| ID     | Result (P/F/B) | Tester | Date       | Notes                                                                             |
| ------ | -------------- | ------ | ---------- | --------------------------------------------------------------------------------- |
| **S6** | F              | sachin | 28-07-2026 | confirm and pay is grey out, still can create invoice with zero medicine selected |


---



## 5. Payment mode & session



### P1 — Mode switching mid-flow


| Step | Action               | Expected                                |
| ---- | -------------------- | --------------------------------------- |
| 1    | Cash → Confirm       | Cash modal                              |
| 2    | Cancel; QR → Confirm | QR modal                                |
| 3    | Link → Confirm       | Link create path (no swipe)             |
| 4    | Payload              | `payment_mode` = `cash` / `qr` / `link` |



| ID     | Result (P/F/B) | Tester | Date       | Notes                                                       |
| ------ | -------------- | ------ | ---------- | ----------------------------------------------------------- |
| **P1** | F              | Sachin | 28-07-2026 | when i switch the mode, backend blocked and it is fixed now |




### P2 — Checkout timer expiry


| Step | Action           | Expected                          |
| ---- | ---------------- | --------------------------------- |
| 1    | Wait 2:00 → 0:00 | Expired warning; Confirm disabled |
| 2    | If modal open    | Closed / swipe disabled           |
| 3    | Reload           | New timer                         |



| ID     | Result (P/F/B) | Tester | Date       | Notes                                                                   |
| ------ | -------------- | ------ | ---------- | ----------------------------------------------------------------------- |
| **P2** | P              | Sachin | 28-07-2026 | i waited for 2min and then swipe disappeared and on refresh it appeared |




### P3 — Missing org / cashier / supplier


| Step | Action                               | Expected                           |
| ---- | ------------------------------------ | ---------------------------------- |
| 1    | Clear `organisation_id` or `user_id` | Error toast; no create             |
| 2    | Batches without `supplier_id`        | Clear error; no silent bad payload |



| ID     | Result (P/F/B) | Tester | Date       | Notes                                                                                                    |
| ------ | -------------- | ------ | ---------- | -------------------------------------------------------------------------------------------------------- |
| **P3** | F              | sachin | 28-07-2026 | when orgID and userID is cleared still updatemanually worked, it shouldnt work, need to block then there |




### P4 — Auth failure mid-pay


| Step | Action                             | Expected                            |
| ---- | ---------------------------------- | ----------------------------------- |
| 1    | Expire token before create/confirm | Handled; no white screen            |
| 2    | Retry after re-auth                | Safe; no duplicate if BE idempotent |



| ID     | Result (P/F/B) | Tester | Date       | Notes                             |
| ------ | -------------- | ------ | ---------- | --------------------------------- |
| **P4** | B              | sachin | 28-07-2026 | need to implement jwt for all api |


---



## 6. Status-driven checkout blocks



### B1 — Enter checkout while tentative


| Step | Action                                   | Expected                                |
| ---- | ---------------------------------------- | --------------------------------------- |
| 1    | Direct URL `/prescription/{F8}/checkout` | Get new prescription popup; pay blocked |
| 2    | Confirm & Pay                            | Disabled / popup only                   |



| ID     | Result (P/F/B) | Tester | Date       | Notes                                                                                |
| ------ | -------------- | ------ | ---------- | ------------------------------------------------------------------------------------ |
| **B1** | P              | Sachin | 28-07-2026 | i checked with tentative status and confirm and pay is blocked and i can see warning |




### B2 — Enter checkout while payment-pending


| Step | Action               | Expected                         |
| ---- | -------------------- | -------------------------------- |
| 1    | Open **F6** checkout | Yet to pay; Confirm disabled     |
| 2    | Click guarded path   | Warning; no new `billing/create` |



| ID     | Result (P/F/B) | Tester | Date       | Notes                                               |
| ------ | -------------- | ------ | ---------- | --------------------------------------------------- |
| **B2** | F              | Sachin | 28-07-2026 | for payment pending the complete payment is blocked |




### B3 — Enter checkout while completed


| Step | Action                | Expected                         |
| ---- | --------------------- | -------------------------------- |
| 1    | Direct URL **F7**     | Should not create new bill       |
| 2    | If UI still shows pay | BE reject / safe fail — note gap |



| ID     | Result (P/F/B) | Tester | Date       | Notes                                                    |
| ------ | -------------- | ------ | ---------- | -------------------------------------------------------- |
| **B3** | P              | Sachin | 28-07-2026 | backend rejecting with invoice already paid or not found |


---



## 7. Network / API failure matrix



### N1 — getMedicineInfo 500 on detail


| Expected              |
| --------------------- |
| Error toast; no crash |



| ID     | Result (P/F/B) | Tester | Date       | Notes                                                                       |
| ------ | -------------- | ------ | ---------- | --------------------------------------------------------------------------- |
| **N1** | P              | Sachin | 29-07-2026 | when backend server was not running, it didnt crash instead popup the error |




### N2 — getMedicineInfo 500 on checkout


| Expected                                                                                     |
| -------------------------------------------------------------------------------------------- |
| Sample fallback **or** error — document actual; never silent wrong pay on sample IDs in prod |



| ID     | Result (P/F/B) | Tester | Date       | Notes                                                           |
| ------ | -------------- | ------ | ---------- | --------------------------------------------------------------- |
| **N2** | P              | Sachin | 29-07-2026 | no data but it is showing sample data, that needs to be removed |




### N3 — getInvoice 404


| Expected           |
| ------------------ |
| Normal create flow |



| ID     | Result (P/F/B) | Tester | Date       | Notes                                             |
| ------ | -------------- | ------ | ---------- | ------------------------------------------------- |
| **N3** | P              | Sachin | 29-07-2026 | when no invoice is found then this error is valid |




### N4 — getInvoice 500


| Expected                                             |
| ---------------------------------------------------- |
| Do not block forever; allow retry / create carefully |



| ID     | Result (P/F/B) | Tester | Date       | Notes              |
| ------ | -------------- | ------ | ---------- | ------------------ |
| **N4** | -              | NA     | 29-07-2026 | it is working fine |




### N5 — billing/create 400


| Expected                        |
| ------------------------------- |
| Toast with BE message; no modal |



| ID     | Result (P/F/B) | Tester | Date       | Notes |
| ------ | -------------- | ------ | ---------- | ----- |
| **N5** | p              | Sachin | 29-07-2026 | -     |




### N6 — billing/create 409 duplicate


| Expected                                       |
| ---------------------------------------------- |
| Prefer return existing invoice / clear message |



| ID     | Result (P/F/B) | Tester | Date       | Notes                           |
| ------ | -------------- | ------ | ---------- | ------------------------------- |
| **N6** | P              | -      | 29-07-2026 | Now changed to complete payment |




### N7 — payment/confirm timeout then success


| Expected                           |
| ---------------------------------- |
| Idempotent confirm; one settlement |



| ID     | Result (P/F/B) | Tester | Date       | Notes                      |
| ------ | -------------- | ------ | ---------- | -------------------------- |
| **N7** | F              | Sachin | 29-07-2026 | Idempotency key is missing |




### N8 — Offline mid-swipe


| Expected                     |
| ---------------------------- |
| Error; can retry when online |



| ID     | Result (P/F/B) | Tester | Date       | Notes                  |
| ------ | -------------- | ------ | ---------- | ---------------------- |
| **N8** | P              | Sachin | 29-07-2026 | received network error |


---



## 8. Race & concurrency (complex)



### C1 — Two tabs both Confirm & Pay


| Expected                                           |
| -------------------------------------------------- |
| One invoice (idempotency / BE unique open invoice) |



| ID     | Result (P/F/B) | Tester | Date     | Notes                                                                                          |
| ------ | -------------- | ------ | -------- | ---------------------------------------------------------------------------------------------- |
| **C1** | F              | Sachin | 29-07-26 | when two tabs open new confirm and pay is not creating but on refresh it should show bill paid |




### C2 — Tab A creates; Tab B loads checkout


| Expected               |
| ---------------------- |
| B resumes same invoice |



| ID     | Result (P/F/B) | Tester | Date       | Notes                                                                             |
| ------ | -------------- | ------ | ---------- | --------------------------------------------------------------------------------- |
| **C2** | P              | Sachin | 29-07-2026 | it passed but for tab b it is giving failed with 500 not exact error it is giving |




### C3 — Tab A confirms; Tab B still on swipe


| Expected                                  |
| ----------------------------------------- |
| B confirm fails gracefully (already paid) |



| ID     | Result (P/F/B) | Tester | Date     | Notes               |
| ------ | -------------- | ------ | -------- | ------------------- |
| **C3** | P              | Sachin | 29-07-26 | b failed with error |




### C4 — Discard while create in flight


| Expected                                  |
| ----------------------------------------- |
| No orphan UX; eventual consistent with BE |



| ID     | Result (P/F/B) | Tester | Date       | Notes                                          |
| ------ | -------------- | ------ | ---------- | ---------------------------------------------- |
| **C4** | p              | Sachin | 29-07-2026 | discard has no point there need to remove that |


---



## 9. Patient / navigation edge cases



### V1 — Checkout without `?patientId=`


| Expected                                                  |
| --------------------------------------------------------- |
| Patient may be —; pay still works if BE has patient on Rx |



| ID     | Result (P/F/B) | Tester | Date       | Notes     |
| ------ | -------------- | ------ | ---------- | --------- |
| **V1** | P              | Sachin | 29-07-2026 | it worked |




### V2 — Back from checkout


| Expected                                              |
| ----------------------------------------------------- |
| Detail keeps patient header (`?patientId=` / session) |



| ID     | Result (P/F/B) | Tester | Date | Notes                     |
| ------ | -------------- | ------ | ---- | ------------------------- |
| **V2** | -              | -      | -    | didnt get idea what to do |




### V3 — Breadcrumb Detail while unpaid invoice


| Expected                             |
| ------------------------------------ |
| Returns detail; re-enter resumes pay |



| ID     | Result (P/F/B) | Tester | Date     | Notes                                      |
| ------ | -------------- | ------ | -------- | ------------------------------------------ |
| **V3** | p              | Sachin | 29-07-26 | we have changed button to complete payment |




### V4 — Discard order


| Expected                                |
| --------------------------------------- |
| Status cancelled; gone from active list |



| ID     | Result (P/F/B) | Tester | Date       | Notes                         |
| ------ | -------------- | ------ | ---------- | ----------------------------- |
| **V4** | F              | Sachin | 29-07-2026 | not integrated or not working |


---



## 10. Master sign-off sheet (fill as you go)

Copy results from each scenario above into this rollup.


| ID  | Scenario                         | P/F/B | Tester | Date       | Notes                                           |
| --- | -------------------------------- | ----- | ------ | ---------- | ----------------------------------------------- |
| H1  | Cash full dispense               |       |        |            |                                                 |
| H2  | QR full dispense                 |       |        |            |                                                 |
| H3  | Link pay                         |       |        |            |                                                 |
| H4  | Partial qty allowed              |       |        |            |                                                 |
| D1  | Completed → Bill paid            |       |        |            |                                                 |
| D2  | Payment pending detail           |       |        |            |                                                 |
| D3  | Tentative popup                  |       |        |            |                                                 |
| D4  | getMedicineInfo tags             |       |        |            |                                                 |
| D5  | Draft / cancelled                |       |        |            |                                                 |
| R1  | Resume after abandon swipe       |       |        |            |                                                 |
| R2  | Confirm fails, retry             |       |        |            |                                                 |
| R3  | Double-click Confirm & Pay       |       |        |            |                                                 |
| R4  | Detail after unpaid create       |       |        |            |                                                 |
| R5  | Refresh + X → reopen swipe       | F→fix | sachin | 28-07-2026 | Yet to pay lost swipe; Complete payment reopens |
| S0  | Dispense/take > prescribed       |       |        |            |                                                 |
| S1  | Take qty > stock                 |       |        |            |                                                 |
| S2  | Allocated ≠ dispense             |       |        |            |                                                 |
| S3  | Multi-batch FEFO                 |       |        |            |                                                 |
| S4  | Two batches — take from one only |       |        |            |                                                 |
| S4b | Same medicine two Rx lines       |       |        |            |                                                 |
| S5  | Out of stock flag                |       |        |            |                                                 |
| S6  | Zero billed lines                |       |        |            |                                                 |
| P1  | Mode switching                   |       |        |            |                                                 |
| P2  | Timer expiry                     |       |        |            |                                                 |
| P3  | Missing org/cashier/supplier     |       |        |            |                                                 |
| P4  | Auth failure mid-pay             |       |        |            |                                                 |
| B1  | Checkout while tentative         |       |        |            |                                                 |
| B2  | Checkout while payment-pending   |       |        |            |                                                 |
| B3  | Checkout while completed         |       |        |            |                                                 |
| N1  | getMedicineInfo 500 detail       |       |        |            |                                                 |
| N2  | getMedicineInfo 500 checkout     |       |        |            |                                                 |
| N3  | getInvoice 404                   |       |        |            |                                                 |
| N4  | getInvoice 500                   |       |        |            |                                                 |
| N5  | billing/create 400               |       |        |            |                                                 |
| N6  | billing/create 409               |       |        |            |                                                 |
| N7  | confirm timeout then success     |       |        |            |                                                 |
| N8  | Offline mid-swipe                |       |        |            |                                                 |
| C1  | Two tabs Confirm & Pay           |       |        |            |                                                 |
| C2  | Tab B resumes invoice            |       |        |            |                                                 |
| C3  | Tab B after A paid               |       |        |            |                                                 |
| C4  | Discard during create            |       |        |            |                                                 |
| V1  | No patientId query               |       |        |            |                                                 |
| V2  | Back keeps patient               |       |        |            |                                                 |
| V3  | Breadcrumb + unpaid resume       |       |        |            |                                                 |
| V4  | Discard cancels Rx               |       |        |            |                                                 |




### Smoke subset (must pass before release)


| ID  | P/F/B | Notes                                                |
| --- | ----- | ---------------------------------------------------- |
| H1  |       |                                                      |
| H3  |       |                                                      |
| H4  |       |                                                      |
| D1  |       |                                                      |
| D3  |       |                                                      |
| R1  |       |                                                      |
| R5  |       | Refresh + X must reopen swipe                        |
| S0  |       | Cannot exceed prescribed qty                         |
| S1  |       |                                                      |
| S4  |       | Take from one batch only; other omitted from payload |
| S4b |       |                                                      |
| P2  |       |                                                      |
| B2  |       |                                                      |
| C1  |       |                                                      |


---

**Lead tester:** _____________  
**Date:** _____________  
**Build / branch:** _____________  
**Overall:** Pass / Fail / Conditional  
**Blockers:** _____________