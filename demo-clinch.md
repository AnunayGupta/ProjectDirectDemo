# Demo Brief — Clinch Wealth Management

You are a senior product designer and full stack engineer helping build a B2B sales demo for a wealth management platform called Project Direct.

The demo is built in Next.js (App Router) with Tailwind CSS, Zustand for local state, and Vercel KV for shared persistent state. Deployed on Vercel.

The goal is simple: get an Irish wealth manager to say "I need this." The target is Andrew Collins, Director at Clinch Wealth Management, managing ~800 clients with a team of 7 advisors. Institutional background. Operationally minded. Will see through anything unpolished.

---

## The Core Promise

Every client, every portfolio, every conversation — in one place. Make a change once, apply it across any selection of clients simultaneously.

---

## Design System — Clinch Wealth Management Brand

Extract these exact tokens into tailwind.config.ts and document them in DESIGN_SYSTEM.md before building any screen:

```
Primary:        #2C3B2D  (deep forest green — header, sidebar, primary buttons)
Background:     #F2EFE9  (warm off-white — page backgrounds)
Accent:         #B5A07A  (muted gold — CTAs, highlights, active states)
Text:           #1A1A1A  (near black — all body copy and headings)
Muted Sage:     #8A9E8C  (secondary green — tags, badges, subtle UI elements)
Dusty Rose:     #C4A8A0  (soft mauve — used sparingly for contrast)
Surface:        #FFFFFF  (pure white — cards, tiles, modals)
Border:         #E2DDD6  (warm grey — card borders, dividers)
```

Typography:
- Headings: Playfair Display (serif) — matches Clinch's editorial feel
- Body: Inter (sans-serif) — clean and legible for data-dense screens
- Both available via Google Fonts

The overall feeling must be a private bank, not a fintech. Warm, considered, institutional. No bright colours, no gradients, no startup energy.

---

## Logged In User

Andrew Collins — Director. His name appears in the sidebar or header as the active user. His client book is the largest — he manages the most AUM of any advisor on the team.

---

## The Advisor Team — Real Clinch Staff

Pre-seed exactly these 7 advisors:

- Andrew Collins — Director
- Tom Clinch — Managing Director
- Leona Nicholson — Senior Financial Planner
- Graham Brooks — Portfolio Manager
- Donal Coughlan — Financial Advisor
- Siobhan Murray — Investment Analyst
- Ciarán Doyle — Financial Planner

Each client in the book is assigned to one of these advisors. Andrew's book has the most clients. Tom Clinch's book is second largest.

---

## What the Demo Must Show

### 1. The Client Book — Tile View

A grid of 200 pre-loaded client tiles, 3-4 per row on desktop. Each tile is a clean white card on the warm off-white background with a subtle warm grey border.

Each tile shows:

- Client full name (Playfair Display, dark)
- Portfolio value (large, prominent, Inter bold)
- Assigned advisor name and title in muted sage (e.g. "Andrew Collins — Director")
- Asset pills — small labelled chips showing current holdings (e.g. AAPL, VOO, MSFT, IEAG) in warm grey
- Monthly performance — up/down percentage in green or red
- Last rebalance date in small grey text
- Drift indicator — a small coloured dot with a time label:
  - Green dot "In sync" — no draft exists, portfolio is current
  - Amber dot "Draft 34 days" — draft exists but not yet sent to client
  - Amber dot "Awaiting approval" — sent to client, waiting response
  - Red dot "Draft 94 days" — draft sitting 90+ days without action, overdue
- Note indicator — small chat bubble icon with count of logged notes

**Filtering and selection:**
- Filter bar at top: by assigned advisor, by drift status, by portfolio value range
- Each tile has a checkbox — selecting multiple tiles activates the bulk action bar at the bottom
- Bulk action bar shows: "X clients selected — €Xm total AUM" with two buttons:
  - "Send Reports" (gold) — generates and sends monthly reports to all selected clients
  - "Mark Reviewed" (forest green outline) — marks selected clients as reviewed

**No bulk rebalance button. Trading always happens per client.**

---

### 2. Client Detail Screen

Tapping a tile opens a full client detail screen with three tabs.

**Client summary bar (below header):**
- Client name, advisor name and title, portfolio value, monthly performance
- "Send for Approval" button (gold) — only active when a draft exists
- "Rebalance" button (forest green outline)
- "Next Drifted Client →" button (muted sage, right side) — navigates directly to next client with red or amber drift indicator without returning to tile grid

