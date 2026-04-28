# Agent Instructions: Phase 4 — Polish, Accessibility & Game Over

## Prerequisites
- Phases 0–3 are complete. Read this doc fully before starting — several Phase 4 items from
  the original spec are already done and are noted as such.
- Read `docs/ui-redesign/design-system.md` for token names and typography rules.
- Read `docs/ui-redesign/frontend-design-principles.md` for aesthetic standards.
- Read `CLAUDE.md` for architecture constraints (global scope, no modules, etc.).

## Scope
**Files to modify:**
- `css/style.css` — Textures, stagger animations, CSS class extractions, CSS cleanup
- `js/ui.js` — Alt text, lazy loading, stagger class, inline style cleanup, keyboard nav, game over redesign
- `js/lobby.js` — Inline style cleanup
- `index.html` — Preload links

**Files to NEVER modify:**
- `js/engine.js`, `js/net.js`, `js/ext-api.js`

---

## Already Done — Skip These

The following items from the original Phase 4 spec were completed during Phases 0–3:

- ✅ All `@keyframes` (fadeIn, fadeSlideUp, pulseGlow, shimmer, activePlayerGlow)
- ✅ `prefers-reduced-motion` media query
- ✅ `:focus-visible` global focus ring
- ✅ Responsive breakpoints at 1024px, 768px, 480px
- ✅ `.animate-in` class with stagger delays
- ✅ `.glass` frosted glass utility class
- ✅ Mobile layout fully tested at 393×852px (iPhone 15 Pro)

Do NOT re-add or duplicate any of these.

---

## Task 1: Inline Style Cleanup (Phase 1 Leftovers)

### In `js/ui.js`

Several flex-layout container divs still use raw inline styles. Extract each to a named CSS class.

Patterns to find and replace:
```js
// These should become CSS classes:
el('div', {style: 'display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px'})
el('div', {style: 'display:flex;gap:6px'})
el('div', {style: 'display:flex;flex-wrap:wrap;gap:10px;margin-bottom:8px'})
el('div', {style: 'display:flex;flex-direction:column;align-items:center;gap:3px'})
el('div', {style: 'display:flex;flex-wrap:wrap;gap:5px;margin-bottom:8px'})
el('div', {style: 'display:flex;gap:8px;flex-wrap:wrap'})
el('div', {style: 'display:flex;flex-wrap:wrap;gap:6px'})
```

Add CSS classes like `.flex-wrap-sm`, `.flex-wrap-md`, `.flex-col-center` — or more semantic names
if the container has a clear role (e.g. `.target-grid`, `.discard-row`, `.seer-hand-row`).

**Do NOT change**: lines using `--btn-clr`, `--char-clr` CSS custom properties. Those are the
correct pattern for dynamic character colors and must stay inline.

Also fix: `style='color:${c.clr}'` patterns that don't already use `--char-clr`. Change to
`style='--char-clr:${c.clr}'` and update the CSS to use `color: var(--char-clr)` on that class.

### In `js/lobby.js`

```js
// These should become CSS classes:
el('div', {style: 'margin-bottom:16px'})
el('div', {style: 'margin-bottom:12px'})
el('div', {style: 'margin-bottom:20px'})
el('span', {style: 'flex:1'})
```

And conditional border patterns:
```js
// Replace with CSS class + modifier:
{style: isActive ? 'border:1px solid var(--c-green-bdr)' : 'border:1px solid var(--border-subtle)'}
// Becomes:
{class: `lobby-order-row${isActive ? ' active' : ''}`}
// CSS:
.lobby-order-row { border: 1px solid var(--border-subtle); }
.lobby-order-row.active { border-color: var(--c-green-bdr); }
```

### CSS cleanup: duplicate 480px media query

There are TWO `@media (max-width: 480px)` blocks at the bottom of style.css. Merge them into one.
The first block (around line 695) and the second (around line 736) have overlapping rules —
keep the most specific/recent rule for each property and remove duplicates.

---

## Task 2: Image Accessibility & Performance

### Alt Text (accessibility requirement)

In `js/ui.js`, every `<img>` element must have an `alt` attribute.

