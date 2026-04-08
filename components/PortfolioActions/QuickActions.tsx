'use client'

interface QuickActionsProps {
  onResetToModel: () => void
  onResetToProposed: () => void
  hasProposed: boolean
  onRaiseCash: () => void
  onLiquidateAll: () => void
}

export default function QuickActions({
  onResetToModel,
  onResetToProposed,
  hasProposed,
  onRaiseCash,
  onLiquidateAll,
}: QuickActionsProps) {
  const actions = [
    {
      id: 'reset',
      label: 'Reset to Model',
      icon: 'restart_alt',
      description: 'Revert all targets to current weightings',
      onClick: onResetToModel,
      variant: 'default' as const,
      disabled: false,
    },
    {
      id: 'reset_proposed',
      label: 'Reset to Proposed',
      icon: 'history',
      description: 'Revert to the last saved proposed state',
      onClick: onResetToProposed,
      variant: 'default' as const,
      disabled: !hasProposed,
    },
    {
      id: 'raise_cash',
      label: 'Raise Cash',
      icon: 'savings',
      description: 'Sell positions to raise a specific cash amount',
      onClick: onRaiseCash,
      variant: 'primary' as const,
      disabled: false,
    },
    {
      id: 'liquidate',
      label: 'Liquidate to Cash',
      icon: 'money_off',
      description: 'Sell all positions — move 100% to cash',
      onClick: onLiquidateAll,
      variant: 'danger' as const,
      disabled: false,
    },
  ]

  return (
    <div className="flex items-center gap-2">
      {actions.map(a => (
        <button
          key={a.id}
          onClick={a.onClick}
          disabled={a.disabled}
          title={a.description}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded transition-all
            disabled:opacity-40 disabled:cursor-not-allowed
            ${a.variant === 'default'
              ? 'text-sage border border-border/60 hover:bg-background hover:text-text'
              : a.variant === 'primary'
              ? 'text-primary border border-primary/30 hover:bg-primary/5'
              : 'text-[#C0392B] border border-[#C0392B]/20 hover:bg-[#C0392B]/5'
            }`}
        >
          <span className="material-symbols-outlined text-[14px]">{a.icon}</span>
          {a.label}
        </button>
      ))}
    </div>
  )
}
