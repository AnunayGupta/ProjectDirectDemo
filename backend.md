# Project Direct — Clinch Demo: Backend Architecture

## Overview

The backend uses a hybrid data model:
- **Seed data** (`lib/seed-data.ts`) — static, never changes, loaded at build time
- **Vercel KV** — mutable state only, four things change during a demo session

All read operations merge seed data with KV overrides. KV is never the primary source of truth for static data — only for changes that happen during the demo.

---

## Tech Stack

- **Framework:** Next.js 15 App Router API routes
- **Storage:** Vercel KV (Redis)
- **Language:** TypeScript strict mode
- **No ORM, no database** — KV only for mutable state

---

## Type Definitions

### Core Types — `lib/types.ts`

```typescript
export type Advisor = {
  id: string
  name: string
  title: string
  initials: string
  photo: string
}

export type Holding = {
  ticker: string
  name: string
  assetClass: "equity" | "etf" | "bond" | "cash"
  currentWeighting: number    // price-driven actual %
  targetWeighting: number     // advisor's intended %
  value: number               // € value
  performance: number         // monthly %
}

export type Client = {
  id: string
  name: string
  advisorId: string
  totalValue: number
  monthlyPerformance: number
  lastRebalanced: string      // ISO date
  draftStartedAt: string | null
  sentForApprovalAt: string | null
  noteCount: number
}

export type AcceptedPortfolio = {
  clientId: string
  holdings: Holding[]
  totalValue: number
}

export type DraftPortfolio = {
  clientId: string
  holdings: Holding[]
  status: "draft" | "pending_approval"
  // status is informational only — never blocks editing
  draftStartedAt: string
  sentForApprovalAt: string | null
  advisorId: string
}

export type Note = {
  id: string
  clientId: string
  title: string
  body: string
  advisorId: string
  createdAt: string           // ISO datetime
}

export type HistoryEntry = {
  id: string
  clientId: string
  actionType: "rebalance" | "add_instrument" | "remove_instrument" | "deploy_capital" | "withdraw"
  trades: Array<{
    side: "buy" | "sell"
    ticker: string
    name: string
    amount: number
  }>
  advisorId: string
  executedAt: string          // ISO datetime
  totalValue: number
}

export type ReportStatus = {
  status: "generated" | "pending"
  generatedAt: string | null
  month: string               // e.g. "2026-03"
}

export type DriftOverride = {
  status: "in_sync" | "draft" | "pending_approval"
  draftStartedAt: string | null
  sentForApprovalAt: string | null
}

// Enriched client — seed Client merged with KV drift override
export type ClientWithDrift = Client & {
  driftStatus: "in_sync" | "draft" | "pending_approval"
}

// Full portfolio response — both states
export type PortfolioResponse = {
  accepted: AcceptedPortfolio
  proposed: DraftPortfolio | null
}
```

---

## Seed Data — `lib/seed-data.ts`

Static data generated once at build time. Never written to during demo.

### Advisors

```typescript
export const ADVISORS: Advisor[] = [
  { id: "advisor_andrew", name: "Andrew Collins", title: "Director", initials: "AC", photo: "/advisors/andrew-collins.jpg" },
  { id: "advisor_tom", name: "Tom Clinch", title: "Managing Director", initials: "TC", photo: "/advisors/tom-clinch.jpg" },
  { id: "advisor_leona", name: "Leona Nicholson", title: "Senior Financial Planner", initials: "LN", photo: "/advisors/leona-nicholson.jpg" },
  { id: "advisor_graham", name: "Graham Brooks", title: "Portfolio Manager", initials: "GB", photo: "/advisors/graham-brooks.jpg" },
  { id: "advisor_donal", name: "Donal Coughlan", title: "Financial Advisor", initials: "DC", photo: "/advisors/donal-coughlan.jpg" },
  { id: "advisor_siobhan", name: "Siobhan Murray", title: "Investment Analyst", initials: "SM", photo: "/advisors/siobhan-murray.jpg" },
  { id: "advisor_ciaran", name: "Ciarán Doyle", title: "Financial Planner", initials: "CD", photo: "/advisors/ciaran-doyle.jpg" },
]
```

### Client Distribution

```
advisor_andrew:  ~60 clients (largest book — logged in user)
advisor_tom:     ~45 clients (second largest)
advisor_leona:   ~19 clients
advisor_graham:  ~19 clients
advisor_donal:   ~19 clients
advisor_siobhan: ~19 clients
advisor_ciaran:  ~19 clients
Total:           200 clients
```

### Pre-Seeded Drift Distribution

