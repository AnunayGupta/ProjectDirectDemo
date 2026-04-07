# Project Direct — Clinch Demo: Screen Architecture

## Persistent Chrome

### Sidebar (240px, #2C3B2D, always visible)
**Components:**
- Clinch Wealth Management logo text in gold at top
- Nav items: Clients, Actions, Reports, Settings
  - Active state: gold text + left border accent in gold
  - Inactive state: muted sage text
- Bottom section: Andrew Collins avatar circle + "Andrew Collins" in white + "Director" in muted sage

**Actions:**
- Click Clients → Screen 1: Client Book
- Click Actions → Screen 3: Portfolio Action Screen
- Click Reports → Screen 7: Reports Screen
- Click Settings → Settings (static)

### Header (full width, white, border-bottom #E2DDD6, always visible)
**Components:**
- Page title left — Playfair Display, dark (changes per screen)
- Right side: Andrew Collins profile photo circle

**Actions:**
- Click profile photo → opens dropdown menu:
  - My Profile (static)
  - Settings (static)
  - Logout (static)

---

## Screen 1: Client Book

**Purpose:** The home screen. Andrew's entire client book at a glance.

**Header title:** "Client Book"

**Components:**

**Filter bar (below header, above tile grid):**
- Dropdown: All Advisors / Andrew Collins / Tom Clinch / Leona Nicholson / Graham Brooks / Donal Coughlan / Siobhan Murray / Ciarán Doyle
- Dropdown: All Drift Status / In Sync / Drifted 30+ days / Drifted 90+ days
- Dropdown: All Values / Under €100k / €100k–€250k / €250k–€500k / Over €500k
- Right side: "200 clients — €142m AUM" in small muted text

**Tile grid (3 columns, warm off-white background):**

