# Citadels UI Design System

This document is the single source of truth for the visual redesign. All agents must read this before making any changes.

---

## Aesthetic Direction

**Theme**: Light & Airy Fantasy — a modern board-game app feel. Predominantly light backgrounds (off-white/cream), vibrant colored cards and panels, high contrast. Think sunlit medieval manuscript meets a polished digital tabletop.

**Mood**: Inviting, warm, elegant. NOT dark/gritty, NOT neon/cyberpunk, NOT generic flat UI.

**Inspiration**: Ghibli-meets-tarot card art, watercolor/gouache illustration, illuminated manuscripts, premium board game companion apps.

**Differentiation**: What makes this unforgettable is the contrast between the airy, light backgrounds and the richly illustrated character/district art. Cards feel like collectible items. The interface feels like opening a beautifully bound game box.

---

## Color Palette

### Base Theme (`:root` CSS Variables)

```css
:root {
  /* ── Backgrounds ── */
  --bg-body: #f4f0e8;           /* warm cream — main page background */
  --bg-panel: #fffdf7;          /* near-white — panels, top bar, bottom bar */
  --bg-card: #f0ece2;           /* light parchment — card surfaces */
  --bg-center: #faf7f0;         /* center game area */
  --bg-hover: #e8e2d4;          /* hover state for interactive elements */

  /* ── Text ── */
  --text-primary: #2c2418;      /* dark brown — main readable text */
  --text-secondary: #5a4e3a;    /* medium brown — secondary info */
  --text-muted: #8a7d68;        /* muted brown — labels, captions */
  --text-accent: #b8860b;       /* dark goldenrod — titles, highlights */
  --text-on-dark: #faf5ea;      /* light text for use on dark/colored backgrounds */

  /* ── Borders ── */
  --border-main: #d4c8a8;       /* warm tan — primary borders */
  --border-subtle: #e0d8c4;     /* light tan — subtle dividers */
  --border-strong: #b8a878;     /* darker tan — emphasis borders */

  /* ── District Colors (vibrant on light backgrounds) ── */
  --c-yellow-bg: #fdf6e3;  --c-yellow-bdr: #d4a843;  --c-yellow-txt: #8b6914;
  --c-blue-bg: #eef5fb;    --c-blue-bdr: #5a9fd4;    --c-blue-txt: #1a5f8a;
  --c-green-bg: #eef8f0;   --c-green-bdr: #4db87a;   --c-green-txt: #1a6b3a;
  --c-red-bg: #fdf0f0;     --c-red-bdr: #d45a5a;     --c-red-txt: #8b2020;
  --c-purple-bg: #f5eefb;  --c-purple-bdr: #9b6fff;  --c-purple-txt: #5a2890;

  /* ── Spacing ── */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;
  --space-xl: 24px;
  --space-2xl: 32px;

  /* ── Radius ── */
  --radius-sm: 5px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  /* ── Transitions ── */
  --transition-fast: 0.15s ease;
  --transition-med: 0.25s ease;
  --transition-slow: 0.4s ease;

  /* ── Shadows (soft for light theme) ── */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.06);
  --shadow-card: 0 2px 8px rgba(0,0,0,0.08);
  --shadow-hover: 0 6px 20px rgba(0,0,0,0.12);
  --shadow-float: 0 12px 36px rgba(0,0,0,0.15);
  --shadow-overlay: 0 8px 40px rgba(0,0,0,0.2);

  /* ── Overlay/Modal ── */
  --overlay-bg: rgba(44,36,24,0.5);
  --modal-bg: #fffdf7;
  --modal-border: #d4c8a8;

  /* ── Scrollbar ── */
  --scrollbar-track: #f0ece2;
  --scrollbar-thumb: #c8bc9c;
}
```

### Updated CS Object (`js/data.js`)

The CS object in data.js must be updated to match the light palette. Same keys, new values:

```js
const CS = {
  yellow: { bg:'#fdf6e3', bdr:'#d4a843', txt:'#8b6914', bar:'#d4a843', label:'Noble' },
  blue:   { bg:'#eef5fb', bdr:'#5a9fd4', txt:'#1a5f8a', bar:'#5a9fd4', label:'Religious' },
  green:  { bg:'#eef8f0', bdr:'#4db87a', txt:'#1a6b3a', bar:'#4db87a', label:'Trade' },
  red:    { bg:'#fdf0f0', bdr:'#d45a5a', txt:'#8b2020', bar:'#d45a5a', label:'Military' },
  purple: { bg:'#f5eefb', bdr:'#9b6fff', txt:'#5a2890', bar:'#9b6fff', label:'Unique' },
};
```

### Character Colors (in CHARS array)

These are the accent colors for each character. They remain vibrant — used for borders, buttons, and accents on the light background:

| Character | Color | Usage |
|-----------|-------|-------|
| Assassin | `#cc7777` | Muted red — kill/death UI |
| Thief | `#7a7a7a` | Dark gray — steal UI |
| Magician/Wizard/Seer | `#7a4fbf` | Deep purple — magic UI |
| King/Queen/Patrician | `#b8860b` | Dark gold — royal UI |
| Bishop/Abbot | `#2a7ab5` | Medium blue — religious UI |
| Merchant/Trader | `#2a8a4a` | Medium green — trade UI |
| Architect/Scholar | `#c07830` | Warm orange — builder UI |
| Warlord | `#c03030` | Strong red — military UI |
| Navigator | `#2a70b0` | Sky blue — naval UI |

---

## Typography

### Font Stack

```css
/* Display/headings — Cinzel is already loaded via Google Fonts */
--font-display: 'Cinzel', 'Palatino Linotype', 'Book Antiqua', serif;

/* Body text */
--font-body: Georgia, 'Times New Roman', serif;

/* Monospace (scores, codes) */
--font-mono: 'Courier New', Courier, monospace;
```

### Scale

| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| Page title (⚜ Citadels) | Cinzel | 20px | 700 | `--text-accent` |
| Section headers | Cinzel | 14px | 600 | `--text-accent` |
| Character names | Cinzel | 13-16px | 700 | character color |
| Player names | Cinzel | 13px | 600 | `--text-accent` |
| Body text | Georgia | 14px | 400 | `--text-primary` |
| Card names | Cinzel | 11-12px | 600 | district `txt` color |
| Labels/captions | Cinzel | 10-11px | 400 | `--text-muted` |
| Descriptions | Georgia | 10-11px | 400 | `--text-secondary` |
| Buttons | Cinzel | 12-13px | 600 | dynamic (matches accent) |

---

## Component Patterns

### Cards (District)

**Landscape (compact)** — used in city display and build picker:
- Background: district color `bg`
- Left border or left strip: district color `bdr` (3px)
- Text: district color `txt`
- Shadow: `--shadow-card`
- Hover: lift `translateY(-3px)` + `--shadow-hover`
- Selected: `bdr` color border (2px solid) + subtle glow

**Portrait (tall)** — used in hand and draft:
- Same coloring, vertical layout
- 130px width, image area on top (64px), info below
- When image available: district art fills top area with gradient scrim

### Cards (Character)

- Rounded rectangle, 1px border in character color
- Portrait image or SVG placeholder as background
- Gradient scrim overlay (bottom → transparent to dark) for text readability
- Name in Cinzel 13px 700 weight
- Ability text in Georgia 11px

### Buttons (`.gbtn`)

Dynamic coloring via `--btn-clr` CSS custom property:
```css
.gbtn {
  background: color-mix(in srgb, var(--btn-clr) 12%, var(--bg-panel));
  border: 1px solid color-mix(in srgb, var(--btn-clr) 35%, var(--border-main));
  color: var(--btn-clr);
}
.gbtn:hover {
  background: color-mix(in srgb, var(--btn-clr) 22%, var(--bg-panel));
  box-shadow: 0 2px 12px color-mix(in srgb, var(--btn-clr) 20%, transparent);
}
```