```
~120 clients — draftStartedAt: null (green — in sync)
~50 clients  — draftStartedAt: 30–89 days ago (amber — draft)
~30 clients  — draftStartedAt: 90+ days ago (red — draft overdue)
```

### Seán O'Brien — Pre-Loaded Demo Client

```typescript
// client_001 — pre-seeded with draft rebalance ready for demo
{
  id: "client_001",
  name: "Seán O'Brien",
  advisorId: "advisor_andrew",
  totalValue: 428500,
  monthlyPerformance: 2.4,
  lastRebalanced: "2026-01-12",
  draftStartedAt: "2026-03-02",  // 34 days ago — amber drift
  sentForApprovalAt: null,
  noteCount: 2,
}

// Pre-loaded draft for client_001
// MSFT target reduced 5%, NVDA target increased 5%
// Stored in KV at boot: draft:client_001
```

### Portfolio Holdings

Each client portfolio:
- 8–12 holdings
- Mix of equities, ETFs, bonds, cash
- currentWeighting slightly different from targetWeighting (natural price drift)
- All weightings sum to 100%

Asset universe:
```
Equities:  AAPL, MSFT, NVDA, GOOGL, AIB.IR, LVMH.PA, CRH.L, META, AMZN, BRK.B
ETFs:      VOO, ICLN, IEAG, CSPX, IUIT, VWRL, QQQ, VTI
Bonds:     IEAG, BND
Cash:      CASH
```

### Seed Notes (2–3 per client)

Realistic Irish wealth management context:
```
"Annual Review — March 2026"
  body: "Client considering increasing equity exposure ahead of PIA launch."

"Phone call — PIA query"
  body: "Client called with questions about the new Personal Investment Account announcement."

"Initial onboarding — January 2024"
  body: "Completed full financial review. Agreed on balanced growth strategy."
```

### Seed History (2–3 per client)

```
actionType: "rebalance" — quarterly rebalance, 3–6 months ago
actionType: "deploy_capital" — new funds invested, 6–12 months ago
```

---

## Vercel KV Schema

Only four things change during a demo session.

### KV Keys

```
draft:{clientId}        → DraftPortfolio
notes:{clientId}        → Note[]
history:{clientId}      → HistoryEntry[]
report:{clientId}       → ReportStatus
drift:{clientId}        → DriftOverride
```

### Key Details

**`draft:{clientId}`**
- Created: when advisor first saves edits in Portfolio Action Screen
- Updated: on every subsequent edit (debounced 500ms)
- Also updated: when advisor clicks Send for Approval (status → pending_approval)
- Deleted: on demo reset only
- Absent key = no draft exists for this client

**`notes:{clientId}`**
- Created: when advisor adds first demo note
- Appended: on each subsequent Add Note
- At read time: merged with SEED_NOTES[clientId], sorted descending
- Absent key = no demo notes, show seed notes only

**`history:{clientId}`**
- Created: first action executed for this client during demo
- Appended: on each subsequent action
- At read time: merged with SEED_HISTORY[clientId], sorted descending
- Absent key = no demo history, show seed history only

**`report:{clientId}`**
- Created: when Generate Reports is clicked
- Absent key = status is "pending" by default
- Month: always "2026-03" for demo

**`drift:{clientId}`**
- Created: when advisor first saves a draft (overrides seed draftStartedAt)
- Updated: when Send for Approval clicked, or demo reset
- Absent key = use seed Client.draftStartedAt and sentForApprovalAt as fallback

---

## Read Logic — Merging Seed + KV

### Client Tile Data (Screen 1)
```
1. Load seed CLIENTS[] — instant, in memory
2. Batch fetch drift:{clientId} for all 200 clients from KV
3. Merge: if drift key exists, override seed drift fields
4. Return ClientWithDrift[]
```

### Portfolio Detail (Screens 2, 3)
```
Accepted state:
  seed PORTFOLIOS[clientId] — always source of truth

Proposed state:
  KV draft:{clientId} — null if key absent
```

### Notes (Screen 2 Notes tab)
```
1. Fetch KV notes:{clientId}
2. Merge with SEED_NOTES[clientId]
3. Sort by createdAt descending
```

### History (Screen 2 History tab)
```
1. Fetch KV history:{clientId}
2. Merge with SEED_HISTORY[clientId]
3. Sort by executedAt descending
```

### Reports (Screen 6)
```
1. Load seed CLIENTS[] — instant
2. Batch fetch report:{clientId} for all 200 from KV
3. Merge: if report key exists use KV status, else "pending"
```

---

## API Endpoints

All routes in `app/api/`. TypeScript strict mode. All responses JSON.

### Clients

