# ⚜ Citadels

A faithful browser implementation of the classic medieval city-building card game — playable solo against AI or with friends over the internet, no account or install required.

**[▶ Play now](https://YOUR-USERNAME.github.io/citadels/)**

---

## Features

- **Solo mode** — 1 human vs. 3 AI opponents
- **Online multiplayer** — host or join a room with a 6-character code (powered by PeerJS, peer-to-peer, no server)
- **Full base game** — all 8 characters and 68 districts from the original ruleset
- **Unique district abilities** — Factory, Library, Graveyard, Observatory, Smithy, Great Wall, and more
- **No install** — pure HTML/CSS/JS, works offline after first load
- **Extension-ready** — clean hook API for adding expansion packs ([see extensions/README.md](extensions/README.md))

---

## How to Play

### Solo

1. Open `index.html` in any modern browser (or visit the GitHub Pages URL above)
2. Click **Solo** on the home screen
3. Each round: choose a character secretly, then take your turn when the Herald calls your number

### Multiplayer

**Host a room:**
1. Click **Host Room**, configure player slots (AI or Human), enter your name
2. Click **Create Room** — share the 6-letter code with friends
3. Click **▶ Start Game** once everyone has joined

**Join a room:**
1. Click **Join Room**, enter your name and the host's room code
2. Wait for the host to start — you'll see the lobby update in real time

> Friends need to open the same URL (or the same HTML file). The host's browser acts as the server; no backend is involved.

---

## Rules Summary

Citadels is a 2–8 player game (this implementation supports 2–4). Each round:

1. **Draft** — starting with the player holding the Crown, each player secretly picks one of the 8 characters
2. **Herald calls** — characters 1–8 are called in order; the holder of each character takes their turn:
   - Collect income (2 gold **or** draw 2 cards, keep 1)
   - Use your character's special ability
   - Build one district from your hand (pay its gold cost)
3. **End round** — once all characters have been called, a new round begins

**Game end:** when any player builds their 8th district, the current round completes and scores are tallied.

### Scoring
| Condition | Points |
|---|---|
| Each district | Cost in gold |
| First to complete 8 districts | +4 |
| Completed 8 districts (not first) | +2 |
| At least one district of all 5 colors | +3 |
| Dragon Gate / University | +2 each |
| Wishing Well | +1 per other purple district |
| Map Room | +1 per card in hand |

### Characters

| # | Character | Ability |
|---|---|---|
| 1 | 🥷 Assassin | Kill a character — they skip their turn |
| 2 | 🕵️ Thief | Steal all gold from a character when they are called |
| 3 | 🧙 Magician | Swap hands with a player, or discard & redraw |
| 4 | 🤴 King | Take the Crown; earn +1✦ per Noble (yellow) district |
| 5 | ⛪ Bishop | Protected from Warlord; earn +1✦ per Religious (blue) district |
| 6 | 🧑‍💼 Merchant | Earn +1✦ bonus; earn +1✦ per Trade (green) district |
| 7 | 👷 Architect | Draw +2 cards; build up to 3 districts this turn |
| 8 | 🤺 Warlord | Destroy a district (pay cost−1); earn +1✦ per Military (red) district |

---

## Project Structure

```
citadels/
├── index.html          # Entry point — loads all scripts in dependency order
├── css/
│   └── style.css       # All styles (dark medieval theme)
├── js/
│   ├── ext-api.js      # Extension registry — must load first
│   ├── data.js         # CHARS, CS, DEMOJI, SDESC, mkDeck(), shuffle()
│   ├── engine.js       # Game state, AI, draft/action phases, human actions
│   ├── ui.js           # DOM helpers + all render functions
│   ├── net.js          # PeerJS multiplayer (host/peer), render routing
│   └── lobby.js        # Home screen, room creation/join UI
├── extensions/
│   └── README.md       # Extension authoring guide
└── citadels.html       # Original single-file version (reference)
```

### Module dependencies (load order)

```
ext-api.js  ←  data.js  ←  engine.js  ←  ui.js  ←  net.js  ←  lobby.js  ←  [extensions]  ←  boot
```

---

## Development

No build tools required — edit any file and reload the browser.

```bash
# Serve locally (avoids CORS issues with script loading)
npx serve .
# or
python -m http.server 8080
```

Open `http://localhost:8080` to test.

---

## GitHub Pages Deployment

1. Push this repository to GitHub
2. Go to **Settings → Pages**
3. Set **Source** to `Deploy from a branch`, branch `main`, folder `/ (root)`
4. GitHub will publish to `https://YOUR-USERNAME.github.io/citadels/`

Update the play link at the top of this README with your actual URL.

---

## Extensions

Citadels has several published expansions (The Dark City, Citadels 2016, etc.). The extension API lets you add new characters and districts without modifying the core engine.

See [extensions/README.md](extensions/README.md) for the full authoring guide.

**Quick example** — adding a new character:

```js
// extensions/my-expansion/extension.js
EXT.register({
  id: 'my-expansion',
  name: 'My Expansion',
  chars: [
    { id: 9, name: 'Navigator', clr: '#5ab8d4', emoji: '⚓',
      ability: 'Draw 2 extra cards at start of your turn.' }
  ],
  sotHook(state, charId, pid) {
    if (charId !== 9) return { state, events: [] };
    // ... your logic here
    return { state, events: [] };
  },
});
```

Then uncomment the `<script>` tag in `index.html`.

---

## Tech Stack

- Vanilla JavaScript (ES2020), no frameworks, no bundler
- PeerJS 1.5.2 for WebRTC signaling (loaded on demand, only in multiplayer)
- Google Fonts (Cinzel) for the medieval aesthetic
- 100% client-side — can be served as static files anywhere

---

## Credits

Based on the board game **Citadels** by Bruno Faidutti, published by Hans im Glück / Z-Man Games.
This is an unofficial fan implementation for personal use.

---

## License

MIT — do whatever you like, just keep the credits.
