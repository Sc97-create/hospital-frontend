# List Filters / Search / Pagination / Sorting — Testing Scenarios

Manual QA for **table controls** on Patient List, Appointments, Prescriptions, and Suppliers. Target: **complete sign-off today (09-08-2026)**.

**Result buckets (P / F / B split)**

| Result | File |
|--------|------|
| Pass | [`list-filters-search-pagination-sorting-passed.md`](list-filters-search-pagination-sorting-passed.md) |
| Fail | [`list-filters-search-pagination-sorting-failed.md`](list-filters-search-pagination-sorting-failed.md) |
| Blocked / skip | [`list-filters-search-pagination-sorting-blocked.md`](list-filters-search-pagination-sorting-blocked.md) |
| Index | [`list-filters-search-pagination-sorting-pass-fail.md`](list-filters-search-pagination-sorting-pass-fail.md) |

**Screens under test**


| Screen        | Path            | Controls                                                                                 |
| ------------- | --------------- | ---------------------------------------------------------------------------------------- |
| Patient list  | `/patients`     | Search (UI), Gender filter, Age / Issued At sort, Pagination                             |
| Appointments  | `/appointments` | Debounced search, Date / Doctor / Status / Visit Type filters, Clear Filters, Pagination |
| Prescriptions | `/prescription` | Debounced search (**400ms**), status chips All / Draft / Sent, Pagination                |
| Suppliers     | `/suppliers`    | Search (UI-only), Pagination; status dropdown local-only                                 |


**Related**

- `[patient-testing-scenarios.md](patient-testing-scenarios.md)` — broader patient flows
- Patient list: `src/patientmangement/patientlist/patient-list.tsx`
- Appointments: `src/patientmangement/patient-appointment/appointment-list.tsx` (search debounce **400ms**)
- Prescriptions: `src/prescriptions/prescription-details.tsx` (search debounce **400ms**)
- Suppliers: `src/suppliers/pharmacy.tsx`

---

## How to sign off each scenario


| Result            | Mark                                |
| ----------------- | ----------------------------------- |
| Pass              | `P` or `pass`                       |
| Fail              | `F` or `fail`                       |
| Blocked / not run | `B` / `skip`                        |
| Notes             | Short reason, screenshot, or ticket |


Fill **Result / Tester / Date / Notes** on every case. Date for today’s run: **09-08-2026**.

---

## Preconditions / fixtures


| Fixture                        | Setup                                                                           |
| ------------------------------ | ------------------------------------------------------------------------------- |
| **F1 Populated patients**      | Org with **>20** patients (mix Male/Female, varied ages & `patient_created_at`) |
| **F2 Empty patients**          | Org with **0** patients                                                         |
| **F3 Populated appointments**  | Org with **>20** appointments across doctors, statuses, visit types, dates      |
| **F4 Empty appointments**      | Org with **0** appointments (or filters that yield 0)                           |
| **F5 Known patient**           | Name + mobile + patient/appointment code you can search for                     |
| **F6 Logged in**               | Valid `access_token` + `organisation_id` in localStorage                        |
| **F7 Populated prescriptions** | Org with **>20** RXs mix `draft` / `sent` (and other statuses if present)       |
| **F8 Empty prescriptions**     | Org with **0** prescriptions                                                    |
| **F9 Known prescription**      | Patient name / RX code / doctor you can search for                              |
| **F10 Populated suppliers**    | Org with **>20** suppliers (mix Active / Inactive if available)                 |
| **F11 Empty suppliers**        | Org with **0** suppliers                                                        |
| **F12 Known supplier**         | Name / license / city string for search (when wired)                            |


**Tools for API fault cases:** DevTools → Network → block/throttle, or mock status **500** on list APIs.


| API                                                                        | Used by                                                                               |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `GET /patients/getPatients`                                                | Patient list                                                                          |
| Appointments org list (payload with `page_no`, `limit`, `search`, filters) | Appointments                                                                          |
| `GET /prescription/get`                                                    | Prescription list (**All**) — `limit`, `offset`, `organisation_id`, optional `search` |
| `GET /prescription/getByStatus`                                            | Prescription list (**Draft** / **Sent**) — same + `status`                            |
| Suppliers by org (`GetSuppliersByOrgID`)                                   | Suppliers — `organisation_id`, `limit`, `page_no`                                     |


---

## 1. Search

### S1 — Patient list search input visible


| Step | Action                     | Expected                                                                                                 |
| ---- | -------------------------- | -------------------------------------------------------------------------------------------------------- |
| 1    | Open `/patients` (**F1**)  | Placeholder “search patients”; search icon visible                                                       |
| 2    | Type a known name (**F5**) | Input accepts text                                                                                       |
| 3    | Observe table              | **Current behaviour:** list does **not** filter / no search API — document as known gap if still unwired |



| ID     | Result (P/F/B) | Tester | Date       | Notes           |
| ------ | -------------- | ------ | ---------- | --------------- |
| **S1** | B              | Sachin | 09-08-2026 | Not implemented |


### S2 — Patient list search clear / icon click


| Step | Action               | Expected                           |
| ---- | -------------------- | ---------------------------------- |
| 1    | Clear the search box | Input empty; page does not crash   |
| 2    | Click search icon    | No crash; no unintended navigation |



| ID     | Result (P/F/B) | Tester | Date       | Notes           |
| ------ | -------------- | ------ | ---------- | --------------- |
| **S2** | -              | -      | 09-08-2026 | Not implemented |


### S3 — Appointments search by patient name (debounce)


| Step | Action                                        | Expected                                                       |
| ---- | --------------------------------------------- | -------------------------------------------------------------- |
| 1    | Open `/appointments` (**F3**)                 | Search placeholder mentions name / mobile / appointment ID     |
| 2    | Type known patient name (**F5**); wait ≥400ms | Loading spinner; request includes `search`; matching rows only |
| 3    | Check footer / title count                    | Count matches filtered `total`                                 |
| 4    | Page resets                                   | `currentPage` becomes **1** after debounce                     |



