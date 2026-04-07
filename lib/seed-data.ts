import { Advisor, Client, AcceptedPortfolio, Holding, Note, HistoryEntry } from './types'

import seedData from './static-seed.json'

export const ADVISORS: Advisor[] = seedData.ADVISORS as Advisor[]
export const CLIENTS: Client[] = seedData.CLIENTS as Client[]
export const ASSET_UNIVERSE = seedData.ASSET_UNIVERSE as any[]
export const PORTFOLIOS: Record<string, AcceptedPortfolio> = seedData.PORTFOLIOS as Record<string, AcceptedPortfolio>
export const SEED_NOTES: Record<string, Note[]> = seedData.SEED_NOTES as Record<string, Note[]>
export const SEED_HISTORY: Record<string, HistoryEntry[]> = seedData.SEED_HISTORY as unknown as Record<string, HistoryEntry[]>
