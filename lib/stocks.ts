export interface Stock {
  ticker: string;
  name: string;
  exchange: string;
  price: number;
  sector: string;
}

export const STOCKS: Stock[] = [
  { ticker: "AAPL", name: "Apple", exchange: "NASDAQ", price: 189.3, sector: "Technology" },
  { ticker: "MSFT", name: "Microsoft", exchange: "NASDAQ", price: 415.2, sector: "Technology" },
  { ticker: "NVDA", name: "Nvidia", exchange: "NASDAQ", price: 875.4, sector: "Technology" },
  { ticker: "AMZN", name: "Amazon", exchange: "NASDAQ", price: 186.7, sector: "Consumer Discretionary" },
  { ticker: "META", name: "Meta Platforms", exchange: "NASDAQ", price: 512.6, sector: "Technology" },
  { ticker: "GOOGL", name: "Alphabet", exchange: "NASDAQ", price: 172.3, sector: "Technology" },
  { ticker: "TSLA", name: "Tesla", exchange: "NASDAQ", price: 248.9, sector: "Consumer Discretionary" },
  { ticker: "BRK.B", name: "Berkshire Hathaway", exchange: "NYSE", price: 394.5, sector: "Financials" },
  { ticker: "JPM", name: "JPMorgan Chase", exchange: "NYSE", price: 210.1, sector: "Financials" },
  { ticker: "JNJ", name: "Johnson & Johnson", exchange: "NYSE", price: 155.8, sector: "Healthcare" },
  { ticker: "V", name: "Visa", exchange: "NYSE", price: 279.4, sector: "Financials" },
  { ticker: "UNH", name: "UnitedHealth", exchange: "NYSE", price: 523.7, sector: "Healthcare" },
  { ticker: "MA", name: "Mastercard", exchange: "NYSE", price: 467.2, sector: "Financials" },
  { ticker: "PG", name: "Procter & Gamble", exchange: "NYSE", price: 164.9, sector: "Consumer Staples" },
  { ticker: "AVGO", name: "Broadcom", exchange: "NASDAQ", price: 1372.0, sector: "Technology" },
  { ticker: "COST", name: "Costco", exchange: "NASDAQ", price: 875.6, sector: "Consumer Staples" },
  { ticker: "NFLX", name: "Netflix", exchange: "NASDAQ", price: 632.4, sector: "Communication Services" },
  { ticker: "ADBE", name: "Adobe", exchange: "NASDAQ", price: 478.3, sector: "Technology" },
  { ticker: "AMD", name: "AMD", exchange: "NASDAQ", price: 172.8, sector: "Technology" },
  { ticker: "KO", name: "Coca-Cola", exchange: "NYSE", price: 61.4, sector: "Consumer Staples" },
  { ticker: "CRM", name: "Salesforce", exchange: "NYSE", price: 298.7, sector: "Technology" },
  { ticker: "CSCO", name: "Cisco", exchange: "NASDAQ", price: 49.3, sector: "Technology" },
  { ticker: "MRK", name: "Merck", exchange: "NYSE", price: 128.6, sector: "Healthcare" },
  { ticker: "PEP", name: "PepsiCo", exchange: "NASDAQ", price: 171.2, sector: "Consumer Staples" },
  { ticker: "QCOM", name: "Qualcomm", exchange: "NASDAQ", price: 162.5, sector: "Technology" },
  { ticker: "DIS", name: "Disney", exchange: "NYSE", price: 112.4, sector: "Communication Services" },
  { ticker: "INTC", name: "Intel", exchange: "NASDAQ", price: 31.7, sector: "Technology" },
  { ticker: "NKE", name: "Nike", exchange: "NYSE", price: 94.8, sector: "Consumer Discretionary" },
  { ticker: "GS", name: "Goldman Sachs", exchange: "NYSE", price: 487.3, sector: "Financials" },
  { ticker: "IBM", name: "IBM", exchange: "NYSE", price: 182.6, sector: "Technology" },
];
