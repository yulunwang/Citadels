# Agent Instructions: Phase 4 — Polish, Responsive & Accessibility

## Prerequisites
- Phases 0-3 must be complete
- Read `docs/ui-redesign/design-system.md` for responsive breakpoints and accessibility requirements
- Read `docs/ui-redesign/frontend-design-principles.md` for quality standards

## Objective
Final polish pass: responsive design, animations, accessibility, performance, texture/atmosphere, and comprehensive testing.

## Scope
**Files to modify:**
- `css/style.css` — Add responsive breakpoints, refine animations, texture styles
- `index.html` — Add preload links for critical images
- `js/ui.js` — Minor tweaks for responsive behavior, lazy loading attributes
- `js/lobby.js` — Minor tweaks for responsive behavior

**Files to NEVER modify:**
- `js/engine.js`, `js/net.js`, `js/ext-api.js`

---

## Task 1: Responsive Design

### Breakpoints

Add at the END of `css/style.css`:

```css
/* ── Tablet (≤1024px) ── */
@media (max-width: 1024px) {
  .tb-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .dcard.portrait {
    width: 110px;
  }
  .dcard.portrait .dcard-emoji-col {
    height: 52px;
    font-size: 24px;
  }
  .charcard {
    /* Smaller draft cards */
  }
  .herald-portrait {
    width: 150px;
  }
  .action-banner-emoji, .action-banner img {
    width: 80px;
  }
}

/* ── Mobile (≤768px) ── */
@media (max-width: 768px) {
  .tb-grid {
    grid-template-columns: 1fr;
  }
  #bottom {
    flex-direction: column;
  }
  #bot-hand, #bot-city {
    width: 100%;
    border-right: none;
    max-height: 40vh;
  }
  #bot-hand {
    border-bottom: 1px solid var(--border-subtle);
  }
  .dcard.portrait {
    width: 100px;
  }
  .herald-portrait {
    width: 120px;
  }
  .lobby-mode-grid {
    flex-direction: column;
  }
  .lobby-box {
    margin: 10px;
    padding: 16px;
  }
  #main {
    max-height: 50vh;
  }
}
```

### Test Each Breakpoint
- Resize browser window to 1024px → verify 2-column player grid
- Resize to 768px → verify 1-column grid, stacked bottom panels
- Verify cards don't overflow or break layout at any width
- Test lobby screens at each breakpoint

---

## Task 2: Animation Refinement

### Ensure All Animations Are Defined

Verify these `@keyframes` exist in style.css (should have been added in Phase 0):
```css
@keyframes fadeIn { ... }
@keyframes fadeSlideUp { ... }
@keyframes pulseGlow { ... }
@keyframes shimmer { ... }
```

### Add Staggered Entrance Animations

For elements that appear in lists (character cards in draft, player cards, event entries):
```css
.stagger-in > * {
  animation: fadeSlideUp 0.3s ease both;
}
.stagger-in > *:nth-child(1) { animation-delay: 0s; }
.stagger-in > *:nth-child(2) { animation-delay: 0.04s; }
.stagger-in > *:nth-child(3) { animation-delay: 0.08s; }
.stagger-in > *:nth-child(4) { animation-delay: 0.12s; }
.stagger-in > *:nth-child(5) { animation-delay: 0.16s; }
.stagger-in > *:nth-child(6) { animation-delay: 0.2s; }
.stagger-in > *:nth-child(7) { animation-delay: 0.24s; }
.stagger-in > *:nth-child(8) { animation-delay: 0.28s; }
/* Cap at ~0.3s total for any list */
.stagger-in > *:nth-child(n+9) { animation-delay: 0.3s; }
```

Apply `.stagger-in` class to:
- Draft character card grid
- Herald event list
- Game over rankings

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## Task 3: Accessibility

### Focus Styles

