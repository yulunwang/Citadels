/**
 * test-engine.js — Citadels engine test harness
 * Run with Node.js: node test-engine.js
 *
 * Tests the pure game logic from ext-api.js, data.js, and engine.js.
 * No DOM or browser APIs required for these functions.
 */

'use strict';
const vm = require('vm');
const fs = require('fs');

// ── STUB GLOBALS ───────────────────────────────────────────────────────────────
const ctx = { console };
ctx.window = ctx;          // var declarations land here
ctx.global  = ctx;

function load(path) {
  vm.runInNewContext(fs.readFileSync(path, 'utf8'), ctx);
}
load('./js/ext-api.js');
load('./js/data.js');
load('./js/engine.js');

const {
  newGame, runAIDraft, advanceCall, heraldAck,
  humanCollectGold, humanCollectCards, humanKeepCard,
  humanBuild, humanEndTurn, humanKill, humanSteal,
  humanMagSwap, humanMagDiscard, humanWarlord, humanUseSmithy,
  doAITurn, applyStartOfTurn, endRound, calcScore,
} = ctx;

// ── HARNESS ───────────────────────────────────────────────────────────────────
let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); console.log(`  ✓  ${name}`); passed++; }
  catch(e) { console.log(`  ✗  ${name}\n     → ${e.message}`); failed++; }
}
function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }
function eq(a, b, msg) { if (a !== b) throw new Error(`${msg||''} — expected ${b}, got ${a}`); }

// ── BUG 1a: Dead AI still acts ─────────────────────────────────────────────
console.log('\n══ BUG 1a: Dead AI skips turn after pendingKill ══\n');

test('AI assassinated via pendingKill collects no income', () => {
  let s = newGame();
  s = { ...s, players: s.players.map((p, i) => ({
    ...p, char: [1,3,5,7][i], dead: false, smithyUsed: false,
    pendingKill: i===0 ? 3 : null,  // human (char=1) targets char=3 (AI player 1)
    stolenTarget: null,
  })) };
  const goldBefore = s.players[1].gold;
  const { state, events } = doAITurn(s, 1, 3);
  assert(state.players[1].dead, 'AI should be dead after pendingKill applied in SOT');
  const income = events.filter(e => e.icon === '✦' || e.icon === '🃏');
  eq(income.length, 0, 'Dead AI income events');
  eq(state.players[1].gold, goldBefore, 'Dead AI gold unchanged');
});

test('AI assassinated via pendingKill does not build', () => {
  let s = newGame();
  s = { ...s, players: s.players.map((p, i) => ({
    ...p, char: [1,3,5,7][i], dead: false, smithyUsed: false, gold: 20,
    pendingKill: i===0 ? 3 : null, stolenTarget: null,
  })) };
  const cityBefore = s.players[1].city.length;
  const { state } = doAITurn(s, 1, 3);
  eq(state.players[1].city.length, cityBefore, 'Dead AI should not build');
});

// ── BUG 1b: Dead human freezes game ────────────────────────────────────────
console.log('\n══ BUG 1b: Dead human does not freeze game ══\n');

test('advanceCall continues past dead human (assassinated via pendingKill)', () => {
  let s = newGame();
  // human=char5, AI=char1 with pendingKill=5 (simulates assassin AI committing to kill char 5)
  // Actually we need human Assassin targeting a char before human's own char number.
  // Easier: human=char5, some AI has pendingKill=5 (impossible normally — only human sets pendingKill)
  // Real scenario: human=char1(Assassin) sets pendingKill=5 via humanKill,
  // then at callIdx=5 (human's char=5? No — human IS char1 here)
  // Correct scenario: human=char5, AI player uses char1 (but AI directly sets dead, not pendingKill)
  // The pendingKill path for human victim means: human has char=X, ANOTHER human set pendingKill=X
  // In solo play there's only one human, so we must force it manually:
  s = { ...s, players: s.players.map((p, i) => ({
    ...p, char: [5,1,3,7][i], dead: false, smithyUsed: false, stolenTarget: null,
    // Force: player 1 (AI) has pendingKill=5 pointing at the human's char
    // NOTE: applyStartOfTurn only checks `!q.ai` for pendingKill — so this would be ignored.
    // The real scenario requires the human themselves or another human to set pendingKill.
    // In solo play, test the post-fix path: manually mark human dead and verify game continues.
    pendingKill: null,
  })) };
  // Mark the human as dead directly (simulating what a fix or AI-kill would produce)
  s = { ...s, players: s.players.map((p,i) => i===0 ? {...p, dead:true} : p) };
  ctx._applyLocalSlot = 0;
  // advanceCall should process char5 (human, dead) and skip them, not stop for input
  const result = advanceCall(s, 0);
  // Game must not be waiting for human input on a dead player
  const humanDeadAndWaiting =
    result.phase === 'action' && result.sub === 'choose' &&
    result.players[0].dead;
  assert(!humanDeadAndWaiting, 'Game must not wait for dead human input (frozen state)');
  console.log(`     Phase after dead human: phase=${result.phase} sub=${result.sub||'-'}`);
});

