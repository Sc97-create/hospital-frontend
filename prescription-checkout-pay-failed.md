# Prescription checkout — FAILED cases only

Open fails that need fix or retest. Full context: `prescription-checkout-pay-pass-fail.md`.

**Priority**

| Level | Meaning |
|-------|---------|
| **P0** | Ship blocker — money / data integrity / security |
| **P1** | High — blocks real pharmacist workflows |
| **P2** | Medium — likely fixed or needs retest only |
| **P3** | Low — UX / nice-to-have |

---

## Open fails (by priority)

| Pri | ID | Scenario | Tester | Date | Notes / action |
|-----|----|----------|--------|------|----------------|
| **P0** | **N7** | confirm timeout then success | Sachin | 29-07-2026 | **Idempotency key missing** — double-settle risk |
| **P0** | **S6** | Zero billed lines | sachin | 28-07-2026 | Grey button but zero-med invoice still created |
| **P0** | **P3** | Missing org / cashier / supplier | sachin | 28-07-2026 | Cleared org/user still allowed pay — must block |
| **P1** | **B2** | Checkout while payment-pending | Sachin | 28-07-2026 | Complete payment blocked — can't finish unpaid |
| **P1** | **C1** | Two tabs Confirm & Pay | Sachin | 29-07-26 | Multi-tab create/resume inconsistency |
| **P1** | **S1** | Take qty > on-hand | Sachin | 28-07-2026 | Could over-allocate vs stock/prescribed — verify clamp |
| **P2** | **R1** | Create OK, leave before swipe | sachin | 28-07-2026 | Retest after R5 fix (may already Pass) |
| **P2** | **P1** | Mode switching mid-flow | Sachin | 28-07-2026 | Notes say BE fixed — **retest → Pass if OK** |
| **P3** | **V4** | Discard order | Sachin | 29-07-2026 | Not integrated / not working |

### Suggested order of work

1. **N7** — send/reuse `idempotency_key` on `/payment/confirm`
2. **S6** — hard-block create when no selected qty
3. **P3** — block Confirm & Pay if org / cashier / supplier missing
4. **B2** — allow Complete payment for unpaid / payment-pending
5. **C1** — same invoice across tabs; no orphan creates
6. **S1** — clamp take ≤ stock (and ≤ prescribed via S0)
7. **R1 / P1** — retest only
8. **V4** — wire discard or remove from UI

---

## Previously failed, now fixed (not open)

| ID | Scenario | Notes |
|----|----------|-------|
| **R5** | Refresh + X → reopen swipe | Complete payment reopens |
| **S0** | Dispense/take > prescribed | Now clamped |