| ID     | Result (P/F/B) | Tester | Date       | Notes                                                                                                                             |
| ------ | -------------- | ------ | ---------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **S3** | P              | Sachin | 09-08-2026 | when typed correct name, it is displaying only those patients and when clicked on 2 page, showing correct patient based on search |


### S4 — Appointments search by mobile


| Step | Action                      | Expected                                               |
| ---- | --------------------------- | ------------------------------------------------------ |
| 1    | Paste known mobile (**F5**) | After debounce, rows for that patient                  |
| 2    | Partial mobile (3–4 digits) | Document BE behaviour (match / empty / all) — no crash |



| ID     | Result (P/F/B) | Tester | Date       | Notes           |
| ------ | -------------- | ------ | ---------- | --------------- |
| **S4** | B              | Sachin | 09-08-2026 | Not implemented |


### S5 — Appointments search by appointment code / ID


| Step | Action                             | Expected                                    |
| ---- | ---------------------------------- | ------------------------------------------- |
| 1    | Search known appointment code      | Single (or matching) row(s)                 |
| 2    | Nonsense string `zzz-no-match-999` | Empty table; “No appointments”; count **0** |



| ID     | Result (P/F/B) | Tester | Date       | Notes                                                                                       |
| ------ | -------------- | ------ | ---------- | ------------------------------------------------------------------------------------------- |
| **S5** | P              | Sachin | 09-08-2026 | for correct code it is working fine,if wrong code entered then no appointments is showing |


### S6 — Appointments search debounce / race


| Step | Action                                    | Expected                                                              |
| ---- | ----------------------------------------- | --------------------------------------------------------------------- |
| 1    | Type quickly A → AB → ABC without pausing | Only **one** settled request for final term (stale responses ignored) |
| 2    | Clear with × / allowClear                 | Debounce clears search; full list returns; page **1**                 |



| ID     | Result (P/F/B) | Tester | Date       | Notes               |
| ------ | -------------- | ------ | ---------- | ------------------- |
| **S6** | P              | Sachin | 09-08-2026 | working as expected |


### S7 — Search + whitespace


| Step | Action                                   | Expected                                          |
| ---- | ---------------------------------------- | ------------------------------------------------- |
| 1    | Type spaces only                         | Treated as empty search (trim); no useless filter |
| 2    | Leading/trailing spaces around real name | Trimmed; still finds patient                      |



| ID     | Result (P/F/B) | Tester | Date       | Notes            |
| ------ | -------------- | ------ | ---------- | ---------------- |
| **S7** | P              | Sachin | 09-08-2026 | no api is called |


---

## 2. Filters

### F-PL1 — Patient Gender filter Male / Female


| Step | Action                                        | Expected                                                    |
| ---- | --------------------------------------------- | ----------------------------------------------------------- |
| 1    | `/patients` → Gender column filter → **Male** | Only Male rows on **current page** (client-side `onFilter`) |
| 2    | Switch to **Female**                          | Only Female rows                                            |
| 3    | Clear column filters                          | All genders on page again                                   |



| ID        | Result (P/F/B) | Tester | Date       | Notes               |
| --------- | -------------- | ------ | ---------- | ------------------- |
| **F-PL1** | P              | Sachin | 09-08-2026 | working as expected |


### F-PL2 — Gender filter + pagination interaction


| Step | Action                          | Expected                                                                                                          |
| ---- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 1    | Apply Male filter on page 1     | Filtered rows                                                                                                     |
| 2    | Go to page 2                    | New page loads from API; filter reapplies to **new page data** (may look “empty” if page has no males — document) |
| 3    | No white-screen / console crash | Pass if stable                                                                                                    |



| ID        | Result (P/F/B) | Tester | Date       | Notes                                               |
| --------- | -------------- | ------ | ---------- | --------------------------------------------------- |
| **F-PL2** | B              | -      | 09-08-2026 | when created more then 10 then will check this case |


### F-AP1 — Appointments Date filter


| Step | Action                                        | Expected                                         |
| ---- | --------------------------------------------- | ------------------------------------------------ |
| 1    | Select **Today**                              | Request `date=today`; rows match today; page → 1 |
| 2    | **Tomorrow** / **This Week** / **This Month** | Refetch each time; counts update                 |
| 3    | Clear Date                                    | Full set (subject to other filters)              |



| ID        | Result (P/F/B) | Tester | Date       | Notes                                        |
| --------- | -------------- | ------ | ---------- | -------------------------------------------- |
| **F-AP1** | F              | Sachin | 09-08-2026 | in status add opd, new patient and follow up |


### F-AP2 — Appointments Doctor filter


| Step | Action                          | Expected                                     |
| ---- | ------------------------------- | -------------------------------------------- |
| 1    | Focus Doctor select             | Doctors load for org                         |
| 2    | Pick a doctor with appointments | Only that doctor’s rows; title count updates |
| 3    | Clear Doctor                    | Restored                                     |



| ID        | Result (P/F/B) | Tester | Date       | Notes                                                                         |
| --------- | -------------- | ------ | ---------- | ----------------------------------------------------------------------------- |
| **F-AP2** | P              | Sachin | 09-08-2026 | Working as expected, since no doctors so considered admin as doctor as of now |


### F-AP3 — Appointments Status filter


| Step | Action                                   | Expected                           |
| ---- | ---------------------------------------- | ---------------------------------- |
| 1    | Filter each status option used in clinic | Rows match status; tags consistent |
| 2    | Clear Status                             | Unfiltered statuses return         |



| ID        | Result (P/F/B) | Tester | Date       | Notes                                                          |
| --------- | -------------- | ------ | ---------- | -------------------------------------------------------------- |
| **F-AP3** | F              | Sachin | 09-08-2026 | Need to filter some status, and need to add/remove filter list |


### F-AP4 — Appointments Visit Type filter


