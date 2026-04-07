# Agent Instructions: Phase 1 — Inline Style Extraction

## Prerequisites
- Phase 0 must be complete (CSS variables and light palette in place)
- Read `docs/ui-redesign/design-system.md` for component patterns
- Read `docs/ui-redesign/frontend-design-principles.md` for aesthetic guidelines
- Read `CLAUDE.md` for architecture constraints

## Objective
Move ALL inline `style:` assignments from JavaScript rendering code into named CSS classes. After this phase, `js/ui.js` and `js/lobby.js` should have near-zero inline style attributes — all styling controlled by CSS classes.

## Scope
**Files to modify:**
- `css/style.css` — Add ~90 new named CSS classes
- `js/ui.js` — Replace `{style:'...'}` with `{class:'...'}` in `el()` calls
- `js/lobby.js` — Same treatment

**Files to NEVER modify:**
- `js/engine.js`, `js/net.js`, `js/ext-api.js` — NEVER

## Critical Architecture Notes

### The `el()` Helper Function
Located near the top of `js/ui.js`. Creates DOM elements:
```js
function el(tag, attrs, text) { ... }
```
It already supports both `style` and `class` attributes. Our job is to stop passing `style` and start passing `class` (or `className`).

### Global Scope Rules
- `function foo(){}` and `var foo` → become `window.foo` (cross-file accessible)
- `let foo` / `const foo` → script-scoped only
- PRESERVE all existing `var` and `function` declarations
- Do NOT convert `var` to `let`/`const`

### Dynamic Colors Pattern
Two categories of inline styles need different solutions:

**Category A: District-color elements (cards, chips)**
Currently: `style: 'background:${c.bg}; border-color:${c.bdr}; color:${c.txt}'`
Solution: Add CSS class `.color-${d.color}` (e.g., `.color-yellow`) and let CSS handle it.

**Category B: Character-color elements (buttons, banners)**
Currently: `style: 'background:${color}20; border-color:${color}55; color:${color}'`
Solution: Set a single `--btn-clr` (or `--char-clr`) CSS custom property inline, and let CSS derive all dependent colors.

## Detailed Steps

### Step 1: Audit All Inline Styles

Before making changes, scan both files and list every `style:` usage. Group them by:
1. Static styles (can become a CSS class directly)
2. District-color styles (use `.color-*` classes)
3. Character-color styles (use `--btn-clr` / `--char-clr` custom property)
4. Truly dynamic styles (must remain inline — e.g., width percentages from game state)

### Step 2: Refactor `gbtn()` in ui.js

Current pattern:
```js
function gbtn(label, color, onClick, extra) {
  var b = el('button', {
    class: 'gbtn',
    style: 'background:' + color + '20;border-color:' + color + '55;color:' + color + ';' + (extra || ''),
  }, label);
  b.onmouseenter = function() { b.style.background = color + '40'; };
  b.onmouseleave = function() { b.style.background = color + '20'; };
  b.onclick = onClick;
  return b;
}
```

New pattern:
```js
function gbtn(label, color, onClick, extra) {
  var b = el('button', {
    class: 'gbtn' + (extra ? '' : ''),
    style: '--btn-clr:' + color + ';' + (extra || ''),
  }, label);
  b.onclick = onClick;
  return b;
}
```

CSS handles hover:
```css
.gbtn {
  background: color-mix(in srgb, var(--btn-clr) 12%, var(--bg-panel));
  border: 1px solid color-mix(in srgb, var(--btn-clr) 35%, var(--border-main));
  color: var(--btn-clr);
  transition: background var(--transition-fast), box-shadow var(--transition-fast);
}
.gbtn:hover {
  background: color-mix(in srgb, var(--btn-clr) 22%, var(--bg-panel));
}
```

**Fallback note**: If `color-mix()` is not supported in target browsers, use this pattern instead:
```css
.gbtn {
  background: var(--bg-panel);
  border: 1px solid var(--border-main);
  color: var(--btn-clr);
  /* Use a pseudo-element overlay for the color tint */
}
```
Or keep the hex+alpha inline styles as a fallback and just remove the JS hover handlers.

### Step 3: Refactor `mkCard()` in ui.js

Current: Applies district colors via inline styles on each card element.
New: Add `.color-${d.color}` class to the card div. CSS rules handle the coloring:

```css
/* Applied to .dcard elements */
.dcard { background: var(--c-bg); border-color: var(--c-bdr); color: var(--c-txt); }
.dcard-emoji-col { border-color: var(--c-bdr); background: var(--c-bg); }
```

The `.color-yellow`, `.color-blue`, etc. classes (added in Phase 0) set `--c-bg`, `--c-bdr`, `--c-txt` which cascade into these rules.

### Step 4: Extract Inline Styles Function by Function

