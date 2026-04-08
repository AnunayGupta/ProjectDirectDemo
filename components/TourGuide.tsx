'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';

interface TourStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
  tooltipSide: 'top' | 'bottom' | 'left' | 'right' | 'center';
  spotlightPadding?: number;
}

interface RouteTour {
  key: string;
  match: (pathname: string) => boolean;
  steps: TourStep[];
}

const ROUTE_TOURS: RouteTour[] = [
  // ── Home / Client Book ──
  {
    key: 'clinch_tour_home_v1',
    match: (p) => p === '/',
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to Clinch',
        description:
          "A live wealth management platform built for advisor teams. Let's walk through what you can do — takes under a minute.",
        tooltipSide: 'center',
      },
      {
        id: 'navigation',
        title: 'Three Core Sections',
        description:
          'The sidebar holds everything: Clients (your full book), Actions (portfolio editing), and Reports (PDF generation & sending).',
        targetSelector: '[data-tour="nav"]',
        tooltipSide: 'right',
        spotlightPadding: 12,
      },
      {
        id: 'filters',
        title: 'Smart Filters',
        description:
          'Filter 200 clients by advisor, drift status, portfolio value, or review recency. The grid updates instantly.',
        targetSelector: '[data-tour="filter-bar"]',
        tooltipSide: 'bottom',
        spotlightPadding: 8,
      },
      {
        id: 'client-tile',
        title: 'Client Cards',
        description:
          'Each card shows portfolio value, monthly performance, top holdings, and drift status. Click any card to open the full portfolio editor.',
        targetSelector: '[data-tour="client-tile-first"]',
        tooltipSide: 'right',
        spotlightPadding: 8,
      },
      {
        id: 'bulk-select',
        title: 'Bulk Select & Act',
        description:
          'Tick the checkbox (top-right of each card) to select multiple clients — then send reports or mark them reviewed in one click from the bar that slides up.',
        targetSelector: '[data-tour="client-tile-first"]',
        tooltipSide: 'bottom',
        spotlightPadding: 8,
      },
      {
        id: 'actions',
        title: 'Portfolio Actions',
        description:
          'Rebalance holdings, deploy capital, raise cash, and push changes for client approval — all from this section.',
        targetSelector: '[data-tour="nav-actions"]',
        tooltipSide: 'right',
        spotlightPadding: 8,
      },
      {
        id: 'reports',
        title: 'Reports',
        description:
          'Select any client to generate a branded PDF report, or send reports across your entire book in one go.',
        targetSelector: '[data-tour="nav-reports"]',
        tooltipSide: 'right',
        spotlightPadding: 8,
      },
    ],
  },

  // ── Actions Client Picker ──
  {
    key: 'clinch_tour_actions_v1',
    match: (p) => p === '/actions',
    steps: [
      {
        id: 'actions-welcome',
        title: 'Portfolio Actions',
        description:
          'This is your rebalancing hub. Clients are sorted by drift — the most out-of-balance portfolios appear first.',
        tooltipSide: 'center',
      },
      {
        id: 'actions-search',
        title: 'Search Clients',
        description:
          'Type a client name to instantly filter the list. Results update as you type.',
        targetSelector: '[data-tour="actions-search"]',
        tooltipSide: 'bottom',
        spotlightPadding: 8,
      },
      {
        id: 'actions-drift',
        title: 'Drift Indicators',
        description:
          'The colored dots show drift status: red means heavily drifted, amber is moderate, and green is in sync.',
        targetSelector: '[data-tour="actions-client-first"]',
        tooltipSide: 'right',
        spotlightPadding: 8,
      },
      {
        id: 'actions-select',
        title: 'Select a Client',
        description:
          'Click "Select" on any row to open the full portfolio editor — where you can adjust weightings and send proposals.',
        targetSelector: '[data-tour="actions-client-first"]',
        tooltipSide: 'bottom',
        spotlightPadding: 8,
      },
    ],
  },

  // ── Individual Client Portfolio Editor ──
  {
    key: 'clinch_tour_editor_v1',
    match: (p) => /^\/actions\/[^/]+$/.test(p),
    steps: [
      {
        id: 'editor-welcome',
        title: 'Portfolio Editor',
        description:
          'This is where you adjust portfolio weightings and send proposals to clients for approval. Changes auto-save as you work.',
        tooltipSide: 'center',
      },
      {
        id: 'editor-weightings',
        title: 'Adjust Weightings',
        description:
          'Drag the sliders or type percentages to adjust each holding. CASH auto-balances — when you increase a position, cash decreases proportionally.',
        targetSelector: '[data-tour="editor-weightings"]',
        tooltipSide: 'right',
        spotlightPadding: 8,
      },
      {
        id: 'editor-impact',
        title: 'Live Impact Preview',
        description:
          'See proposed trades update in real time as you adjust. Buy and sell orders are calculated automatically based on your weighting changes.',
        targetSelector: '[data-tour="editor-impact"]',
        tooltipSide: 'left',
        spotlightPadding: 8,
      },
      {
        id: 'editor-quick-actions',
        title: 'Quick Actions',
        description:
          'Use these shortcuts to reset weightings, raise cash across positions, or liquidate the entire portfolio to cash.',
        targetSelector: '[data-tour="editor-quick-actions"]',
        tooltipSide: 'bottom',
        spotlightPadding: 8,
      },
      {
        id: 'editor-send',
        title: 'Send for Approval',
        description:
          'When you\'re satisfied with the changes, send the proposal to your client. They\'ll receive a notification to review and approve.',
        targetSelector: '[data-tour="editor-send"]',
        tooltipSide: 'bottom',
        spotlightPadding: 8,
      },
    ],
  },

  // ── Reports ──
  {
    key: 'clinch_tour_reports_v1',
    match: (p) => p === '/reports',
    steps: [
      {
        id: 'reports-welcome',
        title: 'Monthly Reports',
        description:
          'Generate branded PDF portfolio reports for your clients. Preview, download, and batch-generate across your entire book.',
        tooltipSide: 'center',
      },
      {
        id: 'reports-client-list',
        title: 'Client List',
        description:
          'Select any client to preview their report. Green badges mean the report is generated; gray means it\'s still pending.',
        targetSelector: '[data-tour="reports-client-list"]',
        tooltipSide: 'right',
        spotlightPadding: 8,
      },
      {
        id: 'reports-preview',
        title: 'Report Preview',
        description:
          'A live preview of the branded PDF — showing performance metrics, holdings breakdown, and asset allocation chart.',
        targetSelector: '[data-tour="reports-preview"]',
        tooltipSide: 'left',
        spotlightPadding: 8,
      },
      {
        id: 'reports-download',
        title: 'Download PDF',
        description:
          'Export the report as a PDF file to send to your client or attach to an email.',
        targetSelector: '[data-tour="reports-download"]',
        tooltipSide: 'bottom',
        spotlightPadding: 8,
      },
      {
        id: 'reports-generate-all',
        title: 'Batch Generate',
        description:
          'Generate reports for all 200 clients in one click. Status badges update as each report is created.',
        targetSelector: '[data-tour="reports-generate-all"]',
        tooltipSide: 'bottom',
        spotlightPadding: 8,
      },
    ],
  },
];

