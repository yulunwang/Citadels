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
  humanSeer, canBuildDistrict,
  doAITurn, applyStartOfTurn, endRound, calcScore,
  charRank, charById,
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

// ── VARIABLE PLAYER COUNT ──────────────────────────────────────────────────
console.log('\n══ Variable player count ══\n');

test('newGame with 1 AI (2 players) has correct structure', () => {
  const s = newGame({numAI:1, charPool:[1,2,3,4,5,6,7,8]});
  eq(s.players.length, 2, 'player count');
  eq(s.charPool.length, 8, 'charPool length');
  assert(s.avail.length === 8, 'avail starts full');
});

test('newGame with 6 AI (7 players) has correct structure', () => {
  const s = newGame({numAI:6, charPool:[1,2,3,4,5,6,7,8,9,10,11]});
  eq(s.players.length, 7, 'player count');
  eq(s.charPool.length, 11, 'charPool length');
  eq(s.players.filter(p=>p.ai).length, 6, 'AI count');
});

test('Navigator AI: takes 4 gold or draws 4 cards, no build', () => {
  let s = newGame({numAI:1, charPool:[1,2,3,4,5,6,7,8,9,10,11]});
  s = { ...s, players: s.players.map((p,i) => ({...p, char:[10,1][i], ai:true, gold:2})) };
  const goldBefore = s.players[0].gold;
  const handBefore = s.players[0].hand.length;
  const { state, events } = doAITurn(s, 0, 10);
  const navEv = events.find(e => e.icon === '⚓');
  assert(navEv, 'Navigator event emitted');
  // Should have drawn cards (gold < 5) or taken gold
  const changed = state.players[0].gold !== goldBefore || state.players[0].hand.length !== handBefore;
  assert(changed, 'Navigator AI made income choice');
});

test('Queen AI: earns 3 gold when beside King', () => {
  let s = newGame({numAI:1, charPool:[1,2,3,4,5,6,7,8,9]});
  // players 0 and 1 are adjacent (diff=1); assign char 9 (Queen) to player 0, char 4 (King) to player 1
  s = { ...s, players: s.players.map((p,i) => ({...p, char:[9,4][i], dead:false})) };
  const goldBefore = s.players[0].gold;
  const { state, events } = applyStartOfTurn(s, 9, 0);
  const queenEv = events.find(e => e.icon === '🫅');
  assert(queenEv, 'Queen event emitted');
  assert(queenEv.text.includes('earns 3✦'), `Queen should earn 3 gold — got: "${queenEv.text}"`);
  eq(state.players[0].gold, goldBefore + 3, 'Queen gold gain');
});

test('charPool preserved across rounds', () => {
  let s = newGame({numAI:2, charPool:[1,2,3,4,5,6,7,8,9,10,11]});
  s = { ...s, players: s.players.map(p => ({...p, ai:true})) };
  ctx._applyLocalSlot = -1;
  s = runAIDraft(s);
  // Simulate end of round
  let steps = 0;
  while(s.round < 2 && s.phase !== 'gameover') {
    if(s.phase === 'herald') s = heraldAck(s, -1);
    else if(s.phase === 'draft') s = runAIDraft(s);
    else if(s.phase === 'action') s = advanceCall(s, -1);
    else break;
    if(++steps > 500) break;
  }
  eq(s.charPool.length, 11, 'charPool preserved in round 2');
  assert(s.avail.length <= 11, 'avail is a subset of charPool');
});

// ── FULL AUTO GAME ─────────────────────────────────────────────────────────
console.log('\n══ Full auto-game ══\n');

