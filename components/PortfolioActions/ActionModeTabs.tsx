export type ActionMode = 'rebalance' | 'deploy_capital' | 'withdraw'

const MODES: { id: ActionMode; label: string; icon: string }[] = [
  { id: 'rebalance',         label: 'Rebalance',        icon: 'account_tree' },
  { id: 'deploy_capital',    label: 'Deploy Capital',   icon: 'trending_up' },
  { id: 'withdraw',          label: 'Withdraw',         icon: 'trending_down' },
]

interface ActionModeTabsProps {
  activeMode: ActionMode
  onModeChange: (mode: ActionMode) => void
}

export default function ActionModeTabs({ activeMode, onModeChange }: ActionModeTabsProps) {
  return (
    <div className="flex items-center gap-0 border-b border-border mb-0">
      {MODES.map(m => (
        <button
          key={m.id}
          onClick={() => onModeChange(m.id)}
          className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeMode === m.id
              ? 'border-accent text-text'
              : 'border-transparent text-sage hover:text-text'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">{m.icon}</span>
          {m.label}
        </button>
      ))}
    </div>
  )
}