```
GET /api/clients
  Returns: ClientWithDrift[]
  Logic: seed CLIENTS[] merged with KV drift overrides
  Used by: Screen 1 tile grid

GET /api/clients/search?q={query}
  Returns: ClientWithDrift[]
  Logic: filter seed CLIENTS[] by name or advisor name (case insensitive)
         merge matched clients with KV drift overrides
  Used by: Screen 3a search bar (debounced 300ms on client)

GET /api/clients/[id]
  Returns: ClientWithDrift
  Logic: seed CLIENT merged with KV drift:{id}
  Used by: Screen 2 header, Screen 3a select

GET /api/clients/[id]/next-drifted
  Returns: { clientId: string } | null
  Logic: find next client in same advisor's book
         where driftStatus !== "in_sync"
         excluding current client
         ordered by draftStartedAt ascending (oldest drift first)
  Used by: Screen 2 "Next Drifted Client →", Screen 4 same button
```

### Portfolio

```
GET /api/portfolio/[id]
  Returns: PortfolioResponse { accepted, proposed }
  Logic: accepted from seed, proposed from KV draft:{id} or null
  Used by: Screen 2 portfolio tab, Screen 3b-3f pre-load

PUT /api/portfolio/[id]/draft
  Body: { holdings: Holding[], advisorId: string }
  Logic:
    - if draft:{id} exists in KV: update holdings, preserve draftStartedAt
    - if draft:{id} absent: create with draftStartedAt = now, status = "draft"
    - write drift:{id} = { status: "draft", draftStartedAt, sentForApprovalAt: null }
  Returns: { success: true, draft: DraftPortfolio }
  Used by: Screen 3b-3f — debounced 500ms on weighting change

POST /api/portfolio/[id]/send-approval
  Body: { advisorId: string }
  Logic:
    - update draft:{id}.status = "pending_approval"
    - update draft:{id}.sentForApprovalAt = now
    - update drift:{id}.status = "pending_approval"
    - update drift:{id}.sentForApprovalAt = now
    - does NOT lock — advisor can still edit
  Returns: { success: true, draft: DraftPortfolio }
  Used by: Screen 2 "Send for Approval" button
```

### Notes

```
GET /api/notes/[id]
  Returns: Note[]
  Logic: merge SEED_NOTES[id] + KV notes:{id}, sort descending
  Used by: Screen 2 Notes tab

POST /api/notes/[id]
  Body: { title: string, body: string, advisorId: string }
  Logic:
    - fetch existing KV notes:{id} array (or empty array)
    - append new note with generated id + createdAt = now
    - write back to KV
  Returns: { success: true, note: Note }
  Used by: Screen 2 "Add Note" save button
```

### History

```
GET /api/history/[id]
  Returns: HistoryEntry[]
  Logic: merge SEED_HISTORY[id] + KV history:{id}, sort descending
  Used by: Screen 2 History tab
```

### Reports

```
GET /api/reports
  Returns: Array<ClientWithDrift & { reportStatus: ReportStatus }>
  Logic: seed CLIENTS[] merged with KV report:{clientId}
         default status "pending" if key absent
  Used by: Screen 6 client list

POST /api/reports/generate
  Body: { clientIds: string[] }  // empty array = all 200 clients
  Logic:
    - for each clientId: write report:{clientId} = { status: "generated", generatedAt: now, month: "2026-03" }
  Returns: { success: true, count: number }
  Used by: Screen 6 "Generate Reports for All Clients"
```

### Demo Utility

```
POST /api/demo/reset
  Body: none
  Logic:
    - scan and delete all KV keys matching: draft:*, notes:*, history:*, report:*, drift:*
    - re-seed Seán O'Brien draft: write draft:client_001 with pre-loaded MSFT→NVDA draft
    - re-seed drift:client_001 with draftStartedAt 34 days ago
  Returns: { success: true, message: "Demo reset to initial state" }
  Used by: Settings screen "Reset Demo" button
  Note: hidden from main UI — only accessible in Settings
```

---

## Seed Script — `scripts/seed-kv.ts`

Run once on deployment to populate KV with initial demo state:

```typescript
// scripts/seed-kv.ts
// Run with: npx tsx scripts/seed-kv.ts

// Seeds:
// 1. draft:client_001 — Seán O'Brien pre-loaded MSFT→NVDA draft
// 2. drift:client_001 — draftStartedAt 34 days ago, status: "draft"
// 3. All other clients with red drift (30): drift:{clientId} with 90+ day draftStartedAt
// 4. All other clients with amber drift (50): drift:{clientId} with 30-89 day draftStartedAt
// Green clients (120): no KV keys needed — seed Client.draftStartedAt is null

// Does NOT seed notes or history — those come from seed-data.ts at read time
// Does NOT seed reports — all default to "pending" when key absent
```