test('7-player full game with all 11 chars completes', () => {
  let s = newGame({numAI:6, charPool:[1,2,3,4,5,6,7,8,9,10,11]});
  s = { ...s, players: s.players.map(p => ({...p, ai:true})) };
  ctx._applyLocalSlot = -1;
  s = runAIDraft(s);
  let steps = 0;
  const MAX = 5000;
  while(s.phase !== 'gameover' && steps < MAX) {
    if(s.phase === 'herald') s = heraldAck(s, -1);
    else if(s.phase === 'draft') s = runAIDraft(s);
    else if(s.phase === 'action') s = advanceCall(s, -1);
    else break;
    steps++;
  }
  assert(s.phase === 'gameover', `7-player game stuck in '${s.phase}' after ${steps} steps`);
  console.log(`     7-player game: ${s.round} rounds, ${steps} steps`);
});

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

// ── NEW DISTRICTS ──────────────────────────────────────────────────────────
console.log('\n══ New district scoring ══\n');

test('Basilica: +1 VP per odd-cost district', () => {
  const p = { city: [
    {uid:'a',id:'basilica',cost:6,color:'purple',special:'basilica'},
    {uid:'b',id:'manor',   cost:3,color:'yellow',special:null},   // odd
    {uid:'c',id:'temple',  cost:1,color:'blue',  special:null},   // odd
    {uid:'d',id:'harbor',  cost:4,color:'green', special:null},   // even
  ], hand:[] };
  // base cost = 6+3+1+4 = 14; basilica bonus = 2 odd-cost districts (manor=3, temple=1)
  eq(calcScore(p, false), 14 + 2, 'Basilica +2 for 2 odd-cost districts');
});

test('Capitol: +3 VP when 3+ districts same color', () => {
  const p = { city: [
    {uid:'a',id:'capitol', cost:5,color:'purple',special:'capitol'},
    {uid:'b',id:'tavern',  cost:1,color:'green', special:null},
    {uid:'c',id:'market',  cost:2,color:'green', special:null},
    {uid:'d',id:'docks',   cost:3,color:'green', special:null},
  ], hand:[] };
  eq(calcScore(p, false), 11 + 3, 'Capitol +3 for 3 green districts');
});

test('Capitol: no bonus when no color has 3+', () => {
  const p = { city: [
    {uid:'a',id:'capitol',cost:5,color:'purple',special:'capitol'},
    {uid:'b',id:'tavern', cost:1,color:'green', special:null},
    {uid:'c',id:'manor',  cost:3,color:'yellow',special:null},
  ], hand:[] };
  eq(calcScore(p, false), 9, 'Capitol no bonus without 3 of same color');
});

test('Ivory Tower: +5 VP when only purple district', () => {
  const p = { city: [
    {uid:'a',id:'ivory_tower',cost:3,color:'purple',special:'ivory_tower'},
    {uid:'b',id:'manor',      cost:3,color:'yellow',special:null},
  ], hand:[] };
  eq(calcScore(p, false), 6 + 5, 'Ivory Tower +5 as sole purple');
});

test('Ivory Tower: no bonus when other purples present', () => {
  const p = { city: [
    {uid:'a',id:'ivory_tower',cost:3,color:'purple',special:'ivory_tower'},
    {uid:'b',id:'keep',       cost:3,color:'purple',special:'keep'},
  ], hand:[] };
  eq(calcScore(p, false), 6, 'Ivory Tower no bonus with other purple');
});

test('Quarry allows building duplicate districts', () => {
  const quarry = {uid:'q1',id:'quarry',name:'Quarry',cost:5,color:'purple',special:'quarry'};
  const tavern = {uid:'t1',id:'tavern',name:'Tavern',cost:1,color:'green', special:null};
  const player = {city:[quarry,tavern], hand:[], gold:10};
  // canBuildDistrict should allow another tavern when quarry is in city
  const {canBuildDistrict} = ctx;
  assert(canBuildDistrict(player, {uid:'t2',id:'tavern',name:'Tavern',cost:1,color:'green',special:null}),
    'Quarry allows duplicate tavern');
});

test('No quarry: duplicate districts blocked', () => {
  const tavern  = {uid:'t1',id:'tavern',name:'Tavern',cost:1,color:'green',special:null};
  const player  = {city:[tavern], hand:[], gold:10};
  const {canBuildDistrict} = ctx;
  assert(!canBuildDistrict(player, {uid:'t2',id:'tavern',name:'Tavern',cost:1,color:'green',special:null}),
    'Without Quarry, duplicate blocked');
});

