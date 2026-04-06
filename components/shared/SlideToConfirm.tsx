"use client";

import { useRef, useState } from "react";

interface SlideToConfirmProps {
  label?: string;
  onConfirm: () => void;
  disabled?: boolean;
  accentColor?: string;
}

export function SlideToConfirm({
  label = "Slide to confirm",
  onConfirm,
  disabled = false,
  accentColor = "#10b77f",
}: SlideToConfirmProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [offsetX, setOffsetX] = useState(0);
  const [confirmed, setConfirmed] = useState(false);

  const THUMB_SIZE = 52;
  const PADDING = 4;

  function getTrackWidth() {
    return (trackRef.current?.clientWidth ?? 300) - THUMB_SIZE - PADDING * 2;
  }

  function handleStart(clientX: number) {
    if (disabled || confirmed) return;
    setDragging(true);
    const rect = trackRef.current?.getBoundingClientRect();
    if (rect) setOffsetX(clientX - rect.left - PADDING - THUMB_SIZE / 2);
  }

  function handleMove(clientX: number) {
    if (!dragging) return;
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const max = getTrackWidth();
    const x = Math.max(0, Math.min(clientX - rect.left - PADDING - THUMB_SIZE / 2, max));
    setOffsetX(x);
    if (x >= max * 0.9) {
      setConfirmed(true);
      setDragging(false);
      onConfirm();
    }
  }

  function handleEnd() {
    if (!confirmed) setOffsetX(0);
    setDragging(false);
  }

  const progress = Math.min(offsetX / Math.max(getTrackWidth(), 1), 1);

  return (
    <div
      ref={trackRef}
      className="relative h-14 rounded-full select-none overflow-hidden"
      style={{ background: `${accentColor}22` }}
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onTouchEnd={handleEnd}
    >
      {/* Fill */}
      <div
        className="absolute inset-0 rounded-full transition-none"
        style={{
          background: accentColor,
          opacity: 0.15 + progress * 0.25,
          width: `${PADDING + THUMB_SIZE + offsetX + THUMB_SIZE / 2}px`,
        }}
      />

      {/* Label */}
      <div
        className="absolute inset-0 flex items-center justify-center text-sm font-semibold pointer-events-none"
        style={{ color: accentColor, opacity: confirmed ? 0 : 1 - progress * 0.8 }}
      >
        {confirmed ? "Confirmed!" : label}
      </div>

      {/* Thumb */}
      <div
        className="absolute top-[4px] flex items-center justify-center rounded-full cursor-grab active:cursor-grabbing shadow-md transition-transform"
        style={{
          left: `${PADDING + offsetX}px`,
          width: THUMB_SIZE,
          height: THUMB_SIZE,
          background: accentColor,
          transform: confirmed ? "scale(1.1)" : "scale(1)",
        }}
        onMouseDown={(e) => handleStart(e.clientX)}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      >
        <span className="material-symbols-outlined text-white text-xl select-none">
          {confirmed ? "check" : "chevron_right"}
        </span>
      </div>
    </div>
  );
}
