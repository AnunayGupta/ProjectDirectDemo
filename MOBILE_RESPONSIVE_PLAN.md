# Mobile Responsive Conversion Plan

> Audit date: 2026-04-08
> Current state: Desktop-only (fixed 240px sidebar, no breakpoints, hardcoded splits)
> Estimated effort: ~22-26 hours (~3-4 days)

---

## Phase 1: Sidebar & Layout Foundation (~4 hrs)

The entire app depends on a fixed 240px sidebar. This must become a mobile drawer before anything else works.

### Sidebar.tsx
- **Line 18**: `w-[240px] fixed left-0 top-0 h-screen` — no mobile alternative
- Convert to: overlay drawer on mobile with hamburger toggle
- Add `hidden md:flex` for desktop, slide-in panel for mobile
- Need a new hamburger button component visible only on mobile

### MainLayout.tsx
- **Line 7**: `ml-[240px]` — hardcoded margin assumes sidebar always visible
- Convert to: `md:ml-[240px] ml-0`

### BulkActionBar.tsx
- **Line 21**: `fixed bottom-0 left-[240px] right-0`
- Convert to: `left-0 md:left-[240px]`

---

## Phase 2: Page-Level Layout Stacking (~6 hrs)

### actions/[id]/page.tsx (Portfolio Editor) — HIGH PRIORITY
- **Lines 280, 292**: `w-[55%]` / `w-[45%]` split layout
- Convert to: `flex-col md:flex-row` with `w-full md:w-[55%]` / `w-full md:w-[45%]`
- **Line 233**: `height: calc(100vh - 56px)` — needs mobile adjustment
- **Lines 244-248**: Portfolio value info side-by-side — needs wrapping

### reports/page.tsx — HIGH PRIORITY
- **Line 160**: `w-[360px] flex-shrink-0` client list sidebar
- Convert to: full-width on mobile, 360px on desktop
- **Line 158**: Two-column layout needs `flex-col md:flex-row`
- **Line 275**: `grid grid-cols-4` metrics — change to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- **Line 301**: Holdings + donut chart `flex gap-8` — add `flex-col md:flex-row`

### WithdrawFlow.tsx & DeployCapitalFlow.tsx
- **Lines 21, 104**: `w-[60%]` / `w-[40%]` split
- Convert to: `flex-col md:flex-row` with full width on mobile

### clients/[id]/page.tsx
- **Lines 110-157**: Header card `flex items-start justify-between` — stack on mobile
- **Lines 128-156**: Stats row (4 items in one row) — wrap on mobile
- **Line 100**: `p-8` — change to `px-4 py-6 md:p-8`

### actions/page.tsx
- **Line 47**: `px-8` — change to `px-4 md:px-8`

---

## Phase 3: Tables & Data Components (~3 hrs)

### HoldingsTable.tsx (components/ClientDetail/)
- **Line 36**: `flex gap-8` (chart + table side-by-side)
- Convert to: `flex-col md:flex-row`, chart stacks above table on mobile
- **Line 39**: Donut chart `width={180} height={180}` — scale down on mobile
- Table columns: add `overflow-x-auto` wrapper or collapse columns

### Reports page holdings table
- **Lines 307-341**: 4-column table — add horizontal scroll wrapper
- **Line 349**: Chart `width={140} height={140}` — make responsive

### WithdrawFlow / DeployCapitalFlow tables
- **Lines 63-97**: 3-column tables — add `overflow-x-auto`

---

## Phase 4: Component Padding & Spacing Pass (~2 hrs)

Bulk find-and-replace `px-8` to `px-4 md:px-8` across these files:

| File | Lines |
|------|-------|
| Header.tsx | 5 |
| app/page.tsx | 107 |
| app/actions/page.tsx | 47 |
| app/actions/[id]/page.tsx | multiple |
| app/reports/page.tsx | 241 |
| app/clients/[id]/page.tsx | 100 |
| WeightingsEditor.tsx | 68, 80, 142 |
| ImpactPreview.tsx | 39, 70 |
| ApprovalModal.tsx | 42, 48, 83 |
| RaiseCashModal.tsx | 64, 70 |

### FilterBar.tsx
- **Line 25**: 4 dropdowns in one row
- Convert to: `flex-col md:flex-row` or 2x2 grid on mobile

### Header.tsx
- **Lines 9-13**: Asset summary info — hide or collapse on mobile

### Toast.tsx
- **Line 31**: `fixed bottom-8 right-8` — change to `bottom-4 right-4 md:bottom-8 md:right-8`

---

## Phase 5: TourGuide, Modals & Polish (~4 hrs)

### TourGuide.tsx
- **Line 242**: `TOOLTIP_WIDTH = 316` — use `min(316px, 90vw)`
- **Lines 244-279**: `getTooltipPosition` — override `left`/`right` to `bottom`/`center` on small screens
- Increase touch targets: buttons to 44px min, progress dots to 10px
- Add `visualViewport` resize listener

### ApprovalModal.tsx
- **Line 38**: `max-w-[520px]` is fine, but inner `px-8` needs `px-4 md:px-8`

### RaiseCashModal.tsx
- **Line 62**: Same padding treatment

### ClientPhonePreview.tsx
- **Line 51**: `width: 300` hardcoded — use `max-w-[300px] w-full`

### QuickActions.tsx
- **Line 58**: Add `flex-wrap` for button group

---

## Phase 6: Testing (~3 hrs)

- Test at 375px (iPhone SE), 390px (iPhone 14), 768px (iPad)
- Verify sidebar drawer open/close + overlay behavior
- Verify all split layouts stack correctly
- Verify tables scroll horizontally
- Verify modals don't overflow
- Verify TourGuide tooltips stay in viewport
- Test touch targets (minimum 44x44px)

---

## Recommended Order

```
1. Sidebar + MainLayout + BulkActionBar  (unblocks everything)
2. Portfolio editor split layout          (highest-traffic page)
3. Reports 2-panel layout
4. Withdraw/Deploy flow splits
5. Bulk padding pass (all files)
6. FilterBar + Header
7. Tables (overflow-x-auto + chart sizing)
8. Client detail page
9. TourGuide mobile positioning
10. Modals + Toast + polish
11. Cross-device testing
```
