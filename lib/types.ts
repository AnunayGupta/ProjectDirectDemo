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
  currentWeighting: number
  targetWeighting: number
  value: number
  performance: number
  purchasedAt?: string
}

export type Client = {
  id: string
  name: string
  advisorId: string
  totalValue: number
  monthlyPerformance: number
  lastRebalanced: string
  draftStartedAt: string | null
  sentForApprovalAt: string | null
  noteCount: number
  lastReviewedAt?: string | null
}

export type AcceptedPortfolio = {
  clientId: string
  holdings: Holding[]
  totalValue: number
  lastUpdated?: string
}

export type DraftPortfolio = {
  clientId: string
  holdings: Holding[]
  status: "draft" | "pending_approval"
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
  createdAt: string
}

export type HistoryEntry = {
  id: string
  clientId: string
  actionType: "rebalance" | "add_instrument" | "remove_instrument" | "deploy_capital" | "withdraw" | "rebalance_proposed"
  trades: Array<{
    side: "buy" | "sell"
    ticker: string
    name?: string
    amount: number
  }>
  advisorId: string
  executedAt: string
  totalValue: number
}

export type ReportStatus = {
  status: "generated" | "pending"
  generatedAt: string | null
  month: string
}

export type DriftOverride = {
  status: "in_sync" | "draft" | "pending_approval"
  draftStartedAt: string | null
  sentForApprovalAt: string | null
}

export type ClientWithDrift = Client & {
  driftStatus: "in_sync" | "draft" | "pending_approval"
}

export type PortfolioResponse = {
  accepted: AcceptedPortfolio
  proposed: DraftPortfolio | null
}
