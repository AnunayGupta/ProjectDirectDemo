import { firmConfig } from '@/lib/firm-config'

export default function Header({ title }: { title: string }) {
  return (
    <header className="bg-background sticky top-0 z-40 flex items-center justify-between px-8 py-4 w-full border-b border-border">
      <div className="flex items-center gap-8">
        <h2 className="font-heading text-2xl text-text">{title}</h2>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right">
          <span className="block text-[10px] uppercase tracking-widest text-sage font-semibold">Asset Summary</span>
          <span className="text-sm font-medium text-sage italic">{firmConfig.clientCount} clients — {firmConfig.totalAUM} AUM</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-sage hover:text-primary transition-colors" data-testid="search-btn">
            <span className="material-symbols-outlined">search</span>
          </button>
        </div>
      </div>
    </header>
  )
}