const TOOLTIP_WIDTH = 316;

function getTooltipPosition(
  rect: DOMRect | null,
  side: TourStep['tooltipSide'],
): React.CSSProperties {
  if (!rect || side === 'center') return {};
  const gap = 22;

  switch (side) {
    case 'right': {
      const left = rect.right + gap;
      const top = Math.max(16, Math.min(rect.top + rect.height / 2, window.innerHeight - 260));
      return { left, top, transform: 'translateY(-50%)' };
    }
    case 'left': {
      const right = window.innerWidth - rect.left + gap;
      const top = Math.max(16, Math.min(rect.top + rect.height / 2, window.innerHeight - 260));
      return { right, top, transform: 'translateY(-50%)' };
    }
    case 'bottom': {
      const top = Math.min(rect.bottom + gap, window.innerHeight - 260);
      const left = Math.max(
        16,
        Math.min(rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2, window.innerWidth - TOOLTIP_WIDTH - 16),
      );
      return { top, left };
    }
    case 'top': {
      const bottom = Math.max(16, window.innerHeight - rect.top + gap);
      const left = Math.max(
        16,
        Math.min(rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2, window.innerWidth - TOOLTIP_WIDTH - 16),
      );
      return { bottom, left };
    }
  }
}

function ArrowCaret({ side }: { side: TourStep['tooltipSide'] }) {
  if (side === 'center') return null;

  const base: React.CSSProperties = {
    position: 'absolute',
    width: 13,
    height: 13,
    backgroundColor: '#FFFFFF',
    transform: 'rotate(45deg)',
  };

  const style: React.CSSProperties = (() => {
    switch (side) {
      case 'right':
        return { ...base, left: -6, top: '50%', marginTop: -6, boxShadow: '-2px 2px 4px rgba(0,0,0,0.07)' };
      case 'left':
        return { ...base, right: -6, top: '50%', marginTop: -6, boxShadow: '2px -2px 4px rgba(0,0,0,0.07)' };
      case 'bottom':
        return { ...base, top: -6, left: '50%', marginLeft: -6, boxShadow: '-2px -2px 4px rgba(0,0,0,0.07)' };
      case 'top':
        return { ...base, bottom: -6, left: '50%', marginLeft: -6, boxShadow: '2px 2px 4px rgba(0,0,0,0.07)' };
    }
  })();

  return <div style={style} />;
}