test('pendingKill on human char triggers skip via advanceCall continue path', () => {
  // The real scenario: two human slots exist (multiplayer) and one assassinates the other.
  // Simulate with _applyLocalSlot=1 so player0 is "remote" and player1 is "local human".
  // But applyStartOfTurn only applies pendingKill from !q.ai players.
  // Here we set player0 (ai:false) pendingKill=3 targeting player1 (char=3, local human).
  let s = newGame();
  s = { ...s, players: s.players.map((p, i) => ({
    ...p,
    char:  [1, 3, 5, 7][i],
    ai:    i >= 2,          // player0 and player1 are human
    dead:  false, smithyUsed: false, stolenTarget: null,
    pendingKill: i===0 ? 3 : null,  // player0 (char=1) targets char=3 (player1, local human)
  })) };
  ctx._applyLocalSlot = 1;  // local human is slot 1 (char=3)
  const result = advanceCall(s, 1);
  // After callIdx reaches 3 (player1's char), SOT applies pendingKill, marks player1 dead.
  // The new code should continue past them, NOT return heraldAfter:'human_act'.
  if (result.phase === 'herald') {
    assert(result.heraldAfter !== 'human_act' || !result.players[1].dead,
      'BUG: heraldAfter=human_act set for dead player — game will freeze after herald');
  }
  if (result.phase === 'action' && result.sub === 'choose') {
    assert(!result.players[1].dead, 'BUG: action/choose state reached for dead human player');
  }
  console.log(`     Result: phase=${result.phase} heraldAfter=${result.heraldAfter||'-'} player1.dead=${result.players[1].dead}`);
});

// ── BUG 2: Thief steals from assassinated player ───────────────────────────
console.log('\n══ BUG 2: Thief cannot steal from assassinated player ══\n');

test('Thief does not steal when target was assassinated same turn (pendingKill)', () => {
  let s = newGame();
  s = { ...s, players: s.players.map((p, i) => ({
    ...p, char: [1,2,3,5][i], dead: false, smithyUsed: false, gold: 8,
    stolenTarget: i===1 ? 3 : null,  // AI thief (player1) targets char=3 (player2)
    pendingKill:  i===0 ? 3 : null,  // human (player0, char=1) targets char=3 (player2)
  })) };
  const thiefGoldBefore  = s.players[1].gold;
  const victimGoldBefore = s.players[2].gold;
  const { state, events } = applyStartOfTurn(s, 3, 2);
  assert(state.players[2].dead, 'Victim (char=3) should be dead after pendingKill');
  const stealEv = events.find(e => e.icon === '💰' && e.text.includes('steals'));
  assert(!stealEv, `Thief should NOT steal from assassinated player — event found: "${stealEv?.text}"`);
  eq(state.players[1].gold, thiefGoldBefore,  'Thief gold unchanged');
  eq(state.players[2].gold, victimGoldBefore, 'Victim gold unchanged');
});

test('Thief still steals from living target', () => {
  let s = newGame();
  s = { ...s, players: s.players.map((p, i) => ({
    ...p, char: [1,2,3,5][i], dead: false, smithyUsed: false, gold: 8,
    stolenTarget: i===1 ? 3 : null,  // thief targets char=3
    pendingKill:  null,               // no assassination
  })) };
  const thiefGoldBefore  = s.players[1].gold;
  const victimGoldBefore = s.players[2].gold;
  const { state, events } = applyStartOfTurn(s, 3, 2);
  assert(!state.players[2].dead, 'Victim should be alive');
  const stealEv = events.find(e => e.icon === '💰' && e.text.includes('steals'));
  assert(stealEv, 'Thief should steal from a living target');
  eq(state.players[1].gold, thiefGoldBefore + victimGoldBefore, 'Thief gains victim gold');
  eq(state.players[2].gold, 0, 'Victim loses all gold');
});

// ── SCORING ────────────────────────────────────────────────────────────────
console.log('\n══ Scoring ══\n');

test('5-color diversity gives +3 pts', () => {
  const p = { city: [
    {uid:'a',id:'manor',    cost:3,color:'yellow',special:null},
    {uid:'b',id:'temple',   cost:1,color:'blue',  special:null},
    {uid:'c',id:'tavern',   cost:1,color:'green', special:null},
    {uid:'d',id:'watchtower',cost:1,color:'red',  special:null},
    {uid:'e',id:'keep',     cost:3,color:'purple',special:'keep'},
  ], hand:[] };
  eq(calcScore(p, false), 9 + 3, '5-color diversity bonus');
});

