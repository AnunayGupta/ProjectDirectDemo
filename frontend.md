# Project Direct — Clinch Demo: Frontend Architecture

## Overview

This document defines frontend rules, constraints, and patterns for the Clinch demo. It does NOT contain component code — that comes from Stitch.

**Before building any component:**
1. Fetch the approved Stitch design using `get_screen_code` and `get_screen_image` from the project Clinch Demo
2. Extract exact spacing, border radius, font sizes, and class patterns from the Stitch output
3. Document each extracted pattern in `DESIGN_SYSTEM.md` as you build it
4. Apply the rules in this doc as constraints on top of what Stitch produces

The Stitch designs are the source of truth for visual appearance. This doc is the source of truth for rules, behaviour, and consistency.

---

## Design Principles

- **Private bank, not fintech.** Warm, considered, institutional. Think Bloomberg meets a private members club.
- **Data-dense but not cluttered.** Information hierarchy is everything. Every element earns its place.
- **Nothing startup-y.** No gradients, no bright colours, no animations beyond subtle transitions.
- **Desktop first.** Shown on a laptop at a coffee meeting. Min width 1280px. Max content width 1440px.
- **Consistency over cleverness.** Use established patterns from Stitch. Do not invent new ones.
- **Firm config drives everything.** No colour, name, or firm string is ever hardcoded. Always `firmConfig.X`.

---

## Colour Rules

Tokens defined in `lib/firm-config.ts`. Never use hardcoded hex values for firm colours.

```
firmConfig.colors.primary    Sidebar bg, report header bg, primary outline buttons
firmConfig.colors.background All page backgrounds — never white for page bg
firmConfig.colors.accent     Gold — all primary CTAs, active nav, selected tile borders,
                             highlights, "Select →" links, tab underlines
firmConfig.colors.text       All body copy, headings, data values, numbers
firmConfig.colors.sage       Advisor names, secondary labels, muted text,
                             inactive nav items, instructional text
firmConfig.colors.rose       Donut chart cash segment ONLY — nowhere else
firmConfig.colors.surface    All cards, tiles, modals, panels, inputs
firmConfig.colors.border     All card borders, dividers, input borders, row separators
```

**Semantic colours — hardcoded, not from firm config:**
These represent universal financial concepts — not firm branding — so they stay fixed.

```
Buy / positive / increase:   #2D6A4F  dark green
Sell / negative / decrease:  #C0392B  dark red
Amber warning / drift:       #D4800A  amber
Amber bg tint:               #FFF8F0  very subtle — pending banners
Green row tint:              #F5FFF8  very subtle — buy/increase rows
Red row tint:                #FFF5F5  very subtle — sell/decrease rows
Gold tint:                   #FFFBF5  very subtle — selected card bg
```

---

## Typography Rules

Both fonts loaded via Google Fonts in `app/layout.tsx`.

**Playfair Display (serif) — use for:**
- Page titles and screen headings
- Client names (tiles and detail screen)
- Card and panel headers
- Note titles
- Report document headings
- Any Playfair Display in Stitch output — preserve it exactly

**Inter (sans-serif) — use for:**
- All numbers and financial data
- All labels and secondary text
- All body copy
- Buttons and CTAs
- All caps small labels (uppercase + tracking-wider)
- Any Inter in Stitch output — preserve it exactly

**Rule:** Never substitute one font for the other. If Stitch uses Playfair for a heading, keep Playfair. If Stitch uses Inter for a value, keep Inter.

---

## Spacing Rules

Extract exact spacing values from Stitch output. Apply them consistently across similar components.

**Principles:**
- Cards should feel generous — never cramped
- Data rows need breathing room — scannable at a glance
- Section gaps should be larger than item gaps
- Sidebar and header dimensions are fixed — extract from Stitch Screen 1 and never deviate

**Document extracted values in DESIGN_SYSTEM.md:**
When you build Screen 1 and extract spacing from Stitch, record:
- Sidebar width
- Header height
- Card padding
- Tile grid gap
- Row padding
- Section gap

All subsequent components use these same values.

---

## Component Rules

### Donut Charts — Always Use This Recharts Config

Stitch renders donut charts as rounded squares. This is a known Stitch limitation. Always replace with proper Recharts PieChart in code.

```tsx
// ALWAYS use innerRadius — without it renders as filled circle
<PieChart width={180} height={180}>
  <Pie
    data={chartData}
    cx={90}
    cy={90}
    innerRadius={55}     // required for donut shape
    outerRadius={80}
    paddingAngle={2}
    dataKey="value"
    strokeWidth={0}
    isAnimationActive={false}  // no chart drawing animation
  >
    {chartData.map((entry) => (
      <Cell key={entry.assetClass} fill={DONUT_COLORS[entry.assetClass]} />
    ))}
  </Pie>
</PieChart>

// Colour mapping — always these four asset classes:
const DONUT_COLORS = {
  equity: firmConfig.colors.primary,   // forest green
  etf:    firmConfig.colors.accent,    // gold
  bond:   firmConfig.colors.sage,      // muted sage
  cash:   firmConfig.colors.rose,      // dusty rose
}

// Smaller variant (inside report preview):
// width={120} height={120} cx={60} cy={60}
// innerRadius={35} outerRadius={52}
```