| Step | Action                                          | Expected                   |
| ---- | ----------------------------------------------- | -------------------------- |
| 1    | **New Patient** / **Follow Up** / **Procedure** | Rows match visit type tags |
| 2    | Clear Visit Type                                | Restored                   |



| ID        | Result (P/F/B) | Tester | Date       | Notes                                          |
| --------- | -------------- | ------ | ---------- | ---------------------------------------------- |
| **F-AP4** | F              | Sachin | 09-08-2026 | Need to add opd and remove procedure as of now |


### F-AP5 — Combined filters + search


| Step | Action                                            | Expected                                  |
| ---- | ------------------------------------------------- | ----------------------------------------- |
| 1    | Set Date + Doctor + Status + Visit Type           | All params sent; intersection of filters  |
| 2    | Add search for a patient who matches filters      | Narrower result set                       |
| 3    | Search for patient who does **not** match filters | Empty / 0 count — not wrong doctor’s rows |



| ID        | Result (P/F/B) | Tester | Date       | Notes                     |
| --------- | -------------- | ------ | ---------- | ------------------------- |
| **F-AP5** | Partial        | Sachin | 09-08-2026 | Need to alter some status |


### F-AP6 — Clear Filters


| Step | Action                                       | Expected                                                          |
| ---- | -------------------------------------------- | ----------------------------------------------------------------- |
| 1    | Apply search + several filters; go to page 2 | State dirty                                                       |
| 2    | Click **Clear Filters**                      | Search cleared; all selects cleared; page **1**; full list reload |



| ID        | Result (P/F/B) | Tester | Date       | Notes               |
| --------- | -------------- | ------ | ---------- | ------------------- |
| **F-AP6** | P              | Sachin | 09-08-2026 | working as expected |


### F-AP7 — Filter shrinks past current page


| Step | Action                                       | Expected                                                   |
| ---- | -------------------------------------------- | ---------------------------------------------------------- |
| 1    | Go to a high page (e.g. page 3) on full list | Page 3 shows                                               |
| 2    | Apply a tight filter with ≤10 total results  | Snaps to valid max page (often **1**); no empty stuck page |



| ID        | Result (P/F/B) | Tester | Date       | Notes               |
| --------- | -------------- | ------ | ---------- | ------------------- |
| **F-AP7** | P              | Sachin | 09-08-2026 | working as expected |


---

## 3. Pagination

### P1 — Patient list page size & next page


| Step | Action                        | Expected                                                   |
| ---- | ----------------------------- | ---------------------------------------------------------- |
| 1    | **F1** open `/patients`       | ≤10 rows; spinner then data                                |
| 2    | Go to page **2**              | Request `page_no=2`; different rows                        |
| 3    | Change page size if UI allows | Refetch with new `limit` (document if size changer absent) |



| ID     | Result (P/F/B) | Tester | Date       | Notes                   |
| ------ | -------------- | ------ | ---------- | ----------------------- |
| **P1** | -              | -      | 09-08-2026 | future testing requires |


### P2 — Patient list total label


| Step | Action                       | Expected                                                                                                                |
| ---- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 1    | Inspect “Total Patients (N)” | **Known gap check:** N may be **page** `data.length`, not API `total` — note Pass-with-gap or Fail per product decision |
| 2    | Pagination control `total`   | Uses API `total` for page count                                                                                         |



| ID     | Result (P/F/B) | Tester | Date       | Notes                     |
| ------ | -------------- | ------ | ---------- | ------------------------- |
| **P2** | P              | Sachin | 09-08-2026 | listing shown as expected |


### P3 — Appointments pagination footer


| Step | Action        | Expected                                                  |
| ---- | ------------- | --------------------------------------------------------- |
| 1    | **F3** page 1 | Footer like `Showing 1–10 of N`; title `Appointments (N)` |
| 2    | Page 2        | `Showing 11–20 of N` (or last partial page); new rows     |
| 3    | Size changer  | Hidden (`showSizeChanger={false}`); always 10             |



| ID     | Result (P/F/B) | Tester | Date       | Notes               |
| ------ | -------------- | ------ | ---------- | ------------------- |
| **P3** | P              | sachin | 09-08-2026 | working as expected |


### P4 — Pagination with empty / single page


| Step | Action            | Expected                                        |
| ---- | ----------------- | ----------------------------------------------- |
| 1    | **F2** / **F4**   | Empty state; pagination still usable / no crash |
| 2    | Org with ≤10 rows | Single page; no bogus page 2 data               |



| ID     | Result (P/F/B) | Tester | Date       | Notes           |
| ------ | -------------- | ------ | ---------- | --------------- |
| **P4** | P              | Sachin | 09-08-2026 | it doesnt crash |


### P5 — Filter/search resets page to 1


| Step | Action                                      | Expected                   |
| ---- | ------------------------------------------- | -------------------------- |
| 1    | Appointments: page 3 → change Status filter | Refetch page **1**         |
| 2    | Page 3 → type search                        | After debounce, page **1** |



| ID     | Result (P/F/B) | Tester | Date       | Notes   |
| ------ | -------------- | ------ | ---------- | ------- |
| **P5** | P              | Sachin | 09-08-2026 | Working |


---

## 4. Sorting

### SO1 — Patient Age sort


| Step | Action                             | Expected                                     |
| ---- | ---------------------------------- | -------------------------------------------- |
| 1    | Click Age column sorter            | Ascending by age (current page, client-side) |
| 2    | Click again                        | Descending                                   |
| 3    | Third click (if Ant Design clears) | Default / unsorted — document                |



| ID      | Result (P/F/B) | Tester | Date       | Notes   |
| ------- | -------------- | ------ | ---------- | ------- |
| **SO1** | P              | Sachin | 09-08-2026 | Working |


### SO2 — Patient Issued At sort


| Step | Action                 | Expected                                                      |
| ---- | ---------------------- | ------------------------------------------------------------- |
| 1    | Sort Issued At         | Order by `patient_created_at` on current page                 |
| 2    | Confirm display format | `DD MMMM YYYY`                                                |
| 3    | Default sort           | Column has `defaultSortOrder: descend` — newest-first on load |



