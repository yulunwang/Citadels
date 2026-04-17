# Phase 5 — AI Image Generation & Visual Elevation

## Overview

This phase replaces all SVG placeholder art with high-quality AI-generated illustrations.
It is a **human + AI tool phase** — you (the user) generate images using Midjourney, DALL-E 3,
Adobe Firefly, or similar, then drop the files into the correct folders. One code change
(flipping `IMG_EXT` in `js/data.js`) swaps the entire game over to the new art.

All prompts are in [`img/PROMPTS.md`](../../img/PROMPTS.md).

---

## Art Direction: Light Fantasy Elegance

Every image in the game must feel like it belongs in the same illustrated medieval fantasy world.
Use this style anchor in every prompt:

> **Watercolor and gouache illustration, light fantasy medieval, warm golden hour lighting,
> cream parchment paper texture, fine ink linework, detailed brushwork, tarot card
> illustration style, airy and luminous atmosphere, soft romantic mood.**
>
> **Negative:** photorealistic, anime, chibi, dark gritty, horror, neon, sci-fi, 3D render,
> CGI, photography.

All assets must share:
- **Warm palette baseline** — even cool-colored assets (blue Bishop, purple Magician) have a
  warm cream background and golden light source
- **Soft ink outlines** — visible but not harsh; more watercolor wash than comic book
- **Intentional composition** — subject centered, breathing room, not cluttered
- **Legibility at small sizes** — the key visual element must read at 64px

---

## Asset Inventory & Dimensions

### Character Portraits (16 total)

| Use in game | Display size | Source art size | Aspect ratio | Format | Max file size |
|---|---|---|---|---|---|
| Draft cards, herald, action banner | 80–200px wide | **512 × 768 px** | 2:3 (portrait) | WebP | 80 KB |

**Midjourney flag**: `--ar 2:3 --q 2 --stylize 150 --v 6`

**Composition rule**: Subject fills 70% of the frame. Face in upper half.
Solid-colored lower third for the name overlay (handled by CSS). Works in circular crop for thumbnails.

### Character Thumbnails (16 total)

Generated from the same portrait renders — do NOT generate separately.
Export a 256×256 **center-crop** of the portrait (face-centered).

| Use in game | Display size | Source art size | Format | Max file size |
|---|---|---|---|---|
| Herald progress pips, player HUD chips | 32–64px | **256 × 256 px** | 1:1 | WebP | 20 KB |

### District Card Art (35 total)

| Use in game | Display size | Source art size | Aspect ratio | Format | Max file size |
|---|---|---|---|---|---|
| Card image zone (top of portrait card) | 80–110px wide × 48–80px tall | **512 × 342 px** | 3:2 (landscape) | WebP | 40 KB |

**Midjourney flag**: `--ar 3:2 --q 1 --stylize 100 --v 6`

**Composition rule**: Building/scene fills the frame. Sky or background in upper 30%.
No text. Single dominant focal element.

### District Thumbnails (35 total)

Center-crop exports from the district art, 128×128px.

| Use in game | Display size | Format | Max file size |
|---|---|---|---|
| City chips in player panels | 20–32px | WebP | 8 KB |

### Background Scenes (4 total)

| Use in game | Display size | Source art size | Aspect ratio | Format | Max file size |
|---|---|---|---|---|---|
| Full-screen game/lobby backgrounds | Viewport | **1920 × 1080 px** | 16:9 | WebP | 200 KB |

**Midjourney flag**: `--ar 16:9 --q 1 --stylize 75 --v 6`

**Composition rule**: Subject/interest in center. Edges can bleed/blur — the CSS applies a
vignette overlay on top. No faces visible. Architectural/environmental only.

### UI Icons (6 total)

**Keep as SVG.** The current `img/ui/*.svg` files are clean production SVGs and do not need replacement.

---

## File Naming Convention

The `IMG` object in `js/data.js` generates paths automatically. You must match these exactly:

### Characters

The slug is: `character_name.toLowerCase().replace(/[^a-z]/g, '_')`

