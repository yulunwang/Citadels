# Frontend Design Principles

> Adapted from the Anthropic `frontend-design` plugin (claude-code/plugins/frontend-design).
> All agents working on the Citadels UI redesign MUST follow these principles.

---

## Core Philosophy

Create distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

**Claude is capable of extraordinary creative work. Don't hold back.**

---

## Design Thinking Process

Before coding any component, understand the context and commit to a BOLD aesthetic direction:

1. **Purpose**: What problem does this interface solve? Who uses it?
   - *For Citadels*: A medieval fantasy board game for 2-7 players. The UI must communicate game state clearly while creating an immersive atmosphere.

2. **Tone**: Pick a clear direction and execute with precision.
   - *For Citadels*: **Light Fantasy Elegance** — airy, sunlit, warm. Medieval illuminated manuscripts meet modern board game apps. NOT dark/gritty, NOT generic flat UI.

3. **Constraints**: Technical requirements.
   - Vanilla JS, no modules, no bundler
   - All scripts share global scope via `var`/`function`
   - No React, no build tools
   - Must work with PeerJS multiplayer (net.js wraps render())

4. **Differentiation**: What makes this UNFORGETTABLE?
   - The contrast between airy light backgrounds and richly illustrated character/card art
   - Cards that feel like collectible items
   - The sense of opening a beautifully bound game box

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work — the key is intentionality, not intensity.

---

## Aesthetic Guidelines

### Typography

- **Choose fonts that are beautiful, unique, and interesting.**
- For Citadels: Cinzel (already loaded) is perfect as the display font — it's a serif typeface inspired by classical Roman inscriptions. Pair with Georgia for body text.
- NEVER use generic fonts like Arial, Inter, Roboto, or system-ui for visible UI text.
- Unexpected, characterful font choices elevate the design. Cinzel for a medieval game is thematic and distinctive.

### Color & Theme

- **Commit to a cohesive aesthetic.** Use CSS variables for consistency.
- **Dominant colors with sharp accents outperform timid, evenly-distributed palettes.**
- For Citadels: warm cream (`#f4f0e8`) as dominant, dark goldenrod (`#b8860b`) as primary accent, district colors as sharp category accents.
- The five district colors (yellow/blue/green/red/purple) should POP against the light background.
- NEVER use clichéd color schemes (particularly purple gradients on white backgrounds).

### Motion & Animation

- Use animations for effects and micro-interactions.
- **Prioritize CSS-only solutions** (no external animation libraries).
- **Focus on high-impact moments**: one well-orchestrated page load with staggered reveals (`animation-delay`) creates more delight than scattered micro-interactions.
- Use scroll-triggering and hover states that surprise.
- For Citadels: Card draws should fade in, herald reveals should slide, active player borders should pulse with golden glow.

### Spatial Composition

- **Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements.**
- Generous negative space OR controlled density — choose one and commit.
- For Citadels: Cards in a grid are expected, but the herald reveal should be dramatic and centered. Lobby should feel spacious. Action phase should feel dense with information.

### Backgrounds & Visual Details

- **Create atmosphere and depth rather than defaulting to solid colors.**
- Add contextual effects and textures that match the overall aesthetic.
- Apply creative forms: gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, grain overlays.
- For Citadels: subtle parchment texture on card backgrounds, warm gradient washes on panels, soft vignette on game background, inner glow on active elements.

---

## What to NEVER Do

These are the hallmarks of generic AI-generated aesthetics. Avoid them completely:

1. **Overused font families**: Inter, Roboto, Arial, system fonts
2. **Clichéd color schemes**: purple gradients on white, random neon accents
3. **Predictable layouts**: identical card grids with no visual hierarchy
4. **Cookie-cutter design**: components that lack context-specific character
5. **Convergent choices**: Don't default to common AI favorites (Space Grotesk, etc.)
6. **Flat, lifeless backgrounds**: solid #fff or #f5f5f5 with no texture or depth
7. **Inconsistent aesthetic**: mixing design languages (material + bootstrap + custom)

---

## Implementation Complexity

**Match implementation complexity to the aesthetic vision.**

- Maximalist designs need elaborate code with extensive animations and effects.
- Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details.
- Elegance comes from executing the vision well.

For Citadels, we want **refined richness**: not maximalist chaos, but warm, detailed, layered. Every element should feel considered. Cards should feel like physical objects. Buttons should feel tactile. The game should feel premium.

---

## Citadels-Specific Design Decisions

These decisions are FINAL and should not be reconsidered:

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Background tone | Light cream (#f4f0e8) | User requirement: current scheme too dark |
| Image approach | SVG placeholders → WebP final art | Immediate progress + future quality |
| Typography | Cinzel display + Georgia body | Medieval thematic, already loaded |
| Card style | Colored backgrounds + image art | Cards feel like collectible game pieces |
| Layout | CSS Grid + Flexbox | Vanilla CSS, no frameworks |
| Theming | CSS custom properties | Easy palette changes, future theme support |
| Animation | CSS-only (@keyframes) | No dependencies, performant |
| Icon style | Custom SVG | Consistent with art direction |