// ── NEW CHARACTERS ─────────────────────────────────────────────────────────
console.log('\n══ New characters ══\n');

test('Seer AI takes 1 card from each opponent', () => {
  let s = newGame({numAI:3, charPool:[1,2,15,4,5,6,7,8]});
  // Give all players a hand, assign Seer(15) to player 1
  s = { ...s, players: s.players.map((p,i) => ({
    ...p, char:[1,15,3,5][i], ai:true, gold:4,
    hand: [{uid:`h${i}a`,id:'tavern',name:'Tavern',cost:1,color:'green',special:null}],
  })) };
  const handBefore = s.players[1].hand.length;
  const opp0Before = s.players[0].hand.length;
  const { state, events } = doAITurn(s, 1, 15);
  const seerEv = events.find(e => e.icon === '🔯');
  assert(seerEv, 'Seer event emitted');
  // Seer (player1) should have taken cards from players 0,2,3
  assert(state.players[1].hand.length > handBefore, 'Seer gained cards');
  assert(state.players[0].hand.length < opp0Before, 'Opponent lost a card');
});

test('humanSeer takes 1 card from each opponent', () => {
  let s = newGame({numAI:2, charPool:[1,2,15,4,5,6,7,8]});
  s = { ...s, players: s.players.map((p,i) => ({
    ...p, char:[15,3,5][i], ai:i>0, gold:4,
    hand: [{uid:`h${i}`,id:'tavern',name:'Tavern',cost:1,color:'green',special:null}],
    seerUsed: false,
  })) };
  const handBefore = s.players[0].hand.length;
  const ns = ctx.humanSeer(s);
  assert(ns.players[0].seerUsed, 'seerUsed flag set');
  assert(ns.players[0].hand.length > handBefore, 'Human Seer gained cards');
  // Opponents should each have lost one card
  assert(ns.players[1].hand.length < s.players[1].hand.length, 'Opponent lost card');
});

test('humanSeer cannot be used twice', () => {
  let s = newGame({numAI:1, charPool:[1,2,15,4,5,6,7,8]});
  s = { ...s, players: s.players.map((p,i) => ({
    ...p, char:[15,3][i], ai:i>0, gold:4,
    hand: [{uid:`h${i}`,id:'tavern',name:'Tavern',cost:1,color:'green',special:null}],
    seerUsed: true,  // already used
  })) };
  const handBefore = s.players[0].hand.length;
  const ns = ctx.humanSeer(s);
  eq(ns.players[0].hand.length, handBefore, 'Seer used twice: hand unchanged');
});

test('Trader SOT: earns gold per green district', () => {
  let s = newGame({numAI:1, charPool:[1,2,3,4,5,16,7,8]});
  const greens = [
    {uid:'g1',id:'tavern',  name:'Tavern',  cost:1,color:'green',special:null},
    {uid:'g2',id:'market',  name:'Market',  cost:2,color:'green',special:null},
  ];
  s = { ...s, players: s.players.map((p,i) => ({
    ...p, char:[16,3][i], dead:false, gold:2, city: i===0 ? greens : [],
  })) };
  const goldBefore = s.players[0].gold;
  const { state, events } = applyStartOfTurn(s, 16, 0);
  const traderEv = events.find(e => e.icon === '🏦');
  assert(traderEv, 'Trader event emitted');
  eq(state.players[0].gold, goldBefore + 2, 'Trader earned 2 gold for 2 green districts');
});