---

## Performance Notes

- Screen 1 tile grid: one KV batch read for 200 drift keys + seed data in memory = fast
- Screen 3a search: no KV reads, pure seed data filter = instant
- Screen 2 portfolio: two KV reads (draft + notes) + seed data = fast
- PUT /api/portfolio/[id]/draft: debounced 500ms — one KV write per edit burst
- All KV reads use Promise.all where multiple keys needed — never sequential awaits

---

## Error Handling

All API routes follow this pattern:

```typescript
try {
  // logic
  return NextResponse.json({ success: true, data })
} catch (error) {
  console.error("[route name]", error)
  return NextResponse.json(
    { success: false, error: "Internal server error" },
    { status: 500 }
  )
}
```

KV key absent is not an error — always handle null returns gracefully and fall back to seed data or defaults.

---

## Test Specifications

Write these tests BEFORE implementing the corresponding source code. Every test must fail first, then pass after implementation.

---

### `__tests__/lib/utils.test.ts`

```typescript
import {
  formatCurrency,
  formatAUM,
  formatPerformance,
  formatDate,
  formatWeighting,
  driftDays,
  driftLabel,
} from '@/lib/utils'

describe('formatCurrency', () => {
  it('formats whole numbers with € prefix and comma separator', () => {
    expect(formatCurrency(428500)).toBe('€428,500')
  })
  it('formats millions correctly', () => {
    expect(formatCurrency(2106400)).toBe('€2,106,400')
  })
  it('formats decimals to 2 places', () => {
    expect(formatCurrency(428500.50)).toBe('€428,500.50')
  })
  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('€0')
  })
})

describe('formatAUM', () => {
  it('formats millions with m suffix', () => {
    expect(formatAUM(142000000)).toBe('€142m')
  })
  it('formats partial millions with one decimal', () => {
    expect(formatAUM(18400000)).toBe('€18.4m')
  })
})

describe('formatPerformance', () => {
  it('shows up arrow for positive values', () => {
    expect(formatPerformance(2.4)).toBe('↑ 2.4%')
  })
  it('shows down arrow for negative values', () => {
    expect(formatPerformance(-0.8)).toBe('↓ 0.8%')
  })
  it('shows dash for zero', () => {
    expect(formatPerformance(0)).toBe('— 0.0%')
  })
})

describe('formatDate', () => {
  it('formats ISO date to DD Mon YYYY', () => {
    expect(formatDate('2026-01-12')).toBe('12 Jan 2026')
  })
  it('formats single digit days without padding', () => {
    expect(formatDate('2026-03-02')).toBe('02 Mar 2026')
  })
})

describe('formatWeighting', () => {
  it('always shows one decimal place', () => {
    expect(formatWeighting(20)).toBe('20.0%')
    expect(formatWeighting(9.5)).toBe('9.5%')
  })
})

describe('driftDays', () => {
  it('returns null for null input', () => {
    expect(driftDays(null)).toBeNull()
  })
  it('returns correct number of days from ISO date', () => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    expect(driftDays(thirtyDaysAgo.toISOString())).toBe(30)
  })
})

describe('driftLabel', () => {
  it('returns In sync when no draft', () => {
    expect(driftLabel(null, null)).toBe('In sync')
  })
  it('returns Draft X days when draft exists and not sent', () => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 34)
    expect(driftLabel(thirtyDaysAgo.toISOString(), null)).toBe('Draft 34 days')
  })
  it('returns Awaiting approval when sent', () => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 34)
    expect(driftLabel(thirtyDaysAgo.toISOString(), new Date().toISOString())).toBe('Awaiting approval')
  })
})
```

---

### `__tests__/lib/seed-data.test.ts`

