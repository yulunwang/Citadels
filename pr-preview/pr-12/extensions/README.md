# Writing Citadels Extensions

Extensions let you add new characters, districts, scoring rules, and UI to Citadels without modifying the core engine.

## Quick start

Create a new folder under `extensions/` and add an `extension.js` file. Call `EXT.register({...})` at the bottom of that file, then add a `<script>` tag for it in `index.html` (after `lobby.js`, before the boot script).

```html
<!-- index.html -->
<script src="extensions/my-expansion/extension.js"></script>
<script>renderLobby({ screen: 'home' });</script>
```

---

## API Reference

### `EXT.register(ext)`

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier, e.g. `'dark-city'` |
| `name` | `string` | Display name shown in the browser console |
| `chars` | `Array` | Extra characters pushed onto `CHARS` |
| `districts` | `Array` | Extra districts shuffled into the deck |
| `sdesc` | `Object` | `{ specialKey: 'tooltip text' }` — merged into `SDESC` |
| `scoreHook` | `Function` | `(player, isFirst, baseScore) → deltaPts` |
| `sotHook` | `Function` | `(state, charId, pid) → { state, events[] }` |
| `specialHook` | `Object` | `{ charId, fn(S, charId) → DOMElement \| null }` |
| `aiHook` | `Object` | `{ charId, fn(state, pid) → { state, events } \| null }` |
| `css` | `string` | Inline CSS injected into `<head>` |

---

## Adding Characters

Use IDs **≥ 9** to avoid conflicts with the base 8.

```js
EXT.register({
  id: 'my-expansion',
  name: 'My Expansion',

  chars: [
    {
      id: 9,
      name: 'Navigator',
      clr: '#5ab8d4',
      emoji: '⚓',
      ability: 'Draw 2 extra cards at the start of your turn.',
    },
  ],

  // Start-of-turn hook — fires for EVERY character each round.
  // Only act when charId matches yours.
  sotHook(state, charId, pid) {
    if (charId !== 9) return { state, events: [] };
    const drawn = state.deck.slice(0, Math.min(2, state.deck.length));
    const newState = {
      ...state,
      deck: state.deck.slice(drawn.length),
      players: state.players.map(p =>
        p.id === pid ? { ...p, hand: [...p.hand, ...drawn] } : p
      ),
    };
    return {
      state: newState,
      events: drawn.length
        ? [{ icon: '⚓', text: `Navigator draws ${drawn.length} extra card(s).`, color: '#5ab8d4' }]
        : [],
    };
  },

  // Special-ability UI panel for this character
  specialHook: {
    charId: 9,
    fn(S, charId) {
      const wrap = el('div', null);
      wrap.appendChild(
        el('div', { style: 'color:#5ab8d4;font-size:12px' },
          '⚓ +2 cards drawn at start of turn.')
      );
      return wrap;
    },
  },

  // AI behavior — return null to use the default "collect income + build" loop
  aiHook: {
    charId: 9,
    fn(state, pid) {
      return null; // use default AI
    },
  },
});
```

---

## Adding Districts

```js
EXT.register({
  id: 'extra-districts',
  name: 'Extra Districts',

  districts: [
    { id: 'museum', name: 'Museum', cost: 4, color: 'purple', special: 'museum' },
  ],

  // SDESC keys must match the 'special' field of your district
  sdesc: {
    museum: '+1 point for each district color you have at game end.',
  },

  scoreHook(player, isFirst, baseScore) {
    const hasMuseum = player.city.some(d => d.id === 'museum');
    if (!hasMuseum) return 0;
    const colors = new Set(player.city.map(d => d.color));
    return colors.size; // +1 per color
  },
});
```

> **Tip:** Add a corresponding emoji in `DEMOJI` if you want an icon on cards:
> ```js
> DEMOJI['museum'] = '🏛️';
> ```

---

## Notes

- Extensions are loaded at parse time but take effect at game start (`mkDeck()` and `CHARS` are read when a new game begins).
- Multiple extensions can be active simultaneously — hooks are called in registration order.
- The `scoreHook` receives the *base* score already computed; return a **delta** (positive or negative), not the total.
- The `sotHook` must return `{ state, events }` for every character call, not just your own.
- `specialHook.fn` returning `null` falls through to the base `renderSpecial()` logic.