Each tile (white card, #E2DDD6 border, subtle shadow) contains:
- Top left: Client full name (Playfair Display, dark)
- Top right: Checkbox for selection
- Below name: Assigned advisor name and title (muted sage, Inter small)
- Centre: Portfolio value (Inter bold, large, prominent)
- Below value: Monthly performance (green ↑ or red ↓ + percentage)
- Asset pills row: small rounded grey chips (AAPL · MSFT · VOO · IEAG · Cash)
- Bottom left: "Last rebalanced [date]" (small grey)
- Bottom right: Drift indicator dot + time label + chat bubble + note count

**Drift indicator states:**
- Green dot + "In sync"
- Amber dot + "Drifted 34 days"
- Red dot + "Drifted 94 days"

**Selected tile state:**
- Gold border
- Light gold background tint
- Checkbox ticked

**Bulk action bar (pinned to bottom, appears when 1+ tiles selected, #2C3B2D background):**
- Left: "X clients selected — €Xm AUM"
- Right: "Rebalance Selected" button in gold

**Actions:**
- Click tile → Screen 2: Client Detail
- Tick checkbox on tile → tile enters selected state, bulk action bar appears
- Select multiple tiles → bulk action bar updates count and AUM total
- Click "Rebalance Selected" in bulk action bar → Screen 3: Portfolio Action Screen (bulk mode, Rebalance tab pre-selected)
- Change any filter dropdown → tile grid filters in real time

---

## Screen 2: Client Detail

**Purpose:** Full view of one client — portfolio, history, and relationship notes.

**Header title:** Client full name (e.g. "Seán O'Brien")

**Components:**

**Client summary bar (below header, above tabs):**
- Client name (Playfair Display, large)
- Assigned advisor name and title (muted sage)
- Portfolio value (Inter bold, large)
- Monthly performance (green/red)
- "Send for Approval" button (gold, right side) — only active when Proposed state differs from Accepted state
- "Rebalance" button (forest green outline, right side)

**Tab bar:** Portfolio · History · Notes

---

### Tab 1: Portfolio

**Components:**

**Two sub-view toggle:** Current (Accepted) · Proposed (Advisor)

**Current view:**
- Holdings list — each row: asset name + ticker, current value, weighting %, monthly performance
- Donut chart (right side) — asset class allocation using Clinch palette (forest green = equities, gold = ETFs, sage = bonds, dusty rose = cash)
- Total portfolio value at bottom

**Proposed view:**
- Same layout as Current but showing advisor's target state
- Differences highlighted — rows where weighting has changed show old % → new % in amber
- Badge: "Draft" or "Pending Approval" shown prominently
- Assets to be bought highlighted in green
- Assets to be sold highlighted in red

**Side by side diff (when Proposed differs from Current):**
- A clear visual comparison strip showing what will change
- "Drift since [date]" shown prominently below the toggle

**Actions:**
- Toggle Current / Proposed → switches sub-view
- Click "Rebalance" button → Screen 3: Portfolio Action Screen (individual mode, Rebalance tab)
- Click "Send for Approval" → triggers Screen 6: Client Approval Modal
- Click any holding row → expands to show lot detail (purchase date, cost basis, gain/loss)

---

### Tab 2: History

**Components:**
- Chronological list of all portfolio actions
- Each entry: date, action type badge (Rebalance / Deploy Capital / Withdrawal / Add Instrument / Remove Instrument), assets changed, trade amounts, advisor who executed, approval status badge (Approved / Pending / Draft)

**Actions:**
- Click any history entry → expands to show full trade list for that action
- No navigation to other screens from this tab

---

### Tab 3: Notes

**Components:**
- "Add Note" button at top right (gold)
- Chronological feed of notes, newest first
- Each note: date stamp, short title (Playfair Display), free text body (Inter), advisor name who added it
- Sample notes pre-seeded with realistic Irish context:
  - "Annual Review — March 2026"
  - "Phone call — PIA query"
  - "Initial onboarding meeting — January 2024"

**Actions:**
- Click "Add Note" → inline note composer appears at top of feed (title field + body field + Save button)
- Click Save → note added to feed, composer closes
- No navigation to other screens from this tab

---

## Screen 3: Portfolio Action Screen

**Purpose:** The operational hub. All portfolio changes happen here.

**Header title:** "Portfolio Actions" — with a sub-label showing scope:
- Individual mode: client name (e.g. "Seán O'Brien")
- Bulk mode: "30 clients selected — €18.4m AUM"

**Entry points:**
- From Screen 2 Portfolio tab → Rebalance button → opens in individual mode, Rebalance tab pre-selected
- From Screen 1 bulk action bar → Rebalance Selected → opens in bulk mode, Rebalance tab pre-selected

**Components:**

**Segmented control at top:** Rebalance · Add Instrument · Remove Instrument · Deploy Capital · Withdraw

**Left panel (60% width):** Action configuration — changes per mode (see below)

**Right panel (40% width):** Live preview — updates in real time as left panel changes
- Header: "Impact Preview"
- List of affected clients (or single client in individual mode)
- Each row: client name, individual buy/sell amounts
- Total order value at bottom in bold
- "Slide to Confirm" component at bottom (gold slider)

---

### Mode 1: Rebalance

**Left panel:**
- Holdings table: asset name + ticker, current weighting %, target weighting % (editable number field), difference (auto-calculated)
- Changing any target % recalculates all others proportionally
- Rows with increases highlighted green, decreases highlighted red
- Total must equal 100% — validation shown if not

**Right panel:**
- Per client: exact buy/sell amounts based on their individual portfolio value
- Updates live as target weightings change

**Actions:**
- Edit any target weighting field → right panel updates live
- Slide to Confirm → Screen 4: Rebalance Preview

---

### Mode 2: Add Instrument

**Left panel:**
- Search bar: "Search stocks and ETFs"
- Search results list (ticker + name + asset class)
- Once selected: target weighting % input field
- Existing holdings shown below compressed proportionally

**Right panel:**
- Shows impact per client — new instrument added, existing holdings compressed

**Actions:**
- Type in search → results filter live
- Select instrument → instrument appears in left panel with weighting input
- Set weighting → right panel updates
- Slide to Confirm → Screen 4: Rebalance Preview

---

### Mode 3: Remove Instrument

**Left panel:**
- Current holdings list — each row selectable
- Select a holding to remove — it highlights in red
- Remaining holdings show redistributed weightings proportionally

**Right panel:**
- Per client: exact sell amounts for removed instrument, buy amounts for redistribution

**Actions:**
- Click any holding row → selects it for removal, right panel updates
- Slide to Confirm → Screen 4: Rebalance Preview

---

### Mode 4: Deploy Capital

**Left panel:**
- Input field: "Amount to deploy" (€)
- Two options (radio):
  - Deploy proportionally across all holdings per current weightings
  - Deploy selectively — shows holdings list with manual allocation
- Selective mode: editable amount fields per asset, must sum to input amount

**Right panel:**
- Per client: exact buy amounts per asset

**Actions:**
- Enter amount → right panel updates
- Toggle proportional / selective → left panel changes
- Slide to Confirm → Screen 4: Rebalance Preview

---

### Mode 5: Withdraw

**Left panel:**
- Input field: "Amount to withdraw" (€)
- Two options (radio):
  - Sell proportionally across all holdings
  - Sell specific assets — shows holdings list with manual sell amounts
- Selective mode: editable sell amount fields per asset

**Right panel:**
- Per client: exact sell amounts per asset, cash raised

**Actions:**
- Enter amount → right panel updates
- Toggle proportional / selective → left panel changes
- Slide to Confirm → Screen 4: Rebalance Preview

---

## Screen 4: Rebalance Preview

**Purpose:** Final review before execution. The wow moment.

**Header title:** "Confirm Trade Instructions"

**Components:**

**Summary bar at top:**
- Action type (e.g. "Rebalance")
- Scope: number of clients, total AUM affected, total order value
- Timestamp: "Instructions will be generated [date/time]"

**Client trade list (scrollable):**
- Each client: name, advisor, portfolio value
- Expanded trade list below each client:
  - Each trade row: Buy/Sell badge, asset name + ticker, amount in €
  - Subtle green background for buys, red for sells

**Bottom:**
- Total order value (large, bold)
- Slide to Confirm component (gold, full width)
- "Cancel" link in muted text above slider

**Actions:**
- Slide to Confirm → Screen 5: Result Screen
- Click Cancel → returns to Screen 3

---

## Screen 5: Result Screen

**Purpose:** Confirmation and feedback.

**Header title:** "Instructions Generated"

**Components:**
- Large gold tick (institutional, not startup-y)
- Summary:
  - "Trade instructions generated for X clients"
  - Total order value
  - Timestamp
  - Advisor name
- "View Instructions" expandable list — same trade list as Screen 4 but read only
- "Return to Client Book" button (gold)

**Auto-actions (happen invisibly in background):**
- Each affected client's history tab updated with new entry
- Each affected client's notes tab auto-note added: "[Action type] executed — [date] — Andrew Collins"
- Drift indicator on affected tiles resets to green + "In sync"

**Actions:**
- Click "Return to Client Book" → Screen 1: Client Book
- Click "View Instructions" → expands trade list inline

---

## Screen 6: Client Approval Modal

**Purpose:** Show Andrew what his client sees when they receive an approval request.

**Trigger:** "Send for Approval" button on Screen 2

**Components:**

**Desktop overlay — dark background dimming Screen 2**

**Centre: phone frame mockup (iPhone outline)**

Inside the phone frame:
- Push notification at top: "Clinch Wealth Management — Portfolio update requires your approval"
- Client name
- "Your advisor has proposed the following changes:"
- Trade list: each change in plain language (e.g. "Sell €1,200 VOO · Buy €1,200 NVDA")
- Current allocation donut → Proposed allocation donut side by side
- Large "Swipe to Approve" slider in gold at bottom

Outside phone frame, bottom of overlay:
- Small label: "This is what [Client Name] sees on their phone"
- "Close Preview" button

**Actions:**
- Click anywhere outside phone frame → closes modal, returns to Screen 2
- Click "Close Preview" → same
- Swipe interaction inside phone frame is visual only — not functional in demo

---

## Screen 7: Reports Screen

**Purpose:** Automated monthly reporting for the entire client book.

**Header title:** "Reports"

**Components:**

**Top action bar:**
- Month selector: "March 2026" with left/right arrows
- "Generate Reports for All Clients" button (gold, right side)

**Report list (left panel, 50% width):**
- Each row: client name, advisor name, portfolio value, report status badge (Generated / Pending)
- One row pre-marked as "Generated" with a "Preview" button

**Report preview panel (right side, 50% width):**
- Embedded PDF preview of the pre-generated Clinch branded report
- Report contents:
  - Clinch header — forest green with gold logo
  - Client name, advisor name and title
  - Portfolio value and monthly performance
  - Full holdings table
  - Asset class donut chart in Clinch palette
  - Footer: "Prepared by Clinch Wealth Management — Confidential"

**Actions:**
- Click "Preview" on any generated report → loads in right panel
- Click "Generate Reports for All Clients" → all status badges animate to "Generated" (simulated)
- Click "Download" on preview panel → simulates PDF download

---

## Screen Flow Summary

```
Screen 1: Client Book
  ├── Click tile → Screen 2: Client Detail
  │     ├── Portfolio tab → Rebalance button → Screen 3: Portfolio Action (individual)
  │     └── Send for Approval → Screen 6: Client Approval Modal
  └── Select tiles → Rebalance Selected → Screen 3: Portfolio Action (bulk)
        └── Slide to Confirm → Screen 4: Rebalance Preview
              └── Slide to Confirm → Screen 5: Result Screen
                    └── Return to Client Book → Screen 1

Sidebar:
  ├── Clients → Screen 1
  ├── Actions → Screen 3
  ├── Reports → Screen 7
  └── Settings → Static

Header:
  └── Profile photo → Dropdown (My Profile / Settings / Logout)
```
