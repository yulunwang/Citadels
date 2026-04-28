# ⚜ Citadels

> A medieval city-building card game — built entirely by a Claude AI agent.

**[▶ Play now](https://yulunwang.github.io/Citadels/)**

Play solo against 2–6 AI opponents, or host a multiplayer room and share a 6-letter code with friends. No install, no account — pure browser.

🌐 **Available in English and Simplified Chinese** — toggle the language at any time from the lobby or in-game.

---

## Characters

Each round, players secretly draft one character. Characters are called in rank order; when yours is called, you act.

### Base Characters (Ranks 1–8)

| Rank | Character | Ability |
|---|---|---|
| 1 | 🥷 Assassin | Kill a character — they skip their turn |
| 2 | 🕵️ Thief | Steal all gold from a character when they are called |
| 3 | 🧙 Magician | Swap hands with a player, or discard & redraw |
| 4 | 🤴 King | Take the Crown; +1✦ per Noble (yellow) district |
| 5 | ⛪ Bishop | Protected from Warlord; +1✦ per Religious (blue) district |
| 6 | 🧑‍💼 Merchant | Earn +1✦ bonus; +1✦ per Trade (green) district |
| 7 | 👷 Architect | Draw +2 cards; build up to 3 districts this turn |
| 8 | 🤺 Warlord | Destroy a district (pay cost−1); +1✦ per Military (red) district |

### Expansion Characters

Each expansion character shares a rank with a base character and can replace it in the draft pool. Only one character per rank is used each game.

| Rank | Character | Ability |
|---|---|---|
| 3 | 🔮 Wizard | Look at a player's hand, take 1 card — keep it or build it immediately |
| 3 | 🔯 Seer | Take 1 random card from each opponent's hand; build up to 2 districts |
| 4 | 🏅 Patrician | Take the Crown; draw +1 card per Noble (yellow) district |
| 5 | 🧎 Abbot | +1✦ per Religious (blue) district; steal 1✦ from the richest opponent |
| 6 | 🏦 Trader | +1✦ per Trade (green) district; build up to 2 districts |
| 7 | ⚓ Navigator | Take 4✦ or draw 4 cards — but cannot build this turn |
| 7 | 📖 Scholar | Draw 7 cards, keep 1; build up to 2 districts |
| 9 | 🫅 Queen | Earn 3✦ if seated beside the King (optional 9th rank) |

### Lobby Presets

| Preset | Characters |
|---|---|
| Standard | Assassin, Thief, Magician, King, Bishop, Merchant, Architect, Warlord |
| + Queen | Standard + Queen (rank 9) |
| Expanded | Assassin, Thief, Wizard, Patrician, Abbot, Merchant, Scholar, Warlord, Queen |
| Full Mix | Assassin, Thief, Seer, Patrician, Abbot, Trader, Navigator, Warlord, Queen |

You can also fully customize the character pool per-rank in the lobby.

---

## Districts

68 district cards across 5 colors. Each color ties to a character's income ability:

| Color | Type | Examples |
|---|---|---|
| 🟡 Yellow | Noble | Manor, Castle, Palace |
| 🔵 Blue | Religious | Temple, Church, Monastery, Cathedral |
| 🟢 Green | Trade | Tavern, Market, Trading Post, Docks, Harbor, Town Hall |
| 🔴 Red | Military | Watchtower, Prison, Battlefield, Fortress |
| 🟣 Purple | Unique | Smithy, Library, Great Wall, School of Magic, … |

Purple districts have special abilities:

| District | Cost | Ability |
|---|---|---|
| 🔭 Observatory | 5 | Draw 3 cards for income, keep 1 (instead of 2/1) |
| ⚒️ Smithy | 5 | Once per turn: pay 2✦ to draw 3 cards |
| 📚 Library | 6 | Keep both cards when drawing for income |
| ⚗️ Laboratory | 5 | Once per turn: discard 1 card to gain 2✦ |
| ⚙️ Factory | 5 | Other purple districts cost 1✦ less to build |
| 🪄 Wishing Well | 5 | +1 VP per other purple district at game end |
| 🗺️ Map Room | 5 | +1 VP per card in hand at game end |
| 🤫 Secret Vault | 3 | Hidden VP — points never revealed during the game |
| 🧱 Great Wall | 6 | Warlord must pay full cost (not cost−1) to destroy your districts |
| 🛡️ Keep | 3 | Cannot be destroyed by the Warlord |
| ⚰️ Graveyard | 1 | Pay 1✦ to recover a destroyed district into your hand |
| 👻 Haunted City | 2 | Counts as any color for the 5-color diversity bonus |
| ✨ School of Magic | 6 | Counts as any color for the 5-color diversity bonus |
| 🐉 Dragon Gate | 6 | +2 VP at game end |
| 🎓 University | 6 | +2 VP at game end |
| 🗝️ Thieves' Den | 6 | May be built by paying any mix of gold and cards |
| ⛏️ Quarry | 5 | Allows building duplicate districts (same name) |
| 🕌 Basilica | 6 | +1 VP per odd-cost district in your city at game end |
| 🏤 Capitol | 5 | +3 VP if you have 3+ districts of the same color at game end |
| 🗽 Ivory Tower | 3 | +5 VP if this is your only purple district at game end |

---

## How to Play

Each round has two phases:

1. **Draft** — starting with the Crown holder, each player secretly picks one character from the available pool (some cards are set aside face-up or face-down per official rules)
2. **Turns** — the Herald calls characters in rank order (1–9); each holder takes their turn:
   - Collect **2 gold** or **draw 2 cards, keep 1**
   - Use your character's special ability (optional)
   - Build one district from your hand (pay its gold cost)

**Game end:** when any player builds their 8th district, the round finishes and scores are tallied.

### Scoring
| Condition | Points |
|---|---|
| Each district built | Cost in gold |
| First to complete 8 districts | +4 |
| Completed 8 (not first) | +2 |
| One district of every 5 colors | +3 |
| Dragon Gate / University | +2 each |
| Map Room | +1 per card in hand |
| Wishing Well | +1 per other purple district |
| Basilica | +1 per odd-cost district |
| Capitol | +3 if 3+ districts share a color |
| Ivory Tower | +5 if it's your only purple district |
| Secret Vault | +3 (hidden during the game) |

---

## Multiplayer

- **Host** — creates a room, shares a 6-letter code, holds authoritative game state
- **Join** — enter the room code and pick a display name and emoji avatar to join as a peer
- Peer-to-peer via **PeerJS (WebRTC)** — works over the internet, no LAN required
- If a peer disconnects mid-game, their slot reverts to AI control

---

## Extension API

Drop a new script after `lobby.js` in `index.html` and call `EXT.register({...})` to add:

- **New characters** (ID ≥ 9) with custom AI, special UI, and start-of-turn hooks
- **New districts** shuffled into the base deck
- **Custom scoring** hooks called at game end

See [`extensions/README.md`](extensions/README.md) for the full API.

---

## Tech

Vanilla JS, no build step, no framework. Open `index.html` directly — or serve locally:

```bash
python -m http.server 8080
```

| File | Role |
|---|---|
| `js/data.js` | Characters, districts, deck factory |
| `js/i18n.js` | EN / ZH translations, language toggle |
| `js/engine.js` | All game logic and AI |
| `js/ui.js` | DOM rendering |
| `js/net.js` | PeerJS multiplayer |
| `js/lobby.js` | Lobby screens |
| `js/ext-api.js` | Extension registry |

---

Based on the board game *Citadels* by Bruno Faidutti. Unofficial fan implementation — MIT license.
