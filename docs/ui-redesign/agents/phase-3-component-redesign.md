# Agent Instructions: Phase 3 — Component Visual Redesign

## Prerequisites
- Phase 0 (CSS vars), Phase 1 (inline migration), Phase 2 (images) must be complete
- Read `docs/ui-redesign/design-system.md` — the FULL design system spec
- Read `docs/ui-redesign/frontend-design-principles.md` — CRITICAL aesthetic guidelines
- Read `CLAUDE.md` — architecture constraints

## Objective
Apply the full visual redesign to every UI component. This is the creative phase — make the game look STUNNING while following the established design system. Every component should feel polished, intentional, and distinctively "Citadels."

**Remember from the frontend-design principles**: Claude is capable of extraordinary creative work. Don't hold back. Commit fully to the Light Fantasy Elegance aesthetic.

**Responsive is non-negotiable**: Every component must be designed for all screen sizes simultaneously. Implement mobile layout alongside desktop layout — do not defer responsive work to Phase 4. Use the breakpoints and per-component rules in `design-system.md § Responsive Design`.

## Scope
**Files to modify:**
- `css/style.css` — Enhance existing classes, add new decorative styles
- `js/ui.js` — Update rendering functions for new visual layouts
- `js/lobby.js` — Redesign lobby screens

**Files to NEVER modify:**
- `js/engine.js`, `js/net.js`, `js/ext-api.js`

## Important Constraint
All changes are RENDERING ONLY. The game state object `S`, all action functions (`humanDraft`, `humanIncome`, `humanBuild`, etc.), and the engine flow must remain untouched. Only change how things LOOK, not how they WORK.

---

## Component 3A: Lobby Redesign

**File**: `js/lobby.js` → `renderLobby()`

### Visual Changes
1. **Background**: Full-bleed `img/bg/lobby.svg` with soft overlay gradient
2. **Container**: Frosted glass card effect
   ```css
   .lobby-box {
     backdrop-filter: blur(16px);
     background: rgba(255,253,247,0.88);
     border: 1px solid rgba(212,200,168,0.6);
     box-shadow: var(--shadow-float);
     border-radius: var(--radius-xl);
   }
   ```
3. **Title**: "⚜ Citadels" — large Cinzel, golden text-shadow glow
   ```css
   .lobby-title {
     font-family: var(--font-display);
     font-size: 28px;
     font-weight: 700;
     color: var(--text-accent);
     text-shadow: 0 0 20px rgba(184,134,11,0.3);
   }
   ```
4. **Mode cards** (Solo/Host/Join): Large clickable cards with icons, hover lift + shadow
5. **Inputs**: Warm border, golden focus glow
   ```css
   .lobby-input:focus {
     border-color: var(--text-accent);
     box-shadow: 0 0 0 3px rgba(184,134,11,0.15);
   }
   ```
6. **Character selection**: Show character thumbnails instead of emojis in the preset/radio grid
7. **Room code display**: Large, monospace, golden background, easy to copy
8. **Player list**: Cards with avatars/colors, ready indicators
9. **Entrance animation**: `fadeSlideUp` on screen transitions (apply `.animate-in` class)

### Responsive Rules (3A)
- **Mobile (≤768px)**: Mode cards stack vertically, full-width. `.lobby-box` uses full viewport width with small margin. Inputs are full-width. Room code text scales down to fit.
- **Tablet (≤1024px)**: Mode cards in 2-column grid. Lobby box max-width 480px centered.
- All inputs: `min-height: 44px` for touch targets.

### Screen-by-Screen Details

**Home screen**:
- Three large mode cards in a row (or stacked on narrow screens)
- Each card: icon (SVG or large emoji), mode name (Cinzel bold), brief description
- Cards lift on hover with shadow expansion

**Solo/Host config**:
- Clean form layout with proper label/input alignment
- Player count: styled increment/decrement buttons
- Character selection: grid of character thumbnails with radio selection
- Start/Create button: prominent, full-width at bottom, golden accent

**Hosting room**:
- Room code in large, easily readable format with copy-to-clipboard affordance
- Player list with turn order numbers, name, AI/Human badge
- Start Game button: large, golden, disabled until minimum players

**Join room**:
- Name input + room code input, clean stacked layout
- Join button: prominent

---

## Component 3B: Draft Screen

**File**: `js/ui.js` → `renderDraft()`

