# Design System — Project Direct

Extracted from Stitch project "Strategies Dashboard" (`projects/12773062116890934861`).
Design language: **"The Quiet Authority"** — editorial, spacious, no 1px borders.

---

## Colors

### Primary
| Token | Value | Usage |
|---|---|---|
| `primary` | `#006c49` | Primary actions, active states |
| `primary-container` / `accent` | `#10b77f` | Buttons, badges, highlights |
| `primary-fixed` | `#70fbbd` | Light accent tints |
| `inverse-primary` | `#50dea3` | Dark bg accent text |

### Secondary
| Token | Value | Usage |
|---|---|---|
| `secondary` | `#386850` | Secondary text/icons |
| `secondary-container` | `#b7ebce` | Pill backgrounds |

### Danger / Tertiary
| Token | Value | Usage |
|---|---|---|
| `tertiary` | `#a43a3b` | Danger text |
| `tertiary-container` | `#f97a77` | Danger badges |
| `error` | `#ba1a1a` | Error states |

### Surfaces (layered, no borders)
| Token | Value | Usage |
|---|---|---|
| `surface` | `#f7fafc` | Page background |
| `surface-low` | `#f1f4f6` | Secondary content zones |
| `surface-lowest` | `#ffffff` | Primary cards |
| `surface-container` | `#ebeef0` | Dividers / chips |
| `surface-high` | `#e2e5e8` | Hover states |
| `surface-bright` | `#ffffff` | Elevated overlays |

### Text / Outline
| Token | Value | Usage |
|---|---|---|
| `on-surface` | `#181c1e` | Primary text |
| `on-surface-variant` | `#3f4c43` | Secondary text |
| `outline` | `#6c7a71` | Tertiary text, placeholders |
| `outline-variant` | `#bbcabf` | Subtle dividers (when needed) |

---

## Typography

- **Font:** Inter (Google Fonts)
- **Scale:** Use Tailwind default (`text-xs` through `text-4xl`)
- **Weights:** 400 (body), 500 (labels), 600 (subheadings), 700 (headings)

---

## Border Radius

| Token | Value | Usage |
|---|---|---|
| `radius-sm` | `0.25rem` | Chips, tags |
| `radius-md` | `0.5rem` | Inputs, small cards |
| `radius-lg` | `1rem` | Cards |
| `radius-xl` | `1.5rem` | Modals, large panels |
| `radius-full` | `9999px` | Pills, avatars |

---

## Shadows / Glass

- **Glass panel:** `background: rgba(255,255,255,0.8); backdrop-filter: blur(20px)`
- **Card elevation:** `shadow-sm` (Tailwind) — prefer surface layering over shadows

---

## The "No-Line" Rule

> **Do NOT use 1px solid borders to define sections.**
> Layout boundaries must be established through background color shifts only.
> Use `surface-low` (#f1f4f6) for secondary zones and `surface-lowest` (#ffffff) for primary cards.

---

## Component Patterns

### Button (Primary)
```
bg-accent text-white font-semibold rounded-full px-6 py-2.5 hover:bg-primary transition-colors
```

### Button (Secondary)
```
bg-surface-container text-on-surface font-medium rounded-full px-6 py-2.5 hover:bg-surface-high transition-colors
```

### Card
```
bg-surface-lowest rounded-xl p-6
```

### Badge (success)
```
bg-secondary-container text-secondary text-xs font-medium rounded-full px-2.5 py-0.5
```

### Badge (danger)
```
bg-tertiary-container text-tertiary text-xs font-medium rounded-full px-2.5 py-0.5
```

### Input
```
bg-surface-low border-0 rounded-lg px-4 py-3 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-accent outline-none
```

### Section Header
```
text-xs font-semibold text-outline uppercase tracking-widest
```
