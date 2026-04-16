# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the Game

No build step. Open `index.html` directly in a browser (`file://` works), or run a local server:

```bash
python -m http.server 8080
# then open http://localhost:8080
```

PeerJS multiplayer requires an internet connection (loads from cdnjs at runtime). Solo mode works fully offline.

## Architecture

**Vanilla JS, no modules, no bundler.** All files are plain `<script>` tags. Scripts share state through the global (`window`) scope.

### Load Order (strict — do not reorder)

```
ext-api.js → data.js → engine.js → ui.js → net.js → lobby.js → [extensions] → inline boot
```

The inline boot in `index.html` is just: `renderLobby({ screen: 'home' });`

### Global Scope Rules

This is critical. Because these are non-module scripts:

- `function foo(){}` and `var foo` → become `window.foo`, accessible across all files ✓
- `let foo` / `const foo` → are **script-scoped**, NOT on `window`, invisible to other files ✗

All cross-file mutable state **must** use `var` or `function` declarations:
- `var S = null` in ui.js (game state for rendering)
- `var LS = {...}` in lobby.js (lobby state)
- `var _onRoundEnd = null` in engine.js (callback hook, set by net.js)
- `var _applyLocalSlot = 0` in engine.js (which slot is the local human in multiplayer)
- All `humanXxx` action functions in engine.js are `function` declarations so net.js can reassign them on `window`

### File Responsibilities

| File | Purpose |
|---|---|
| `js/ext-api.js` | Defines the `EXT` registry object (must load first) |
| `js/data.js` | `CHARS`, `SDESC`, `mkDeck()`, `shuffle()` — static game data |
| `js/engine.js` | All game logic: state factory, AI, draft, action phase, all `humanXxx` actions |
| `js/ui.js` | All DOM rendering: `render()`, `renderHerald()`, `renderDraft()`, `renderSpecial()` |
| `js/net.js` | PeerJS multiplayer: host/peer wiring, `broadcastState`, `applyAction`, overrides `render` and `humanXxx` |
| `js/lobby.js` | Lobby screen state and rendering (`renderLobby`) |

### Multiplayer Architecture

Three modes in `NET.mode`: `'solo'`, `'host'`, `'peer'`.

- **Host** holds the authoritative state, runs all AI, pushes full state JSON to peers after every mutation.
- **Peer** never mutates state locally — all actions are sent to host via PeerJS and the host applies them.
- `_patchActionsForPeer()` in net.js reassigns all `humanXxx` window globals so peer clicks send messages instead of mutating state.
- net.js wraps `render` on load:
  - peer mode → `_renderWithPeerActions()` (patched actions)
  - host mode → `_origRender()` + `broadcastState()`
  - solo mode → `_origRender()`

### Engine ↔ Net Decoupling

`engine.js` must not `import` or call anything from `net.js`. The seam is `_onRoundEnd`:
- engine.js declares `var _onRoundEnd = null`
- net.js sets it immediately on load: `_onRoundEnd = () => { if (NET.mode === 'host') broadcastState(); };`
- `heraldAck` in engine.js calls `if (_onRoundEnd) setTimeout(() => _onRoundEnd(), 50);`

## Extension API

Extensions are separate scripts loaded after `lobby.js` (uncomment in `index.html`). They call `EXT.register({...})` once. See [extensions/README.md](extensions/README.md) for the full API.

Hook points in the engine:
- `EXT._scoreHooks` — called per player at game end (`calcScore`)
- `EXT._sotHooks` — called at start of every character's turn (`applyStartOfTurn`)
- `EXT._specialHooks[charId]` — renders special-ability UI panel (`renderSpecial`)
- `EXT._aiHooks[charId]` — overrides AI behavior for a character (`doAITurn`)
- `EXT._extraDistricts` — extra districts shuffled into the deck (consumed by `mkDeck`)

Use character IDs ≥ 9 for new characters to avoid base-game conflicts.

## UI Redesign (Active Project)

A full visual redesign is in progress. All agent instructions and design specifications are in [`docs/ui-redesign/`](docs/ui-redesign/README.md).

**Key documents for any UI work:**
- `docs/ui-redesign/design-system.md` — Colors, typography, components, image system
- `docs/ui-redesign/frontend-design-principles.md` — Aesthetic guidelines (MUST READ)
- `docs/ui-redesign/agents/phase-{0-4}-*.md` — Step-by-step agent instructions per phase

**Critical rules for UI changes:**
- `js/engine.js` may be modified for bug fixes and missing game mechanics
- NEVER modify `js/net.js` or `js/ext-api.js`
- All colors must use CSS custom properties (`:root` variables in `css/style.css`)
- All styling must use CSS classes, not inline styles in JS
- Images are referenced via the global `IMG` object in `js/data.js`
- Follow the Light Fantasy Elegance aesthetic: warm cream backgrounds, Cinzel typography, watercolor-style art
