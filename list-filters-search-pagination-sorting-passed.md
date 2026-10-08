# List filters / search / pagination / sorting — PASSED

Source: [`list-filters-search-pagination-sorting-test-scenarios.md`](list-filters-search-pagination-sorting-test-scenarios.md)  
Also see: [`list-filters-search-pagination-sorting-failed.md`](list-filters-search-pagination-sorting-failed.md) · [`list-filters-search-pagination-sorting-blocked.md`](list-filters-search-pagination-sorting-blocked.md)

| ID | Scenario | Tester | Date | Notes |
|----|----------|--------|------|-------|
| **S3** | Appt search by name | Sachin | 09-08-2026 | Correct name filters; page 2 still respects search |
| **S5** | Appt search by code / no match | Sachin | 09-08-2026 | Correct code OK; wrong code → no appointments |
| **S6** | Appt search debounce / race | Sachin | 09-08-2026 | Working as expected |
| **S7** | Search whitespace | Sachin | 09-08-2026 | No API for spaces-only |
| **F-PL1** | Patient Gender filter | Sachin | 09-08-2026 | Working as expected |
| **F-AP2** | Appt Doctor filter | Sachin | 09-08-2026 | OK; admin used as doctor when no doctors |
| **F-AP6** | Clear Filters | Sachin | 09-08-2026 | Working as expected |
| **F-AP7** | Filter shrinks past page | Sachin | 09-08-2026 | Working as expected |
| **P2** | Patient total label | Sachin | 09-08-2026 | Listing shown as expected |
| **P3** | Appt pagination footer | sachin | 09-08-2026 | Working as expected |
| **P4** | Empty / single page | Sachin | 09-08-2026 | Doesn’t crash |
| **P5** | Filter resets page | Sachin | 09-08-2026 | Working |
| **SO1** | Age sort | Sachin | 09-08-2026 | Working |
| **SO2** | Issued At sort | Sachin | 09-08-2026 | Working |
| **SO4** | Appt column sort (N/A check) | Sachin | 09-08-2026 | Sorted correctly / behaviour OK |
| **E1** | Patients list 500 | Sachin | 09-08-2026 | Fail-to-load; message unclear (follow-up UX) |
| **E2** | Appointments list 500 | Sachin | 09-08-2026 | Error message not clear (follow-up UX) |
| **E3** | 500 on filter/search | Sachin | 09-08-2026 | Works; message not clear |
| **E4** | 500 on page change | Sachin | 09-08-2026 | Pagination path noted |
| **E5** | Doctors 500 | Sachin | 09-08-2026 | Working |
| **R1** | Desktop 1440×900 + 1280×800 | Sachin | 09-08-2026 | Looks clean and neat |
| **R4** | 500 toast @ tablet + phone | Sachin | 09-08-2026 | Toast OK; patients still weak on error UI |
| **R5** | Sidebar collapse | Sachin | 09-08-2026 | Working as expected |
| **RX-S1** | RX search debounce | Sachin | 09-08-2026 | Working as expected |
| **RX-S3** | RX search race | Sachin | 09-08-2026 | Working |
| **RX-P1** | RX pagination | Sachin | 09-08-2026 | Working |
| **RX-P2** | RX filter resets page | Sachin | 09-08-2026 | Working |
| **RX-E1** | RX list 500 | Sachin | 09-08-2026 | Working |
| **RX-E2** | RX 500 on search/page | Sachin | 09-08-2026 | Pass with note: failed search can leave old list — improve later |
| **SUP-P2** | Supplier missing org | Sachin | 09-08-2026 | Missing `organisation_id` handled correctly |
| **SUP-E1** | Supplier list 500 | Sachin | 09-08-2026 | — |

**Count:** 31

_Move IDs here when they flip to Pass after fix/retest._
