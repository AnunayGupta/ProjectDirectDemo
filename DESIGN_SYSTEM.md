# Project Direct — Clinch Design System

This document tracks all layout, spacing, and styling constraints extracted directly from Stitch Screen 1 ("Clinch Client Book - Updated Actions"). This ensures consistency across all future components according to the frontend rules.

## Layout & Dimensions
- **Sidebar Width:** `240px` fixed (`w-[240px]`)
- **Main Canvas Margin:** `ml-[240px]` perfectly aligning alongside the Sidebar
- **Header Padding:** `px-8 py-4`
- **Main Canvas Padding:** `p-8 pb-32`
- **Tile Grid Gap:** `gap-6` (`grid-cols-1 lg:grid-cols-2 xl:grid-cols-3`)

## Card Styles (Client Tiles)
- **Border Radius:** `rounded-lg`
- **Container Padding:** `p-6`
- **Default State:** `bg-white border border-outline-variant/50 shadow-sm hover:shadow-md transition-all`
- **Selected State:** `bg-primary-container/5 border-2 border-primary-container ring-1 ring-primary-container/20`
- **Tile Bottom Row Padding:** `pt-4` with `border-t border-outline-variant/30`

## Navigation Styles (Sidebar)
- **Nav Container Gap:** `space-y-2`
- **Nav Item Default (Inactive):** `text-[#f6f3ed]/70 hover:text-[#f6f3ed] pl-4 py-2 flex items-center gap-3 cursor-pointer hover:bg-[#3d4f3e] transition-colors duration-200`
- **Nav Item Active:** `text-[#B5A07A] font-semibold border-l-2 border-[#B5A07A] pl-4 py-2 flex items-center gap-3 cursor-pointer hover:bg-[#3d4f3e] transition-colors duration-200`
- **Sidebar Logo Text:** `font-serif text-[#B5A07A] uppercase tracking-widest text-lg font-bold` with subtitile `text-[10px] uppercase tracking-[0.2em] mt-1`

## Typography Variants & Hierarchies
- **Screen Title (Header):** `font-headline text-2xl text-[#6d5c3b]`
- **Client Tile Full Name:** `font-display text-xl text-on-surface mb-1`
- **Advisor Assigment Text:** `text-[11px] text-secondary/70 font-medium uppercase tracking-wider`
- **Portfolio Value (Large):** `font-body text-3xl font-bold tabular-nums text-on-surface tracking-tight`
- **Trend Positive:** `text-green-700 text-xs font-medium`
- **Trend Negative:** `text-red-700 text-xs font-medium`

## Asset Pills
- **Chip Container:** `flex flex-wrap gap-2 mb-6`
- **Chip Item:** `px-2 py-0.5 bg-surface-container rounded text-[10px] font-bold text-secondary-fixed-variant uppercase tracking-tighter`

## Action Elements
- **Bulk Action Bar Bottom:** `fixed bottom-0 left-[240px] right-0 z-50 px-8 h-20 bg-[#2C3B2D]/95 backdrop-blur-xl border-t border-[#B5A07A]/20`
- **Header Select/Filter Buttons:** `px-3 py-1.5 border border-outline-variant rounded-lg text-xs text-on-surface-variant cursor-pointer hover:bg-surface-container transition-colors`
