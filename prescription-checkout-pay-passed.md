# Prescription checkout — PASSED cases only

From `prescription-checkout-pay-pass-fail.md` / scenario results.

| ID | Scenario | Tester | Date | Notes |
|----|----------|--------|------|-------|
| **D1** | Completed → Bill paid | NA | 28-07-2026 | — |
| **D2** | Payment pending | NA | 28-07-2026 | — |
| **D3** | Tentative → popup | NA | 28-07-2026 | — |
| **R3** | Double-click Confirm & Pay | Sachin | 28-07-26 | One invoice |
| **R4** | Detail after unpaid create | sachin | 28-07-2026 | Complete payment resume |
| **S2** | Allocated ≠ dispense qty | Sachin | 28-07-2026 | — |
| **S3** | Multi-batch FEFO | Sachin | 28-07-2026 | — |
| **S4** | Two batches — take from one only | Sachin | 28-07-2026 | — |
| **S4b** | Same medicine, two Rx lines | Sachin | 28-07-26 | — |
| **P2** | Checkout timer expiry | Sachin | 28-07-2026 | — |
| **B1** | Checkout while tentative | Sachin | 28-07-2026 | — |
| **B3** | Checkout while completed | Sachin | 28-07-2026 | — |
| **N1** | getMedicineInfo 500 detail | Sachin | 29-07-2026 | — |
| **N2** | getMedicineInfo 500 checkout | Sachin | 29-07-2026 | Sample data still shown — follow-up |
| **N3** | getInvoice 404 | Sachin | 29-07-2026 | — |
| **N5** | billing/create 400 | Sachin | 29-07-2026 | — |
| **N6** | billing/create 409 | — | 29-07-2026 | — |
| **N8** | Offline mid-swipe | Sachin | 29-07-2026 | — |
| **C2** | Tab B resumes invoice | Sachin | 29-07-2026 | 500 message unclear |
| **C3** | Tab B after A paid | Sachin | 29-07-26 | — |
| **C4** | Discard during create | Sachin | 29-07-2026 | Discard may be unused |
| **V1** | No patientId query | Sachin | 29-07-2026 | — |
| **V3** | Breadcrumb + unpaid resume | Sachin | 29-07-26 | — |

**Also fixed (treat as pass after quick re-check):** R5, S0