### Drift Indicator — Always Time-Based

Drift is calculated from `draftStartedAt` — never from the magnitude of portfolio deviation.

```
No draft (null):        Green dot    "In sync"
Draft < 30 days:        Green dot    "Draft X days"    (recent, not urgent)
Draft 30–89 days:       Amber dot    "Draft X days"
Draft 90+ days:         Red dot      "Draft X days"
Pending approval:       Amber dot    "Awaiting approval"
```

Dot is always a small filled circle. Label is always Inter small. Extract exact sizes from Stitch Screen 1.

### Buttons — Three Variants Only

**Primary (gold):** All main CTAs. "Send for Approval", "Confirm & Execute", "Generate Reports", "Select →" actions.

**Secondary (forest green outline):** Lower emphasis actions. "Save Draft", "Mark Reviewed", "Next Drifted Client →", "Go to Client Book →".

**Ghost (text only):** Lowest emphasis. "Cancel", dismiss links, secondary navigation.

**Never use:**
- Slide to confirm on desktop — always a button
- Rounded-full buttons — too consumer app
- Any colour other than gold or forest green for button backgrounds

### Cards and Tiles

All cards: white surface, firm border colour, rounded corners, subtle shadow.

Selected state (tiles): gold border, very subtle gold background tint.

Extract exact border-radius and shadow values from Stitch Screen 1 tile. Apply identically across all cards throughout the app.

### Tables and Rows

All data tables: column headers in small caps with muted sage colour. Row borders between entries. Generous row padding.

Row tints (action screen only — when values change):
- Increasing rows: very subtle green tint background
- Decreasing rows: very subtle red tint background
- Unchanged rows: white

Extract exact row height and padding from Stitch Screen 3 left panel.

### Asset Pills

Small rounded chips showing ticker symbols. Always warm grey background, dark text. Extract exact sizing from Stitch Screen 1 tile.

### Status Badges

Small rounded labels used for: Generated/Pending (reports), Draft/Pending Approval (portfolio states), action type tags, NEW instrument label, REMOVING label.

Extract exact sizing and border-radius from Stitch. Apply the semantic colour rules:
- Generated: dark green bg, white text
- Pending: border colour bg, sage text
- Draft / Pending Approval: amber tint bg, amber text, amber border
- NEW: gold bg, dark text
- REMOVING: red bg, white text

---

## Behaviour Rules

### No Blank Clicks

Every interactive element must do something. See `demo-clinch.md` Interaction Tiers for the full list. Summary:

- Every navigation link goes somewhere
- Every button either triggers an action or shows a graceful response
- Graceful responses: toast notification, static page, read-only view
- No element throws an error or shows a blank screen

### Draft Auto-Save

Portfolio Action Screen saves draft to KV automatically as advisor edits weightings.

```
Debounce: 500ms after last keystroke
On save: PUT /api/portfolio/[id]/draft
Show: subtle "Saving..." indicator while pending, "Saved" when complete
Never: save on every keystroke — always debounce
```

### Search Debounce

Client picker search bar debounces before fetching.

```
Debounce: 300ms after last keystroke
On search: GET /api/clients/search?q={query}
Show: skeleton rows while loading
Never: fetch on every keystroke — always debounce
```

### Live Impact Preview

Right panel on Portfolio Action Screen updates as advisor edits.

```
Trigger: any change to target weighting fields
Calculation: client-side only — no API call needed
Formula: (targetWeighting / 100) * client.totalValue = buy/sell amount
Show: updated amounts immediately on every change
```

---

## Animation Rules

Minimal. Nothing that feels like a consumer app.

```
Bulk action bar appear:      slide up, 200ms ease-out
Bulk action bar disappear:   slide down, 200ms ease-in
Tile hover:                  border colour transition, 150ms
Button hover:                opacity 90%, 150ms
Toast slide in:              slide from right, 200ms ease-out
Toast fade out:              opacity 0, 300ms ease-in
Report badge → Generated:    subtle scale + opacity, 300ms
Modal overlay appear:        opacity 0→1, 200ms
```

**Never animate:**
- Page transitions
- Card or tile appearances on load
- Chart drawing — always `isAnimationActive={false}` on all Recharts components
- Tab switching — instant
- Dropdown open/close — instant
- Filter changes — instant

---

## Responsive Rules

Desktop only. No mobile layout for the advisor portal.

