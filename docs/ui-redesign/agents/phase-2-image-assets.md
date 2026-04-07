# Agent Instructions: Phase 2 — Image Assets (SVG Placeholders + AI Art Prompts)

## Prerequisites
- Phase 1 must be complete (inline styles migrated to CSS classes)
- Read `docs/ui-redesign/design-system.md` for image asset specs and IMG object definition
- Read `docs/ui-redesign/frontend-design-principles.md` for art direction

## Objective
Two parallel tracks:
- **Track A**: Create SVG placeholder files for ALL game visual assets (characters, districts, backgrounds, UI icons)
- **Track B**: Generate detailed AI art prompts in `img/PROMPTS.md` for the user to create final art

Also: add the `IMG` reference object to `js/data.js` and wire images into the rendering code.

## Scope
**Files to create:**
- `img/chars/*.svg` — 16 character portrait placeholders
- `img/chars/thumb/*.svg` — 16 character thumbnail placeholders
- `img/districts/*.svg` — 35 district card art placeholders
- `img/districts/thumb/*.svg` — 35 district thumbnail placeholders
- `img/bg/*.svg` — 4 background placeholders
- `img/ui/*.svg` — 6 UI icon SVGs (these are FINAL, not placeholders)
- `img/PROMPTS.md` — AI art generation prompt file

**Files to modify:**
- `js/data.js` — Add `IMG` and `IMG_EXT` objects (AFTER existing code, before `mkDeck`)
- `js/ui.js` — Wire images into `mkCard()`, `renderDraft()`, `renderHerald()`, `renderAction()`, `render()`
- `js/lobby.js` — Wire background and character thumbnails into lobby

**Files to NEVER modify:**
- `js/engine.js`, `js/net.js`, `js/ext-api.js`

---

## Track A: SVG Placeholders

### Character Portraits (16 files, `img/chars/{slug}.svg`)

Each SVG should be 512x768 viewBox. Design pattern:
- Background: vertical gradient using the character's color (lighter at top → darker at bottom)
- Center: large emoji as text element (40-60px equivalent)
- Subtle decorative border (1px, character color at 30% opacity)
- Character name at bottom in a dark banner strip

File naming (slug from `c.name.toLowerCase().replace(/[^a-z]/g, '_')`):
```
assassin.svg, thief.svg, magician.svg, king.svg, bishop.svg,
merchant.svg, architect.svg, warlord.svg, queen.svg, navigator.svg,
wizard.svg, patrician.svg, abbot.svg, scholar.svg, seer.svg, trader.svg
```

Template:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 768">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="{COLOR_LIGHT}"/>
      <stop offset="100%" stop-color="{COLOR_DARK}"/>
    </linearGradient>
  </defs>
  <rect width="512" height="768" fill="url(#bg)" rx="12"/>
  <rect x="4" y="4" width="504" height="760" rx="10" fill="none"
        stroke="{COLOR}" stroke-opacity="0.3" stroke-width="1"/>
  <text x="256" y="360" text-anchor="middle" font-size="120">{EMOJI}</text>
  <rect x="0" y="688" width="512" height="80" fill="rgba(0,0,0,0.4)" rx="0 0 12 12"/>
  <text x="256" y="738" text-anchor="middle" fill="white"
        font-family="serif" font-size="28" font-weight="bold">{NAME}</text>
</svg>
```

### Character Thumbnails (16 files, `img/chars/thumb/{slug}.svg`)

64x64 viewBox. Simple circle with color fill + emoji:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="30" fill="{COLOR}" fill-opacity="0.15"
          stroke="{COLOR}" stroke-width="2"/>
  <text x="32" y="40" text-anchor="middle" font-size="28">{EMOJI}</text>
</svg>
```

### District Card Art (35 files, `img/districts/{id}.svg`)

256x192 viewBox. Pattern:
- Background: district color gradient
- Simple geometric building silhouette (varies by district type)
- Emoji overlay
- Category color bar at bottom (4px)

```
Noble (yellow): triangular roofs, columns
Religious (blue): domed/arched shapes
Trade (green): rectangular market/dock shapes
Military (red): angular fortress/tower shapes
Unique (purple): abstract/magical shapes with stars
```

File naming matches district IDs: `manor.svg`, `castle.svg`, `palace.svg`, `temple.svg`, etc.

### District Thumbnails (35 files, `img/districts/thumb/{id}.svg`)

48x48 viewBox. Circle with district color + emoji (same pattern as character thumbs).

### Backgrounds (4 files, `img/bg/{name}.svg`)

1920x1080 viewBox. Abstract gradient washes with subtle patterns:

- **lobby.svg**: Warm golden gradient wash (top-left warm → bottom-right cool). Subtle repeating diamond/fleur-de-lis pattern at 5% opacity. Soft radial light in center.
- **game.svg**: Light parchment base with subtle grain texture. Faint medieval map-style compass rose at 3% opacity. Warm vignette edges.
- **draft.svg**: Subtle blue-purple tint gradient. Faint card fan pattern radiating from center at 4% opacity.
- **gameover.svg**: Warm golden radial gradient from center. Subtle crown/laurel pattern at 5% opacity.

### UI Icons (6 files, `img/ui/{name}.svg` — FINAL quality)

These are the final production SVGs, not placeholders. 32x32 viewBox, clean vector art:

