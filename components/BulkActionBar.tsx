import { formatCurrency } from '@/lib/utils'

interface BulkActionBarProps {
  selectedCount: number
  totalValue: number
  onClear: () => void
  onMarkReviewed: () => void
  onSendReports: () => void
}

export default function BulkActionBar({
  selectedCount,
  totalValue,
  onClear,
  onMarkReviewed,
  onSendReports,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="fixed bottom-0 left-[240px] right-0 z-50 flex items-center justify-between px-8 bg-primary/95 backdrop-blur-xl h-20 border-t border-accent/20"
         style={{ animation: 'slideUp 0.2s ease-out' }}>
      <div className="flex items-center gap-4">
        <span className="material-symbols-outlined text-accent">checklist</span>
        <p className="text-white/90 text-sm font-medium tracking-wide">
          {selectedCount} client{selectedCount !== 1 ? 's' : ''} selected{' '}
          <span className="text-white/40 px-2">—</span>{' '}
          <span className="text-accent font-bold">{formatCurrency(totalValue)} AUM</span>
        </p>
      </div>
      <div className="flex items-center gap-3">
        {/* Send Reports — gold primary */}
        <button
          onClick={onSendReports}
          className="px-5 py-2.5 bg-accent text-[#1A241B] rounded font-body font-bold text-sm hover:brightness-110 active:scale-95 transition-all"
        >
          Send Reports
        </button>
        {/* Mark Reviewed — forest green outline */}
        <button
          onClick={onMarkReviewed}
          className="px-5 py-2.5 rounded font-body font-bold text-sm border-2 border-accent text-accent hover:bg-accent/10 active:scale-95 transition-all"
        >
          Mark Reviewed
        </button>
        {/* Clear selection */}
        <button onClick={onClear} className="p-2 text-white/50 hover:text-white transition-colors ml-1">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
    </div>
  )
}