If `color-mix` is not supported, fall back to hex+opacity inline styles.

### Panels

- Background: `--bg-panel`
- Border: 1px solid `--border-main`
- Border-radius: `--radius-md` (8px)
- Shadow: `--shadow-sm`
- Padding: `--space-md` to `--space-lg`

### Modal/Overlay

- Overlay: `--overlay-bg` (semi-transparent brown)
- Modal: `--modal-bg` background, `--modal-border` border
- Shadow: `--shadow-float`
- Border-radius: `--radius-lg`

---

## Animations

```css
@keyframes fadeIn {
  from { opacity: 0 }
  to { opacity: 1 }
}

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(12px) }
  to { opacity: 1; transform: translateY(0) }
}

@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 8px var(--text-accent) }
  50% { box-shadow: 0 0 20px var(--text-accent) }
}

@keyframes shimmer {
  from { background-position: -200% 0 }
  to { background-position: 200% 0 }
}
```

Usage:
- Screen transitions: `fadeSlideUp` on lobby screen changes (`.animate-in`)
- Card appearance: `fadeIn` on new cards
- Herald beat transitions: slide + fade between character reveals
- Active player: `pulseGlow` on border
- Loading states: `shimmer` on skeleton elements

All animations must respect `prefers-reduced-motion: reduce`.

---

## Image Asset System

### Directory Layout

```
img/
├── chars/           # Character portraits (512x768)
│   ├── assassin.svg     # SVG placeholder initially, swap to .webp later
│   ├── thief.svg
│   └── ...
├── chars/thumb/     # Character thumbnails (64x64)
│   ├── assassin.svg
│   └── ...
├── districts/       # District card art (256x192)
│   ├── manor.svg
│   ├── castle.svg
│   └── ...
├── districts/thumb/ # District thumbnails (48x48)
│   ├── manor.svg
│   └── ...
├── bg/              # Backgrounds (1920x1080)
│   ├── lobby.svg
│   ├── game.svg
│   ├── draft.svg
│   └── gameover.svg
├── ui/              # UI icons (32x32, final SVG)
│   ├── gold.svg
│   ├── card.svg
│   ├── crown.svg
│   ├── build.svg
│   ├── sword.svg
│   └── score.svg
└── PROMPTS.md       # AI art generation prompts for real images
```

### IMG Object (`js/data.js`)

```js
var IMG_EXT = 'svg';  // change to 'webp' when real art is ready
var IMG = {
  char: {},
  district: {},
  bg: {},
  ui: {}
};

// Auto-populate character images
CHARS.forEach(function(c) {
  var slug = c.name.toLowerCase().replace(/[^a-z]/g, '_');
  IMG.char[c.id] = {
    full: 'img/chars/' + slug + '.' + IMG_EXT,
    thumb: 'img/chars/thumb/' + slug + '.' + IMG_EXT
  };
});

// Auto-populate district images
Object.keys(DEMOJI).forEach(function(id) {
  IMG.district[id] = {
    full: 'img/districts/' + id + '.' + IMG_EXT,
    thumb: 'img/districts/thumb/' + id + '.' + IMG_EXT
  };
});

// Backgrounds
['lobby','game','draft','gameover'].forEach(function(k) {
  IMG.bg[k] = 'img/bg/' + k + '.' + IMG_EXT;
});

// UI icons (always SVG)
['gold','card','crown','build','sword','score'].forEach(function(k) {
  IMG.ui[k] = 'img/ui/' + k + '.svg';
});
```

### Emoji Fallback

Every element that displays an image must also carry a `data-emoji` attribute with the Unicode emoji. CSS handles fallback:

```css
.has-img {
  background-size: cover;
  background-position: center;
}
.has-img[data-emoji]::after {
  content: attr(data-emoji);
  display: none;  /* hidden when image loads */
}
.has-img.img-error::after {
  display: flex;   /* shown when image fails */
  align-items: center;
  justify-content: center;
}
```

JS `onerror` handler adds `.img-error` class when image fails to load.

---

## Responsive Design

All components must be designed **mobile-first**: start with the smallest layout and add complexity as the viewport grows. The game must be fully playable and readable at every breakpoint.

### Breakpoints

| Name | Width | Layout changes |
|------|-------|---------------|
| Mobile | ≤ 768px | Single column, stacked panels, compact cards |
| Tablet | ≤ 1024px | 2-column player grid, medium cards |
| Desktop | > 1024px | Full 4-column layout (default) |

### Breakpoint CSS

```css
/* ── Tablet (≤1024px) ── */
@media (max-width: 1024px) {
  .tb-grid { grid-template-columns: repeat(2, 1fr); }
  .dcard.portrait { width: 110px; }
  .dcard.portrait .dcard-emoji-col { height: 52px; font-size: 24px; }
  .herald-portrait { width: 150px; }
  .draft-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); }
  .lobby-mode-grid { gap: var(--space-md); }
  .action-banner-emoji, .action-banner img { width: 80px; }
}

/* ── Mobile (≤768px) ── */
@media (max-width: 768px) {
  .tb-grid { grid-template-columns: 1fr; }
  #bottom { flex-direction: column; }
  #bot-hand, #bot-city { width: 100%; border-right: none; max-height: 40vh; }
  #bot-hand { border-bottom: 1px solid var(--border-subtle); }
  .dcard.portrait { width: 96px; }
  .herald-portrait { width: 110px; }
  .draft-grid { grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); }
  .lobby-mode-grid { flex-direction: column; }
  .lobby-box { margin: var(--space-sm); padding: var(--space-lg); }
  .gameover-podium { flex-direction: column; align-items: center; }
  #main { max-height: 50vh; }
  .action-end-turn { font-size: 13px; padding: 12px; }
}
```

### Per-Component Responsive Rules

| Component | Mobile | Tablet |
|-----------|--------|--------|
| **Top bar** | 1-column player stack, condensed stats | 2-column player grid |
| **Draft** | 2-column char grid, smaller cards (110px) | 3-column grid (140px) |
| **Herald** | Smaller portrait (110px), stacked events | Medium portrait (150px) |
| **Action** | Smaller banner portrait (70px), full-width buttons | Medium portrait (80px) |
| **Bottom panel** | Stacked vertically (hand above city) | Side by side (default) |
| **Lobby** | Single-column mode selection, full-width inputs | Wider box, multi-column mode cards |
| **Game over** | Stacked ranking (no podium), full-width rows | Side-by-side podium |

### Fluid Typography

Use `clamp()` for key text sizes to scale gracefully:
```css
.lobby-title { font-size: clamp(20px, 4vw, 32px); }
.herald-title { font-size: clamp(18px, 3vw, 26px); }
.tb-title { font-size: clamp(14px, 2vw, 18px); }
```

### Touch Targets

All interactive elements must have a minimum touch target of **44×44px** on mobile. Use padding to expand small elements without changing their visual size:
```css
@media (max-width: 768px) {
  .gbtn { min-height: 44px; padding: 10px 16px; }
  .charcard { min-height: 44px; }
  .dcard.clickable { min-height: 44px; }
  .tb-chip-label { min-height: 36px; padding: 6px 10px; }
}
```

---

## Accessibility Requirements

- All interactive elements must have `:focus-visible` ring styles
- All images must have alt text derived from character/district names
- Color contrast must pass WCAG AA (4.5:1 for normal text, 3:1 for large text)
- Animations must respect `prefers-reduced-motion: reduce`
- Keyboard navigation must work for draft character selection