```typescript
import { CLIENTS, ADVISORS, PORTFOLIOS, SEED_NOTES, SEED_HISTORY } from '@/lib/seed-data'

describe('ADVISORS', () => {
  it('contains exactly 7 advisors', () => {
    expect(ADVISORS).toHaveLength(7)
  })
  it('includes Andrew Collins as Director', () => {
    const andrew = ADVISORS.find(a => a.id === 'advisor_andrew')
    expect(andrew).toBeDefined()
    expect(andrew?.title).toBe('Director')
  })
  it('every advisor has required fields', () => {
    ADVISORS.forEach(advisor => {
      expect(advisor.id).toBeTruthy()
      expect(advisor.name).toBeTruthy()
      expect(advisor.title).toBeTruthy()
      expect(advisor.initials).toHaveLength(2)
    })
  })
})

describe('CLIENTS', () => {
  it('contains exactly 200 clients', () => {
    expect(CLIENTS).toHaveLength(200)
  })
  it('every client has a valid advisorId', () => {
    const advisorIds = ADVISORS.map(a => a.id)
    CLIENTS.forEach(client => {
      expect(advisorIds).toContain(client.advisorId)
    })
  })
  it('Andrew has the most clients', () => {
    const counts = ADVISORS.map(a => ({
      id: a.id,
      count: CLIENTS.filter(c => c.advisorId === a.id).length
    }))
    const andrew = counts.find(c => c.id === 'advisor_andrew')
    counts.forEach(c => {
      if (c.id !== 'advisor_andrew') {
        expect(andrew!.count).toBeGreaterThanOrEqual(c.count)
      }
    })
  })
  it('client_001 is Seán O\'Brien with pre-seeded draft', () => {
    const sean = CLIENTS.find(c => c.id === 'client_001')
    expect(sean?.name).toBe("Seán O'Brien")
    expect(sean?.draftStartedAt).not.toBeNull()
  })
  it('has correct drift distribution', () => {
    const green = CLIENTS.filter(c => c.draftStartedAt === null).length
    const drifted = CLIENTS.filter(c => c.draftStartedAt !== null).length
    expect(green).toBeGreaterThanOrEqual(100)
    expect(drifted).toBeGreaterThanOrEqual(70)
  })
})

describe('PORTFOLIOS', () => {
  it('has a portfolio for every client', () => {
    expect(Object.keys(PORTFOLIOS)).toHaveLength(200)
  })
  it('every portfolio weightings sum to 100', () => {
    Object.entries(PORTFOLIOS).forEach(([clientId, portfolio]) => {
      const total = portfolio.holdings.reduce((sum, h) => sum + h.currentWeighting, 0)
      expect(Math.round(total)).toBe(100)
    })
  })
  it('every portfolio has cash holding', () => {
    Object.values(PORTFOLIOS).forEach(portfolio => {
      const cash = portfolio.holdings.find(h => h.assetClass === 'cash')
      expect(cash).toBeDefined()
    })
  })
  it('every portfolio has 8-12 holdings', () => {
    Object.values(PORTFOLIOS).forEach(portfolio => {
      expect(portfolio.holdings.length).toBeGreaterThanOrEqual(8)
      expect(portfolio.holdings.length).toBeLessThanOrEqual(12)
    })
  })
  it('client_001 has MSFT and NVDA with different current and target weightings', () => {
    const portfolio = PORTFOLIOS['client_001']
    const msft = portfolio.holdings.find(h => h.ticker === 'MSFT')
    const nvda = portfolio.holdings.find(h => h.ticker === 'NVDA')
    expect(msft?.currentWeighting).not.toBe(msft?.targetWeighting)
    expect(nvda?.currentWeighting).not.toBe(nvda?.targetWeighting)
  })
})

describe('SEED_NOTES', () => {
  it('has notes for every client', () => {
    CLIENTS.forEach(client => {
      expect(SEED_NOTES[client.id]).toBeDefined()
      expect(SEED_NOTES[client.id].length).toBeGreaterThanOrEqual(2)
    })
  })
})

describe('SEED_HISTORY', () => {
  it('has history for every client', () => {
    CLIENTS.forEach(client => {
      expect(SEED_HISTORY[client.id]).toBeDefined()
      expect(SEED_HISTORY[client.id].length).toBeGreaterThanOrEqual(2)
    })
  })
})
```

---

### `__tests__/api/clients.test.ts`