```css
/* Visible focus ring for keyboard navigation */
:focus-visible {
  outline: 2px solid var(--text-accent);
  outline-offset: 2px;
}

/* Remove default focus for mouse users */
:focus:not(:focus-visible) {
  outline: none;
}

/* Specific component focus styles */
.gbtn:focus-visible {
  outline: 2px solid var(--btn-clr, var(--text-accent));
  outline-offset: 2px;
}

.charcard:focus-visible {
  outline: 3px solid var(--text-accent);
  outline-offset: 2px;
}

.dcard.clickable:focus-visible {
  outline: 2px solid var(--c-bdr, var(--text-accent));
  outline-offset: 1px;
}
```

### Image Alt Text

In `js/ui.js`, ensure every `<img>` element has an `alt` attribute:
- Character portraits: `alt="{Character Name}"`
- District images: `alt="{District Name}"`
- UI icons: `alt="{icon purpose}"` or `role="presentation"` for decorative icons
- Background images (CSS): no alt needed (decorative)

### Contrast Verification

With the light palette, verify these combinations pass WCAG AA (4.5:1 ratio):
- `--text-primary` (#2c2418) on `--bg-body` (#f4f0e8) → should pass
- `--text-muted` (#8a7d68) on `--bg-panel` (#fffdf7) → CHECK THIS — may need darkening
- `--text-accent` (#b8860b) on `--bg-body` (#f4f0e8) → CHECK THIS — may need darkening
- Each district `txt` on its `bg` → verify all 5 combinations

If any fail, adjust the lighter color to increase contrast while maintaining the palette feel.

### Keyboard Navigation

For draft character selection in `renderDraft()`:
- Each `.charcard` should have `tabindex="0"`
- Enter/Space should trigger selection (add `onkeydown` handler)
- Arrow keys for grid navigation (optional enhancement)

For buttons:
- All `.gbtn` elements should already be `<button>` tags (naturally focusable)
- Verify all have visible focus states

---

## Task 4: Performance

### Image Optimization

In `js/ui.js` and `js/lobby.js`, when creating `<img>` elements:
```js
var img = el('img', {
  src: imgSrc,
  alt: altText,
  width: 200,      // explicit dimensions prevent layout shift
  height: 300,
  loading: 'lazy',  // lazy load non-critical images
  decoding: 'async'
});
```

Critical images that should NOT be lazy-loaded:
- Current screen's background image
- Active character portrait in herald/action
- Cards in the player's hand

### Preload Critical Images

Add to `index.html` `<head>`:
```html
<!-- Preload lobby background for instant display -->
<link rel="preload" href="img/bg/lobby.svg" as="image">
<!-- Preload UI icons -->
<link rel="preload" href="img/ui/gold.svg" as="image">
<link rel="preload" href="img/ui/card.svg" as="image">
<link rel="preload" href="img/ui/crown.svg" as="image">
```

### CSS Optimization
- Verify no duplicate CSS rules
- Consolidate similar rules where possible
- Ensure transitions only apply to properties that actually change
- Use `will-change: transform` on elements with hover lift effects (but sparingly)

---

## Task 5: Textures & Atmosphere

### Subtle Parchment Texture on Cards

```css
.dcard::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,..."); /* inline SVG noise pattern */
  opacity: 0.03;
  pointer-events: none;
  border-radius: inherit;
}
```

Or use a CSS-only noise approach:
```css
.dcard {
  position: relative;
}
.dcard::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-conic-gradient(
    rgba(0,0,0,0.01) 0% 25%,
    transparent 0% 50%
  ) 0 0 / 4px 4px;
  border-radius: inherit;
  pointer-events: none;
}
```

### Gradient Depth on Panels

```css
#topbar {
  background: linear-gradient(180deg, var(--bg-panel), color-mix(in srgb, var(--bg-panel) 95%, var(--bg-body)));
}

#bottom {
  background: linear-gradient(0deg, var(--bg-panel), color-mix(in srgb, var(--bg-panel) 95%, var(--bg-body)));
}
```

### Warm Vignette on Game Background

```css
#app::after {
  content: '';
  position: fixed;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 50%, rgba(44,36,24,0.08) 100%);
  pointer-events: none;
  z-index: 0;
}
```

### Inner Glow on Active Elements

```css
.tb-player.active {
  box-shadow: inset 0 0 12px rgba(184,134,11,0.08), var(--shadow-card);
}
```

---

## Task 6: Comprehensive Testing

### Test Matrix

Run through each scenario and verify:

**Lobby:**
- [ ] Home screen: 3 mode cards display, hover effects work
- [ ] Solo config: player count buttons work, character selection works
- [ ] Host config: name input, player slots, create room
- [ ] Hosting: room code visible, player list updates
- [ ] Join: name + code inputs, join button
- [ ] All lobby screens: responsive at 1024px and 768px

**Draft:**
- [ ] Character cards display with portraits
- [ ] Available/removed/unavailable states correct
- [ ] Click to select works
- [ ] Keyboard navigation works (Tab + Enter)

**Herald:**
- [ ] Character portrait displays
- [ ] Progress bar shows thumbnails
- [ ] Events display with correct colors
- [ ] Continue button works
- [ ] All 16 characters display correctly

**Action (test each character):**
- [ ] Assassin: kill target selection
- [ ] Thief: steal target selection
- [ ] Magician: swap/discard buttons
- [ ] King: noble income display
- [ ] Bishop: religious income display
- [ ] Merchant: trade income display
- [ ] Architect: draw + build 3
- [ ] Warlord: destroy target selection
- [ ] Queen: seating bonus
- [ ] Navigator: 4G/4 cards toggle
- [ ] Wizard: hand view + take card
- [ ] Patrician: crown + noble card draws
- [ ] Abbot: religious income + steal from richest
- [ ] Scholar: 7-card draw
- [ ] Seer: take from opponents
- [ ] Trader: trade income + build 2
- [ ] Income buttons (gold/cards) work for all
- [ ] Build section: affordable/expensive distinction
- [ ] Smithy active building: pay 2G button
- [ ] End Turn button works

**Game Over:**
- [ ] Rankings display correctly
- [ ] Scores calculated and shown
- [ ] City display with all districts
- [ ] Play Again button works

**Multiplayer:**
- [ ] Host creates room, code displays
- [ ] Peer joins with code
- [ ] Draft syncs between players
- [ ] Herald acknowledging syncs
- [ ] Actions resolve correctly
- [ ] State broadcasts work (all players see same game state)

**Accessibility:**
- [ ] Tab through all interactive elements — focus ring visible
- [ ] Enter/Space activates focused buttons
- [ ] All images have alt text
- [ ] No contrast failures (use browser DevTools accessibility checker)

**Performance:**
- [ ] Page loads without visible layout shift
- [ ] Animations are smooth (no jank)
- [ ] No console errors or warnings
- [ ] Images load without blocking rendering

---

## Verification Checklist

- [ ] All responsive breakpoints work (1024px, 768px)
- [ ] All animations play smoothly
- [ ] `prefers-reduced-motion` disables animations
- [ ] Focus styles visible on all interactive elements
- [ ] WCAG AA contrast passes for all text/background combinations
- [ ] All images have alt text
- [ ] Preload links added for critical assets
- [ ] Lazy loading on non-critical images
- [ ] Parchment texture visible on cards (subtle)
- [ ] Gradient depth on panels
- [ ] Vignette on game background
- [ ] Full test matrix above passes
- [ ] No JavaScript errors in console
- [ ] No CSS errors in console

## Success Criteria
The game is polished, responsive, accessible, and performant. It works beautifully on desktop and tablet sizes. Keyboard navigation works. Animations are smooth and respectful of user preferences. The atmosphere is warm, inviting, and distinctively medieval fantasy.
