"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { firmConfig } from '@/lib/firm-config'

export default function Sidebar() {
  const pathname = usePathname()
  const { loggedInAdvisor } = firmConfig

  const navItems = [
    { label: 'Clients', icon: 'group', href: '/' },
    { label: 'Actions', icon: 'bolt', href: '/actions' },
    { label: 'Reports', icon: 'analytics', href: '/reports' },
  ]

  return (
    <aside className="h-screen w-[240px] fixed left-0 top-0 bg-primary flex flex-col py-8 z-50">
      <div className="px-8 mb-12">
        <h1 className="font-heading text-accent uppercase tracking-widest text-lg font-bold">{firmConfig.shortName || firmConfig.name}</h1>
        <p className="text-white/60 text-[10px] uppercase tracking-[0.2em] mt-1">Wealth Management</p>
      </div>

      <nav data-tour="nav" className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/' || pathname.startsWith('/clients')
              : pathname.startsWith(item.href)
          const tourId = item.label === 'Actions' ? 'nav-actions' : item.label === 'Reports' ? 'nav-reports' : undefined
          return (
            <Link
              key={item.label}
              href={item.href}
              {...(tourId && { 'data-tour': tourId })}
              className={cn(
                "pl-4 py-2 flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-colors duration-200",
                isActive 
                  ? "text-accent font-semibold border-l-2 border-accent"
                  : "text-white/70 hover:text-white"
              )}
            >
              <span className="material-symbols-outlined text-sm">{item.icon}</span>
              <span className="text-sm tracking-wide">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="px-8 mt-auto flex items-center gap-3">
        <div className="w-8 h-8 rounded-full overflow-hidden border border-accent/30 flex-shrink-0">
          <img src={loggedInAdvisor.photo} alt={`${loggedInAdvisor.name} profile photo`} className="w-full h-full object-cover" data-testid="advisor-photo" />
        </div>
        <div>
          <p className="text-white text-xs font-medium">{loggedInAdvisor.name}</p>
          <p className="text-white/50 text-[10px]">{loggedInAdvisor.title}</p>
        </div>
      </div>
    </aside>
  )
}
