'use client'
import { useEffect } from 'react'

interface ToastProps {
  message: string
  variant: 'info' | 'success' | 'loading'
  onDismiss: () => void
}

const ICONS: Record<string, string> = {
  success: 'check_circle',
  info:    'info',
  loading: 'sync',
}

const COLORS: Record<string, string> = {
  success: 'border-[#2D6A4F]/30 bg-[#F5FFF8] text-[#2D6A4F]',
  info:    'border-border bg-surface text-text',
  loading: 'border-border bg-surface text-sage',
}

export default function Toast({ message, variant, onDismiss }: ToastProps) {
  useEffect(() => {
    if (variant === 'loading') return
    const t = setTimeout(onDismiss, 3500)
    return () => clearTimeout(t)
  }, [message, variant, onDismiss])

  return (
    <div className={`
      fixed bottom-8 right-8 z-[60] flex items-center gap-3 px-5 py-3.5 rounded-lg border shadow-lg
      animate-[slideInRight_0.2s_ease-out]
      ${COLORS[variant]}
    `}>
      <span className={`material-symbols-outlined text-[18px] ${variant === 'loading' ? 'animate-spin' : ''}`}>
        {ICONS[variant]}
      </span>
      <p className="text-sm font-medium">{message}</p>
    </div>
  )
}
