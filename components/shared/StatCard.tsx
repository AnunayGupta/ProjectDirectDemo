interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  trend?: "up" | "down" | "neutral";
  icon?: string;
}

export function StatCard({ label, value, subValue, trend, icon }: StatCardProps) {
  const trendColor =
    trend === "up"
      ? "text-[#10b77f]"
      : trend === "down"
      ? "text-[#a43a3b]"
      : "text-[#6c7a71]";

  return (
    <div className="bg-white rounded-xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-[#6c7a71] uppercase tracking-widest mb-2">
            {label}
          </p>
          <p className="text-2xl font-bold text-[#181c1e] leading-none">{value}</p>
          {subValue && (
            <p className={`text-sm font-medium mt-1.5 ${trendColor}`}>{subValue}</p>
          )}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-[#f1f4f6] flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[#10b77f] text-xl">{icon}</span>
          </div>
        )}
      </div>
    </div>
  );
}
