import Sidebar from '@/components/Sidebar'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full overflow-hidden">
      <Sidebar />
      <main className="ml-[240px] flex-1 flex flex-col min-h-screen bg-background">
        {children}
      </main>
    </div>
  )
}