### Visual Changes
1. **Background tint**: Subtle blue-purple wash for draft phase
2. **Title**: "Choose your character" — Cinzel, centered
3. **Info bar**: Face-down/face-up removed counts in styled pills
4. **Character cards**: LARGE portrait cards (~180px wide)
   - Image background (character portrait SVG) with gradient scrim overlay
   - Name overlaid on bottom with text-shadow for readability
   - Rank number badge in top corner
   - **Available**: full color, hover → lift 3px + golden glow shadow
   - **Removed**: `filter: grayscale(1) brightness(0.6)` + "NOT IN PLAY" banner
   - **Unavailable**: dimmed, no hover effect
5. **Grid**: `repeat(auto-fill, minmax(180px, 1fr))`, centered, generous gap

### Responsive Rules (3B)
- **Mobile**: `minmax(110px, 1fr)` — 2-3 columns at small sizes. Cards at 110px width.
- **Tablet**: `minmax(140px, 1fr)` — 3-4 columns. Cards at 140px width.
- Character card name text must remain legible at all sizes — use `font-size: clamp(11px, 1.5vw, 14px)`.

---

## Component 3C: Herald Screen

**File**: `js/ui.js` → `renderHerald()`

### Visual Changes
1. **Character portrait**: Large (~200px tall) portrait image as centerpiece
2. **Progress bar**: Replace plain pips with mini character thumbnails (32px circles)
   - Past: filled with character color
   - Current: golden border pulse animation
   - Future: empty/muted
3. **Herald card**: Elevated card panel with subtle border
4. **Character name**: Large Cinzel, character color
5. **Beat info**: Player name, ability text
6. **Event log**: Each event as a mini-card with:
   - Left color bar (3px, event type color)
   - Icon (SVG or emoji)
   - Description text
   - Subtle background tint matching event type
7. **Continue button**: Full-width, character-colored, with subtle gradient
8. **Background tint**: Subtle wash matching character color (via `--herald-clr` variable on container)
9. **Transition**: When advancing to next character, slide-out + slide-in animation

### Responsive Rules (3C)
- **Mobile**: Portrait at 110px, pips collapse to a simple color-dot row (no thumbnails — too small). Events show icon + text only (no background card).
- **Tablet**: Portrait at 150px, thumbnail pips visible.
- Herald card max-width: 100% on mobile, 680px on desktop.

---

## Component 3D: Action Phase

**File**: `js/ui.js` → `renderAction()`

### Visual Changes
1. **Action banner**: Character portrait (100-120px) alongside name + ability panel
   - Background: subtle character-color tint
   - Border: character color
2. **Income section**: Two large buttons side by side
   - "Take 2 Gold" with gold coin SVG icon
   - "Draw Cards" with card SVG icon
   - Buttons use character color via `--btn-clr`
3. **Special ability section**: Themed frame
   - Border: character color
   - Background: very subtle character-color tint
   - Target selection: grid of styled buttons/cards
   - Pending action: status pill with icon
4. **Build section**:
   - "Build a District" header with build SVG icon
   - Affordable cards: full color, clickable, hover glow
   - Too expensive cards: dimmed, with cost in red
   - Build counter: "Built 1/3" styled pill
5. **End Turn button**: Full-width, GREEN gradient, large padding, prominent
   ```css
   .action-end-turn {
     background: linear-gradient(135deg, #2a8a4a, #1a6b3a);
     color: white;
     padding: 14px;
     font-size: 14px;
     border-radius: var(--radius-md);
     box-shadow: var(--shadow-card);
   }
   ```
6. **Active buildings** (Smithy): Distinct panel with ⚒️ icon and "Pay 2✦" button

### Responsive Rules (3D)
- **Mobile**: Banner portrait shrinks to 70px. Income buttons stack vertically (full-width). Target selection grid uses 2 columns max. End Turn button always full-width with `min-height: 48px`.
- **Tablet**: Banner portrait at 80px. Income buttons side by side.
- Build section cards wrap naturally — `flex-wrap: wrap` already handles this.

---

## Component 3E: Top Bar & Player Panels

**File**: `js/ui.js` → `render()` (topbar section)

### Visual Changes
1. **Header row**: Title + round info + calling character
2. **Player cards**: Slightly more padding, cleaner layout
   - Character thumbnail (32px) next to name when revealed
   - Stats row: SVG icons (gold.svg, build.svg, card.svg, score.svg) replacing emojis
   - Active player: animated golden border pulse (`pulseGlow` animation)
   - Current player: subtle green left bar
3. **City chips**: Show district thumbnail (if available) + name + cost
4. **Tooltips**: Cleaner styling, match new palette

