# Citadels 3D · 富饶之城

A ground-up rebuild of the Citadels card game as a 3D tabletop: miniature procedural cities on a candle-lit table, cinematic character calls, and a bilingual (EN / 中文) glass HUD. Solo vs AI or online with friends (WebRTC, no server).

## Run

ES modules need a local server (they won't load from `file://`):

```bash
node serve.mjs          # → http://localhost:5173 (no dependencies)
```

Three.js and PeerJS load from CDNs, so the first load needs internet.

Engine self-check (plays 240 full AI games and verifies the invariants):

```bash
node test/engine.test.mjs
```

Pressure test: thousands of games in every mode. It proves the AI's input never changes when only hidden information changes (re-dealt "twin worlds"), mixes in a random-move player to shake out rule bugs, and prints AI behaviour stats (targeting, repetition, stalling):

```bash
node test/pressure.mjs 600
```

## Layout

| File | Role |
|---|---|
| `js/data.js` | Characters, districts, deck |
| `js/engine.js` | Pure rules: `createGame`, `act(state, pid, action)`, `viewFor(state, pid)`, scoring |
| `js/ai.js` | AI decisions (sees only `viewFor`, so it can't cheat) |
| `js/search.js` | Lookahead for the Cunning AI (determinized Monte-Carlo) |
| `js/materials.js` | Procedural PBR surfaces (stone, tiles, timber, felt…) and the warm lighting environment |
| `js/models.js` | Procedural 3D building for every district; also renders card art |
| `js/scene.js` | Three.js table, seats, coins, cards, crown, tokens, effects, camera |
| `js/ui.js` | HUD, hand, actions, sheets, call banner, end screen |
| `js/lobby.js` | Home / solo / host / join screens |
| `js/net.js` | PeerJS wrapper |
| `js/main.js` | Controller: state flow, AI pacing, event playback, saves, host/peer |
| `js/i18n.js`, `js/icons.js`, `js/sfx.js` | Strings, SVG emblems, synthesized sound |

## Features

- **2–7 players**, solo vs AI or online. Includes the official 2-player draft (pick, then discard one face down), two characters each with 2–3 players, and the 7-player face-down pick.
- **Three AI levels.** Normal and Cunning keep an opponent model: from the draft order, what was missing when the draft reached them, and what each rival would want, they estimate who holds each hidden character. *Cunning* adds determinized Monte-Carlo lookahead: for character picks and Assassin/Thief targets it samples the hidden information and plays out the round under each option. Measured with `test/ai-duel.mjs`, Cunning beats Normal head-to-head about 72% of the time. Among near-equal options it picks with a little randomness, so its play is less predictable.
- **Advisor hint (H)** suggests a move and highlights it. One-time beginner tips cover the first draft, turn and call.
- **Online:** turn timer (the advisor moves for anyone idle), emotes, heartbeat disconnect detection, seat reclaim on reconnect, version check.
- **Table:** drag to orbit and scroll/pinch to zoom. Seats get heraldic flags, numbers float up over coins and cities, a banner marks the final round, and there's an optional generative score.
- **Resilience:** autosave with versioning, crash safety net, hidden-tab fast-forward, automatic low-graphics mode on slow devices, WebGL context-loss recovery.
- **Keys:** G gold · D draw · B build · A ability · E end · H hint · L log · 1–9 cards.

## Key changes from v1

- **One rules path.** Humans, AI and network peers all call `act()`. No more player-0 swapping or a separate AI rule set.
- **Hidden information is real.** Peers receive only their own redacted view, and the AI sees the same view.
- **Rules completed:** 3-player games with two characters each, the 7-player face-down pick, the King's heir, Bishop protection, no Warlord in completed cities, Seer give-backs, Wizard bonus builds, the Trader's free green builds, and the official tie-break.
- **No forced clicking.** Events play as animations and AI turns pace themselves to match.
- **Resume anywhere:** solo games autosave. Hosts and peers reconnect after a refresh.
