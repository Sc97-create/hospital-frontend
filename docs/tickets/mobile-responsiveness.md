# Ticket: Mobile responsiveness for hospital frontend

**Status:** In progress (shell + primary screens implemented on `mobile-responsiveness`)  

**Type:** Enhancement  
**Area:** Authenticated product UI (not landing/marketing)

## Problem

Core authenticated screens (dashboard, patients, appointments, prescriptions, employees, labs, pharmacy/stock) are desktop-first. On phones and small tablets the layout overflows, the sidebar/header compete for space, tables and forms are hard to use, and touch targets are inconsistent.

## Scope

- Dashboard header, KPIs, and tables
- Sidebar / navigation on small viewports
- Patient list, overview, and appointment flows
- Prescription, lab, pharmacy/stock forms and drawers
- Employee add/list screens
- Customer signup / subscription renew (already partially handled)

## Acceptance criteria

- [ ] No horizontal page scroll at 390px and 768px widths for primary flows
- [ ] Sidebar collapses or uses a drawer/hamburger on mobile
- [ ] Header stacks or truncates branch/search without clipping
- [ ] Tables scroll inside the card or switch to a stacked/card layout on mobile
- [ ] Forms and drawers use full width with readable labels and tappable controls
- [ ] Verified in browser at 390px (phone) and 768px (tablet)

## Test scenarios

Full manual QA matrix: [`mobile-responsiveness-qa.md`](./mobile-responsiveness-qa.md)

Covered areas: shell (A), auth banners (B), session / missing user (C), dashboard (D), patients (E–F), appointments & labs tabs (G–I), employees (J), fill-stock drawer (K), desktop regression (L).

## Resolution

1. **Breakpoints** — Use consistent CSS breakpoints: phone `max-width: 576px`, tablet `max-width: 768px`, laptop `max-width: 992px`.
2. **Shell** — Make the app shell responsive: collapse sidebar into a drawer on mobile; keep main content full-bleed with safe padding.
3. **Header** — Stack title/date/search/user on small screens; truncate organisation/branch label; keep search usable above the fold.
4. **Data density** — For Ant Design tables, enable horizontal scroll containers and hide non-essential columns under 768px; prefer card/list patterns where interaction is primary.
5. **Forms** — Keep Ant `Col` grids that already use `xs={24}`; audit fixed widths (`min-width`, hard `px` layouts) and replace with `%` / `max-width: 100%`.
6. **Drawers/modals** — Set drawer `width` to `100%` (or `min(100vw, 480px)`) on mobile for add-medicine / similar panels.
7. **Auth** — Floato mint banner on login/signup mobile; recover `user_id` from JWT when missing.
8. **QA** — Run `mobile-responsiveness-qa.md` at 390px and 768px before closing.

## Out of scope

- Native mobile app
- Redesigning desktop layouts that already work

## Notes

Landing/marketing pages already have more mobile CSS; this ticket focuses on the authenticated hospital product UI.