### Responsive Rules (3E)
- **Mobile**: Player grid is 1-column. Stats row wraps to 2 lines if needed. City chips truncate long district names with `text-overflow: ellipsis`. Top bar `max-height` increases slightly to accommodate the taller stacked layout.
- **Tablet**: 2-column player grid. Thumbnails at 24px.

---

## Component 3F: Bottom Panel

**File**: `js/ui.js` → `render()` (bottom section)

### Visual Changes
1. **Hand section**: Character role display with thumbnail
   - Portrait cards with image backgrounds
   - Hover: lift + shadow + slight `scale(1.02)`
   - Disabled cards: low opacity + no hover
2. **City section**: Organized by color with section dividers
   - Each color group has a subtle header
   - Cards show district thumbnails
   - Selected card: golden glow ring

### Responsive Rules (3F)
- **Mobile**: Hand and city panels stack vertically (`flex-direction: column`). Each panel gets `max-height: 40vh` with scroll. Portrait cards shrink to 96px width.
- **Tablet**: Side by side (default), portrait cards at 110px.

---

## Component 3G: Game Over Screen

**File**: `js/ui.js` → `renderGameOver()`

### Visual Changes
1. **Background**: Golden radial gradient (celebratory)
2. **Winner**: Large portrait, name in golden Cinzel, crown icon
3. **Rankings**: Podium-style layout
   - 1st: large, golden accent, portrait
   - 2nd/3rd: medium, silver/bronze accent
   - Others: smaller rows
4. **Score display**: Animated fill bar (CSS animation from 0 to final width)
5. **City display**: All district images in a wrap grid, organized by color
6. **Bonus breakdown**: Score components listed with icons
7. **"Play Again" button**: Large, prominent, golden, centered

### Responsive Rules (3G)
- **Mobile**: Rankings in a single full-width vertical list (no podium). Each row: rank number + name + score. City grid uses 2-column wrap of small district chips.
- **Tablet**: Podium layout for top 3 (side by side), smaller rows for the rest.

---

## CSS Additions

Add to `css/style.css`:

```css
/* Frosted glass effect */
.glass {
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  background: rgba(255,253,247,0.88);
}

/* Animate-in utility */
.animate-in {
  animation: fadeSlideUp 0.3s ease both;
}

/* Staggered animation delays */
.animate-in:nth-child(1) { animation-delay: 0s; }
.animate-in:nth-child(2) { animation-delay: 0.05s; }
.animate-in:nth-child(3) { animation-delay: 0.1s; }
.animate-in:nth-child(4) { animation-delay: 0.15s; }
.animate-in:nth-child(5) { animation-delay: 0.2s; }

/* Active player pulse */
.tb-player.active {
  animation: pulseGlow 2s ease-in-out infinite;
}

/* Card image overlay scrim */
.img-scrim {
  background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%);
}

/* Portrait image in cards */
.herald-portrait {
  width: 200px;
  height: auto;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}
```

---

## Verification Checklist

- [ ] Lobby: all 6 screens render beautifully with frosted glass effect
- [ ] Lobby: entrance animations play on screen transitions
- [ ] Draft: character cards show portraits with gradient scrim
- [ ] Draft: available/removed/unavailable states visually distinct
- [ ] Herald: large portrait visible, progress thumbnails work
- [ ] Herald: events display with color-coded borders
- [ ] Action: character portrait in banner
- [ ] Action: income buttons have SVG icons
- [ ] Action: all 16 character abilities render correctly
- [ ] Action: build section shows affordable/expensive distinction
- [ ] Top bar: player cards show character thumbnails
- [ ] Top bar: active player has golden pulse
- [ ] Bottom: hand cards have image backgrounds
- [ ] Bottom: city organized by color
- [ ] Game over: podium layout with winner portrait
- [ ] Solo game: full playthrough works
- [ ] Multiplayer: host + peer renders sync correctly
- [ ] Extensions: extension API still works (test if any are enabled)
- [ ] No JavaScript errors in console
- [ ] Performance: no visible jank or lag
- [ ] **Responsive — Mobile (768px)**: Lobby stacks vertically, player grid is 1-column, bottom panels stack, draft fits in 2 columns
- [ ] **Responsive — Tablet (1024px)**: Player grid is 2-column, draft fits in 3-4 columns, lobby box is centered
- [ ] **Touch targets**: All buttons/cards ≥44px tall on mobile
- [ ] **Fluid text**: Titles scale with `clamp()` and don't overflow at any size

## Success Criteria
The game looks like a premium board game companion app — light, airy, richly illustrated, and polished. Every component has visual intentionality. The aesthetic is cohesive and distinctive. It looks NOTHING like generic AI-generated UI. It works beautifully on mobile, tablet, and desktop.
