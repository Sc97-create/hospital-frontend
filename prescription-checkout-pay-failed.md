# Prescription checkout — FAILED cases only

Open fails that need fix or retest. Full context: `prescription-checkout-pay-pass-fail.md`.

| ID | Scenario | Tester | Date | Notes / action |
|----|----------|--------|------|----------------|
| **R1** | Create OK, leave before swipe | sachin | 28-07-2026 | Retest after R5 fix |
| **S1** | Take qty > on-hand | Sachin | 28-07-2026 | Could exceed prescribed; verify stock clamp |
| **S6** | Zero billed lines | sachin | 28-07-2026 | Grey button but zero-med invoice still created |
| **P1** | Mode switching mid-flow | Sachin | 28-07-2026 | Notes say BE fixed — **retest** |
| **P3** | Missing org / cashier / supplier | sachin | 28-07-2026 | Must block when org/user cleared |
| **B2** | Checkout while payment-pending | Sachin | 28-07-2026 | Complete payment blocked incorrectly |
| **N7** | confirm timeout then success | Sachin | 29-07-2026 | **Idempotency key missing** |
| **C1** | Two tabs Confirm & Pay | Sachin | 29-07-26 | Multi-tab create/resume inconsistency |
| **V4** | Discard order | Sachin | 29-07-2026 | Not integrated / not working |

## Previously failed, now fixed (not open)

| ID | Scenario | Notes |
|----|----------|-------|
| **R5** | Refresh + X → reopen swipe | Complete payment reopens |
| **S0** | Dispense/take > prescribed | Now clamped |