Work through each rendering function. For each inline `style:` attribute:
1. Create a named CSS class in `style.css`
2. Replace `{style:'...'}` with `{class:'classname'}` in the JS
3. If the element needs both a class and a dynamic property, use both: `{class:'classname', style:'--foo:val'}`

**Naming convention for new classes:**
- Lobby: `.lobby-*` (e.g., `.lobby-page`, `.lobby-box`, `.lobby-title`)
- Draft: `.draft-*` (e.g., `.draft-grid`, `.draft-info-bar`)
- Herald: `.herald-*` (already mostly exists, add missing ones)
- Action: `.action-*` (e.g., `.action-income-btn`, `.action-end-turn`)
- Game Over: `.gameover-*` (e.g., `.gameover-podium`, `.gameover-rank`)
- Generic: `.badge`, `.status-pill`, `.section-divider`

### Step 5: Process `js/lobby.js`

Same treatment for lobby rendering code:
- `renderLobby()` with its 6 sub-screens (home, solo, host, hosting, join, connecting)
- `renderCharSelect()` — character selection grid
- `showCharTooltip()` / `_ensureCharTooltip()` — tooltip popup
- Any helper functions with inline styles

### Step 6: Clean Up

- Remove any unused style strings
- Verify no `onmouseenter`/`onmouseleave` handlers remain for hover effects (CSS handles them)
- Ensure the `el()` function still works correctly with the new class-based approach

## New CSS Classes Reference

Here is a non-exhaustive list of classes you'll likely need to create. Discover the actual list by auditing the inline styles:

```
/* Lobby */
.lobby-page          /* full-height scrollable wrapper */
.lobby-box           /* centered card container */
.lobby-title         /* ⚜ Citadels heading */
.lobby-subtitle      /* tagline or instructions */
.lobby-mode-grid     /* 3-button mode selection grid */
.lobby-mode-card     /* individual mode card (Solo/Host/Join) */
.lobby-input         /* text input fields */
.lobby-input-label   /* input labels */
.lobby-player-list   /* player list in hosting/waiting */
.lobby-player-item   /* individual player row */
.lobby-code          /* room code display */
.lobby-section       /* generic section wrapper */
.lobby-back-btn      /* back button */
.config-row          /* player count / AI config row */
.config-label        /* config option label */
.char-select-grid    /* character selection radio grid */
.char-preset-btn     /* preset buttons (Standard, Expanded, etc.) */
.char-tooltip        /* character info tooltip */

/* Draft */
.draft-grid          /* character card grid */
.draft-info          /* "X face-down, Y face-up" info bar */
.draft-removed       /* removed character styling */

/* Action */
.action-banner       /* already exists - update to use vars */
.action-income       /* income option section */
.action-income-btn   /* take gold / draw cards buttons */
.action-special      /* special ability section */
.action-target-grid  /* target selection grid */
.action-target-btn   /* individual target button */
.action-build        /* build section */
.action-build-count  /* "Built 1/3" counter */
.action-end-turn     /* end turn button */
.action-label        /* section label */

/* Herald */
.herald-beat-name    /* player name in beat */
.herald-ready-count  /* "2/4 players ready" */

/* Game Over */
.gameover-wrapper    /* results container */
.gameover-rank       /* individual player rank row */
.gameover-rank-num   /* rank number (1st, 2nd...) */
.gameover-score      /* score display */
.gameover-city       /* city display */
.gameover-play-again /* play again button */

/* Utilities */
.badge               /* small pill badge (YOU, 👑, etc.) */
.status-dead         /* ☠️ death indicator */
.section-divider     /* horizontal divider */
.text-center         /* text-align: center */
.flex-center         /* flex + center alignment */
.gap-sm              /* gap: var(--space-sm) */
.gap-md              /* gap: var(--space-md) */
```

## Verification Checklist

- [ ] Open game in browser — visually identical to Phase 0 output
- [ ] Right-click → Inspect any card element: should have CSS classes, minimal inline styles
- [ ] Right-click → Inspect any button: should use `--btn-clr` property, no inline background
- [ ] Hover effects work on cards (CSS `:hover`, not JS handlers)
- [ ] Hover effects work on buttons (CSS `:hover`, not JS handlers)
- [ ] Play through solo game: draft → herald → action → build → game over
- [ ] All character abilities render correctly in action phase
- [ ] Lobby screens all render correctly (home, solo config, host config, etc.)
- [ ] Character tooltips appear on hover in lobby
- [ ] Confirm modal still works
- [ ] No JavaScript errors in console
- [ ] Search `js/ui.js` for `style:` — count should be very low (only truly dynamic values)
- [ ] Search `js/lobby.js` for `style:` — count should be very low

## Success Criteria
Zero visual change from Phase 0. All styling is now CSS-class-driven. The style.css file has grown from ~112 lines to ~450+ lines. Inline styles in JS are reduced to only truly dynamic values (like `--btn-clr` custom properties or percentage-based widths from game state).
