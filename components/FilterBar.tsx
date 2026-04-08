import { ADVISORS } from '@/lib/seed-data'

export const DRIFT_OPTIONS = ['All Drift Status', 'In Sync', 'Drifted']
export const VALUE_OPTIONS = ['All Values', '< €1M', '€1M - €5M', '> €5M']
export const REVIEW_OPTIONS = ['All Review Status', 'Reviewed < 3d', 'Reviewed < 7d', 'Never Reviewed']

interface FilterBarProps {
  advisorFilter: string
  onAdvisorChange: (val: string) => void
  driftFilter: string
  onDriftChange: (val: string) => void
  valueFilter: string
  onValueChange: (val: string) => void
  reviewFilter: string
  onReviewChange: (val: string) => void
}

export default function FilterBar({ 
  advisorFilter, onAdvisorChange,
  driftFilter, onDriftChange,
  valueFilter, onValueChange,
  reviewFilter, onReviewChange
}: FilterBarProps) {
  return (
    <div data-tour="filter-bar" className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        {/* Advisor Filter */}
        <div className="relative">
          <select 
            value={advisorFilter}
            onChange={(e) => onAdvisorChange(e.target.value)}
            className="appearance-none bg-surface-container border border-border/50 text-text text-sm font-medium rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-accent/50 cursor-pointer"
          >
            <option value="All Advisors">All Advisors</option>
            {ADVISORS.map(adv => (
              <option key={adv.id} value={adv.id}>{adv.name}</option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-sage pointer-events-none text-lg">
            expand_more
          </span>
        </div>

        {/* Drift Status Filter */}
        <div className="relative">
          <select 
            value={driftFilter}
            onChange={(e) => onDriftChange(e.target.value)}
            className="appearance-none bg-surface-container border border-border/50 text-text text-sm font-medium rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-accent/50 cursor-pointer"
          >
            {DRIFT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-sage pointer-events-none text-lg">
            expand_more
          </span>
        </div>

        {/* Portfolio Value Filter */}
        <div className="relative">
          <select 
            value={valueFilter}
            onChange={(e) => onValueChange(e.target.value)}
            className="appearance-none bg-surface-container border border-border/50 text-text text-sm font-medium rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-accent/50 cursor-pointer"
          >
            {VALUE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-sage pointer-events-none text-lg">
            expand_more
          </span>
        </div>

        {/* Review Days Filter */}
        <div className="relative">
          <select 
            value={reviewFilter}
            onChange={(e) => onReviewChange(e.target.value)}
            className="appearance-none bg-surface-container border border-border/50 text-text text-sm font-medium rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-accent/50 cursor-pointer"
          >
            {REVIEW_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-sage pointer-events-none text-lg">
            expand_more
          </span>
        </div>
      </div>

      <div className="text-sm font-medium text-sage flex items-center gap-2 cursor-pointer hover:text-text transition-colors">
        <span className="material-symbols-outlined text-[18px]">sort</span>
        Sort by Value
      </div>
    </div>
  )
}