| ID      | Result (P/F/B) | Tester | Date       | Notes   |
| ------- | -------------- | ------ | ---------- | ------- |
| **SO2** | P              | Sachin | 09-08-2026 | Working |


### SO3 — Sort + pagination (patients)


| Step | Action                 | Expected                                                                               |
| ---- | ---------------------- | -------------------------------------------------------------------------------------- |
| 1    | Sort Age asc on page 1 | Ordered on page 1                                                                      |
| 2    | Go to page 2           | New page data; sort reapplies **within page only** (not global server sort) — document |
| 3    | No crash               | Pass if stable                                                                         |



| ID      | Result (P/F/B) | Tester | Date       | Notes                   |
| ------- | -------------- | ------ | ---------- | ----------------------- |
| **SO3** | B              | -      | 09-08-2026 | patient are not >10 yet |


### SO4 — Appointments column sort (current behaviour)


| Step | Action                       | Expected                                                      |
| ---- | ---------------------------- | ------------------------------------------------------------- |
| 1    | Inspect Appointments columns | **No** column sorters today — document Pass if intentional    |
| 2    | If product expects sort      | Mark **F** / gap and note expected columns (date, time, name) |



| ID      | Result (P/F/B) | Tester | Date       | Notes            |
| ------- | -------------- | ------ | ---------- | ---------------- |
| **SO4** | P              | Sachin | 09-08-2026 | sorted correctly |


---

## 5. 500 Internal Server Error — responsiveness

### E1 — Patient list `getPatients` → 500


| Step | Action                                   | Expected                                                                                                  |
| ---- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 1    | Open `/patients`; force list API **500** | Loading ends; **no white-screen / React crash**                                                           |
| 2    | Observe UI                               | Table empty or prior data cleared; console may log error                                                  |
| 3    | User feedback                            | Ideal: toast + Retry. **Today:** often console-only — mark Pass-with-gap if no crash, Fail if blank crash |
| 4    | Navigate away and back after API healthy | List recovers                                                                                             |



| ID     | Result (P/F/B) | Tester | Date       | Notes                                                 |
| ------ | -------------- | ------ | ---------- | ----------------------------------------------------- |
| **E1** | P              | Sachin | 09-08-2026 | fail to load patient, not clear about internal server |


### E2 — Appointments list → 500


| Step | Action                                       | Expected                             |
| ---- | -------------------------------------------- | ------------------------------------ |
| 1    | Open `/appointments`; force list API **500** | Toast: “Failed to load appointments” |
| 2    | Table                                        | Empty; count **0**; loading cleared  |
| 3    | Clear Filters / change filter after recovery | Refetch works when API back          |



| ID     | Result (P/F/B) | Tester | Date       | Notes                   |
| ------ | -------------- | ------ | ---------- | ----------------------- |
| **E2** | P              | Sachin | 09-08-2026 | error message not clear |


### E3 — 500 during filter / search change


| Step | Action                                                       | Expected                                                             |
| ---- | ------------------------------------------------------------ | -------------------------------------------------------------------- |
| 1    | Healthy list loaded                                          | Rows visible                                                         |
| 2    | Change Status (or search) while next request returns **500** | Error toast (appointments); loading stops; not stuck spinner forever |
| 3    | Retry same filter when API OK                                | Data returns                                                         |



| ID     | Result (P/F/B) | Tester | Date       | Notes                               |
| ------ | -------------- | ------ | ---------- | ----------------------------------- |
| **E3** | P              | Sachin | 09-08-2026 | Working but error message not clear |


### E4 — 500 on pagination click


| Step | Action                                  | Expected                        |
| ---- | --------------------------------------- | ------------------------------- |
| 1    | Page 1 OK; force page-2 request **500** | No crash; loading clears        |
| 2    | Appointments                            | Error toast; empty / safe state |
| 3    | Click page 1 again (API OK)             | Page 1 data restores            |



| ID     | Result (P/F/B) | Tester | Date       | Notes                     |
| ------ | -------------- | ------ | ---------- | ------------------------- |
| **E4** | P              | Sachin | 09-08-2026 | pagination is not enabled |


### E5 — Doctors dropdown load failure (appointments)


| Step | Action                                     | Expected                                 |
| ---- | ------------------------------------------ | ---------------------------------------- |
| 1    | Force `GetDoctors` **500** on Doctor focus | Console error; select doesn’t crash page |
| 2    | Rest of filters / table                    | Still usable                             |



| ID     | Result (P/F/B) | Tester | Date       | Notes   |
| ------ | -------------- | ------ | ---------- | ------- |
| **E5** | P              | Sachin | 09-08-2026 | Working |


### E6 — Rapid 500 then success (no stale overwrite)


| Step | Action                                                         | Expected                                                                        |
| ---- | -------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 1    | Trigger slow **500**, then quick success with different filter | UI shows **latest** successful response only (request-id guard on appointments) |
| 2    | Never leave infinite loading                                   | Pass                                                                            |



| ID     | Result (P/F/B) | Tester | Date       | Notes                              |
| ------ | -------------- | ------ | ---------- | ---------------------------------- |
| **E6** | -              | Sachin | 09-08-2026 | slow network testing will do later |


---

## 6. Responsive layout (filters / search / table)

**How to set viewport:** Chrome DevTools → Toggle device toolbar → set **exact** Width × Height (CSS px). Test **portrait** unless noted. Zoom **100%**.

### Viewport matrix (use these sizes)


