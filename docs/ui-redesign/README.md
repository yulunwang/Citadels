# Citadels UI Redesign — Master Plan

## Overview

Full visual redesign of the Citadels web game. Transform from a dark, emoji-based UI into a light, airy, richly illustrated medieval fantasy board game experience.

**Aesthetic**: Light Fantasy Elegance — warm cream backgrounds, vibrant district colors, illustrated character/card art, Cinzel serif typography, watercolor/gouache art style.

**Responsive**: The redesign must work across all screen sizes. Every component is built mobile-first with breakpoints at 768px (mobile) and 1024px (tablet). See `design-system.md` for breakpoint specs and `agents/phase-3-component-redesign.md` for per-component responsive rules.

## Document Index

| Document | Purpose |
|----------|---------|
| [design-system.md](design-system.md) | Complete design system: colors, typography, components, images, responsive, accessibility |
| [frontend-design-principles.md](frontend-design-principles.md) | Aesthetic guidelines adapted from Anthropic's frontend-design plugin. MUST READ before any visual work. |
| [agents/phase-0-css-foundation.md](agents/phase-0-css-foundation.md) | Agent instructions: CSS variables + light palette |
| [agents/phase-1-inline-migration.md](agents/phase-1-inline-migration.md) | Agent instructions: Extract inline styles to CSS classes |
| [agents/phase-2-image-assets.md](agents/phase-2-image-assets.md) | Agent instructions: SVG placeholders + AI art prompts |
| [agents/phase-3-component-redesign.md](agents/phase-3-component-redesign.md) | Agent instructions: Visual redesign of all components |
| [agents/phase-4-polish.md](agents/phase-4-polish.md) | Agent instructions: Responsive, accessibility, performance, polish |

## Execution Order

```
Phase 0 ──→ Phase 1 ──→ Phase 2 ──→ Phase 3 ──→ Phase 4
(CSS vars)  (styles)    (images)    (redesign)   (polish)
```

Each phase depends on the previous one. The game must be fully functional after each phase.

## How to Use These Instructions

Each phase has a dedicated agent instruction file in `docs/ui-redesign/agents/`. To execute a phase:

1. Start a new Claude Code session (or continue an existing one)
2. Tell Claude: "Read `docs/ui-redesign/agents/phase-X-*.md` and execute the instructions"
3. Claude will read the prerequisites, understand the scope, and implement the changes
4. Verify using the checklist at the end of each instruction file
5. Commit the changes
6. Move to the next phase

## Safety Guarantees

These files are NEVER modified in ANY phase:
- `js/engine.js` — Game logic
- `js/net.js` — Multiplayer networking
- `js/ext-api.js` — Extension registry

All changes are rendering-layer only. The game remains fully functional throughout.

## Files Modified Per Phase

| Phase | css/style.css | js/data.js | js/ui.js | js/lobby.js | index.html | img/ |
|-------|:---:|:---:|:---:|:---:|:---:|:---:|
| 0 | ✓ | ✓ | | | | |
| 1 | ✓ | | ✓ | ✓ | | |
| 2 | | ✓ | ✓ | ✓ | | ✓ (create) |
| 3 | ✓ | | ✓ | ✓ | | |
| 4 | ✓ | | ✓ | ✓ | ✓ | |

## Swapping in Real Art

After Phase 2 creates SVG placeholders, the user can generate real art:

1. Read `img/PROMPTS.md` for detailed image generation prompts
2. Generate images using DALL-E, Midjourney, Stable Diffusion, etc.
3. Convert to WebP format
4. Drop files into the appropriate `img/` subdirectories
5. Change `IMG_EXT` from `'svg'` to `'webp'` in `js/data.js`
6. The game automatically uses the new art (file naming matches)
