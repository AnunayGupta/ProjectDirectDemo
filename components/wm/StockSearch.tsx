"use client";

import { useState, useRef, useEffect } from "react";
import { STOCKS, type Stock } from "@/lib/stocks";

interface StockSearchProps {
  onAdd: (stock: Stock) => void;
  excludeTickers: string[];
}

export function StockSearch({ onAdd, excludeTickers }: StockSearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const results = query.length > 0
    ? STOCKS.filter(
        (s) =>
          !excludeTickers.includes(s.ticker) &&
          (s.ticker.toLowerCase().includes(query.toLowerCase()) ||
            s.name.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 8)
    : [];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center bg-[#f1f4f6] rounded-lg px-3 py-2.5 gap-2">
        <span className="material-symbols-outlined text-[#6c7a71] text-lg">search</span>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search stocks… (e.g. AAPL, Microsoft)"
          className="bg-transparent flex-1 text-sm text-[#181c1e] placeholder:text-[#6c7a71] outline-none"
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-lg z-20 overflow-hidden max-h-72 overflow-y-auto">
          {results.map((stock) => (
            <button
              key={stock.ticker}
              onClick={() => {
                onAdd(stock);
                setQuery("");
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#f1f4f6] transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-lg bg-[#ebeef0] flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-[#3f4c43]">{stock.ticker.slice(0, 2)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#181c1e]">{stock.ticker} <span className="font-normal text-[#6c7a71]">· {stock.name}</span></p>
                <p className="text-xs text-[#6c7a71]">{stock.exchange} · {stock.sector}</p>
              </div>
              <span className="text-sm font-medium text-[#181c1e]">${stock.price.toFixed(2)}</span>
              <span className="material-symbols-outlined text-[#10b77f] text-xl">add_circle</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