**Tab bar:** Portfolio · History · Notes

---

#### Tab 1: Portfolio

**Two sub-view toggle:** Current (Accepted) · Proposed (Draft or Pending)

**Current view:**
- Holdings list — each row: asset name + ticker, current value, current weighting %, target weighting %, monthly performance
- Donut chart (right side) — asset class allocation using Clinch palette
- Total portfolio value at bottom

**Proposed view (only visible when draft or pending approval exists):**
- Same layout showing advisor's proposed target state
- Differences highlighted — rows where target weighting differs from current show old % → new % in amber
- Badge: "Draft — not yet sent" or "Pending Approval — sent [date]"
- Assets to be bought highlighted in green, assets to be sold in red

**Drift status card (right side, below donut):**
- Shows current drift state with time elapsed
- "Review Proposed Changes →" link if draft exists
- "Send for Approval" button if draft exists and not yet sent

**Actions:**
- Toggle Current / Proposed → switches sub-view
- Click "Rebalance" → Screen 3: Portfolio Action Screen
- Click "Send for Approval" → triggers Client Approval Modal
- Click any holding row → expands to show lot detail

---

#### Tab 2: History

- Chronological log of all portfolio actions for this client
- Each entry: date, action type badge, assets changed, trade amounts, advisor, approval status
- Click any entry → expands to show full trade list

---

#### Tab 3: Notes

- "Add Note" button at top right (gold)
- Chronological feed of notes newest first
- Each note: date, title (Playfair Display), body (Inter), advisor name
- Pre-seeded with 2-3 realistic Irish context notes per client:
  - e.g. "Annual Review — March 2026"
  - e.g. "Phone call — PIA query"
  - e.g. "Initial onboarding — January 2024"
- Add Note → inline composer (title + body + Save)

---

### 3. Portfolio Action Screen — Per Portfolio Only

All portfolio actions are scoped to one client at a time. Each client has their own unique portfolio composition driven by individual purchase prices and price movements. A rebalance for one client is a different calculation from another.

**Entry point:** Rebalance button inside Client Detail screen only.

**Header:** Client name + advisor name + portfolio value. Scoped to this client only.

**Five modes selectable via segmented control:**