- **gold.svg**: Gold coin with "G" or "✦" mark. Colors: #b8860b fill, #8b6914 shadow.
- **card.svg**: Playing card back. Colors: #5a4e3a outline, #f0ece2 fill.
- **crown.svg**: Simple crown shape. Colors: #b8860b fill, #d4a843 highlights.
- **build.svg**: Hammer or trowel. Colors: #8a7d68 fill.
- **sword.svg**: Crossed swords. Colors: #8b2020 fill (for military/warlord).
- **score.svg**: Star or trophy. Colors: #b8860b fill.

---

## Track B: AI Art Prompts (`img/PROMPTS.md`)

Generate a comprehensive prompt file. For each asset, include:

```markdown
## Characters

### Assassin
**File**: `img/chars/assassin.webp` (512x768)
**Prompt**: A mysterious hooded figure in dark crimson robes, face hidden in shadow
except for glinting eyes. One hand holds a curved dagger catching dim light.
Watercolor/gouache style, light fantasy illustration. Soft warm lighting from the side.
Background: abstract warm cream wash with subtle red mist.
**Style keywords**: watercolor, gouache, light fantasy, airy, soft shadows, tarot card,
medieval, warm palette, painterly brushstrokes
**Color accent**: #cc7777 (muted crimson)
**Mood**: Dangerous elegance, quiet menace
**Negative prompt**: dark gritty, photorealistic, anime, neon, sci-fi

### Thief
[... etc for all 16 characters ...]
```

The prompts must:
1. Describe the character's appearance based on their game role and ability
2. Use consistent style keywords across ALL characters
3. Specify the light, airy aesthetic (NOT dark/gritty)
4. Include character's accent color
5. Be specific enough for consistent results across different AI tools
6. Include negative prompts to avoid unwanted aesthetics

Repeat the same structure for:
- All 35 districts (grouped by color category)
- All 4 backgrounds
- Include conversion notes: "Convert to WebP, max 50KB per character, max 20KB per district"

---

## Integration Code

### Add IMG Object to data.js

Add AFTER the `SDESC` object (around line 72) and BEFORE `CHAR_PRESETS`:

```js
// ── Image asset registry ──
var IMG_EXT = 'svg';  // Change to 'webp' when real art is ready
var IMG = { char:{}, district:{}, bg:{}, ui:{} };

CHARS.forEach(function(c) {
  var slug = c.name.toLowerCase().replace(/[^a-z]/g, '_');
  IMG.char[c.id] = {
    full: 'img/chars/' + slug + '.' + IMG_EXT,
    thumb: 'img/chars/thumb/' + slug + '.' + IMG_EXT
  };
});
Object.keys(DEMOJI).forEach(function(id) {
  IMG.district[id] = {
    full: 'img/districts/' + id + '.' + IMG_EXT,
    thumb: 'img/districts/thumb/' + id + '.' + IMG_EXT
  };
});
['lobby','game','draft','gameover'].forEach(function(k) {
  IMG.bg[k] = 'img/bg/' + k + '.' + IMG_EXT;
});
['gold','card','crown','build','sword','score'].forEach(function(k) {
  IMG.ui[k] = 'img/ui/' + k + '.svg';  // UI icons always SVG
});
```

### Wire Images into Rendering

**In `mkCard()` (`js/ui.js`)**:
The `.dcard-emoji-col` div should get a background image:
```js
var emojiCol = el('div', { class: 'dcard-emoji-col has-img', 'data-emoji': emoji });
emojiCol.style.backgroundImage = 'url(' + IMG.district[d.id].full + ')';
emojiCol.onerror = function() { this.classList.add('img-error'); };
```

Note: Since it's a background-image (not an `<img>` tag), use an `<img>` element with `display:none` to detect load errors, or use JS `Image()` preloading.

**In `renderDraft()` (`js/ui.js`)**:
Character cards get portrait backgrounds:
```js
var card = el('div', { class: 'charcard', 'data-emoji': c.emoji });
card.style.backgroundImage = 'url(' + IMG.char[c.id].full + ')';
card.style.backgroundSize = 'cover';
card.style.backgroundPosition = 'center';
```

**In `renderHerald()` (`js/ui.js`)**:
Replace the large emoji span with an image element:
```js
var portrait = el('img', {
  src: IMG.char[charId].full,
  alt: charName,
  class: 'herald-portrait',
  'data-emoji': emoji
});
portrait.onerror = function() { /* fallback to emoji */ };
```

**In `render()` (`js/ui.js`)**:
Game wrapper gets background image:
```js
wrapper.style.backgroundImage = 'url(' + IMG.bg.game + ')';
wrapper.style.backgroundSize = 'cover';
```

**In `renderLobby()` (`js/lobby.js`)**:
Lobby page gets background:
```js
page.style.backgroundImage = 'url(' + IMG.bg.lobby + ')';
```

---

## Verification Checklist

- [ ] All SVG files created and render correctly in browser
- [ ] `IMG` object accessible from browser console (`console.log(IMG)`)
- [ ] Character portraits visible in draft screen
- [ ] District art visible in card emoji columns
- [ ] Background gradients visible on lobby and game screens
- [ ] UI icons render at correct size (32x32)
- [ ] Emoji fallback works when images are deleted
- [ ] No broken image icons visible
- [ ] No layout shift when images load (explicit dimensions set)
- [ ] `img/PROMPTS.md` contains prompts for all 85+ assets
- [ ] Solo game plays through with all visuals intact
- [ ] Performance acceptable (SVGs are lightweight)

## Success Criteria
Every visual element that was previously an emoji now has a styled SVG placeholder with proper fallback. The `PROMPTS.md` file is ready for the user to generate final art. Changing `IMG_EXT` from `'svg'` to `'webp'` and dropping WebP files will seamlessly swap the art.