```
Minimum supported width:   1280px
Maximum content width:     1440px
Sidebar:                   fixed width, never collapses
Tile grid:                 3 columns always
Panel splits:              60/40 action screen, 50/50 reports — always fixed
Font sizes:                never scale with viewport — always fixed
```

---

## Icon Rules

Material Symbols Outlined loaded via Google Fonts.

```tsx
// Usage:
<span className="material-symbols-outlined">
  {iconName}
</span>

// Extract icon size class from Stitch designs
// Never use emoji as icons
// Never use SVG icons — always Material Symbols for consistency
```

**Icon map — always use these, never substitute:**
```
Clients nav:        group
Actions nav:        account_tree (or bolt — whichever Stitch uses)
Reports nav:        description
Settings nav:       settings
Search:             search
Dropdown:           expand_more
Note count:         chat_bubble
Info notice:        info
Success:            check_circle
Loading/sync:       sync
Forward arrow:      arrow_forward
Download:           download
Add:                add
Close:              close
Back:               chevron_left
```

---

## Loading States

Show skeleton placeholders while data loads. Never show a spinner for the tile grid.

```
Tile grid loading:    3×3 grid of skeleton tiles — same dimensions as real tiles
                      Pulsing grey bars replacing name, value, pills
Holdings table:       Skeleton rows — grey bars for name, value, weighting columns
Notes feed:           2–3 skeleton note cards
History feed:         2–3 skeleton history rows
Report list:          6 skeleton rows
```

Skeleton colour: `firmConfig.colors.border` with `animate-pulse`.

---

## Formatting Utilities

Implement in `lib/utils.ts`. Use consistently throughout — never format inline.

```typescript
formatCurrency(428500)      → "€428,500"       // always € prefix, comma separator
formatCurrency(2106400)     → "€2,106,400"
formatAUM(142000000)        → "€142m"           // compact for AUM totals
formatAUM(18400000)         → "€18.4m"
formatPerformance(2.4)      → "↑ 2.4%"          // always show sign and arrow
formatPerformance(-0.8)     → "↓ 0.8%"
formatPerformance(0)        → "— 0.0%"
formatDate("2026-01-12")    → "12 Jan 2026"     // always DD Mon YYYY
formatWeighting(20)         → "20.0%"           // always one decimal
formatWeighting(9.5)        → "9.5%"
driftDays("2026-03-02")     → 34                // days from ISO date to today
driftLabel(null, null)      → "In sync"
driftLabel("2026-03-02", null) → "Draft 34 days"
driftLabel("2026-03-02", "2026-03-15") → "Awaiting approval"
```

---

## Zustand Store

UI state only. No API data in Zustand — that goes through React state or SWR.

```typescript
// lib/store.ts

type UIStore = {
  // Client Book
  selectedClientIds: Set<string>
  filterAdvisor: string | null
  filterDrift: "all" | "in_sync" | "draft" | "pending_approval"
  filterValue: "all" | "under_100k" | "100k_250k" | "250k_500k" | "over_500k"
  setFilter: (key: string, value: string | null) => void
  toggleClientSelected: (id: string) => void
  clearSelection: () => void

  // Client Detail
  activeClientTab: "portfolio" | "history" | "notes"
  portfolioSubView: "current" | "proposed"
  setActiveClientTab: (tab: string) => void
  setPortfolioSubView: (view: string) => void

  // Portfolio Action Screen
  activeActionMode: "rebalance" | "add_instrument" | "remove_instrument" | "deploy_capital" | "withdraw"
  draftHoldings: Holding[] | null  // live edits before debounced KV save
  setActiveActionMode: (mode: string) => void
  updateDraftHolding: (ticker: string, targetWeighting: number) => void

  // Modals
  approvalModalOpen: boolean
  approvalModalClientId: string | null
  openApprovalModal: (clientId: string) => void
  closeApprovalModal: () => void

  // Toast
  toast: { message: string, variant: "info" | "success" | "loading" } | null
  showToast: (message: string, variant: string) => void
  clearToast: () => void
}
```

---

## DESIGN_SYSTEM.md — Populate As You Build

Create `DESIGN_SYSTEM.md` in the project root. Populate it as you extract values from Stitch designs.

Document these values after building Screen 1:
```
sidebar_width:
header_height:
card_padding:
card_border_radius:
card_shadow:
tile_grid_gap:
row_padding:
section_gap:
input_border_radius:
button_border_radius:
font_size_page_title:
font_size_card_header:
font_size_client_name:
font_size_portfolio_value:
font_size_label:
font_size_muted:
drift_dot_size:
asset_pill_padding:
asset_pill_border_radius:
```

All subsequent screens must use these extracted values. If a new Stitch screen uses different values, align to the established system unless the difference is clearly intentional.

---

## References

- Full UX brief and screen designs: `demo-clinch.md`
- Data model and API spec: `backend.md`
- Build instructions and project structure: `CLAUDE.md`