| Character | Full portrait path | Thumb path |
|---|---|---|
| Assassin | `img/chars/assassin.webp` | `img/chars/thumb/assassin.webp` |
| Thief | `img/chars/thief.webp` | `img/chars/thumb/thief.webp` |
| Magician | `img/chars/magician.webp` | `img/chars/thumb/magician.webp` |
| King | `img/chars/king.webp` | `img/chars/thumb/king.webp` |
| Bishop | `img/chars/bishop.webp` | `img/chars/thumb/bishop.webp` |
| Merchant | `img/chars/merchant.webp` | `img/chars/thumb/merchant.webp` |
| Architect | `img/chars/architect.webp` | `img/chars/thumb/architect.webp` |
| Warlord | `img/chars/warlord.webp` | `img/chars/thumb/warlord.webp` |
| Queen | `img/chars/queen.webp` | `img/chars/thumb/queen.webp` |
| Navigator | `img/chars/navigator.webp` | `img/chars/thumb/navigator.webp` |
| Wizard | `img/chars/wizard.webp` | `img/chars/thumb/wizard.webp` |
| Patrician | `img/chars/patrician.webp` | `img/chars/thumb/patrician.webp` |
| Abbot | `img/chars/abbot.webp` | `img/chars/thumb/abbot.webp` |
| Scholar | `img/chars/scholar.webp` | `img/chars/thumb/scholar.webp` |
| Seer | `img/chars/seer.webp` | `img/chars/thumb/seer.webp` |
| Trader | `img/chars/trader.webp` | `img/chars/thumb/trader.webp` |

### Districts

File name = the district's `id` key from `js/data.js`:

| Color | District | Full path | Thumb path |
|---|---|---|---|
| Yellow | Manor | `img/districts/manor.webp` | `img/districts/thumb/manor.webp` |
| Yellow | Castle | `img/districts/castle.webp` | `img/districts/thumb/castle.webp` |
| Yellow | Palace | `img/districts/palace.webp` | `img/districts/thumb/palace.webp` |
| Blue | Temple | `img/districts/temple.webp` | `img/districts/thumb/temple.webp` |
| Blue | Church | `img/districts/church.webp` | `img/districts/thumb/church.webp` |
| Blue | Monastery | `img/districts/monastery.webp` | `img/districts/thumb/monastery.webp` |
| Blue | Cathedral | `img/districts/cathedral.webp` | `img/districts/thumb/cathedral.webp` |
| Green | Tavern | `img/districts/tavern.webp` | `img/districts/thumb/tavern.webp` |
| Green | Market | `img/districts/market.webp` | `img/districts/thumb/market.webp` |
| Green | Trading Post | `img/districts/trading_post.webp` | `img/districts/thumb/trading_post.webp` |
| Green | Docks | `img/districts/docks.webp` | `img/districts/thumb/docks.webp` |
| Green | Harbor | `img/districts/harbor.webp` | `img/districts/thumb/harbor.webp` |
| Green | Town Hall | `img/districts/town_hall.webp` | `img/districts/thumb/town_hall.webp` |
| Red | Watchtower | `img/districts/watchtower.webp` | `img/districts/thumb/watchtower.webp` |
| Red | Prison | `img/districts/prison.webp` | `img/districts/thumb/prison.webp` |
| Red | Battlefield | `img/districts/battlefield.webp` | `img/districts/thumb/battlefield.webp` |
| Red | Fortress | `img/districts/fortress.webp` | `img/districts/thumb/fortress.webp` |
| Purple | Haunted City | `img/districts/haunted_city.webp` | `img/districts/thumb/haunted_city.webp` |
| Purple | Factory | `img/districts/factory.webp` | `img/districts/thumb/factory.webp` |
| Purple | Dragon Gate | `img/districts/dragon_gate.webp` | `img/districts/thumb/dragon_gate.webp` |
| Purple | University | `img/districts/university.webp` | `img/districts/thumb/university.webp` |
| Purple | Thieves' Den | `img/districts/thieves_den.webp` | `img/districts/thumb/thieves_den.webp` |
| Purple | Keep | `img/districts/keep.webp` | `img/districts/thumb/keep.webp` |
| Purple | Graveyard | `img/districts/graveyard.webp` | `img/districts/thumb/graveyard.webp` |
| Purple | Observatory | `img/districts/observatory.webp` | `img/districts/thumb/observatory.webp` |
| Purple | Smithy | `img/districts/smithy.webp` | `img/districts/thumb/smithy.webp` |
| Purple | Library | `img/districts/library.webp` | `img/districts/thumb/library.webp` |
| Purple | School of Magic | `img/districts/school_of_magic.webp` | `img/districts/thumb/school_of_magic.webp` |
| Purple | Wishing Well | `img/districts/wishing_well.webp` | `img/districts/thumb/wishing_well.webp` |
| Purple | Map Room | `img/districts/map_room.webp` | `img/districts/thumb/map_room.webp` |
| Purple | Secret Vault | `img/districts/secret_vault.webp` | `img/districts/thumb/secret_vault.webp` |
| Purple | Great Wall | `img/districts/great_wall.webp` | `img/districts/thumb/great_wall.webp` |
| Purple | Quarry | `img/districts/quarry.webp` | `img/districts/thumb/quarry.webp` |
| Purple | Basilica | `img/districts/basilica.webp` | `img/districts/thumb/basilica.webp` |
| Purple | Capitol | `img/districts/capitol.webp` | `img/districts/thumb/capitol.webp` |
| Purple | Ivory Tower | `img/districts/ivory_tower.webp` | `img/districts/thumb/ivory_tower.webp` |