| ID      | Label            | Device reference         | Width (px) | Height (px) | Orientation |
| ------- | ---------------- | ------------------------ | ---------- | ----------- | ----------- |
| **V1**  | Desktop large    | 15–16″ laptop / external | **1440**   | **900**     | Landscape   |
| **V2**  | Desktop standard | Common laptop            | **1280**   | **800**     | Landscape   |
| **V3**  | Laptop compact   | 13″ / scaled             | **1024**   | **768**     | Landscape   |
| **V4**  | iPad portrait    | iPad (9th/10th)          | **768**    | **1024**    | Portrait    |
| **V5**  | iPad landscape   | iPad                     | **1024**   | **768**     | Landscape   |
| **V6**  | Android tablet   | Typical 10″              | **800**    | **1280**    | Portrait    |
| **V7**  | Large phone      | iPhone 14/15 Pro Max-ish | **430**    | **932**     | Portrait    |
| **V8**  | Standard phone   | iPhone 13/14             | **390**    | **844**     | Portrait    |
| **V9**  | Small phone      | iPhone SE / compact      | **375**    | **667**     | Portrait    |
| **V10** | Narrow stress    | Smallest supported       | **360**    | **640**     | Portrait    |


**Pass rule:** Controls remain usable without horizontal page overflow (table may scroll **inside** its container). Touch targets ≥ **44×44** px where possible. No overlap with sidebar / toast / pagination.

### R1 — Desktop (V1 + V2)


| Step | Action                                                                 | Expected                                                            |
| ---- | ---------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 1    | Set viewport **1440 × 900** (V1). Open `/patients` and `/appointments` | Search, filters, table, pagination aligned; no overlap with sidebar |
| 2    | Set viewport **1280 × 800** (V2). Repeat both lists                    | Same; content uses width without cramped wrapping                   |



| ID     | Result (P/F/B) | Tester | Date       | Notes                |
| ------ | -------------- | ------ | ---------- | -------------------- |
| **R1** | P              | Sachin | 09-08-2026 | looks clean and neat |


### R2 — Tablet / iPad (V3 + V4 + V5)


| Step | Action                                 | Expected                                                                                                      |
| ---- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 1    | Set **1024 × 768** (V3 / V5 landscape) | Filter row wraps cleanly; all filters reachable; Clear Filters tappable                                       |
| 2    | Set **768 × 1024** (V4 portrait)       | Search usable; table readable; horizontal scroll **inside** table only if needed; pagination + count readable |
| 3    | Optional: **800 × 1280** (V6)          | Same checks as V4                                                                                             |



| ID     | Result (P/F/B) | Tester | Date       | Notes                                  |
| ------ | -------------- | ------ | ---------- | -------------------------------------- |
| **R2** | F              | Sachin | 09-08-2026 | need modification for this screenwidth |


### R3 — Phone (V7 + V8 + V9 + V10)


| Step | Action                         | Expected                                                                   |
| ---- | ------------------------------ | -------------------------------------------------------------------------- |
| 1    | Set **430 × 932** (V7)         | Primary actions not clipped; filters stack/scroll; page scrolls vertically |
| 2    | Set **390 × 844** (V8)         | Same as V7                                                                 |
| 3    | Set **375 × 667** (V9)         | Gender / Status dropdown menus not cut off; pagination next/prev usable    |
| 4    | Set **360 × 640** (V10) stress | No white-screen; no unusable overflow; critical actions still reachable    |



| ID     | Result (P/F/B) | Tester | Date       | Notes                  |
| ------ | -------------- | ------ | ---------- | ---------------------- |
| **R3** | F              | Sachin | 09-08-2026 | Not required as of now |


### R4 — Responsive + error toast on 500


| Step | Action                                                   | Expected                                                                  |
| ---- | -------------------------------------------------------- | ------------------------------------------------------------------------- |
| 1    | Set **768 × 1024** (V4). Force appointments list **500** | Error toast fully visible (not behind sidebar / off-canvas / under notch) |
| 2    | Set **390 × 844** (V8). Force same **500**               | Toast readable within **390 × 844**; dismissible; layout stays usable     |



| ID     | Result (P/F/B) | Tester | Date       | Notes                                                          |
| ------ | -------------- | ------ | ---------- | -------------------------------------------------------------- |
| **R4** | P              | Sachin | 09-08-2026 | toast is coming correctly but for patients we dont c any error |


### R5 — Sidebar collapse at fixed sizes


| Step | Action                                                          | Expected                                       |
| ---- | --------------------------------------------------------------- | ---------------------------------------------- |
| 1    | Set **1280 × 800** (V2). Collapse sidebar; keep filters + table | Content reflows into freed width; no overlap   |
| 2    | Set **768 × 1024** (V4). Collapse / expand sidebar              | Still usable; filters + pagination not clipped |
| 3    | Expand sidebar again on both sizes                              | Layout restores cleanly                        |



| ID     | Result (P/F/B) | Tester | Date       | Notes               |
| ------ | -------------- | ------ | ---------- | ------------------- |
| **R5** | P              | Sachin | 09-08-2026 | working as expected |


---

## 7. Prescriptions (`/prescription`)

### RX-S1 — Search by patient / code (debounce)


| Step | Action                                           | Expected                                                                           |
| ---- | ------------------------------------------------ | ---------------------------------------------------------------------------------- |
| 1    | Open `/prescription` (**F7**)                    | Placeholder “Search prescriptions”; All/Draft/Sent chips visible                   |
| 2    | Type known patient or code (**F9**); wait ≥400ms | Loading; `GET /prescription/get` (or getByStatus) includes `search`; matching rows |
| 3    | Check total                                      | `Total Prescriptions (N)` matches API `total_count`                                |
| 4    | Page resets                                      | After debounce, page becomes **1**                                                 |



| ID        | Result (P/F/B) | Tester | Date       | Notes               |
| --------- | -------------- | ------ | ---------- | ------------------- |
| **RX-S1** | P              | Sachin | 09-08-2026 | working as expected |


### RX-S2 — Search no match / clear / whitespace


| Step | Action                              | Expected                                     |
| ---- | ----------------------------------- | -------------------------------------------- |
| 1    | Search `zzz-no-rx-999`              | Empty table; total **0**; no crash           |
| 2    | Clear with allowClear               | Full list returns (for current status chip)  |
| 3    | Spaces only / trim around real name | Trimmed; spaces-only treated as empty search |