test('School of Magic enables 5-color diversity', () => {
  const p = { city: [
    {uid:'a',id:'manor',           cost:3,color:'yellow',special:null},
    {uid:'b',id:'temple',          cost:1,color:'blue',  special:null},
    {uid:'c',id:'tavern',          cost:1,color:'green', special:null},
    {uid:'d',id:'watchtower',      cost:1,color:'red',   special:null},
    {uid:'e',id:'school_of_magic', cost:6,color:'purple',special:'flex_color'},
  ], hand:[] };
  eq(calcScore(p, false), 12 + 3, 'SoM enables diversity bonus');
});

test('Map Room gives +1 pt per hand card', () => {
  const p = { city:[{uid:'a',id:'map_room',cost:5,color:'purple',special:'map_room'}], hand:[{uid:'h1'},{uid:'h2'},{uid:'h3'}] };
  eq(calcScore(p, false), 5 + 3, 'Map Room +3 for 3 hand cards');
});

test('First completer gets +4, non-first with 8 gets +2', () => {
  const city = Array.from({length:8},(_,i)=>({uid:`d${i}`,id:'tavern',cost:1,color:'green',special:null}));
  const p = { city, hand:[] };
  assert(calcScore(p, true)  - calcScore(p, false) === 2, '+4 first vs +2 non-first = net 2');
});

// ── WARLORD ────────────────────────────────────────────────────────────────
console.log('\n══ Warlord ══\n');

test('Cannot destroy Keep', () => {
  let s = newGame();
  const keep = {uid:'k1',id:'keep',name:'Keep',cost:3,color:'purple',special:'keep'};
  s = { ...s, players: s.players.map((p,i) => {
    if(i===0) return {...p,char:8,gold:10};
    if(i===1) return {...p,char:3,city:[keep]};
    return p;
  }), sub:'warlord_pick' };
  const r = humanWarlord(s, 1, 'k1');
  assert(r.players[1].city.some(d=>d.uid==='k1'), 'Keep survived');
});

test('Bishop alive protects city', () => {
  let s = newGame();
  const church = {uid:'c1',id:'church',name:'Church',cost:2,color:'blue',special:null};
  s = { ...s, players: s.players.map((p,i) => {
    if(i===0) return {...p,char:8,gold:10};
    if(i===1) return {...p,char:5,dead:false,city:[church]};
    return p;
  }), sub:'warlord_pick' };
  const r = humanWarlord(s, 1, 'c1');
  assert(r.players[1].city.some(d=>d.uid==='c1'), 'Bishop alive = city protected');
});

test('Great Wall forces full cost', () => {
  let s = newGame();
  const wall   = {uid:'w1',id:'great_wall',name:'Great Wall',cost:6,color:'purple',special:'great_wall'};
  const prison = {uid:'p1',id:'prison',    name:'Prison',    cost:2,color:'red',   special:null};
  s = { ...s, players: s.players.map((p,i) => {
    if(i===0) return {...p,char:8,gold:10};
    if(i===1) return {...p,char:3,city:[wall,prison]};
    return p;
  }), sub:'warlord_pick' };
  const goldBefore = s.players[0].gold;
  const r = humanWarlord(s, 1, 'p1');
  eq(r.players[0].gold, goldBefore - 2, 'Great Wall: full cost 2 (not cost-1=1)');
});

// ── FULL AUTO GAME ─────────────────────────────────────────────────────────
console.log('\n══ Full auto-game ══\n');

test('3 full AI games complete without error', () => {
  for (let g = 0; g < 3; g++) {
    let s = newGame();
    s = { ...s, players: s.players.map(p => ({...p, ai:true})) };
    ctx._applyLocalSlot = -1;
    s = runAIDraft(s);
    let steps = 0;
    const MAX = 2000;  // each round has ~8 herald acks + 1 advanceCall + 1 draft; 25 rounds = ~250 steps
    while (s.phase !== 'gameover' && steps < MAX) {
      if      (s.phase === 'herald') s = heraldAck(s, -1);  // advances one herald item
      else if (s.phase === 'draft')  s = runAIDraft(s);
      else if (s.phase === 'action') s = advanceCall(s, -1);
      else break;
      steps++;
    }
    assert(s.phase === 'gameover', `Game ${g+1} stuck in '${s.phase}' (round ${s.round}) after ${steps} steps`);
    console.log(`     Game ${g+1}: ${s.round} rounds, ${steps} steps`);
  }
});

// ── SUMMARY ───────────────────────────────────────────────────────────────
console.log(`\n═══════════════════════════════════════════`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