```typescript
import { GET } from '@/app/api/clients/route'
import { GET as getById } from '@/app/api/clients/[id]/route'
import { GET as search } from '@/app/api/clients/search/route'
import { GET as nextDrifted } from '@/app/api/clients/[id]/next-drifted/route'
import { NextRequest } from 'next/server'

describe('GET /api/clients', () => {
  it('returns 200 with array of 200 clients', async () => {
    const req = new NextRequest('http://localhost/api/clients')
    const res = await GET(req)
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data).toHaveLength(200)
  })
  it('every client has required tile fields', async () => {
    const req = new NextRequest('http://localhost/api/clients')
    const res = await GET(req)
    const data = await res.json()
    data.forEach((client: any) => {
      expect(client.id).toBeTruthy()
      expect(client.name).toBeTruthy()
      expect(client.advisorId).toBeTruthy()
      expect(client.totalValue).toBeGreaterThan(0)
      expect(client.driftStatus).toBeDefined()
    })
  })
  it('uses KV drift override when present', async () => {
    // seed KV drift for client_001
    await setTestKV('drift:client_001', {
      status: 'pending_approval',
      draftStartedAt: new Date().toISOString(),
      sentForApprovalAt: new Date().toISOString(),
    })
    const req = new NextRequest('http://localhost/api/clients')
    const res = await GET(req)
    const data = await res.json()
    const sean = data.find((c: any) => c.id === 'client_001')
    expect(sean.driftStatus).toBe('pending_approval')
  })
  it('falls back to seed drift when KV key absent', async () => {
    // client_001 has draftStartedAt in seed — amber
    const req = new NextRequest('http://localhost/api/clients')
    const res = await GET(req)
    const data = await res.json()
    const sean = data.find((c: any) => c.id === 'client_001')
    expect(sean.driftStatus).toBe('draft')
  })
})

describe('GET /api/clients/search', () => {
  it('returns matching clients by name', async () => {
    const req = new NextRequest("http://localhost/api/clients/search?q=O'Brien")
    const res = await search(req)
    const data = await res.json()
    expect(data.length).toBeGreaterThan(0)
    expect(data[0].name).toContain("O'Brien")
  })
  it('returns matching clients by advisor name', async () => {
    const req = new NextRequest('http://localhost/api/clients/search?q=Tom+Clinch')
    const res = await search(req)
    const data = await res.json()
    expect(data.length).toBeGreaterThan(0)
    data.forEach((c: any) => expect(c.advisorId).toBe('advisor_tom'))
  })
  it('returns empty array for no match', async () => {
    const req = new NextRequest('http://localhost/api/clients/search?q=zzznomatch')
    const res = await search(req)
    const data = await res.json()
    expect(data).toHaveLength(0)
  })
  it('returns 400 for missing query', async () => {
    const req = new NextRequest('http://localhost/api/clients/search')
    const res = await search(req)
    expect(res.status).toBe(400)
  })
})

describe('GET /api/clients/[id]', () => {
  it('returns 200 with client data', async () => {
    const req = new NextRequest('http://localhost/api/clients/client_001')
    const res = await getById(req, { params: { id: 'client_001' } })
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.id).toBe('client_001')
    expect(data.name).toBe("Seán O'Brien")
  })
  it('returns 404 for unknown client', async () => {
    const req = new NextRequest('http://localhost/api/clients/unknown_id')
    const res = await getById(req, { params: { id: 'unknown_id' } })
    expect(res.status).toBe(404)
  })
})

describe('GET /api/clients/[id]/next-drifted', () => {
  it('returns next drifted client in same advisor book', async () => {
    const req = new NextRequest('http://localhost/api/clients/client_001/next-drifted')
    const res = await nextDrifted(req, { params: { id: 'client_001' } })
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.clientId).toBeTruthy()
    expect(data.clientId).not.toBe('client_001')
  })
  it('returns null when no more drifted clients', async () => {
    // clear all drift — no drifted clients remain
    // depends on test setup clearing KV and using all-green seed
    // implementation specific — adjust based on seed data
  })
})
```

---

### `__tests__/api/portfolio.test.ts`