| ID        | Result (P/F/B) | Tester | Date       | Notes                                                |
| --------- | -------------- | ------ | ---------- | ---------------------------------------------------- |
| **RX-S2** | B              | Sachin | 09-08-2026 | Working for code, need to implement for name as well |


### RX-S3 — Search debounce / race


| Step | Action                                                | Expected                                                  |
| ---- | ----------------------------------------------------- | --------------------------------------------------------- |
| 1    | Type quickly A → AB → ABC                             | Only settled request for final term wins (`requestIdRef`) |
| 2    | No flicker to wrong intermediate results after settle | Pass                                                      |



| ID        | Result (P/F/B) | Tester | Date       | Notes   |
| --------- | -------------- | ------ | ---------- | ------- |
| **RX-S3** | P              | Sachin | 09-08-2026 | Working |


### RX-F1 — Status filter All / Draft / Sent


| Step | Action          | Expected                                                                       |
| ---- | --------------- | ------------------------------------------------------------------------------ |
| 1    | Click **All**   | `GET /prescription/get`; mixed statuses; chip primary                          |
| 2    | Click **Draft** | `GET /prescription/getByStatus` with `status=draft`; only drafts; page → **1** |
| 3    | Click **Sent**  | `status=sent`; only sent; page → **1**                                         |
| 4    | Back to **All** | Full set again                                                                 |



| ID        | Result (P/F/B) | Tester | Date       | Notes                                                                               |
| --------- | -------------- | ------ | ---------- | ----------------------------------------------------------------------------------- |
| **RX-F1** | F              | Sachin | 09-08-2026 | Need to replace draft, with pending payment and other status, list will be provided |


### RX-F2 — Status filter + search combined


| Step | Action                                     | Expected                                    |
| ---- | ------------------------------------------ | ------------------------------------------- |
| 1    | Select **Sent**; search known sent patient | Intersection: sent + search                 |
| 2    | Same search with **Draft**                 | Empty or draft-only matches — not sent rows |



| ID        | Result (P/F/B) | Tester | Date       | Notes                                                                |
| --------- | -------------- | ------ | ---------- | -------------------------------------------------------------------- |
| **RX-F2** | F              | Sachin | 09-08-2026 | need to merge getbystatus and get api for prescription it is failing |


### RX-P1 — Pagination


| Step | Action           | Expected                                            |
| ---- | ---------------- | --------------------------------------------------- |
| 1    | **F7** page 1    | ≤10 rows; `Total Prescriptions` = API total         |
| 2    | Go to page **2** | New request with next `offset`/page; different rows |
| 3    | Size changer     | Hidden; always 10                                   |
| 4    | **F8** empty org | Empty table; total 0; no crash                      |



| ID        | Result (P/F/B) | Tester | Date       | Notes   |
| --------- | -------------- | ------ | ---------- | ------- |
| **RX-P1** | P              | Sachin | 09-08-2026 | Working |


### RX-P2 — Filter/search resets page


| Step | Action                     | Expected                   |
| ---- | -------------------------- | -------------------------- |
| 1    | Page 3 → switch Draft/Sent | Refetch page **1**         |
| 2    | Page 3 → type search       | After debounce, page **1** |



| ID        | Result (P/F/B) | Tester | Date       | Notes   |
| --------- | -------------- | ------ | ---------- | ------- |
| **RX-P2** | P              | Sachin | 09-08-2026 | Working |


### RX-SO1 — Column sort (current behaviour)


| Step | Action                                      | Expected                                                                                         |
| ---- | ------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 1    | Inspect columns                             | **No** column sorters today (`showSorterTooltip` present but no `sorter`) — document intentional |
| 2    | If product expects Issued On / Patient sort | Mark **F** / gap                                                                                 |



| ID         | Result (P/F/B) | Tester | Date       | Notes |
| ---------- | -------------- | ------ | ---------- | ----- |
| **RX-SO1** |                |        | 09-08-2026 |       |


### RX-E1 — List API 500


| Step | Action                                                 | Expected                                                                        |
| ---- | ------------------------------------------------------ | ------------------------------------------------------------------------------- |
| 1    | Force `GET /prescription/get` (or getByStatus) **500** | Loading ends; **no white-screen**                                               |
| 2    | User feedback                                          | Ideal: toast + Retry. **Today:** console error only — Pass-with-gap if no crash |
| 3    | Recover when API healthy (change chip / page)          | List loads again                                                                |



| ID        | Result (P/F/B) | Tester | Date       | Notes   |
| --------- | -------------- | ------ | ---------- | ------- |
| **RX-E1** | P              | Sachin | 09-08-2026 | Working |


### RX-E2 — 500 on search / page change


| Step | Action                                              | Expected                          |
| ---- | --------------------------------------------------- | --------------------------------- |
| 1    | Healthy list; next search or page-2 returns **500** | Loading clears; not stuck spinner |
| 2    | Retry when OK                                       | Data restores                     |



| ID        | Result (P/F/B) | Tester | Date       | Notes                                                                                                                   |
| --------- | -------------- | ------ | ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| **RX-E2** | P              | Sachin | 09-08-2026 | showing no data in list, but when i did search and it failed still i can old state list, can we do anything for that?? |


### RX-R1 — Responsive prescriptions toolbar


| Step | Action                                          | Expected                                                                         |
| ---- | ----------------------------------------------- | -------------------------------------------------------------------------------- |
| 1    | Set **1440 × 900** (V1) and **1280 × 800** (V2) | Search + All/Draft/Sent aligned; table + footer spacing OK                       |
| 2    | Set **768 × 1024** (V4) and **1024 × 768** (V5) | Chips reachable; no overlap; pagination tappable                                 |
| 3    | Set **390 × 844** (V8) and **375 × 667** (V9)   | Chips usable; table scrolls inside container if needed; **View** still reachable |
| 4    | Set **360 × 640** (V10)                         | No clipped critical actions                                                      |



| ID        | Result (P/F/B) | Tester | Date       | Notes                                        |
| --------- | -------------- | ------ | ---------- | -------------------------------------------- |
| **RX-R1** | P->f           | Sachin | 09-08-2026 | Working as expected, attaching failure notes |


