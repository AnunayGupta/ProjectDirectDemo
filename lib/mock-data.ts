// Static mock data for analytics, charts, and demo pre-seeding

export const DEMO_FIRM_ID = "demo-firm-001";
export const DEMO_STRATEGY_IDS = ["strategy-001", "strategy-002", "strategy-003"];

export const PERFORMANCE_DATA = [
  { month: "Apr", portfolio: 0, benchmark: 0 },
  { month: "May", portfolio: 2.1, benchmark: 1.4 },
  { month: "Jun", portfolio: 1.8, benchmark: 2.2 },
  { month: "Jul", portfolio: 4.5, benchmark: 3.1 },
  { month: "Aug", portfolio: 3.9, benchmark: 2.8 },
  { month: "Sep", portfolio: 6.2, benchmark: 4.5 },
  { month: "Oct", portfolio: 5.8, benchmark: 4.9 },
  { month: "Nov", portfolio: 8.4, benchmark: 5.6 },
  { month: "Dec", portfolio: 10.1, benchmark: 7.2 },
  { month: "Jan", portfolio: 9.7, benchmark: 6.8 },
  { month: "Feb", portfolio: 12.3, benchmark: 8.1 },
  { month: "Mar", portfolio: 14.7, benchmark: 9.4 },
];

export const SUBSCRIBER_DATA = [
  { month: "Apr", count: 0 },
  { month: "May", count: 3 },
  { month: "Jun", count: 7 },
  { month: "Jul", count: 12 },
  { month: "Aug", count: 18 },
  { month: "Sep", count: 24 },
  { month: "Oct", count: 31 },
  { month: "Nov", count: 45 },
  { month: "Dec", count: 52 },
  { month: "Jan", count: 61 },
  { month: "Feb", count: 74 },
  { month: "Mar", count: 89 },
];

export const SAWTOOTH_DATA = Array.from({ length: 52 }, (_, i) => {
  const base = 10000;
  const trend = i * 28;
  const noise = Math.sin(i * 0.8) * 120 + Math.cos(i * 0.4) * 80;
  const dip = i % 13 === 12 ? -350 : 0;
  return {
    week: i + 1,
    value: Math.round(base + trend + noise + dip),
  };
});