```typescript
import { GET } from '@/app/api/portfolio/[id]/route'
import { PUT } from '@/app/api/portfolio/[id]/draft/route'
import { POST } from '@/app/api/portfolio/[id]/send-approval/route'
import { NextRequest } from 'next/server'

describe('GET /api/portfolio/[id]', () => {
  it('returns accepted state from seed and null proposed when no draft', async () => {
    const req = new NextRequest('http://localhost/api/portfolio/client_002')
    const res = await GET(req, { params: { id: 'client_002' } })
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.accepted).toBeDefined()
    expect(data.accepted.holdings.length).toBeGreaterThan(0)
    expect(data.proposed).toBeNull()
  })
  it('returns proposed state from KV when draft exists', async () => {
    await setTestKV('draft:client_002', {
      clientId: 'client_002',
      holdings: [],
      status: 'draft',
      draftStartedAt: new Date().toISOString(),
      sentForApprovalAt: null,
      advisorId: 'advisor_andrew',
    })
    const req = new NextRequest('http://localhost/api/portfolio/client_002')
    const res = await GET(req, { params: { id: 'client_002' } })
    const data = await res.json()
    expect(data.proposed).not.toBeNull()
    expect(data.proposed.status).toBe('draft')
  })
  it('returns 404 for unknown client', async () => {
    const req = new NextRequest('http://localhost/api/portfolio/unknown')
    const res = await GET(req, { params: { id: 'unknown' } })
    expect(res.status).toBe(404)
  })
})

describe('PUT /api/portfolio/[id]/draft', () => {
  it('creates draft with draftStartedAt on first save', async () => {
    const req = new NextRequest('http://localhost/api/portfolio/client_003/draft', {
      method: 'PUT',
      body: JSON.stringify({
        holdings: [
          { ticker: 'AAPL', targetWeighting: 25.0 },
          { ticker: 'MSFT', targetWeighting: 75.0 },
        ],
        advisorId: 'advisor_andrew',
      }),
    })
    const res = await PUT(req, { params: { id: 'client_003' } })
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.draft.draftStartedAt).toBeTruthy()
    expect(data.draft.status).toBe('draft')
  })
  it('preserves draftStartedAt on subsequent saves', async () => {
    const original = new Date(Date.now() - 86400000).toISOString() // 1 day ago
    await setTestKV('draft:client_003', {
      clientId: 'client_003',
      holdings: [],
      status: 'draft',
      draftStartedAt: original,
      sentForApprovalAt: null,
      advisorId: 'advisor_andrew',
    })
    const req = new NextRequest('http://localhost/api/portfolio/client_003/draft', {
      method: 'PUT',
      body: JSON.stringify({ holdings: [], advisorId: 'advisor_andrew' }),
    })
    const res = await PUT(req, { params: { id: 'client_003' } })
    const data = await res.json()
    expect(data.draft.draftStartedAt).toBe(original)
  })
  it('returns 400 for missing holdings', async () => {
    const req = new NextRequest('http://localhost/api/portfolio/client_003/draft', {
      method: 'PUT',
      body: JSON.stringify({ advisorId: 'advisor_andrew' }),
    })
    const res = await PUT(req, { params: { id: 'client_003' } })
    expect(res.status).toBe(400)
  })
})

describe('POST /api/portfolio/[id]/send-approval', () => {
  it('sets status to pending_approval and records sentForApprovalAt', async () => {
    await setTestKV('draft:client_004', {
      clientId: 'client_004',
      holdings: [],
      status: 'draft',
      draftStartedAt: new Date().toISOString(),
      sentForApprovalAt: null,
      advisorId: 'advisor_andrew',
    })
    const req = new NextRequest('http://localhost/api/portfolio/client_004/send-approval', {
      method: 'POST',
      body: JSON.stringify({ advisorId: 'advisor_andrew' }),
    })
    const res = await POST(req, { params: { id: 'client_004' } })
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.draft.status).toBe('pending_approval')
    expect(data.draft.sentForApprovalAt).toBeTruthy()
  })
  it('does not lock draft — can still be edited after send', async () => {
    // After send-approval, PUT draft should still succeed
    await setTestKV('draft:client_004', {
      clientId: 'client_004',
      holdings: [],
      status: 'pending_approval',
      draftStartedAt: new Date().toISOString(),
      sentForApprovalAt: new Date().toISOString(),
      advisorId: 'advisor_andrew',
    })
    const req = new NextRequest('http://localhost/api/portfolio/client_004/draft', {
      method: 'PUT',
      body: JSON.stringify({ holdings: [], advisorId: 'advisor_andrew' }),
    })
    const res = await PUT(req, { params: { id: 'client_004' } })
    expect(res.status).toBe(200)
  })
  it('returns 404 when no draft exists', async () => {
    const req = new NextRequest('http://localhost/api/portfolio/client_005/send-approval', {
      method: 'POST',
      body: JSON.stringify({ advisorId: 'advisor_andrew' }),
    })
    const res = await POST(req, { params: { id: 'client_005' } })
    expect(res.status).toBe(404)
  })
})
```

---

### `__tests__/api/notes.test.ts`

```typescript
import { GET, POST } from '@/app/api/notes/[id]/route'
import { NextRequest } from 'next/server'

describe('GET /api/notes/[id]', () => {
  it('returns seed notes when no KV notes exist', async () => {
    const req = new NextRequest('http://localhost/api/notes/client_001')
    const res = await GET(req, { params: { id: 'client_001' } })
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.length).toBeGreaterThanOrEqual(2)
  })
  it('merges KV notes with seed notes sorted by date descending', async () => {
    await setTestKV('notes:client_001', [{
      id: 'demo_note_1',
      clientId: 'client_001',
      title: 'Demo note',
      body: 'Added during demo',
      advisorId: 'advisor_andrew',
      createdAt: new Date().toISOString(),
    }])
    const req = new NextRequest('http://localhost/api/notes/client_001')
    const res = await GET(req, { params: { id: 'client_001' } })
    const data = await res.json()
    // Demo note is newest — should be first
    expect(data[0].id).toBe('demo_note_1')
    // Seed notes also present
    expect(data.length).toBeGreaterThan(1)
  })
})

describe('POST /api/notes/[id]', () => {
  it('appends note to KV and returns it', async () => {
    const req = new NextRequest('http://localhost/api/notes/client_001', {
      method: 'POST',
      body: JSON.stringify({
        title: 'New note',
        body: 'Note body text',
        advisorId: 'advisor_andrew',
      }),
    })
    const res = await POST(req, { params: { id: 'client_001' } })
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.note.title).toBe('New note')
    expect(data.note.createdAt).toBeTruthy()
  })
  it('returns 400 for missing title or body', async () => {
    const req = new NextRequest('http://localhost/api/notes/client_001', {
      method: 'POST',
      body: JSON.stringify({ advisorId: 'advisor_andrew' }),
    })
    const res = await POST(req, { params: { id: 'client_001' } })
    expect(res.status).toBe(400)
  })
})
```