---

## 8. Suppliers (`/suppliers`)

### SUP-S1 — Search input (current behaviour)


| Step | Action                             | Expected                                                           |
| ---- | ---------------------------------- | ------------------------------------------------------------------ |
| 1    | Open `/suppliers` (**F10**)        | Placeholder “Search by supplier name, license, or city...”         |
| 2    | Type known supplier name (**F12**) | Input accepts text                                                 |
| 3    | Observe table                      | **Known gap:** search is **UI-only** — does not filter or call API |
| 4    | Click search icon                  | No crash; no unintended navigation                                 |



| ID         | Result (P/F/B) | Tester | Date       | Notes           |
| ---------- | -------------- | ------ | ---------- | --------------- |
| **SUP-S1** | B              | Sachin | 09-08-2026 | Not Implemented |


### SUP-S2 — Search clear


| Step | Action               | Expected                                                    |
| ---- | -------------------- | ----------------------------------------------------------- |
| 1    | Clear the search box | Input empty; list unchanged (still full API page); no crash |



| ID         | Result (P/F/B) | Tester | Date       | Notes           |
| ---------- | -------------- | ------ | ---------- | --------------- |
| **SUP-S2** | F              | Sachin | 09-08-2026 | Not Implemented |


### SUP-F1 — Status dropdown (Active / Inactive)


| Step | Action                                     | Expected                                                                                                         |
| ---- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| 1    | Open Status on a row; pick opposite status | Tag updates in UI immediately                                                                                    |
| 2    | Refresh page / change page and return      | **Known gap check:** status may **revert** if not persisted via API — document Pass-with-gap or Fail per product |
| 3    | No crash while changing                    | Pass if stable                                                                                                   |



| ID         | Result (P/F/B) | Tester | Date       | Notes             |
| ---------- | -------------- | ------ | ---------- | ----------------- |
| **SUP-F1** | B              | Sachin | 09-08-2026 | Need to Implement |


### SUP-P1 — Pagination


| Step | Action           | Expected                                                         |
| ---- | ---------------- | ---------------------------------------------------------------- |
| 1    | **F10** page 1   | ≤10 rows; spinner then data; `Total Suppliers (N)` = API `total` |
| 2    | Go to page **2** | Request `page_no=2`; different rows                              |
| 3    | Size changer     | Hidden; always 10                                                |
| 4    | **F11** empty    | Empty text “No suppliers yet”; total 0                           |



| ID         | Result (P/F/B) | Tester | Date       | Notes                                        |
| ---------- | -------------- | ------ | ---------- | -------------------------------------------- |
| **SUP-P1** | F              | Sachin | 09-08-2026 | supplier not reached more then 10 pagination |


### SUP-P2 — Missing organisation_id


| Step | Action                                                       | Expected                                                                  |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------------------- |
| 1    | Clear `organisation_id` from localStorage; open `/suppliers` | Toast: “Missing organisation — please log in again”; no bogus fetch crash |



| ID         | Result (P/F/B) | Tester | Date       | Notes                              |
| ---------- | -------------- | ------ | ---------- | ---------------------------------- |
| **SUP-P2** | P              | Sachin | 09-08-2026 | missing organisation_id is correct |


### SUP-SO1 — Column sort (current behaviour)


| Step | Action                                 | Expected                                           |
| ---- | -------------------------------------- | -------------------------------------------------- |
| 1    | Inspect columns                        | **No** column sorters today — document intentional |
| 2    | If product expects Name / Created sort | Mark **F** / gap                                   |



| ID          | Result (P/F/B) | Tester | Date       | Notes                      |
| ----------- | -------------- | ------ | ---------- | -------------------------- |
| **SUP-SO1** | B              | Sachin | 09-08-2026 | column sort is not present |


### SUP-E1 — List API 500


| Step | Action                                          | Expected                                                 |
| ---- | ----------------------------------------------- | -------------------------------------------------------- |
| 1    | Force suppliers list **500**                    | Toast: “Failed to load suppliers”                        |
| 2    | Table                                           | Empty; total **0**; loading cleared; **no white-screen** |
| 3    | Recover when API healthy (change page / reload) | List loads                                               |



| ID         | Result (P/F/B) | Tester | Date       | Notes             |
| ---------- | -------------- | ------ | ---------- | ----------------- |
| **SUP-E1** | P              | Sachin | 09-08-2026 | it is showing 500 |


### SUP-E2 — 500 on page change


| Step | Action                          | Expected                                        |
| ---- | ------------------------------- | ----------------------------------------------- |
| 1    | Page 1 OK; force page-2 **500** | Error toast; empty / safe state; loading clears |
| 2    | Click page 1 (API OK)           | Page 1 data restores                            |



| ID         | Result (P/F/B) | Tester | Date       | Notes                                              |
| ---------- | -------------- | ------ | ---------- | -------------------------------------------------- |
| **SUP-E2** | P              | Sachin | 09-08-2026 | page 2 will not be shown since 500 error is coming |


### SUP-R1 — Responsive suppliers list


| Step | Action                                          | Expected                                               |
| ---- | ----------------------------------------------- | ------------------------------------------------------ |
| 1    | Set **1440 × 900** (V1) and **1280 × 800** (V2) | Add New Supplier + search + table + pagination aligned |
| 2    | Set **768 × 1024** (V4) and **1024 × 768** (V5) | Fill Stock tappable; table may scroll inside container |
| 3    | Set **390 × 844** (V8) and **375 × 667** (V9)   | Pagination + status dropdown usable (menu not clipped) |
| 4    | Set **768 × 1024** (V4); force list **500**     | Error toast fully visible within viewport              |
| 5    | Set **360 × 640** (V10)                         | No unusable overflow                                   |



| ID         | Result (P/F/B) | Tester | Date       | Notes               |
| ---------- | -------------- | ------ | ---------- | ------------------- |
| **SUP-R1** | F              | Sachin | 09-08-2026 | doesnt look correct |