export default function TourGuide() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [activeTour, setActiveTour] = useState<RouteTour | null>(null);

  // Find matching tour for current route
  useEffect(() => {
    const tour = ROUTE_TOURS.find(t => t.match(pathname));
    setActiveTour(tour ?? null);
    setCurrentStep(0);
    setIsActive(false);
  }, [pathname]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-launch tour if not seen yet
  useEffect(() => {
    if (!mounted || !activeTour) return;
    if (!localStorage.getItem(activeTour.key)) {
      const timer = setTimeout(() => setIsActive(true), 700);
      return () => clearTimeout(timer);
    }
  }, [mounted, activeTour]);

  const steps = activeTour?.steps ?? [];

  const computeRect = useCallback(() => {
    const step = steps[currentStep];
    if (!step?.targetSelector) {
      setTargetRect(null);
      return;
    }
    const el = document.querySelector(step.targetSelector);
    setTargetRect(el ? el.getBoundingClientRect() : null);
  }, [currentStep, steps]);

  useEffect(() => {
    if (!isActive) return;
    computeRect();
    window.addEventListener('resize', computeRect);
    return () => window.removeEventListener('resize', computeRect);
  }, [isActive, computeRect]);

  const dismiss = useCallback(() => {
    if (activeTour) localStorage.setItem(activeTour.key, '1');
    setIsActive(false);
  }, [activeTour]);

  const next = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      dismiss();
    }
  }, [currentStep, steps.length, dismiss]);

  const prev = useCallback(() => {
    setCurrentStep(s => Math.max(0, s - 1));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
      if (e.key === 'ArrowRight' || e.key === 'Enter') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [isActive, dismiss, next, prev]);

  if (!mounted || !isActive || steps.length === 0) return null;

  const step = steps[currentStep];
  const pad = step.spotlightPadding ?? 8;
  const isLast = currentStep === steps.length - 1;
  const isCenter = step.tooltipSide === 'center';

  const tooltipPos = getTooltipPosition(targetRect, step.tooltipSide);

  const content = (
    <>
      {/* Semi-transparent backdrop */}
      <div
        className="fixed inset-0 z-[9997]"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
        onClick={dismiss}
      />

      {/* Spotlight cutout */}
      {!isCenter && targetRect && (
        <div
          style={{
            position: 'fixed',
            top: targetRect.top - pad,
            left: targetRect.left - pad,
            width: targetRect.width + pad * 2,
            height: targetRect.height + pad * 2,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
            borderRadius: 10,
            border: '1.5px solid rgba(181, 160, 122, 0.85)',
            zIndex: 9998,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Tooltip */}
      <div
        style={{
          position: 'fixed',
          width: TOOLTIP_WIDTH,
          zIndex: 10000,
          animation: 'fadeIn 0.18s ease-out',
          ...(isCenter
            ? { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
            : tooltipPos),
        }}
        className="bg-surface rounded-xl shadow-2xl p-6"
      >
        <ArrowCaret side={step.tooltipSide} />

        {/* Step counter */}
        <p className="text-[10px] font-bold text-sage uppercase tracking-[0.18em] mb-3">
          {currentStep === 0 ? 'Quick Tour' : `Step ${currentStep} of ${steps.length - 1}`}
        </p>

        {/* Title */}
        <h3 className="font-heading text-[1.2rem] text-primary font-semibold leading-snug mb-2">
          {step.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-text/75 leading-relaxed mb-5">
          {step.description}
        </p>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5 mb-5">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              aria-label={`Go to step ${i + 1}`}
              style={{
                borderRadius: 99,
                height: 6,
                width: i === currentStep ? 20 : 6,
                backgroundColor: i === currentStep ? '#B5A07A' : '#E2DDD6',
                transition: 'all 0.2s ease',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            />
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={dismiss}
            className="text-xs text-sage hover:text-text transition-colors"
          >
            Skip tour
          </button>
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={prev}
                className="px-4 py-2 text-sm font-medium text-primary border border-border rounded-lg hover:bg-background transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={next}
              className="px-5 py-2 text-sm font-bold bg-accent text-[#1A241B] rounded-lg hover:brightness-105 active:scale-95 transition-all flex items-center gap-1.5"
            >
              {currentStep === 0 ? "Let's go" : isLast ? 'Done' : 'Next'}
              <span className="material-symbols-outlined text-[15px]">
                {isLast ? 'check' : 'arrow_forward'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(content, document.body);
}