test('Trader AI: builds up to 2 districts', () => {
  let s = newGame({numAI:1, charPool:[1,2,3,4,5,16,7,8]});
  const cards = [
    {uid:'c1',id:'tavern', name:'Tavern', cost:1,color:'green',special:null},
    {uid:'c2',id:'market', name:'Market', cost:2,color:'green',special:null},
  ];
  s = { ...s, players: s.players.map((p,i) => ({
    ...p, char:[16,3][i], ai:true, gold:10, hand: i===0 ? cards : [],
  })) };
  const cityBefore = s.players[0].city.length;
  const { state } = doAITurn(s, 0, 16);
  assert(state.players[0].city.length >= cityBefore + 1, 'Trader AI built at least 1 district');
});

test('Patrician SOT: takes crown and draws cards for yellow districts', () => {
  let s = newGame({numAI:1, charPool:[1,2,3,12,5,6,7,8]});
  const yellows = [
    {uid:'y1',id:'manor',  name:'Manor',  cost:3,color:'yellow',special:null},
    {uid:'y2',id:'castle', name:'Castle', cost:4,color:'yellow',special:null},
  ];
  s = { ...s, players: s.players.map((p,i) => ({
    ...p, char:[12,3][i], dead:false, city: i===0 ? yellows : [],
  })) };
  const handBefore = s.players[0].hand.length;
  const { state, events } = applyStartOfTurn(s, 12, 0);
  assert(state.crown === 0, 'Patrician takes the crown');
  assert(state.players[0].hand.length >= handBefore + 2, 'Patrician draws 2 cards for 2 yellow districts');
});

test('Abbot SOT: earns gold per blue district and steals 1 from richest', () => {
  let s = newGame({numAI:1, charPool:[1,2,3,4,13,6,7,8]});
  const blues = [
    {uid:'b1',id:'temple', name:'Temple', cost:1,color:'blue',special:null},
    {uid:'b2',id:'church', name:'Church', cost:2,color:'blue',special:null},
  ];
  s = { ...s, players: s.players.map((p,i) => ({
    ...p, char:[13,3][i], dead:false, gold: i===0?2:10, city: i===0 ? blues : [],
  })) };
  const goldBefore0 = s.players[0].gold;
  const goldBefore1 = s.players[1].gold;
  const { state, events } = applyStartOfTurn(s, 13, 0);
  // Should earn 2 from blue + steal 1 from player1
  eq(state.players[0].gold, goldBefore0 + 2 + 1, 'Abbot gained 2 blue + 1 stolen');
  eq(state.players[1].gold, goldBefore1 - 1, 'Richest player lost 1 gold');
});

test('Scholar AI: draws 7 keeps best, builds up to 2', () => {
  let s = newGame({numAI:1, charPool:[1,2,3,4,5,6,14,8]});
  s = { ...s, players: s.players.map((p,i) => ({...p, char:[14,3][i], ai:true, gold:10})) };
  const deckBefore = s.deck.length;
  const { state, events } = doAITurn(s, 0, 14);
  const scholEv = events.find(e => e.icon === '📖');
  assert(scholEv, 'Scholar event emitted');
  // Scholar draws up to 7, keeps 1 (net deck shrinkage of up to 7)
  assert(state.deck.length <= deckBefore, 'Deck shrank after Scholar draw');
});

test('Full game with Full Mix charPool completes', () => {
  // One char per rank (ranks 1-9), using expansion chars
  let s = newGame({numAI:6, charPool:[1,2,15,12,13,16,10,8,9]});
  s = { ...s, players: s.players.map(p => ({...p, ai:true})) };
  ctx._applyLocalSlot = -1;
  s = runAIDraft(s);
  let steps = 0;
  while(s.phase !== 'gameover' && steps < 5000) {
    if(s.phase === 'herald') s = heraldAck(s, -1);
    else if(s.phase === 'draft') s = runAIDraft(s);
    else if(s.phase === 'action') s = advanceCall(s, -1);
    else break;
    steps++;
  }
  assert(s.phase === 'gameover', `Full-mix game stuck in '${s.phase}' after ${steps} steps`);
  console.log(`     Full-mix game: ${s.round} rounds, ${steps} steps`);
});

// ── SUMMARY ───────────────────────────────────────────────────────────────
console.log(`\n═══════════════════════════════════════════`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