---

## 9. Master sign-off sheet (fill as you go — today)


| ID      | Scenario                       | P/F/B | Tester | Date       | Notes |
| ------- | ------------------------------ | ----- | ------ | ---------- | ----- |
| S1      | Patient search input           |       |        | 09-08-2026 |       |
| S2      | Patient search clear / icon    |       |        | 09-08-2026 |       |
| S3      | Appt search by name            |       |        | 09-08-2026 |       |
| S4      | Appt search by mobile          |       |        | 09-08-2026 |       |
| S5      | Appt search by code / no match |       |        | 09-08-2026 |       |
| S6      | Appt search debounce / race    |       |        | 09-08-2026 |       |
| S7      | Search whitespace              |       |        | 09-08-2026 |       |
| F-PL1   | Patient Gender filter          |       |        | 09-08-2026 |       |
| F-PL2   | Gender + pagination            |       |        | 09-08-2026 |       |
| F-AP1   | Appt Date filter               |       |        | 09-08-2026 |       |
| F-AP2   | Appt Doctor filter             |       |        | 09-08-2026 |       |
| F-AP3   | Appt Status filter             |       |        | 09-08-2026 |       |
| F-AP4   | Appt Visit Type filter         |       |        | 09-08-2026 |       |
| F-AP5   | Combined filters + search      |       |        | 09-08-2026 |       |
| F-AP6   | Clear Filters                  |       |        | 09-08-2026 |       |
| F-AP7   | Filter shrinks past page       |       |        | 09-08-2026 |       |
| P1      | Patient pagination             |       |        | 09-08-2026 |       |
| P2      | Patient total label            |       |        | 09-08-2026 |       |
| P3      | Appt pagination footer         |       |        | 09-08-2026 |       |
| P4      | Empty / single page            |       |        | 09-08-2026 |       |
| P5      | Filter resets page             |       |        | 09-08-2026 |       |
| SO1     | Age sort                       |       |        | 09-08-2026 |       |
| SO2     | Issued At sort                 |       |        | 09-08-2026 |       |
| SO3     | Sort + pagination              |       |        | 09-08-2026 |       |
| SO4     | Appt column sort (N/A check)   |       |        | 09-08-2026 |       |
| E1      | Patients list 500              |       |        | 09-08-2026 |       |
| E2      | Appointments list 500          |       |        | 09-08-2026 |       |
| E3      | 500 on filter/search           |       |        | 09-08-2026 |       |
| E4      | 500 on page change             |       |        | 09-08-2026 |       |
| E5      | Doctors 500                    |       |        | 09-08-2026 |       |
| E6      | Stale 500 vs success           |       |        | 09-08-2026 |       |
| R1      | Desktop 1440×900 + 1280×800    |       |        | 09-08-2026 |       |
| R2      | Tablet 1024×768 + 768×1024     |       |        | 09-08-2026 |       |
| R3      | Phone 430/390/375/360          |       |        | 09-08-2026 |       |
| R4      | 500 toast @ 768×1024 + 390×844 |       |        | 09-08-2026 |       |
| R5      | Sidebar @ 1280×800 + 768×1024  |       |        | 09-08-2026 |       |
| RX-S1   | RX search debounce             |       |        | 09-08-2026 |       |
| RX-S2   | RX search clear / no match     |       |        | 09-08-2026 |       |
| RX-S3   | RX search race                 |       |        | 09-08-2026 |       |
| RX-F1   | RX All / Draft / Sent          |       |        | 09-08-2026 |       |
| RX-F2   | RX status + search             |       |        | 09-08-2026 |       |
| RX-P1   | RX pagination                  |       |        | 09-08-2026 |       |
| RX-P2   | RX filter resets page          |       |        | 09-08-2026 |       |
| RX-SO1  | RX column sort (N/A)           |       |        | 09-08-2026 |       |
| RX-E1   | RX list 500                    |       |        | 09-08-2026 |       |
| RX-E2   | RX 500 on search/page          |       |        | 09-08-2026 |       |
| RX-R1   | RX @ V1–V5 + V8–V10            |       |        | 09-08-2026 |       |
| SUP-S1  | Supplier search (UI-only)      |       |        | 09-08-2026 |       |
| SUP-S2  | Supplier search clear          |       |        | 09-08-2026 |       |
| SUP-F1  | Supplier status dropdown       |       |        | 09-08-2026 |       |
| SUP-P1  | Supplier pagination            |       |        | 09-08-2026 |       |
| SUP-P2  | Supplier missing org           |       |        | 09-08-2026 |       |
| SUP-SO1 | Supplier sort (N/A)            |       |        | 09-08-2026 |       |
| SUP-E1  | Supplier list 500              |       |        | 09-08-2026 |       |
| SUP-E2  | Supplier 500 on page           |       |        | 09-08-2026 |       |
| SUP-R1  | SUP @ V1–V5 + V8–V10 + 500     |       |        | 09-08-2026 |       |


**Overall (today):** Pass / Fail / Conditional  


| Field         | Value      |
| ------------- | ---------- |
| Tester        |            |
| Build / env   |            |
| Sign-off date | 09-08-2026 |
| Blockers      |            |


---

## Known gaps (do not treat as silent Pass)

1. Patient list search is UI-only (not wired to API/filter) — **S1**.
2. Patient “Total Patients (N)” may use page length, not API `total` — **P2**.
3. Patient Gender filter / Age / Issued At sort are **client-side on current page only** — **F-PL2**, **SO3**.
4. Patient list 500 often has no user-facing toast/Retry — **E1**.
5. Appointments have **no** column sorters — **SO4**.
6. Prescription list 500 is console-only (no toast/Retry) — **RX-E1**.
7. Prescription / Supplier lists have **no** column sorters — **RX-SO1**, **SUP-SO1**.
8. Supplier search is UI-only (not wired) — **SUP-S1**.
9. Supplier status dropdown updates local state only (may not persist) — **SUP-F1**.