**Rebalance**
- Left panel: holdings table with Current % (actual price-driven weighting) and Target % (editable — advisor's intended weighting)
- Rows where current diverges from target are highlighted — this is drift visualised
- Changing any Target % recalculates all others proportionally
- Total must equal 100% — validation shown
- Right panel: this client's exact buy/sell amounts based on their actual portfolio value — updates live

**Add Instrument**
- Search bar: find stock or ETF from asset universe
- Set target weighting — existing holdings compress proportionally
- Right panel: this client's exact buy amount for new instrument

**Remove Instrument**
- Select existing holding to take to zero
- Proceeds redistributed proportionally across remaining holdings
- Right panel: this client's exact sell amount

**Deploy Capital**
- Input amount client has deposited
- Two options: deploy proportionally across all holdings, or selectively
- Right panel: exact buy amounts per holding for this client

**Withdraw**
- Input withdrawal amount
- Two options: sell proportionally, or sell specific assets
- Right panel: exact sell amounts per holding for this client

**All modes:**
- Right panel always shows this client's exact trade amounts
- "Confirm & Execute" button at bottom of right panel (gold, full width)
- Warning text: "This will generate trade instructions for [client name]. This action cannot be undone."
- "Cancel" link in muted sage below button

**After Confirm & Execute:**
- Draft state saved automatically as advisor edits (auto-save to KV)
- On confirm: draft → accepted in one step (discretionary mandate — no client approval required for this flow)
- Result Screen shown
- Note auto-added to client feed
- Drift indicator resets to green

---

### 4. Portfolio States — Three States

Every portfolio has exactly three possible states:

**Accepted (source of truth)**
- What the client has approved and what has been executed
- Source of truth for reporting, performance, monthly PDF
- Displayed as "Current" in Client Detail

**Draft (advisor working)**
- Advisor has started changes, client has no visibility
- Auto-saved to KV as advisor edits in rebalance screen
- Freely editable
- Tile: amber dot + "Draft X days" — timer from draftStartedAt
- Badge: "Draft — not yet sent"

**Pending Approval**
- Advisor clicked "Send for Approval" — client notified
- Locked from editing until client responds
- Tile: amber dot + "Awaiting approval"
- Badge: "Pending Approval — sent [date]"

**State transitions:**
```
Accepted → Draft           auto-save when advisor opens rebalance screen and edits
Draft → Pending Approval   advisor clicks "Send for Approval"
Pending Approval → Accepted client swipes to approve — trades execute
Draft → Accepted           advisor clicks "Confirm & Execute" — discretionary, no approval needed
```

**Drift timer:**
- Starts from draftStartedAt — the moment advisor first saved a draft
- Not from when it was sent for approval
- Supervisory signal: a client sitting in draft for 94 days without being sent is a management issue

---

### 5. Result Screen

- Gold tick, "Trade Instructions Generated" in Playfair Display
- Timestamp + "Executed by [advisor name]"
- Summary: client name, total order value, action type
- Trade list: all buy/sell instructions for this client
- Auto-actions notice: history updated, note added, drift reset
- "Return to Client Book" button (gold)
- "Next Drifted Client →" button (forest green outline) — continues working through drifted book

---

### 6. Client Approval Modal

- Phone frame overlay on Client Detail
- Shows what client sees on their phone
- Push notification, "Hello [name]", proposed trade list, Approve Changes button
- "This is what [client name] sees on their phone" label
- Close Preview button

---

### 7. Reports Screen

- Month selector + "Generate Reports for All Clients" button
- Left panel: client list with Generated/Pending badges
- Right panel: pre-generated branded PDF report for Seán O'Brien
- Report: forest green header, Clinch wordmark in gold, client name, advisor, four stat blocks, holdings table, donut chart, footer

---

## Asset Universe

Each client portfolio holds a realistic mix of:
- Individual equities — US and European listed stocks (AAPL, MSFT, NVDA, GOOGL, AIB.IR, LVMH.PA, CRH.L)
- ETFs — broad market, thematic, bond (VOO, ICLN, IEAG, CSPX, IUIT, VWRL)
- Cash — always visible as a portfolio allocation percentage

No strategies or tiers. Each client has their own individual portfolio. Weightings must sum to 100% including cash.

---

## Data Model — Vercel KV

```typescript
// Firm config
firm:config → firmConfig object

// Client index
clients:index → string[] (200 client IDs)

// Individual client record
client:{clientId} → {
  id: string
  name: string
  advisorId: string
  portfolioValue: number
  monthlyPerformance: number
  lastRebalanced: string
  draftStartedAt: string | null
  sentForApprovalAt: string | null
  noteCount: number
}

// Portfolio — accepted state (source of truth)
portfolio:{clientId}:accepted → {
  holdings: Array<{
    ticker: string
    name: string
    assetClass: "equity" | "etf" | "bond" | "cash"
    value: number           // actual current value in €
    weighting: number       // current actual weighting % (price-driven)
    targetWeighting: number // advisor's intended target %
    performance: number     // monthly performance %
    purchasedAt: string
  }>
  totalValue: number
  lastUpdated: string
}

// Portfolio — proposed state (draft or pending)
portfolio:{clientId}:proposed → {
  holdings: Array<{...same as accepted}>
  status: "draft" | "pending_approval" | null
  draftStartedAt: string | null
  sentForApprovalAt: string | null
  advisorId: string
}

// Notes
notes:{clientId} → Array<{
  id: string
  title: string
  body: string
  advisorId: string
  createdAt: string
}>

// History
history:{clientId} → Array<{
  id: string
  actionType: "rebalance" | "add_instrument" | "remove_instrument" | "deploy_capital" | "withdraw"
  trades: Array<{ side: "buy" | "sell", ticker: string, amount: number }>
  advisorId: string
  executedAt: string
  totalValue: number
}>

// Reports
report:{clientId} → {
  status: "generated" | "pending"
  generatedAt: string | null
  month: string
}
```

---

## API Endpoints

```
// Clients
GET  /api/clients                     → list all clients with tile data
GET  /api/clients/[id]                → single client full detail
GET  /api/clients/[id]/next-drifted   → next client ID with red or amber drift

// Portfolio
GET  /api/portfolio/[id]              → both accepted and proposed states
PUT  /api/portfolio/[id]/draft        → auto-save draft as advisor edits
POST /api/portfolio/[id]/send-approval → draft → pending_approval, notify client
POST /api/portfolio/[id]/execute      → execute trades, proposed → accepted
                                         generates history entry
                                         adds auto-note
                                         resets drift

// Notes
GET  /api/notes/[clientId]            → get all notes for client
POST /api/notes/[clientId]            → add note

// History
GET  /api/history/[clientId]          → get history for client

// Reports
GET  /api/reports                     → all clients with report status
POST /api/reports/generate            → mark selected clients as generated (simulated)
```

---

## Demo Pre-Seeding

- Firm name: Clinch Wealth Management
- 200 pre-loaded clients with realistic Irish full names
- Each client assigned to one of the 7 advisors:
  - Andrew Collins: ~60 clients (largest book)
  - Tom Clinch: ~45 clients (second largest)
  - Remaining 5 advisors: ~19 clients each
- Each portfolio holds 8-12 assets — realistic mix of equities and ETFs
- Each holding has a current weighting (price-driven) AND a target weighting (slightly different to create visible drift)
- Drift distribution:
  - ~120 clients green (in sync — no draft)
  - ~50 clients amber draft (30–89 days)
  - ~30 clients red draft (90+ days)
- One client (Seán O'Brien) pre-loaded with a draft rebalance ready to execute in the demo — MSFT target weighting reduced 5%, NVDA increased 5%
- 2-3 pre-loaded notes per client
- One pre-generated report for Seán O'Brien ready to preview

---

## Firm Config — Single Source of Truth

All firm-specific data lives in `lib/firm-config.ts`. Nothing firm-specific is hardcoded anywhere else.

```typescript
export const firmConfig = {
  name: "Clinch Wealth Management",
  shortName: "CLINCH",
  tagline: "TO LISTEN. TO PLAN. TOGETHER.",
  colors: {
    primary: "#2C3B2D",
    background: "#F2EFE9",
    accent: "#B5A07A",
    text: "#1A1A1A",
    sage: "#8A9E8C",
    rose: "#C4A8A0",
    surface: "#FFFFFF",
    border: "#E2DDD6",
  },
  fonts: {
    heading: "Playfair Display",
    body: "Inter",
  },
  loggedInAdvisor: {
    name: "Andrew Collins",
    title: "Director",
    photo: "/advisors/andrew-collins.jpg",
    initials: "AC",
  },
  advisors: [
    { name: "Andrew Collins", title: "Director", photo: "/advisors/andrew-collins.jpg", initials: "AC" },
    { name: "Tom Clinch", title: "Managing Director", photo: "/advisors/tom-clinch.jpg", initials: "TC" },
    { name: "Leona Nicholson", title: "Senior Financial Planner", photo: "/advisors/leona-nicholson.jpg", initials: "LN" },
    { name: "Graham Brooks", title: "Portfolio Manager", photo: "/advisors/graham-brooks.jpg", initials: "GB" },
    { name: "Donal Coughlan", title: "Financial Advisor", photo: "/advisors/donal-coughlan.jpg", initials: "DC" },
    { name: "Siobhan Murray", title: "Investment Analyst", photo: "/advisors/siobhan-murray.jpg", initials: "SM" },
    { name: "Ciarán Doyle", title: "Financial Planner", photo: "/advisors/ciaran-doyle.jpg", initials: "CD" },
  ],
  clientCount: 200,
  totalAUM: "€142m",
  reportingFooter: "Prepared by Clinch Wealth Management — Confidential",
  reportingDisclaimer: "This report is for information purposes only and does not constitute investment advice.",
}
```

**Rules:**
- Every colour → `firmConfig.colors.X` — never a hardcoded hex
- Every advisor name/title/photo → `firmConfig.advisors` — never hardcoded
- Every firm name/shortname → `firmConfig` — never hardcoded
- Photo fallback: if photo 404s, show initials circle using `firmConfig.colors.primary`

**To adapt for a new firm in under 20 minutes:**
1. Update `lib/firm-config.ts`
2. Drop advisor photos into `/public/advisors/`
3. Update `lib/clients.ts` with appropriate client names
4. Nothing else changes — entire UI re-skins automatically

---

## Stitch Integration Workflow

Every component must be built from a Stitch design. No component is designed from scratch in code.

**Mandatory workflow for every screen:**
```
1. fetch get_screen_image  → visual reference
2. fetch get_screen_code   → HTML/CSS source
3. adapt to React/Next.js  → convert to TSX
4. replace hardcoded values → firmConfig references
5. replace hardcoded colours → firmConfig.colors references
6. extract reusable parts  → /components
7. apply build fixes       → fix known Stitch issues below
```

**Never:**
- Design from scratch without fetching Stitch design first
- Hardcode a colour that exists in firmConfig
- Hardcode a firm-specific string
- Skip the Stitch fetch

---

## Interaction Tiers — No Blank Clicks

### Tier 1 — Fully Functional
- Client tile click → Client Detail
- Filter dropdowns → tiles filter in real time
- Tile checkbox → bulk action bar with live count and AUM
- All five Portfolio Action Screen modes
- Target weighting edits → right panel updates live
- Confirm & Execute → Result Screen
- Return to Client Book → Screen 1 with drift updated
- Next Drifted Client → next amber/red client
- Send for Approval → Client Approval Modal
- Close Preview → returns to Client Detail
- Reports nav → Reports Screen
- Preview button on report row → report loads in right panel
- All sidebar nav items → correct screens

### Tier 2 — Graceful Dead Ends
- History tab → pre-seeded entries, read only
- Notes tab → pre-seeded notes, Add Note opens inline composer
- Download Instructions PDF → toast "Preparing download..."
- Download PDF in reports → same toast
- Generate Reports for All Clients → badges animate Pending → Generated
- Search bar in header → empty overlay with close button
- Settings nav → static "Settings — Coming soon" page
- View all clients link on Result Screen → expands inline list
- Send Reports bulk action → badges animate to Generated
- Mark Reviewed bulk action → tiles show a subtle "Reviewed" indicator

### Tier 3 — Visually Present, Non-Interactive
- Notification bell in header
- Three dot menu in header
- Profile photo → simple dropdown (My Profile · Settings · Logout — all static)
- Review Proposed Changes link in drift card

---

## Stitch Design References

All screens approved in Stitch. Fetch via `get_screen_code` and `get_screen_image` before building.

| Screen | Description | Status |
|---|---|---|
| Screen 1 | Client Book — tile grid | ✅ Approved |
| Screen 2 | Client Detail — portfolio, history, notes | ✅ Approved |
| Screen 3a | Portfolio Action — Rebalance mode | ✅ Approved |
| Screen 3b | Portfolio Action — Add Instrument mode | ✅ Approved |
| Screen 3c | Portfolio Action — Remove Instrument mode | ✅ Approved |
| Screen 3d | Portfolio Action — Deploy Capital mode | ✅ Approved |
| Screen 3e | Portfolio Action — Withdraw mode | ✅ Approved |
| Screen 4 | Result Screen | ✅ Approved |
| Screen 5 | Client Approval Modal | ✅ Approved |
| Screen 6 | Reports Screen | ✅ Approved |

---

## Build Fixes — Known Stitch Issues to Fix in Code

### Persistent Chrome
- Sidebar nav: always **Clients · Actions · Reports · Settings** — never Dashboard, Portfolio, Reporting
- Firm name: always **CLINCH — WEALTH MANAGEMENT** in forest green sidebar
- Logged in user: always **Andrew Collins — Director** with avatar at sidebar bottom
- Material icon names rendering as text — use Material Symbols Outlined via Google Fonts

### Screen 1: Client Book
- Bottom tiles missing drift indicators and note counts — every tile must show both
- BTC/ETH/COIN asset pills — replace with realistic wealth management assets only
- Bulk action bar: replace "Rebalance Selected" with "Send Reports" (gold) and "Mark Reviewed" (forest green outline)

### Screen 2: Client Detail
- Donut chart rendering as rounded square — use Recharts PieChart with innerRadius
- Cash percentage inconsistency — align to 20.1% throughout
- Add "Next Drifted Client →" button to client summary bar

### Screen 3: Portfolio Action Screen
- All modes: remove any bottom action bar (Institutional Mode / Queue / Syncing prices)
- Header: shows single client name only — never "X clients selected"
- Rebalance mode: two columns per holding — Current % and Target % — not just one editable field
- Rebalance mode: row tints for changed holdings (red #FFF5F5 decrease, green #F5FFF8 increase) must be clearly visible
- Add Instrument mode: selected instrument confirmation card (gold left border) must appear between search and compression table
- Remove Instrument mode: right panel shows "Sell €X [ticker]" only — no redistribution destination specified, no portfolio reference numbers, no tooltips
- Deploy Capital mode: allocation table rows must have green tint #F5FFF8
- Withdraw mode: remove settlement periods line, allocation table rows must have red tint #FFF5F5
- All modes: "Slide to Confirm" → "Confirm & Execute" button

### Screen 4: Result Screen
- Buy amounts must be dark green #2D6A4F — not black
- Add "Next Drifted Client →" button alongside "Return to Client Book"
- Summary shows single client name — not "X clients affected"

### Screen 5: Client Approval Modal
- Replace donut charts with simple before/after text summary
- Add Clinch green header bar inside phone frame
- Fix body text to "Your advisor has proposed the following changes to your portfolio"

### Screen 6: Reports Screen
- Portfolio values must match Screen 1 exactly
- Donut chart inside report — use Recharts, proper circular ring
- Report header must have forest green #2C3B2D background — verify renders correctly

### All Screens
- Donut charts: always Recharts PieChart with innerRadius — never rounded squares
- Colours: always from firmConfig.colors — never hardcoded hex values
- Names/titles: always from firmConfig — never hardcoded strings
- All client names: realistic Irish names only
- All advisor names: real Clinch team of 7 only

---

## Change Log

### April 2026 — Post Stitch Design Phase Updates

**Per-portfolio model adopted (no bulk rebalance)**
- Portfolio Action Screen is now always scoped to one client
- Bulk action bar on Screen 1 changed to "Send Reports" + "Mark Reviewed" — no Rebalance Selected
- Right panel on all five Portfolio Action modes now shows one client's full trade breakdown with "No change" rows for unaffected holdings
- Result Screen scoped to single client — four stat blocks updated to show client name, advisor, order value, action type

**Three portfolio states confirmed**
- Accepted (source of truth)
- Draft (advisor working — auto-saves, client has no visibility)
- Pending Approval (sent to client, locked from editing)
- Drift timer starts from draftStartedAt — supervisory signal for management

**New screen added — Screen 3a: Client Picker**
- Entry point when arriving at Actions from sidebar
- Search bar + recent clients list with drift indicators
- Select → routes to Portfolio Action Screen (if draft or clean) or Client Detail (if pending approval)
- "Go to Client Book →" fallback link

**Navigation improvement — Next Drifted Client**
- Added to Client Detail screen summary bar
- Added to Result Screen alongside Return to Client Book
- Allows Andrew to work through drifted book without returning to tile grid

**Updated Stitch screen inventory:**

| Screen | Description | Status |
|---|---|---|
| Screen 1 | Client Book — tile grid, Send Reports + Mark Reviewed bulk actions | ✅ Approved |
| Screen 2 | Client Detail — portfolio, history, notes, Next Drifted Client button | ✅ Approved |
| Screen 3a | Client Picker — search + recent clients list | ✅ Approved |
| Screen 3b | Portfolio Action — Rebalance mode (per client) | ✅ Approved |
| Screen 3c | Portfolio Action — Add Instrument mode (per client) | ✅ Approved |
| Screen 3d | Portfolio Action — Remove Instrument mode (per client) | ✅ Approved |
| Screen 3e | Portfolio Action — Deploy Capital mode (per client) | ✅ Approved |
| Screen 3f | Portfolio Action — Withdraw mode (per client) | ✅ Approved |
| Screen 4 | Result Screen — single client, Next Drifted Client button | ✅ Approved |
| Screen 5 | Client Approval Modal — phone frame overlay | ✅ Approved |
| Screen 6 | Reports Screen — client list + report preview | ✅ Approved |

**Additional build fixes from corrections phase:**

Screen 3a — Client Picker:
- Transition logic: null draft → Portfolio Action Screen clean; draft exists → Portfolio Action Screen pre-loaded; pending approval → Client Detail Screen
- Search must filter all 200 clients in real time by name or advisor name
- "Recent clients" list shows last 6 clients the logged in advisor interacted with

Screen 3b–3f — All Portfolio Action modes:
- Header always shows "Seán O'Brien — €428,500" format — never bulk scope
- Right panel always shows single client full trade breakdown
- "No change" rows shown in muted sage with dash — gives context that full portfolio considered
- Net trade value shown below trade list — not "Total order value across X clients"
- Warning text: "This will generate trade instructions for [client name]. This action cannot be undone."

Screen 4 — Result Screen:
- Four stat blocks: Client · Advisor · Total Order Value · Action Type
- Trade list shows single client full breakdown with No change rows
- Auto-actions notice references client name specifically
- "Next Drifted Client →" button alongside "Return to Client Book"
- Remove "View all 30 clients →" link — not applicable in per-portfolio model

Screen 3a — Client Picker navigation:
- Actions sidebar nav → Screen 3a (Client Picker) always
- Screen 3a Select → routes based on draft state:
  - No draft → Screen 3b (Portfolio Action, Rebalance tab, clean)
  - Draft exists → Screen 3b (Portfolio Action, Rebalance tab, draft pre-loaded)
  - Pending approval → Screen 2 (Client Detail, Portfolio tab, Pending Approval badge)
