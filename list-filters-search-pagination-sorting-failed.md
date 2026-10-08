# List filters / search / pagination / sorting — FAILED

Open fails to fix or retest later.  
Source: [`list-filters-search-pagination-sorting-test-scenarios.md`](list-filters-search-pagination-sorting-test-scenarios.md)  
Also see: [`list-filters-search-pagination-sorting-passed.md`](list-filters-search-pagination-sorting-passed.md) · [`list-filters-search-pagination-sorting-blocked.md`](list-filters-search-pagination-sorting-blocked.md)

**Priority**

| Level | Meaning |
|-------|---------|
| **P0** | Ship blocker — wrong data / broken core filter |
| **P1** | High — wrong filter options or broken list API merge |
| **P2** | Medium — responsive / pagination gaps |
| **P3** | Low — out of scope for now / polish |

---

## Open fails (by priority)

| Pri | ID | Scenario | Tester | Date | Notes / action |
|-----|----|----------|--------|------|----------------|
| **P1** | **F-AP1** | Appt Date filter | Sachin | 09-08-2026 | In status area add OPD / new patient / follow up (filter options wrong) |
| **P1** | **F-AP3** | Appt Status filter | Sachin | 09-08-2026 | Need to filter some statuses; add/remove options in filter list |
| **P1** | **F-AP4** | Appt Visit Type filter | Sachin | 09-08-2026 | Add OPD; remove Procedure for now |
| **P1** | **F-AP5** | Combined filters + search | Sachin | 09-08-2026 | **Partial** — need to alter some statuses |
| **P1** | **RX-F1** | RX All / Draft / Sent | Sachin | 09-08-2026 | Replace Draft with payment-pending + other statuses (list TBD) |
| **P1** | **RX-F2** | RX status + search | Sachin | 09-08-2026 | Merge `getByStatus` + `get` APIs — currently failing |
| **P2** | **R2** | Tablet 1024×768 + 768×1024 | Sachin | 09-08-2026 | Need layout modification for this screen width |
| **P2** | **SUP-P1** | Supplier pagination | Sachin | 09-08-2026 | Couldn’t validate >10 suppliers yet / pagination issue |
| **P2** | **SUP-R1** | Supplier responsive | Sachin | 09-08-2026 | Doesn’t look correct |
| **P2** | **RX-R1** | RX responsive | Sachin | 09-08-2026 | Marked P→F — failure notes to attach / retest |
| **P2** | **SUP-S2** | Supplier search clear | Sachin | 09-08-2026 | Not implemented |
| **P3** | **R3** | Phone 430/390/375/360 | Sachin | 09-08-2026 | Marked fail — “not required as of now” (confirm product scope) |

### Suggested order of work (later)

1. **F-AP3 / F-AP4 / F-AP1 / F-AP5** — align appointment filter options (status + visit type + OPD)
2. **RX-F1 / RX-F2** — prescription status chips + merge list APIs
3. **R2 / SUP-R1 / RX-R1** — responsive layouts
4. **SUP-P1 / SUP-S2** — supplier pagination + search wiring
5. **R3** — confirm if phone is in scope or move to Blocked

---

**Count (open):** 12

_Update when fixed → move to passed file._
