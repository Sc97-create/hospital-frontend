# Prescription checkout — Pass / Fail segregation

Source results from `prescription-checkout-pay-test-scenarios.md` (tester fill-in rows).

**Legend:** P = Pass · F = Fail · B = Blocked · F→fixed = failed then fixed · — / blank = not run / skip

| Bucket | Count |
|--------|------:|
| Pass | 24 |
| Fail (open) | 8 |
| Fail → fixed (re-verify) | 2 |
| Blocked / skip | 4 |
| Untested | 7 |
| **Total** | **45** |

---

## Pass

| ID | Scenario | Tester | Date | Notes |
|----|----------|--------|------|-------|
| **D1** | Completed → Bill paid | NA | 28-07-2026 | — |
| **D2** | Payment pending | NA | 28-07-2026 | — |
| **D3** | Tentative → popup | NA | 28-07-2026 | — |
| **R3** | Double-click Confirm & Pay | Sachin | 28-07-26 | One invoice; popup each time |
| **R4** | Detail after unpaid create | sachin | 28-07-2026 | Resume + Complete payment |
| **S2** | Allocated ≠ dispense qty | Sachin | 28-07-2026 | Message pops; blocked |
| **S3** | Multi-batch FEFO | Sachin | 28-07-2026 | Working as expected |
| **S4** | Two batches — take from one only | Sachin | 28-07-2026 | — |
| **S4b** | Same medicine, two Rx lines | Sachin | 28-07-26 | — |
| **P2** | Checkout timer expiry | Sachin | 28-07-2026 | Swipe gone at 0; refresh restores |
| **B1** | Enter checkout while tentative | Sachin | 28-07-2026 | Confirm blocked + warning |
| **B3** | Enter checkout while completed | Sachin | 28-07-2026 | BE rejects already paid |
| **N1** | getMedicineInfo 500 on detail | Sachin | 29-07-2026 | Error popup; no crash |
| **N2** | getMedicineInfo 500 on checkout | Sachin | 29-07-2026 | Shows sample data — **remove sample fallback** (follow-up) |
| **N3** | getInvoice 404 | Sachin | 29-07-2026 | Normal create when no invoice |
| **N5** | billing/create 400 | Sachin | 29-07-2026 | — |
| **N6** | billing/create 409 duplicate | — | 29-07-2026 | Now Complete payment path |
| **N8** | Offline mid-swipe | Sachin | 29-07-2026 | Network error shown |
| **C2** | Tab A creates; Tab B loads checkout | Sachin | 29-07-2026 | Resume OK; Tab B 500 message unclear |
| **C3** | Tab A confirms; Tab B still on swipe | Sachin | 29-07-26 | B failed with error (expected) |
| **C4** | Discard while create in flight | Sachin | 29-07-2026 | Discard may be pointless — consider remove |
| **V1** | Checkout without `?patientId=` | Sachin | 29-07-2026 | Worked |
| **V3** | Breadcrumb Detail while unpaid invoice | Sachin | 29-07-26 | Complete payment button |

---

## Fail (still open)

Needs fix or clear retest before release. Priorities: see `prescription-checkout-pay-failed.md`.

| Pri | ID | Scenario | Tester | Date | Notes |
|-----|----|----------|--------|------|-------|
| **P0** | **N7** | payment/confirm timeout then success | Sachin | 29-07-2026 | **Idempotency key missing** — double-settle risk |
| **P0** | **S6** | Zero billed lines | sachin | 28-07-2026 | Grey button but zero-med invoice still creatable |
| **P0** | **P3** | Missing org / cashier / supplier | sachin | 28-07-2026 | Cleared org/user still allowed pay — must block |
| **P1** | **B2** | Enter checkout while payment-pending | Sachin | 28-07-2026 | Complete payment blocked for payment-pending |
| **P1** | **C1** | Two tabs both Confirm & Pay | Sachin | 29-07-26 | Second tab odd; refresh should show bill paid |
| **P1** | **S1** | Take qty > on-hand | Sachin | 28-07-2026 | Over-allocate vs stock/prescribed — verify clamp |
| **P2** | **R1** | Create OK, leave before swipe | sachin | 28-07-2026 | Retest after R5 fix |
| **P2** | **P1** | Mode switching mid-flow | Sachin | 28-07-2026 | Notes say BE fixed — **retest → Pass if OK** |
| **P3** | **V4** | Discard order | Sachin | 29-07-2026 | Not integrated / not working |

---

## Fail → fixed (re-verify as Pass)

| ID | Scenario | Tester | Date | Notes |
|----|----------|--------|------|-------|
| **R5** | Refresh + X → reopen swipe | sachin | 28-07-2026 | Dismiss keeps invoice; Complete payment reopens |
| **S0** | Dispense / take qty > prescribed | Sachin | 28-07-2026 | Now blocks over-prescribed |

---

## Blocked / skipped

| ID | Scenario | Tester | Date | Notes |
|----|----------|--------|------|-------|
| **D4** | Tags from getMedicineInfo | NA | 28-07-2026 | Need OOS fixture to verify tag |
| **R2** | Confirm fails, retry | sachin | 28-07-2026 | Need to reproduce |
| **P4** | Auth failure mid-pay | sachin | 28-07-2026 | Token refresh masks; JWT not on all APIs |
| **S5** | Out of stock flag | — | — | Need stock = 0 to reproduce |
| **N4** | getInvoice 500 | NA | 29-07-2026 | Marked “working fine” / skip (`-`) |
| **V2** | Back from checkout | — | — | Unclear what to do |

---

## Untested (blank result)

| ID | Scenario |
|----|----------|
| **H1** | Cash full dispense |
| **H2** | QR full dispense |
| **H3** | Link pay |
| **H4** | Partial qty allowed |
| **D5** | Draft / cancelled |

---

## Priority follow-ups

1. **P0:** N7 → S6 → P3  
2. **P1:** B2 → C1 → S1  
3. **P2 retest:** R1, P1; promote R5 / S0 to Pass if still good  
4. **P3:** V4 discard  
5. **Hygiene:** N2 sample fallback; C4 discard UX  
6. **Happy path still blank:** H1–H4

---

_Update this file when scenario results change._