### Backgrounds

| Screen | Path |
|---|---|
| Lobby | `img/bg/lobby.webp` |
| In-game | `img/bg/game.webp` |
| Draft | `img/bg/draft.webp` |
| Game Over | `img/bg/gameover.webp` |

---

## Integration: One Code Change

Once you have generated and placed all (or some) images, activate them by editing **one line**
in `js/data.js`:

```js
// Before (SVG placeholders):
var IMG_EXT = 'svg';

// After (WebP real art):
var IMG_EXT = 'webp';
```

The `IMG` object regenerates all paths automatically. You can do a **partial swap** — place
just the character portraits first, flip the extension, and see the characters upgrade
immediately. Missing files gracefully fall back via the `probe.onerror` handler already
in `js/ui.js`.

**If you only have some assets ready**, you can keep `IMG_EXT = 'svg'` and override
individual paths manually after the IMG object is built:

```js
// In data.js, after the CHARS.forEach block:
IMG.char[1].full  = 'img/chars/assassin.webp';   // just this one character
IMG.char[1].thumb = 'img/chars/thumb/assassin.webp';
```

---

## Export Workflow

1. **Generate** — Run prompts in your AI tool. Request 4 variants, pick the best.
2. **Upscale** — Upscale the chosen variant to full resolution.
3. **Crop** — For portraits: crop to 512×768. For districts: crop to 512×342.
4. **Thumbnail** — Center-crop the portrait/district art to square (256×256 for chars, 128×128 for districts).
5. **Convert to WebP** — Use `cwebp`, Photoshop, Squoosh (squoosh.app), or similar.
   - Characters: quality 82, max 80KB
   - Districts: quality 78, max 40KB
   - Thumbnails: quality 75, max 20KB
   - Backgrounds: quality 72, max 200KB
6. **Name and place** — Follow the naming table above exactly.
7. **Verify** — Open `index.html`, start a game, confirm images appear with no broken icons.

---

## Quality Checklist (per asset)

- [ ] Matches the Light Fantasy Elegance style (watercolor, warm, medieval)
- [ ] Consistent lighting direction (warm from upper-left or upper-right)
- [ ] Key element legible at 64px thumbnail size
- [ ] No text baked into the image (names/labels are overlaid by CSS)
- [ ] Portrait: face/body readable, no extreme cropping of subject
- [ ] District: architecture clearly identifiable, no human characters
- [ ] Color category visible at a glance (yellow/noble art feels warm-gold, blue/religious feels cool-holy, etc.)
- [ ] File size within limits
- [ ] File name matches naming table exactly (no capitals, spaces, or extra characters)
