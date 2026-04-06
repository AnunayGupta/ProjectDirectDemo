import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Holding {
  ticker: string;
  name: string;
  weighting: number;
}

export interface Strategy {
  id: string;
  firmId: string;
  name: string;
  description: string;
  riskCategory: "conservative" | "balanced" | "growth" | "aggressive";
  minInvestment: number;
  holdings: Holding[];
  status: "draft" | "live" | "paused";
  createdAt: string;
  lastRebalanced: string;
  subscribers: number;
  aum: number;
  ytdPerformance: number;
}

export interface Firm {
  id: string;
  legalName: string;
  displayName: string;
  logoUrl: string;
  accentColor: string;
  bio: string;
  advisorName: string;
  advisorTitle: string;
  advisorPhoto: string;
  status: "pending" | "approved" | "rejected";
}

export interface Broadcast {
  id: string;
  strategyId: string;
  firmId: string;
  title: string;
  body: string;
  createdAt: string;
  readCount: number;
}

export interface PortfolioPosition {
  strategyId: string;
  strategyName: string;
  invested: number;
  currentValue: number;
  performance: number;
}

const DEFAULT_DRAFT: Partial<Strategy> = {
  riskCategory: "growth",
  minInvestment: 1000,
  holdings: [],
  status: "draft",
};

interface AppState {
  // WM Portal state
  draftStrategy: Partial<Strategy>;
  builderStep: number;
  setDraftStrategy: (partial: Partial<Strategy>) => void;
  setBuilderStep: (step: number) => void;
  clearDraftStrategy: () => void;

  // Consumer app state
  portfolio: PortfolioPosition[];
  addPosition: (position: PortfolioPosition) => void;

  // UI state
  isPublishing: boolean;
  setIsPublishing: (v: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      draftStrategy: DEFAULT_DRAFT,
      builderStep: 0,
      setDraftStrategy: (partial) =>
        set((s) => ({ draftStrategy: { ...s.draftStrategy, ...partial } })),
      setBuilderStep: (step) => set({ builderStep: step }),
      clearDraftStrategy: () =>
        set({ draftStrategy: DEFAULT_DRAFT, builderStep: 0 }),

      portfolio: [],
      addPosition: (position) =>
        set((s) => ({
          portfolio: [
            ...s.portfolio.filter((p) => p.strategyId !== position.strategyId),
            position,
          ],
        })),

      isPublishing: false,
      setIsPublishing: (v) => set({ isPublishing: v }),
    }),
    {
      name: "project-direct-store",
      partialize: (state) => ({
        draftStrategy: state.draftStrategy,
        builderStep: state.builderStep,
        portfolio: state.portfolio,
      }),
    }
  )
);
