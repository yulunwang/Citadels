// ═══════════════════════════════════════════════════════════════════════════════
// EXTENSION API
// Register game expansions (new characters, districts, score rules, UI) via
// EXT.register({...}) at the bottom of any extension script.
//
// Load order: ext-api.js must come before data.js (which uses EXT._extraDistricts)
// and before engine.js (which calls EXT hooks at runtime).
// ═══════════════════════════════════════════════════════════════════════════════

const EXT = {
  _extraDistricts: [],   // extra district definitions added by extensions
  _scoreHooks:     [],   // fn(player, isFirst, baseScore) → deltaPts
  _sotHooks:       [],   // fn(state, charId, pid) → { state, events }
  _specialHooks:   {},   // charId → fn(S, charId) → DOMElement | null
  _aiHooks:        {},   // charId → fn(state, pid) → { state, events } | null

  /**
   * Register a game extension.
   *
   * @param {Object}   ext
   * @param {string}   ext.id             Unique identifier (e.g. 'dark-city')
   * @param {string}   ext.name           Display name shown in console
   *
   * @param {Array}    [ext.chars]        Extra characters pushed onto CHARS.
   *   Each entry: { id, name, clr, emoji, ability }
   *   Use ids >= 9 to avoid conflicts with the base 8 characters.
   *
   * @param {Array}    [ext.districts]    Extra districts shuffled into the deck.
   *   Each entry: { id, name, cost, color, special }
   *   'special' must match a key in SDESC (or add one via ext.sdesc).
   *
   * @param {Object}   [ext.sdesc]        { specialKey: 'description', ... }
   *   Merged into SDESC so tooltips work for new special abilities.
   *
   * @param {Function} [ext.scoreHook]
   *   Called once per player at game end.
   *   fn(player, isFirst, baseScore) → number (delta, 0 = no change).
   *   Do NOT mutate player.
   *
   * @param {Function} [ext.sotHook]
   *   Called at the start of every character's turn (charIds 1-8 and beyond).
   *   fn(state, charId, pid) → { state, events[] }
   *   Only act when charId matches your character's id.
   *
   * @param {Object}   [ext.specialHook]  { charId, fn }
   *   fn(S, charId) → DOMElement | null
   *   Renders the special-ability UI panel for your character.
   *   Return null to fall through to the base renderSpecial() logic.
   *
   * @param {Object}   [ext.aiHook]       { charId, fn }
   *   fn(state, pid) → { state, events } | null
   *   Override AI behavior for your character. Return null to use default AI.
   *
   * @param {string}   [ext.css]
   *   Inline CSS injected into <head> for extension-specific UI styling.
   */
  register(ext) {
    if (ext.chars)       CHARS.push(...ext.chars);
    if (ext.districts)   EXT._extraDistricts.push(...ext.districts);
    if (ext.sdesc)       Object.assign(SDESC, ext.sdesc);
    if (ext.scoreHook)   EXT._scoreHooks.push(ext.scoreHook);
    if (ext.sotHook)     EXT._sotHooks.push(ext.sotHook);
    if (ext.specialHook) EXT._specialHooks[ext.specialHook.charId] = ext.specialHook.fn;
    if (ext.aiHook)      EXT._aiHooks[ext.aiHook.charId] = ext.aiHook.fn;
    if (ext.css) {
      const s = document.createElement('style');
      s.textContent = ext.css;
      document.head.appendChild(s);
    }
    console.log('[Citadels] Extension loaded:', ext.name || ext.id);
  },
};
