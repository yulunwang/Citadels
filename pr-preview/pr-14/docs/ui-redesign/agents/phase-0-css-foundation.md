# Agent Instructions: Phase 0 — CSS Variable Foundation & Light Theme

## Prerequisites
- Read `docs/ui-redesign/design-system.md` for the complete color palette and variable definitions
- Read `docs/ui-redesign/frontend-design-principles.md` for aesthetic guidelines
- Read `CLAUDE.md` for architecture constraints (global scope, load order, etc.)

## Objective
Replace ALL hardcoded color values in `css/style.css` with CSS custom properties. Update the `CS` object in `js/data.js` to match the new light palette. The game must look and function identically in structure, but with the new light color scheme.

## Scope
**Files to modify:**
- `css/style.css` — Add `:root` block, rewrite all rules to use `var()`
- `js/data.js` — Update `CS` hex values only (lines 27-33)

**Files to NEVER modify:**
- `js/engine.js` — Game logic, untouchable
- `js/net.js` — Multiplayer networking, untouchable
- `js/ext-api.js` — Extension registry, untouchable
- `js/ui.js` — NOT in this phase (Phase 1 handles this)
- `js/lobby.js` — NOT in this phase (Phase 1 handles this)

## Detailed Steps

### Step 1: Add `:root` CSS Variables Block

Add the full `:root` block from `docs/ui-redesign/design-system.md` at the TOP of `css/style.css`, before any other rules. This includes:
- `--bg-body`, `--bg-panel`, `--bg-card`, `--bg-center`, `--bg-hover`
- `--text-primary`, `--text-secondary`, `--text-muted`, `--text-accent`, `--text-on-dark`
- `--border-main`, `--border-subtle`, `--border-strong`
- `--c-yellow-*`, `--c-blue-*`, `--c-green-*`, `--c-red-*`, `--c-purple-*`
- `--space-*`, `--radius-*`, `--transition-*`
- `--shadow-*`, `--overlay-*`, `--modal-*`, `--scrollbar-*`

### Step 2: Rewrite Every CSS Rule

Go through each of the 112 existing CSS rules and replace hardcoded values:

**Mapping table (old → new):**

| Old Value | New Variable | Usage |
|-----------|-------------|-------|
| `#090c18` | `var(--bg-body)` | body background, scrollbar track |
| `#0d1128` | `var(--bg-panel)` | #topbar, #bottom backgrounds |
| `#111530` | `var(--bg-card)` | .tb-player, .herald-card backgrounds |
| `#0b0e1c` | `var(--bg-center)` | #center background |
| `#e8dfc8` | `var(--text-primary)` | body color, confirm-box h3 |
| `#7a6a4a` | `var(--text-muted)` | .tb-meta, .sect-label |
| `#d4a843` | `var(--text-accent)` | .tb-title, .tb-player-name, .bot-label-right |
| `#2a2f55` | `var(--border-main)` | topbar border-bottom, bottom border-top |
| `#1e2245` | `var(--border-subtle)` | .tb-header border, .tb-player border, #bot-hand border |
| `#2e3560` | `var(--scrollbar-thumb)` | scrollbar thumb |
| `#2a2855` | `var(--border-main)` | .herald-card border |
| `#5a5080` | `var(--text-muted)` | .herald-char-num, .herald-empty |
| `#6858a0` | `var(--text-secondary)` | .herald-sub |
| `#c0b088` | `var(--text-secondary)` | .herald-ev-text |
| `#5a4e32` | `var(--text-muted)` | .bot-label |
| `#c8b080` | `var(--text-primary)` | .tb-stat-val |
| `#7a6848` | `var(--text-muted)` | .tb-player-stats |
| `rgba(0,0,0,0.72)` | `var(--overlay-bg)` | .confirm-overlay |
| `#151830` | `var(--modal-bg)` | .confirm-box |
| `#4a3060` | `var(--modal-border)` | .confirm-box border |
| `rgba(0,0,0,0.8)` | `var(--shadow-overlay)` | .confirm-box box-shadow |
| `rgba(212,168,67,0.09)` | `color-mix(in srgb, var(--text-accent) 9%, var(--bg-card))` | .tb-player.active (or use a simpler approach) |
| `#1a1535` | `var(--bg-card)` | .tb-chip-tip |
| `#4a3870` | `var(--border-main)` | .tb-chip-tip border |
| `#d0c0f0` | `var(--text-primary)` | .tb-chip-tip color |

Note: Some dark-theme-specific colors (like `rgba(212,168,67,0.09)`) need light-theme equivalents. For `.tb-player.active`, use a subtle warm tint like `rgba(184,134,11,0.08)`.

### Step 3: Add District Color Utility Classes

Add these AFTER the `:root` block:

```css
.color-yellow { --c-bg: var(--c-yellow-bg); --c-bdr: var(--c-yellow-bdr); --c-txt: var(--c-yellow-txt); }
.color-blue   { --c-bg: var(--c-blue-bg);   --c-bdr: var(--c-blue-bdr);   --c-txt: var(--c-blue-txt); }
.color-green  { --c-bg: var(--c-green-bg);   --c-bdr: var(--c-green-bdr);   --c-txt: var(--c-green-txt); }
.color-red    { --c-bg: var(--c-red-bg);     --c-bdr: var(--c-red-bdr);     --c-txt: var(--c-red-txt); }
.color-purple { --c-bg: var(--c-purple-bg);  --c-bdr: var(--c-purple-bdr);  --c-txt: var(--c-purple-txt); }
```

### Step 4: Add Button Variable Pattern

```css
.gbtn {
  --btn-clr: var(--text-accent);  /* default, overridden inline */
  /* ... existing styles, but using var(--btn-clr) for colors */
}
```

### Step 5: Update CS in data.js

Replace lines 27-33 in `js/data.js` with the light palette values from the design system doc.

### Step 6: Add Animation Keyframes

Add the `@keyframes` blocks from the design system at the bottom of style.css. Also add:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Verification Checklist

- [ ] Open `index.html` in browser — light cream background visible
- [ ] Top bar shows with light panel background
- [ ] Player cards readable with dark text on light background
- [ ] District color chips still show distinct colors (yellow/blue/green/red/purple)
- [ ] Herald area readable
- [ ] Bottom panel (hand/city) readable
- [ ] Confirm modal works (try End Game button)
- [ ] Scrollbars visible and styled
- [ ] No CSS errors in browser DevTools console
- [ ] Start a solo game, play through all phases (draft → herald → action → build)
- [ ] Game over screen displays correctly
- [ ] No hardcoded hex colors remain in style.css rules (`:root` block excepted)

## Success Criteria
The game looks like a light-themed version of itself — same layout, same structure, but warm cream backgrounds with dark text and vibrant colored accents. Every color comes from a CSS variable.