export const MOCK_STRATEGIES = [
  {
    id: "strategy-001",
    firmId: DEMO_FIRM_ID,
    name: "Elevate US Prime 30",
    description:
      "A concentrated basket of America's 30 most impactful companies, engineered for long-term capital appreciation with direct indexing tax efficiency.",
    riskCategory: "growth" as const,
    minInvestment: 1000,
    holdings: [
      { ticker: "AAPL", name: "Apple", weighting: 12 },
      { ticker: "MSFT", name: "Microsoft", weighting: 11 },
      { ticker: "NVDA", name: "Nvidia", weighting: 10 },
      { ticker: "AMZN", name: "Amazon", weighting: 8 },
      { ticker: "META", name: "Meta Platforms", weighting: 7 },
      { ticker: "GOOGL", name: "Alphabet", weighting: 7 },
      { ticker: "TSLA", name: "Tesla", weighting: 5 },
      { ticker: "BRK.B", name: "Berkshire Hathaway", weighting: 5 },
      { ticker: "JPM", name: "JPMorgan Chase", weighting: 5 },
      { ticker: "V", name: "Visa", weighting: 4 },
      { ticker: "UNH", name: "UnitedHealth", weighting: 4 },
      { ticker: "MA", name: "Mastercard", weighting: 4 },
      { ticker: "AVGO", name: "Broadcom", weighting: 4 },
      { ticker: "NFLX", name: "Netflix", weighting: 3 },
      { ticker: "CRM", name: "Salesforce", weighting: 3 },
      { ticker: "COST", name: "Costco", weighting: 3 },
      { ticker: "ADBE", name: "Adobe", weighting: 2 },
      { ticker: "AMD", name: "AMD", weighting: 2 },
      { ticker: "GS", name: "Goldman Sachs", weighting: 1 },
    ],
    status: "live" as const,
    createdAt: "2025-04-01T09:00:00Z",
    lastRebalanced: "2026-03-01T09:00:00Z",
    subscribers: 89,
    aum: 1240000,
    ytdPerformance: 14.7,
  },
  {
    id: "strategy-002",
    firmId: DEMO_FIRM_ID,
    name: "Dividend Fortress",
    description:
      "High-conviction dividend payers selected for yield stability and consistent capital return. Ideal for income-focused investors.",
    riskCategory: "conservative" as const,
    minInvestment: 5000,
    holdings: [
      { ticker: "JNJ", name: "Johnson & Johnson", weighting: 15 },
      { ticker: "PG", name: "Procter & Gamble", weighting: 15 },
      { ticker: "KO", name: "Coca-Cola", weighting: 12 },
      { ticker: "PEP", name: "PepsiCo", weighting: 12 },
      { ticker: "V", name: "Visa", weighting: 10 },
      { ticker: "MA", name: "Mastercard", weighting: 10 },
      { ticker: "JPM", name: "JPMorgan Chase", weighting: 8 },
      { ticker: "IBM", name: "IBM", weighting: 8 },
      { ticker: "CSCO", name: "Cisco", weighting: 5 },
      { ticker: "MRK", name: "Merck", weighting: 5 },
    ],
    status: "live" as const,
    createdAt: "2025-05-15T09:00:00Z",
    lastRebalanced: "2026-02-15T09:00:00Z",
    subscribers: 54,
    aum: 820000,
    ytdPerformance: 7.2,
  },
  {
    id: "strategy-003",
    firmId: DEMO_FIRM_ID,
    name: "Tech Frontier",
    description:
      "Aggressive exposure to the frontier of technology — AI, semiconductors, and cloud infrastructure — for high-conviction growth investors.",
    riskCategory: "aggressive" as const,
    minInvestment: 2500,
    holdings: [
      { ticker: "NVDA", name: "Nvidia", weighting: 20 },
      { ticker: "MSFT", name: "Microsoft", weighting: 18 },
      { ticker: "AAPL", name: "Apple", weighting: 15 },
      { ticker: "AVGO", name: "Broadcom", weighting: 12 },
      { ticker: "AMD", name: "AMD", weighting: 10 },
      { ticker: "META", name: "Meta Platforms", weighting: 10 },
      { ticker: "ADBE", name: "Adobe", weighting: 7 },
      { ticker: "CRM", name: "Salesforce", weighting: 5 },
      { ticker: "QCOM", name: "Qualcomm", weighting: 3 },
    ],
    status: "live" as const,
    createdAt: "2025-07-01T09:00:00Z",
    lastRebalanced: "2026-03-10T09:00:00Z",
    subscribers: 41,
    aum: 560000,
    ytdPerformance: 22.1,
  },
];

export const MOCK_FIRM = {
  id: DEMO_FIRM_ID,
  legalName: "Elevate Capital Management Ltd.",
  displayName: "Elevate Capital",
  logoUrl: "",
  accentColor: "#10b77f",
  bio: "We believe every investor deserves institutional-grade portfolio construction. Elevate Capital brings direct indexing — once reserved for ultra-high-net-worth clients — to everyone.",
  advisorName: "Alexandra Chen",
  advisorTitle: "Chief Investment Officer",
  advisorPhoto: "",
  status: "approved" as const,
};

export const MOCK_BROADCASTS = [
  {
    id: "broadcast-001",
    strategyId: "strategy-001",
    firmId: DEMO_FIRM_ID,
    title: "Q1 2026 Rebalance Complete",
    body: "We've completed our quarterly rebalance of the Elevate US Prime 30 strategy. Key changes: increased NVDA by 2%, reduced TSLA by 1%, added GS at 1%. The portfolio remains positioned for continued AI-driven growth while maintaining broad diversification across the US large-cap universe.",
    createdAt: "2026-03-01T10:00:00Z",
    readCount: 67,
  },
  {
    id: "broadcast-002",
    strategyId: "strategy-001",
    firmId: DEMO_FIRM_ID,
    title: "Market Commentary: AI Supercycle",
    body: "The artificial intelligence investment cycle continues to accelerate. Our holdings in NVDA, MSFT, and META are positioned at the epicentre of this transformation. We remain constructive on tech through 2026.",
    createdAt: "2026-02-15T10:00:00Z",
    readCount: 82,
  },
];