Find all `el('img', {...})` calls and ensure each has `alt`:
- Herald portrait: `alt: c.name` (the character's name)
- Character thumbnails (progress pips): `alt: ''` (decorative, screen reader ignores)
- District images: `alt: d.name` (the district's name)
- Action banner portrait: `alt: c.name`
- Any `role="presentation"` purely decorative images: `alt: ''`

In `js/lobby.js`:
- Character select thumbnails: `alt: ch.name`
- Background images set via `backgroundImage` CSS property: no alt needed (CSS, not `<img>`)

### Lazy Loading

For `<img>` elements that are NOT critical for the initial render, add:
```js
loading: 'lazy',
decoding: 'async'
```

**Do NOT lazy-load** (these are critical / above-the-fold):
- Herald portrait (active character's portrait)
- Action banner portrait
- Cards in the player's own hand

**Do lazy-load**:
- Character portrait thumbnails in progress pips
- District images in the city panels
- Opponent player thumbnails
- Lobby character select thumbnails

### Preload Critical Images

Add to `index.html` `<head>` (before the closing `</head>`):
```html
<!-- Preload lobby background for instant display -->
<link rel="preload" href="img/bg/lobby.svg" as="image">
```

Only preload `lobby.svg` — it's the first thing the user sees. The game background loads after
a click so it doesn't need preloading.

---

## Task 3: Stagger-In Animations

The `.animate-in` class exists in style.css with stagger delays for up to 5 children.
Extend it to support 8 children, then apply it to lists that benefit from entrance animation.

### Extend stagger delays in CSS

```css
/* Extend existing .animate-in stagger — add after the existing nth-child rules */
.animate-in:nth-child(6) { animation-delay: 0.25s; }
.animate-in:nth-child(7) { animation-delay: 0.30s; }
.animate-in:nth-child(8) { animation-delay: 0.35s; }
.animate-in:nth-child(n+9) { animation-delay: 0.40s; }
```

### Apply `.animate-in` to children

In `js/ui.js`, add `animate-in` class to direct children of these containers:
- **Draft character cards**: add `animate-in` to each `.charcard` element in the grid
- **Herald event log entries**: add `animate-in` to each event row/card
- **Game over ranking rows**: add `animate-in` to each player rank entry

Do this by adding the class on the child elements, not the parent container.
(The stagger works via `:nth-child` on the parent's children.)

---

## Task 4: Textures & Atmosphere

### Parchment texture on cards

Add a subtle noise texture overlay to `.dcard` using a CSS `::before` pseudo-element:

```css
.dcard {
  position: relative; /* already set, but confirm */
}
.dcard::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-conic-gradient(
    rgba(0,0,0,0.012) 0% 25%,
    transparent 0% 50%
  ) 0 0 / 3px 3px;
  border-radius: inherit;
  pointer-events: none;
  z-index: 0;
}
/* Ensure card content renders above the texture */
.dcard > * {
  position: relative;
  z-index: 1;
}
```

Test that this doesn't break district images or text readability. If the pattern is too strong,
reduce opacity by halving the color stop value (e.g. `0.006` instead of `0.012`).

### Gradient depth on panels

```css
#topbar {
  background: linear-gradient(180deg,
    var(--bg-panel),
    color-mix(in srgb, var(--bg-panel) 94%, var(--bg-body))
  );
}

#bottom {
  background: linear-gradient(0deg,
    var(--bg-panel),
    color-mix(in srgb, var(--bg-panel) 94%, var(--bg-body))
  );
}
```

### Warm vignette on the game wrapper

```css
.game-wrap::after {
  content: '';
  position: fixed;
  inset: 0;
  background: radial-gradient(
    ellipse at center,
    transparent 55%,
    rgba(44,36,24,0.07) 100%
  );
  pointer-events: none;
  z-index: 0;
}
```

Ensure `.game-wrap` has `position: relative` so this doesn't escape.

### Inner glow on active player card

The `activePlayerGlow` keyframe is defined. Verify it's applied:
```css
.tb-player.active {
  animation: activePlayerGlow 2s ease-in-out infinite;
  /* also add: */
  box-shadow: var(--shadow-card), 0 0 0 2px color-mix(in srgb, var(--text-accent) 28%, transparent);
}
```

---

## Task 5: Game Over Screen Redesign (3G — deferred from Phase 3)

This is the main creative task of Phase 4. The game over screen was never redesigned.

**File**: `js/ui.js` → `renderGameOver()`

### Layout

Replace the current flat list with a structured celebratory layout:

1. **Winner banner** (top): Large character portrait of the winner's last known character
   (or use avatar emoji if no character assigned), golden Cinzel name, crown icon, score.
   Background: warm golden radial gradient.

2. **Rankings list** (below winner): Each player as a card row:
   - Rank number (`1st`, `2nd`, `3rd`, `4th`) in Cinzel
   - Player name + avatar
   - Score with a horizontal fill bar (CSS width from 0 → score/maxScore %)
   - City district count
   - Score breakdown: base + longest road bonus + full city bonus + unique bonuses

3. **City display** (for the winner, or toggle): District chips organized by color category,
   small thumbnail format.

4. **Play Again button**: Full-width, prominent, golden, centered at bottom.

### Score fill bar animation

```css
.gameover-score-bar {
  height: 6px;
  background: var(--border-subtle);
  border-radius: 3px;
  overflow: hidden;
}
.gameover-score-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--text-accent), #d4a843);
  border-radius: 3px;
  width: 0%;
  transition: width 0.8s ease 0.3s; /* delay so it animates in after render */
}
```

In JS, after inserting the element: set the fill width via `requestAnimationFrame`:
```js
var fill = el('div', {class: 'gameover-score-fill'});
// After appending to DOM:
requestAnimationFrame(function() {
  fill.style.width = Math.round((score / maxScore) * 100) + '%';
});
```

### Responsive rules
- **Mobile**: Rankings in a vertical list, no podium. Score bar full-width. City chips in 3-col wrap.
- **Desktop**: Rankings list centered, max-width 600px, comfortable padding.

---

## Task 6: Keyboard Navigation for Draft

In `js/ui.js` → `renderDraft()`:

Each `.charcard` for available characters should be keyboard-accessible:
```js
var card = el('div', {
  class: `charcard ${stateClass}`,
  style: `--char-clr:${c.clr}`,
  tabindex: isAvailable ? '0' : '-1',  // only available cards are reachable
});

if (isAvailable) {
  card.onkeydown = function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      humanDraft(c.id);
    }
  };
}
```

---

## Task 7: WCAG Contrast Verification

Check these combinations manually in DevTools (Accessibility panel) or with a contrast checker:

| Foreground | Background | Token | Required | Action |
|---|---|---|---|---|
| `#8a7d68` | `#fffdf7` | `--text-muted` on panels | 4.5:1 | Darken muted if needed |
| `#b8860b` | `#f4f0e8` | `--text-accent` on body | 4.5:1 | Darken accent if needed |
| `#8b6914` | `#fdf6e3` | yellow district text | 4.5:1 | Should pass — verify |
| `#1a5f8a` | `#eef5fb` | blue district text | 4.5:1 | Should pass — verify |

If `--text-muted` fails: darken to `#7a6e58`.
If `--text-accent` fails: darken to `#9a7209` (update both `:root` token and `js/data.js` CS object).

Update token in `:root` AND in `js/data.js` `CS` object if changed.

---

## Verification Checklist

- [ ] No raw flex/layout inline styles remain in ui.js or lobby.js (--btn-clr/--char-clr are fine)
- [ ] Duplicate `@media (max-width: 480px)` merged into one block
- [ ] All `<img>` elements have `alt` attributes
- [ ] Non-critical images have `loading="lazy"` and `decoding="async"`
- [ ] `<link rel="preload">` added for lobby.svg in index.html
- [ ] Draft character cards have `animate-in` class (stagger entrance)
- [ ] Herald events have `animate-in` class
- [ ] Game over ranking rows have `animate-in` class
- [ ] Parchment texture visible on cards (subtle — not distracting)
- [ ] Panel gradient depth visible on topbar and bottom
- [ ] Vignette visible on game wrapper edges
- [ ] Active player card has golden glow pulse
- [ ] Game over screen: winner banner, rankings with score bars, play again button
- [ ] Score bars animate in after render (not instant-set)
- [ ] Draft: Tab navigates between available character cards
- [ ] Draft: Enter/Space selects the focused card
- [ ] WCAG AA contrast passes for muted and accent text
- [ ] Full solo game playthrough: draft → herald → action → game over
- [ ] No JavaScript errors in console
- [ ] No duplicate CSS rules
- [ ] Mobile (393×852): game over screen fits without horizontal scroll
- [ ] Mobile (393×852): draft keyboard nav still works (touch users unaffected)

## Success Criteria
The game has a complete, polished visual experience end-to-end. The game over screen is
celebratory and beautiful. Accessibility basics are in place. Textures add warmth without
visual noise. Code is clean — no legacy inline styles, no duplicate CSS blocks.