---

### `__tests__/api/reports.test.ts`

```typescript
import { GET } from '@/app/api/reports/route'
import { POST } from '@/app/api/reports/generate/route'
import { NextRequest } from 'next/server'

describe('GET /api/reports', () => {
  it('returns all 200 clients with default pending status', async () => {
    const req = new NextRequest('http://localhost/api/reports')
    const res = await GET(req)
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data).toHaveLength(200)
    data.forEach((r: any) => expect(r.reportStatus.status).toBe('pending'))
  })
  it('returns generated status for clients in KV', async () => {
    await setTestKV('report:client_001', {
      status: 'generated',
      generatedAt: new Date().toISOString(),
      month: '2026-03',
    })
    const req = new NextRequest('http://localhost/api/reports')
    const res = await GET(req)
    const data = await res.json()
    const sean = data.find((r: any) => r.id === 'client_001')
    expect(sean.reportStatus.status).toBe('generated')
  })
})

describe('POST /api/reports/generate', () => {
  it('marks all clients as generated when empty clientIds', async () => {
    const req = new NextRequest('http://localhost/api/reports/generate', {
      method: 'POST',
      body: JSON.stringify({ clientIds: [] }),
    })
    const res = await POST(req)
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.count).toBe(200)
  })
  it('marks only specified clients as generated', async () => {
    const req = new NextRequest('http://localhost/api/reports/generate', {
      method: 'POST',
      body: JSON.stringify({ clientIds: ['client_001', 'client_002'] }),
    })
    const res = await POST(req)
    const data = await res.json()
    expect(data.count).toBe(2)
  })
})
```

---

### `__tests__/api/demo-reset.test.ts`

```typescript
import { POST } from '@/app/api/demo/reset/route'
import { NextRequest } from 'next/server'

describe('POST /api/demo/reset', () => {
  it('clears all mutable KV state', async () => {
    // Seed some KV state
    await setTestKV('draft:client_002', { status: 'draft' })
    await setTestKV('notes:client_002', [{ id: 'n1' }])
    await setTestKV('history:client_002', [{ id: 'h1' }])
    await setTestKV('report:client_002', { status: 'generated' })
    await setTestKV('drift:client_002', { status: 'in_sync' })

    const req = new NextRequest('http://localhost/api/demo/reset', { method: 'POST' })
    const res = await POST(req)
    expect(res.status).toBe(200)

    // All KV state cleared
    expect(await getTestKV('draft:client_002')).toBeNull()
    expect(await getTestKV('notes:client_002')).toBeNull()
    expect(await getTestKV('history:client_002')).toBeNull()
    expect(await getTestKV('report:client_002')).toBeNull()
    expect(await getTestKV('drift:client_002')).toBeNull()
  })

  it('re-seeds Seán O\'Brien draft after reset', async () => {
    const req = new NextRequest('http://localhost/api/demo/reset', { method: 'POST' })
    await POST(req)

    const draft = await getTestKV('draft:client_001')
    expect(draft).not.toBeNull()
    expect(draft.status).toBe('draft')
    expect(draft.clientId).toBe('client_001')
  })

  it('re-seeds drift for client_001 with 34 day draftStartedAt', async () => {
    const req = new NextRequest('http://localhost/api/demo/reset', { method: 'POST' })
    await POST(req)

    const drift = await getTestKV('drift:client_001')
    expect(drift).not.toBeNull()
    expect(drift.status).toBe('draft')
    const days = driftDays(drift.draftStartedAt)
    expect(days).toBeGreaterThanOrEqual(33)
    expect(days).toBeLessThanOrEqual(35)
  })

  it('returns success message', async () => {
    const req = new NextRequest('http://localhost/api/demo/reset', { method: 'POST' })
    const res = await POST(req)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.message).toBeTruthy()
  })
})
```
