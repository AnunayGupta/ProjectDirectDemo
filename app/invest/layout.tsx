export default function InvestLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-[#f7fafc]">
      {children}
    </div>
  );
}
