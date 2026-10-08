# List filters / search / pagination / sorting — BLOCKED / SKIPPED

Blocked, skipped, or deferred. Run later when fixtures / features exist.  
Source: [`list-filters-search-pagination-sorting-test-scenarios.md`](list-filters-search-pagination-sorting-test-scenarios.md)  
Also see: [`list-filters-search-pagination-sorting-passed.md`](list-filters-search-pagination-sorting-passed.md) · [`list-filters-search-pagination-sorting-failed.md`](list-filters-search-pagination-sorting-failed.md)

---

## Blocked / not implemented yet

| ID | Scenario | Tester | Date | Notes |
|----|----------|--------|------|-------|
| **S1** | Patient search input | Sachin | 09-08-2026 | Not implemented (UI-only) |
| **S4** | Appt search by mobile | Sachin | 09-08-2026 | Not implemented |
| **F-PL2** | Gender + pagination | — | 09-08-2026 | Need **>10** patients to validate |
| **SO3** | Sort + pagination | — | 09-08-2026 | Patients not **>10** yet |
| **RX-S2** | RX search clear / no match | Sachin | 09-08-2026 | Works for code; need name search too |
| **SUP-S1** | Supplier search (UI-only) | Sachin | 09-08-2026 | Not implemented |
| **SUP-F1** | Supplier status dropdown | Sachin | 09-08-2026 | Need to implement (persist API) |
| **SUP-SO1** | Supplier column sort | Sachin | 09-08-2026 | Column sort not present |

---

## Skipped / deferred (`-`)

| ID | Scenario | Tester | Date | Notes |
|----|----------|--------|------|-------|
| **S2** | Patient search clear / icon | — | 09-08-2026 | Not implemented |
| **P1** | Patient pagination | — | 09-08-2026 | Future testing |
| **E6** | Stale 500 vs success | Sachin | 09-08-2026 | Slow-network testing later |

---

## Untested (blank result)

| ID | Scenario |
|----|----------|
| **RX-SO1** | RX column sort (N/A) |
| **SUP-E2** | Supplier 500 on page |

---

**Count:** Blocked 8 · Skipped 3 · Untested 2

_When unblocked, retest and move to passed or failed._
