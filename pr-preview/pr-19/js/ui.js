// In-game HUD: top bar, call track, seat labels, hand dock, action buttons, sheets (modals),
// character-call banner, toasts, floating numbers, emotes and the end screen. Pure DOM over WebGL.

import { CHAR, HUE, DIST, COLORS, SEAT_HUES } from './data.js';
import {
  rankOf, has, buildCost, canPlace, destroyCost, shielded, targetRanks, countsTowardLimit, score,
} from './engine.js';
import { t, cname, cabil, dname, ddesc, RULES, getLang, setLang, langSelect } from './i18n.js';
import { svg, ROMAN } from './icons.js';
import { sfx, soundOn, setSound, musicEnabled, setMusic } from './sfx.js';

const $ = (sel, el = document) => el.querySelector(sel);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ACTIVE = { assassin: 'kill', thief: 'rob', magician: 'mag', warlord: 'war', wizard: 'wiz', seer: 'seer', navigator: 'nav', scholar: 'scholar' };
const ABILITY_ICON = { kill: 'assassin', rob: 'thief', mag: 'magician', war: 'warlord', wiz: 'wizard', seer: 'seer', nav: 'navigator', scholar: 'scholar' };
const ABILITY_OF_ACTION = { kill: 'kill', rob: 'rob', swap: 'mag', redraw: 'mag', destroy: 'war', peek: 'wiz', seer: 'seer', nav: 'nav', scholar: 'scholar' };
const BLOCKING = ['draft', 'discard', 'keep', 'wizPick', 'seerGive', 'grave', 'over'];
const TURN_SHEETS = ['kill', 'rob', 'mag', 'war', 'wiz', 'seer', 'nav', 'scholar', 'den', 'lab'];
export const EMOTES = ['👍', '😂', '😮', '😡', '😈', '👑', '🙏', '🎉'];
const seatHue = pid => SEAT_HUES[pid % SEAT_HUES.length];

export function createUI(ctx) {
  const root = $('#hud');
  root.innerHTML = `
    <header class="topbar"></header>
    <div class="labels"></div>
    <div class="floaters"></div>
    <div class="toasts" aria-live="polite"></div>
    <div class="banner"></div>
    <section class="dock">
      <div class="prompt"></div>
      <div class="dock-row">
        <div class="me-panel"></div>
        <div class="hand"></div>
        <div class="actions"></div>
      </div>
    </section>
    <div class="sheet-wrap"><div class="sheet" role="dialog" aria-modal="true"></div></div>
    <div class="tip"></div>`;

  const els = {
    top: $('.topbar', root), labels: $('.labels', root), floaters: $('.floaters', root), toasts: $('.toasts', root),
    banner: $('.banner', root), dock: $('.dock', root), prompt: $('.prompt', root), me: $('.me-panel', root),
    hand: $('.hand', root), actions: $('.actions', root), wrap: $('.sheet-wrap', root), sheet: $('.sheet', root),
    tip: $('.tip', root),
  };

  function chrome() {
    els.top.innerHTML = `
      <div class="tb-left"><div class="round-chip"></div></div>
      <div class="calltrack" aria-label="call order"></div>
      <div class="tb-right">
        <div class="emote-wrap"><button class="icon-btn" data-a="emotes" title="${t('ui.react')}">😀</button>
          <div class="emote-pal">${EMOTES.map(e => `<button data-a="emote" data-v="${e}">${e}</button>`).join('')}</div></div>
        <button class="icon-btn" data-a="overview" title="${t('ui.resetView')}">${svg('focus')}</button>
        <button class="icon-btn" data-a="sheet" data-v="log" title="${t('ui.log')}">${svg('log')}</button>
        <button class="icon-btn" data-a="sheet" data-v="rules" title="${t('ui.rules')}">${svg('help')}</button>
        <button class="icon-btn" data-a="sheet" data-v="menu" title="${t('ui.menu')}">${svg('menu')}</button>
      </div>`;
    els.round = $('.round-chip', els.top);
    els.track = $('.calltrack', els.top);
  }
  chrome();

  // local (non-game) UI state
  const L = { sel: null, sheet: null, multi: new Set(), inspect: null, log: [], view: null, labelEls: new Map(), hint: null, shown: null };

  const insets = () => ctx.scene.setInsets({ top: els.top.offsetHeight + 8, bottom: els.dock.offsetHeight + 8 });
  new ResizeObserver(insets).observe(els.dock);

  // ── helpers ──
  const P = pid => L.view.players[pid];
  const thumb = id => ctx.thumbs[id] ? `style="background-image:url(${ctx.thumbs[id]})"` : '';
  const avatar = p => `<span class="av">${esc(p?.avatar || '◆')}</span>`;
  const pname = pid => (pid === L.view.me ? t('ui.you') : esc(P(pid)?.name ?? '?'));
  const realName = pid => esc(P(pid)?.name ?? '?');
  const shownScore = (v, p) => score(v, p).total - (p.id !== v.me && has(p, 'secret_vault') && v.phase !== 'over' ? 3 : 0);
  const sortHand = hand => [...hand].sort((a, b) => COLORS.indexOf(a.color) - COLORS.indexOf(b.color) || a.cost - b.cost || a.id.localeCompare(b.id));
  const actorOf = v => v.interrupt ? v.interrupt.pid : v.phase === 'draft' ? v.draft.order[v.draft.idx] : v.phase === 'turns' ? v.turn?.pid : null;

  function cardHTML(card, { cls = '', costShown, attrs = '' } = {}) {
    if (card.hidden) return `<div class="card back ${cls}"></div>`;
    const cost = costShown ?? card.cost;
    return `<button class="card c-${card.color} ${cls}" data-uid="${card.uid}" data-id="${card.id}" ${attrs}>
      <span class="card-art" ${thumb(card.id)}></span>
      <span class="card-cost${cost < card.cost ? ' disc' : ''}">${cost}</span>
      ${card.color === 'purple' ? '<span class="card-gem">✦</span>' : ''}
      <span class="card-name${/^[^\u3040-\u9fff\uac00-\ud7af]{9,}$/.test(dname(card)) ? ' long' : ''}">${esc(dname(card))}</span></button>`;
  }
  function charHTML(id, { cls = '', attrs = '', sub = '' } = {}) {
    const c = CHAR[id];
    return `<button class="ccard ${cls}" style="--cc:${c.color}" data-char="${id}" ${attrs}>
      <span class="cc-rank">${ROMAN[c.rank]}</span>
      <span class="cc-emb">${svg(c.key, 'emb')}</span>
      <span class="cc-name">${esc(cname(id))}</span>
      <span class="cc-ab">${esc(sub || cabil(id))}</span></button>`;
  }
  const chip = (id, extra = '') => `<span class="chip" style="--cc:${CHAR[id].color}" data-char="${id}" ${extra}>${svg(CHAR[id].key)}<b>${ROMAN[CHAR[id].rank]}</b></span>`;
  const rankChar = r => L.view.cfg.chars.find(c => rankOf(c) === r);

  // ── event text (log + toasts) ──
  function evText(e) {
    const n = pid => (pid === null || pid === undefined ? '' : realName(pid));
    switch (e.k) {
      case 'start': return t('l.start');
      case 'round': return t('l.round', { n: e.n, name: n(e.crown) });
      case 'pick': return t('l.pick', { name: n(e.pid) });
      case 'discard': return t('l.discard', { name: n(e.pid) });
      case 'call':
        if (e.pid === null) return t('l.callNone', { char: cname(e.charId) });
        if (e.killed) return t('l.callKilled', { char: cname(e.charId), name: n(e.pid) });
        return t('l.call', { char: cname(e.charId), name: n(e.pid) });
      case 'robbed': return t('l.robbed', { to: n(e.to), from: n(e.from), n: e.n });
      case 'crown': return t(e.heir ? 'l.heir' : 'l.crown', { name: n(e.pid) });
      case 'gold': return t('l.gold', { name: n(e.pid), n: e.n });
      case 'cards': return t('l.cards', { name: n(e.pid), n: e.n });
      case 'tithe': return t('l.tithe', { from: n(e.from) });
      case 'draw': return t('l.draw', { name: n(e.pid), n: e.n });
      case 'build': return t('l.build', { name: n(e.pid), dist: dname(e.card) });
      case 'complete': return t('l.complete', { name: n(e.pid) });
      case 'kill': return t('l.kill', { char: cname(rankChar(e.rank)) });
      case 'rob': return t('l.rob', { char: cname(rankChar(e.rank)) });
      case 'swap': return t('l.swap', { name: n(e.pid), target: n(e.target) });
      case 'redraw': return t('l.redraw', { name: n(e.pid), n: e.n });
      case 'destroy': return t('l.destroy', { name: n(e.pid), target: n(e.target), dist: dname(e.card) });
      case 'graveyard': return t('l.graveyard', { name: n(e.pid), dist: dname(e.card) });
      case 'peek': return t('l.peek', { name: n(e.pid), target: n(e.target) });
      case 'wizTake': return t('l.wizTake', { name: n(e.pid), target: n(e.target) });
      case 'seer': return t('l.seer', { name: n(e.pid), n: e.n });
      case 'seerGive': return t('l.seerGive', { name: n(e.pid), n: e.n });
      case 'over': return t('l.over', { name: n(e.winner) });
    }
    return null;
  }

  function toast(text, tone = '', ms = 2800) {
    const el = document.createElement('div');
    el.className = 'toast ' + tone;
    el.innerHTML = text;
    els.toasts.prepend(el);
    while (els.toasts.children.length > 4) els.toasts.lastChild.remove();
    setTimeout(() => el.classList.add('out'), ms);
    setTimeout(() => el.remove(), ms + 600);
  }
  // First-time guidance: each tip shows once per device.
  function coach(key) {
    try {
      if (localStorage.getItem('c3d.coach.' + key)) return;
      localStorage.setItem('c3d.coach.' + key, '1');
    } catch { return; }
    toast(`💡 ${t('coach.' + key)}`, 'coach', 7000);
  }

  // Numbers that rise from coins / cards / plots in the 3D scene.
  function floater(pid, where, text, tone = '') {
    const p = ctx.scene.screenOf(pid, where);
    if (!p || p.behind || document.hidden) return;
    const el = document.createElement('div');
    el.className = 'floater ' + tone;
    el.textContent = text;
    el.style.left = p.x + 'px';
    el.style.top = p.y + 'px';
    els.floaters.appendChild(el);
    setTimeout(() => el.remove(), 1600);
  }

  function showEmote(pid, e) {
    if (!EMOTES.includes(e) || !L.view) return;
    const anchor = pid === L.view.me ? els.me : L.labelEls.get(pid);
    if (!anchor) return;
    const r = anchor.getBoundingClientRect();
    const el = document.createElement('div');
    el.className = 'emote';
    el.textContent = e;
    el.style.left = r.left + r.width / 2 + 'px';
    el.style.top = r.top + 'px';
    els.floaters.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }

  function banner(e) {
    let html;
    if (e.k === 'complete') {
      html = `<div class="bn final"><div class="bn-emb">${svg('trophy', 'emb')}</div>
        <div class="bn-txt"><div class="bn-rank">${t('ui.finalSub', { name: realName(e.pid) })}</div><div class="bn-name">${t('ui.finalRound')}</div></div></div>`;
    } else {
      const c = CHAR[e.charId];
      const sub = e.pid === null ? t('ui.calledNobody') : e.killed ? `${pname(e.pid)} · ${t('ui.calledSlain')}` : pname(e.pid);
      html = `<div class="bn ${e.pid === null ? 'none' : ''} ${e.killed ? 'slain' : ''}" style="--cc:${c.color}">
        <div class="bn-emb">${svg(c.key, 'emb')}</div>
        <div class="bn-txt"><div class="bn-rank">${ROMAN[c.rank]}</div><div class="bn-name">${esc(cname(e.charId))}</div>
        <div class="bn-sub">${e.pid !== null && !e.killed ? avatar(P(e.pid)) : ''}${sub}</div></div></div>`;
    }
    els.banner.innerHTML = html;
    els.banner.classList.remove('show');
    void els.banner.offsetWidth;
    els.banner.classList.add('show');
  }

  // Called by the controller for every new event, in order. Returns ms to let it breathe.
  function event(e, view) {
    L.view = view;
    const txt = evText(e);
    if (txt && e.k !== 'gold' && e.k !== 'cards') L.log.push({ id: e.id, k: e.k, txt });
    if (L.log.length > 300) L.log.splice(0, L.log.length - 300);
    if (L.sheet === 'log') renderSheet();
    const mine = e.pid === view.me;
    switch (e.k) {
      case 'call':
        L.shown = { round: view.round, call: e.rank };
        renderTrack(view);
        banner(e);
        sfx(e.killed ? 'kill' : 'call');
        if (mine && !e.killed) setTimeout(() => sfx('turn'), 500);
        return e.pid === null ? 750 : e.killed ? 1200 : 1350;
      case 'round': toast(`<b>${t('ui.round', { n: e.n })}</b>`, 'gold'); return 900;
      case 'pick': case 'discard': return 220;
      case 'gold': sfx('coin', e.n); floater(e.pid, 'coins', `+${e.n}`, 'gold'); return 420;
      case 'cards': case 'draw': sfx('card', e.n); floater(e.pid, 'cards', `+${e.n}`, 'card'); return 420;
      case 'build': sfx('build'); floater(e.pid, 'plot', `+${e.card.cost}★`, 'pts'); if (!mine) toast(txt, 'c-' + e.card.color); return 750;
      case 'destroy': sfx('destroy'); floater(e.pid, 'coins', `−${e.cost}`, 'loss'); floater(e.target, 'plot', `−${e.card.cost}★`, 'loss'); toast(txt, 'danger'); return 1000;
      case 'robbed': sfx('coin', 4); floater(e.from, 'coins', `−${e.n}`, 'loss'); floater(e.to, 'coins', `+${e.n}`, 'gold'); toast(txt, 'danger'); return 900;
      case 'tithe': floater(e.from, 'coins', '−1', 'loss'); floater(e.to, 'coins', '+1', 'gold'); sfx('coin', 1); toast(txt); return 600;
      case 'kill': sfx('kill'); toast(txt, 'danger'); return 700;
      case 'rob': toast(txt); return 600;
      case 'crown': sfx('crown'); toast(txt, 'gold'); return 700;
      case 'complete': sfx('win'); banner(e); toast(`<b>${txt}</b>`, 'gold'); return 2000;
      case 'swap': case 'wizTake': case 'graveyard': case 'seer': case 'peek': case 'seerGive': case 'redraw': sfx('card', 2); toast(txt); return 700;
      case 'over': sfx('win'); return 600;
    }
    return 300;
  }

  // ── render ──
  function render(view) {
    const prevMe = L.view?.me;
    L.view = view;
    const me = view.players[view.me];
    const T = view.turn;
    const myTurn = view.phase === 'turns' && T?.pid === view.me && !view.interrupt;
    const draftMine = view.phase === 'draft' && view.draft.order[view.draft.idx] === view.me;
    // a new turn (incl. my second character straight after my first) closes the last turn's tools
    const turnKey = myTurn ? view.round + ':' + T.charId : null, wasWar = L.sheet === 'war';
    if (turnKey !== L.turnKey) { L.turnKey = turnKey; L.sel = null; if (TURN_SHEETS.includes(L.sheet)) L.sheet = null; }
    if (myTurn && ABILITY_ICON[L.sheet] && L.sheet !== abilityKey(view)) L.sheet = null; // ability already spent
    if (wasWar && L.sheet !== 'war') ctx.scene.highlight([]);
    if (prevMe !== view.me) { L.labelEls.forEach(el => el.remove()); L.labelEls.clear(); }
    if (L.hint && L.hint.seq !== view.evSeq) L.hint = null;
    if (me && L.sel && !me.hand.some(c => c.uid === L.sel)) L.sel = null;

    els.round.innerHTML = `<span class="rc-n">${t('ui.round', { n: view.round })}</span><span class="rc-p">${t('ui.' + (view.phase === 'idle' ? 'turns' : view.phase))}</span>`;
    renderTrack(view);
    renderLabels(view);

    if (me) {
      const curChar = myTurn ? T.charId : null;
      els.me.style.setProperty('--seat', seatHue(me.id));
      els.me.innerHTML = `
        <div class="mp-id">${avatar(me)}<span class="mp-name">${esc(me.name)}</span>${view.crown === me.id ? `<span class="crown-ico" title="Crown">${svg('crown')}</span>` : ''}</div>
        <div class="mp-stats"><span class="st gold" title="${t('ui.gold')}">${svg('gold')}<b>${me.gold}</b></span>
          <span class="st" title="${t('ui.city')}">${svg('build')}<b>${me.city.length}/${view.cfg.goal}</b></span>
          <span class="st" title="${t('ui.projected')}">★<b>${shownScore(view, me)}</b></span></div>
        <div class="mp-chars">${me.chars.map(c => chip(c, curChar === c ? 'data-on="1"' : view.killed === rankOf(c) && view.revealed.includes(c) ? 'data-dead="1"' : '')).join('')}</div>`;
    }

    renderHand(view, me, myTurn);
    renderActions(view, me, myTurn, draftMine);
    renderPrompt(view, myTurn, draftMine);

    // decisions that can't wait open themselves
    const pend = myTurn ? T.pending : null;
    const auto = view.interrupt?.pid === view.me ? 'grave'
      : draftMine ? (view.draft.mustDiscard ? 'discard' : 'draft')
      : pend?.k === 'keep' ? 'keep' : pend?.k === 'wizard' ? 'wizPick' : pend?.k === 'seerGive' ? 'seerGive' : null;
    if (auto && L.sheet !== auto) { L.sheet = auto; L.multi.clear(); }
    else if (!auto && BLOCKING.includes(L.sheet) && L.sheet !== 'over') L.sheet = null;
    if (draftMine) coach('draft');
    if (myTurn) coach('turn');
    if (view.phase === 'turns' && view.round === 1 && !myTurn) coach('call');
    if (view.round === 2) coach('cam');
    if (view.phase === 'over' && !L.overShown) { L.overShown = true; setTimeout(() => { if (L.view?.phase === 'over') { L.sheet = 'over'; renderSheet(); } }, 2200); }
    if (view.phase !== 'over') L.overShown = false;
    renderSheet();
    ctx.scene.highlight(L.sheet === 'war' ? warTargets(view).filter(x => x.ok).map(x => x.card.uid) : []);
    insets();
  }

  function renderTrack(view) {
    const ids = [...view.cfg.chars].sort((a, b) => rankOf(a) - rankOf(b));
    const up = view.draft?.faceUp || [];
    const call = L.shown?.round === view.round ? L.shown.call : view.call; // follows the banner, not the state
    els.track.innerHTML = ids.map(id => {
      const r = rankOf(id);
      const revealed = view.revealed.find(c => rankOf(c) === r);
      const holder = revealed ? view.players.find(p => p.chars.includes(revealed)) : null;
      const cls = [
        up.includes(id) ? 'up' : '',
        view.phase === 'turns' && call === r ? 'now' : '',
        view.phase === 'turns' && call > r ? 'past' : '',
        view.killed === r ? 'killed' : '',
        view.robbed === r ? 'robbed' : '',
      ].join(' ');
      const shown = revealed || id;
      return `<span class="tk ${cls}" style="--cc:${CHAR[shown].color}" data-char="${shown}">
        <span class="tk-emb">${svg(CHAR[shown].key)}</span><span class="tk-r">${ROMAN[r]}</span>
        ${view.killed === r ? `<span class="tk-mark k">${svg('skull')}</span>` : view.robbed === r ? `<span class="tk-mark r">${svg('thief')}</span>` : ''}
        ${holder ? `<span class="tk-who">${esc(holder.avatar || '·')}</span>` : ''}</span>`;
    }).join('');
  }

  function renderLabels(view) {
    const actor = actorOf(view);
    const seen = new Set();
    for (const p of view.players) {
      if (p.id === view.me) continue;
      seen.add(p.id);
      let el = L.labelEls.get(p.id);
      if (!el) {
        el = document.createElement('button');
        el.className = 'seat';
        el.dataset.a = 'inspect';
        el.dataset.v = p.id;
        el.style.setProperty('--seat', seatHue(p.id));
        els.labels.appendChild(el);
        L.labelEls.set(p.id, el);
      }
      const live = view.phase !== 'over' && view.phase !== 'idle';
      el.classList.toggle('active', actor === p.id && live);
      el.classList.toggle('winner', view.phase === 'over' && view.winner === p.id);
      el.classList.toggle('done', p.city.length >= view.cfg.goal);
      el.innerHTML = `<div class="s-top">${avatar(p)}<span class="s-name">${esc(p.name)}</span>${view.crown === p.id ? `<span class="crown-ico">${svg('crown')}</span>` : ''}${p.ai && ctx.mode() !== 'solo' ? '<span class="tag ai">AI</span>' : ''}${actor === p.id && live ? '<span class="dots"><i></i><i></i><i></i></span>' : ''}</div>
        <div class="s-stats"><span class="st gold">${svg('gold')}<b>${p.gold}</b></span><span class="st">${svg('card')}<b>${p.handCount}</b></span><span class="st">${svg('build')}<b>${p.city.length}</b></span><span class="st">★<b>${shownScore(view, p)}</b></span></div>
        ${p.chars.length || p.charCount ? `<div class="s-chars">${p.chars.map(c => chip(c, view.killed === rankOf(c) ? 'data-dead="1"' : '')).join('')}${'<span class="chip hid">?</span>'.repeat(Math.max(0, p.charCount - p.chars.length))}</div>` : ''}`;
    }
    for (const [pid, el] of L.labelEls) if (!seen.has(pid)) { el.remove(); L.labelEls.delete(pid); }
  }

  // positions labels every frame from the 3D projection; ticks the turn timer
  function frame() {
    for (const [pid, el] of L.labelEls) {
      const p = ctx.scene.labelPos(pid);
      if (!p || p.behind) { el.style.opacity = 0; continue; }
      const w = el.offsetWidth, h = el.offsetHeight;
      const x = Math.max(6, Math.min(innerWidth - w - 6, p.x - w / 2));
      const y = Math.max(els.top.offsetHeight + 4, Math.min(innerHeight - els.dock.offsetHeight - h - 4, p.y - h / 2));
      el.style.transform = `translate(${x}px, ${y}px)`;
      el.style.opacity = 1;
    }
    const tm = els.prompt.querySelector('.timer');
    if (tm) {
      const left = Math.max(0, Math.ceil((+tm.dataset.at - Date.now()) / 1000));
      if (tm.textContent !== left + 's') { tm.textContent = left + 's'; tm.classList.toggle('low', left <= 10); }
    }
  }

  function buildState(view, me, card) {
    const T = view.turn;
    if (!T || T.pid !== view.me) return null;
    if (!T.income) return t('ui.incomeFirst');
    if (countsTowardLimit(T.charId, card) && T.built >= T.max) return T.max === 0 ? t('ui.noBuild') : t('ui.limit');
    if (!canPlace(me, card)) return t('ui.dup');
    const cost = buildCost(me, card);
    if (cost > me.gold && !(card.id === 'thieves_den' && cost <= me.gold + me.hand.length - 1)) return t('ui.tooPoor');
    return 'ok';
  }

  function renderHand(view, me, myTurn) {
    if (!me) { els.hand.innerHTML = ''; return; }
    const hand = sortHand(me.hand), n = hand.length;
    if (!n) { els.hand.innerHTML = `<div class="hand-empty">${t('ui.empty')}</div>`; return; }
    const mid = (n - 1) / 2;
    els.hand.innerHTML = hand.map((c, i) => {
      const st = myTurn && !view.turn.pending ? buildState(view, me, c) : null;
      const cls = [st === 'ok' ? 'playable' : st ? 'blocked' : '', L.sel === c.uid ? 'sel' : ''].join(' ');
      return cardHTML(c, { cls, costShown: buildCost(me, c), attrs: `data-a="card" data-k="${i + 1}" style="--i:${i - mid};--a:${Math.abs(i - mid)}" ${st && st !== 'ok' ? `data-why="${esc(st)}"` : ''}` });
    }).join('');
    fitHand();
  }
  function fitHand() {
    const cards = els.hand.querySelectorAll('.card');
    if (!cards.length) return;
    const cw = cards[0].offsetWidth || 80, avail = els.hand.clientWidth - 8, n = cards.length;
    const gap = n > 1 ? Math.min(8, (avail - cw) / (n - 1) - cw) : 0;
    els.hand.style.setProperty('--gap', gap + 'px');
  }
  addEventListener('resize', () => fitHand());

  function abilityKey(view) {
    const T = view.turn;
    const k = ACTIVE[CHAR[T.charId].key];
    return k && !T.used.ability ? k : null;
  }

  function renderActions(view, me, myTurn, draftMine) {
    const hintBtn = `<button class="btn small ghost hint-btn" data-a="hint" title="H">${svg('help')}<span>${t('ui.hint')}</span></button>`;
    if (!myTurn || view.turn.pending) { els.actions.innerHTML = ''; return; }
    const T = view.turn, b = [];
    if (!T.income) {
      const n = has(me, 'observatory') ? 3 : 2;
      b.push(`<button class="btn gold" data-a="gold">${svg('gold')}<span>${t('ui.takeGold')}</span><kbd>G</kbd></button>`);
      b.push(`<button class="btn" data-a="draw" ${view.deckCount ? '' : 'disabled'}>${svg('draw')}<span>${has(me, 'library') ? t('ui.drawAll', { n }) : t('ui.drawCards', { n, k: 1 })}</span><kbd>D</kbd></button>`);
    }
    const ab = abilityKey(view);
    if (ab) b.push(`<button class="btn ability" style="--cc:${CHAR[T.charId].color}" data-a="sheet" data-v="${ab}">${svg(ABILITY_ICON[ab])}<span>${esc(cname(T.charId))}</span><kbd>A</kbd></button>`);
    if (has(me, 'smithy') && !T.used.smithy && me.gold >= 2) b.push(`<button class="btn small" data-a="smithy">${svg('smithy')}<span>${t('ui.smithy')}</span></button>`);
    if (has(me, 'laboratory') && !T.used.lab && me.hand.length) b.push(`<button class="btn small" data-a="sheet" data-v="lab">${svg('lab')}<span>${t('ui.lab')}</span></button>`);
    const sel = me.hand.find(c => c.uid === L.sel);
    if (sel && buildState(view, me, sel) === 'ok') b.push(`<button class="btn primary" data-a="build">${svg('build')}<span>${t('ui.buildFor', { n: buildCost(me, sel) })}</span><kbd>B</kbd></button>`);
    if (T.income) b.push(`<button class="btn ${sel ? '' : 'primary'} end" data-a="end">${svg('end')}<span>${t('ui.endTurn')}</span><kbd>E</kbd></button>`);
    b.push(hintBtn);
    els.actions.innerHTML = b.join('');
    markHint();
  }

  function renderPrompt(view, myTurn, draftMine) {
    let s = '';
    const actor = actorOf(view);
    if (view.phase === 'over') s = t('ui.winner', { name: pname(view.winner) });
    else if (view.interrupt && view.interrupt.pid !== view.me) s = t('ui.waitingGrave', { name: pname(view.interrupt.pid) });
    else if (myTurn) {
      const T = view.turn;
      const left = Math.max(0, T.max - T.built);
      s = `<b style="color:${CHAR[T.charId].color}">${t('ui.yourTurn', { char: cname(T.charId) })}</b> · ` +
        (!T.income ? t('ui.chooseIncome') : T.max === 0 ? t('ui.noBuild') : `${t('ui.mainHint')} <span class="muted">${t('ui.buildsLeft', { n: left })}</span>`);
    } else if (draftMine) s = `<b>${t(view.draft.mustDiscard ? 'ui.discardTitle' : 'ui.pickChar')}</b>`;
    else if (view.phase === 'draft') s = t(view.draft.mustDiscard ? 'ui.waitingDiscard' : 'ui.waitingDraft', { name: pname(view.draft.order[view.draft.idx]) });
    else if (view.turn) s = t('ui.waitingFor', { name: pname(view.turn.pid) });
    const dl = ctx.deadline?.();
    if (dl && dl.pid === actor && view.phase !== 'over') s += ` <span class="timer" data-at="${dl.at}"></span>`;
    els.prompt.innerHTML = s;
  }

  // ── hints: the advisor (normal-level AI) suggests a move and the UI points at it ──
  function describe(a, v) {
    const me = v.players[v.me];
    const cardIn = (list, uid) => list?.find(c => c.uid === uid);
    switch (a.t) {
      case 'pick': case 'discard': return t('h.' + a.t, { char: cname(a.charId) });
      case 'gold': case 'draw': case 'end': case 'seer': case 'scholar': case 'smithy': case 'seerGive': return t('h.' + a.t);
      case 'build': return t('h.build', { dist: dname(cardIn(me.hand, a.uid)) });
      case 'lab': return t('h.lab', { dist: dname(cardIn(me.hand, a.uid)) });
      case 'keep': return t('h.keep', { dist: dname(cardIn(v.turn.pending.cards, a.uids[0])) });
      case 'wizTake': return t('h.wizTake', { dist: dname(cardIn(v.turn.pending.cards, a.uid)) });
      case 'kill': case 'rob': return t('h.' + a.t, { char: cname(rankChar(a.rank)) });
      case 'swap': case 'peek': return t('h.' + a.t, { name: realName(a.target) });
      case 'redraw': return t('h.redraw', { n: a.uids.length });
      case 'destroy': return t('h.destroy', { name: realName(a.target), dist: dname(cardIn(v.players[a.target].city, a.uid)) });
      case 'nav': return t(a.choice === 'gold' ? 'h.navg' : 'h.navc');
      case 'graveyard': return t(a.take ? 'h.graveYes' : 'h.graveNo');
    }
    return '';
  }
  function showHint() {
    const a = ctx.hint?.();
    if (!a || !L.view) return;
    L.hint = { a, seq: L.view.evSeq };
    toast(t('ui.hintSays', { what: `<b>${esc(describe(a, L.view))}</b>` }), 'gold');
    if (a.t === 'build') L.sel = a.uid;
    render(L.view);
  }
  function markHint() {
    root.querySelectorAll('.suggest').forEach(el => el.classList.remove('suggest'));
    const a = L.hint?.a;
    if (!a) return;
    const sel = [];
    const ab = ABILITY_OF_ACTION[a.t];
    if (ab) sel.push(`[data-a="sheet"][data-v="${ab}"]`);
    if (a.t === 'pick' || a.t === 'discard') sel.push(`.ccard[data-char="${a.charId}"]`);
    if (['gold', 'draw', 'end', 'smithy'].includes(a.t)) sel.push(`[data-a="${a.t}"]`);
    if (a.t === 'build') sel.push(`.hand .card[data-uid="${a.uid}"]`, '[data-a="build"]');
    if (a.t === 'lab') sel.push('[data-a="sheet"][data-v="lab"]', `.card[data-a="lab"][data-uid="${a.uid}"]`);
    if (a.t === 'keep') sel.push(`.card[data-a="keep"][data-uid="${a.uids[0]}"]`);
    if (a.t === 'wizTake') sel.push(`[data-a="${a.build ? 'wizBuild' : 'wizTake'}"][data-v="${a.uid}"]`);
    if (a.t === 'kill' || a.t === 'rob') sel.push(`.ccard[data-a="${a.t}"][data-v="${a.rank}"]`);
    if (a.t === 'swap' || a.t === 'peek') sel.push(`[data-a="${a.t}"][data-v="${a.target}"]`);
    if (a.t === 'redraw' || a.t === 'seerGive') a.uids.forEach(u => sel.push(`.card[data-a="multi"][data-uid="${u}"]`));
    if (a.t === 'destroy') sel.push(`.card[data-a="destroy"][data-uid="${a.uid}"]`);
    if (a.t === 'seer') sel.push('[data-a="seerGo"]');
    if (a.t === 'scholar') sel.push('[data-a="scholarGo"]');
    if (a.t === 'nav') sel.push(`[data-a="nav"][data-v="${a.choice}"]`);
    if (a.t === 'graveyard') sel.push(`[data-a="${a.take ? 'graveYes' : 'graveNo'}"]`);
    sel.forEach(s => root.querySelectorAll(s).forEach(el => el.classList.add('suggest')));
  }

  // ── sheets ──
  function warTargets(view) {
    const me = view.players[view.me], out = [];
    for (const o of view.players) {
      const sh = shielded(view, o);
      for (const card of o.city) {
        const cost = destroyCost(o, card);
        out.push({ o, card, cost, sh, ok: !sh && card.id !== 'keep' && cost <= me.gold });
      }
    }
    return out;
  }

  function sheetFrame(title, body, { closable = true, cls = '', foot = '' } = {}) {
    return `<div class="sh-head"><h2>${title}</h2>${closable ? `<button class="icon-btn" data-a="close" aria-label="${t('ui.close')}">${svg('close')}</button>` : ''}</div>
      <div class="sh-body ${cls}">${body}</div>${foot}`;
  }
  function orderStrip(v) {
    const d = v.draft;
    return `<div class="order"><span class="muted">${t('ui.order')}</span>${d.order.map((pid, i) =>
      `<span class="ord ${i < d.idx ? 'done' : i === d.idx ? 'now' : ''}" style="--seat:${seatHue(pid)}" title="${realName(pid)}">${avatar(P(pid))}</span>`).join('<i>›</i>')}</div>`;
  }

  function renderSheet() {
    const v = L.view, s = L.sheet;
    els.wrap.classList.toggle('open', !!s);
    els.wrap.classList.toggle('blocking', BLOCKING.includes(s));
    els.wrap.classList.toggle('side', ['war', 'inspect', 'log'].includes(s)); // keep the table clickable
    if (!s || !v) { els.sheet.innerHTML = ''; return; }
    // never leave a decision dialog on screen with nothing to decide
    if ((s === 'draft' || s === 'discard') && !(v.phase === 'draft' && v.draft.options?.length)) { L.sheet = null; return renderSheet(); }
    const me = v.players[v.me], T = v.turn, pend = T?.pid === v.me ? T.pending : null;
    let html = '', wide = false;
    const myRanks = me ? me.chars.map(rankOf) : [];
    const hintFoot = `<div class="sh-foot"><button class="btn small ghost hint-btn" data-a="hint">${svg('help')}<span>${t('ui.hint')}</span></button></div>`;

    if (s === 'draft' || s === 'discard') {
      const discarding = s === 'discard';
      const opts = [...(v.draft.options || [])].sort((a, b) => rankOf(a) - rankOf(b));
      const second = me.chars.length > 0;
      html = sheetFrame(t(discarding ? 'ui.discardTitle' : second ? 'ui.pickSecond' : 'ui.pickChar'),
        `${orderStrip(v)}
        <div class="ccards ${discarding ? 'discarding' : ''}">${opts.map(id => charHTML(id, { attrs: `data-a="${discarding ? 'discard' : 'pick'}"`, cls: !discarding && !v.draft.avail.includes(id) ? 'hiddenpick' : '' })).join('')}</div>
        <div class="aside">${v.draft.faceUp.length ? `<span class="muted">${t('ui.faceUp')}</span>${v.draft.faceUp.map(id => chip(id)).join('')}` : ''}
        ${v.draft.faceDown.length ? `<span class="chip hid">?</span><span class="muted">${t('ui.faceDown', { n: v.draft.faceDown.length })}</span>` : ''}
        ${second ? `<span class="muted">· ${me.chars.map(c => chip(c)).join('')}</span>` : ''}</div>
        ${discarding ? `<p class="note">${t('ui.discardHint')}</p>` : opts.length > v.draft.avail.length ? `<p class="note">${t('ui.lastPickNote')}</p>` : ''}`,
        { closable: false, foot: hintFoot });
      wide = true;
    } else if (s === 'grave' && v.interrupt) {
      const c = v.interrupt.card;
      html = sheetFrame(t('ui.graveTitle'), `<div class="cards-big">${cardHTML(c, { cls: 'big' })}</div>
        <p class="center">${t('ui.graveAsk', { dist: `<b>${esc(dname(c))}</b>` })}</p>
        <div class="sh-foot two"><button class="btn" data-a="graveNo">${t('ui.graveNo')}</button>
        <button class="btn primary" data-a="graveYes" ${me.gold >= 1 ? '' : 'disabled'}>${svg('gold')}${t('ui.graveYes')}</button></div>`, { closable: false });
    } else if (s === 'keep' && pend) {
      html = sheetFrame(t('ui.keepTitle', { n: pend.n }),
        `<div class="cards-big">${sortHand(pend.cards).map(c => cardHTML(c, { cls: 'big' + (canPlace(me, c) ? '' : ' dupwarn'), costShown: buildCost(me, c), attrs: 'data-a="keep"' })).join('')}</div>
        <p class="note">${t('ui.keepHint')}</p>`, { closable: false, foot: hintFoot });
      wide = true;
    } else if (s === 'kill' || s === 'rob') {
      const ranks = targetRanks(v, s === 'kill' ? [1] : [1, 2, v.killed]).filter(r => !myRanks.includes(r));
      html = sheetFrame(t(s === 'kill' ? 'ui.killTitle' : 'ui.robTitle'),
        `<div class="ccards compact">${ranks.map(r => charHTML(rankChar(r), { attrs: `data-a="${s}" data-v="${r}"` })).join('')}</div>`, { foot: hintFoot });
      wide = true;
    } else if (s === 'mag') {
      const opps = v.players.filter(p => p.id !== v.me);
      html = sheetFrame(t('ui.magTitle'), `
        <h4>${t('ui.magSwap')}</h4>
        <div class="plist">${opps.map(p => `<button class="pitem" data-a="swap" data-v="${p.id}">${avatar(p)}<span>${esc(p.name)}</span><span class="st">${svg('card')}<b>${p.handCount}</b></span></button>`).join('')}</div>
        <h4>${t('ui.magRedraw')}</h4><p class="note">${t('ui.magRedrawHint')}</p>
        <div class="cards-pick">${sortHand(me.hand).map(c => cardHTML(c, { cls: L.multi.has(c.uid) ? 'picked' : '', attrs: 'data-a="multi"' })).join('')}</div>`,
        { foot: `<div class="sh-foot"><button class="btn small ghost hint-btn" data-a="hint">${svg('help')}<span>${t('ui.hint')}</span></button><button class="btn primary" data-a="redraw" ${L.multi.size && v.deckCount ? '' : 'disabled'}>${t('ui.confirm')} · ${L.multi.size}</button></div>` });
    } else if (s === 'war') {
      const rows = warTargets(v);
      const by = v.players.map(o => ({ o, list: rows.filter(r => r.o.id === o.id) })).filter(g => g.list.length);
      html = sheetFrame(t('ui.warTitle'), `<p class="note">${t('ui.warHint')}</p>` + by.map(({ o, list }) => `
        <div class="wgroup"><div class="wg-head" style="--seat:${seatHue(o.id)}">${avatar(o)}<b>${o.id === v.me ? t('ui.you') : esc(o.name)}</b>
          ${list[0].sh ? `<span class="tag">${t('ui.shielded.' + list[0].sh)}</span>` : ''}</div>
        <div class="cards-pick">${list.map(r => cardHTML(r.card, { cls: r.ok ? 'target' : 'blocked', attrs: r.ok ? `data-a="destroy" data-t="${o.id}"` : '', costShown: r.card.cost })
          .replace('</button>', `<span class="dcost">${svg('gold')}${r.cost}</span></button>`)).join('')}</div></div>`).join(''), { foot: hintFoot });
      wide = true;
    } else if (s === 'wiz') {
      const opps = v.players.filter(p => p.id !== v.me && p.handCount);
      html = sheetFrame(t('ui.wizTitle'), `<div class="plist">${opps.map(p => `<button class="pitem" data-a="peek" data-v="${p.id}">${avatar(p)}<span>${esc(p.name)}</span><span class="st">${svg('card')}<b>${p.handCount}</b></span></button>`).join('')}</div>`, { foot: hintFoot });
    } else if (s === 'wizPick' && pend) {
      html = sheetFrame(cname(11) + ' · ' + esc(P(pend.target).name), `<div class="cards-big">${sortHand(pend.cards).map(c => {
        const canB = canPlace(me, c) && buildCost(me, c) <= me.gold;
        return `<div class="wiz-opt">${cardHTML(c, { cls: 'big', costShown: buildCost(me, c) })}
          <button class="btn small" data-a="wizTake" data-v="${c.uid}">${t('ui.wizTake')}</button>
          <button class="btn small primary" data-a="wizBuild" data-v="${c.uid}" ${canB ? '' : 'disabled'}>${t('ui.wizBuild', { n: buildCost(me, c) })}</button></div>`;
      }).join('')}</div>`, { closable: false, foot: hintFoot });
      wide = true;
    } else if (s === 'seer') {
      html = sheetFrame(cname(15), `<p>${esc(cabil(15))}</p>`, { foot: `<div class="sh-foot"><button class="btn primary" data-a="seerGo">${t('ui.seerGo')}</button></div>` });
    } else if (s === 'seerGive' && pend) {
      const names = pend.targets.map(id => realName(id)).join(' → ');
      html = sheetFrame(t('ui.seerGive', { n: pend.targets.length }), `<p class="note">${t('ui.seerGiveHint', { names })}</p>
        <div class="cards-pick">${sortHand(me.hand).map(c => cardHTML(c, { cls: L.multi.has(c.uid) ? 'picked' : '', attrs: 'data-a="multi"' })).join('')}</div>`,
        { closable: false, foot: `<div class="sh-foot"><button class="btn small ghost hint-btn" data-a="hint">${svg('help')}<span>${t('ui.hint')}</span></button><button class="btn primary" data-a="seerGive" ${L.multi.size === pend.targets.length ? '' : 'disabled'}>${t('ui.confirm')} · ${L.multi.size}/${pend.targets.length}</button></div>` });
    } else if (s === 'nav') {
      html = sheetFrame(t('ui.navTitle'), `<p>${esc(cabil(10))}</p>`, { foot: `<div class="sh-foot two">
        <button class="btn gold" data-a="nav" data-v="gold">${svg('gold')}${t('ui.nav4gold')}</button>
        <button class="btn" data-a="nav" data-v="cards" ${v.deckCount ? '' : 'disabled'}>${svg('draw')}${t('ui.nav4cards')}</button></div>` });
    } else if (s === 'scholar') {
      html = sheetFrame(cname(14), `<p>${esc(cabil(14))}</p>`, { foot: `<div class="sh-foot"><button class="btn primary" data-a="scholarGo" ${v.deckCount ? '' : 'disabled'}>${t('ui.scholarGo')}</button></div>` });
    } else if (s === 'lab') {
      html = sheetFrame(dname('laboratory'), `<p class="note">${esc(ddesc('laboratory'))}</p>
        <div class="cards-pick">${sortHand(me.hand).map(c => cardHTML(c, { attrs: 'data-a="lab"' })).join('')}</div>`);
    } else if (s === 'den') {
      const card = me.hand.find(c => c.uid === L.sel);
      if (!card) { L.sheet = null; return renderSheet(); }
      const cost = buildCost(me, card), need = Math.max(0, cost - me.gold), goldPaid = cost - L.multi.size;
      html = sheetFrame(dname(card) + ' · ' + t('ui.denPay'), `<p class="note">${t('ui.denHint', { n: need })}</p>
        <div class="cards-pick">${sortHand(me.hand.filter(c => c.uid !== card.uid)).map(c => cardHTML(c, { cls: L.multi.has(c.uid) ? 'picked' : '', attrs: 'data-a="multi"' })).join('')}</div>`,
        { foot: `<div class="sh-foot"><button class="btn primary" data-a="denBuild" ${L.multi.size >= need && goldPaid >= 0 ? '' : 'disabled'}>${svg('build')}${svg('gold')}${Math.max(0, goldPaid)} + ${svg('card')}${L.multi.size}</button></div>` });
    } else if (s === 'inspect') {
      const p = P(L.inspect);
      if (!p) { L.sheet = null; return renderSheet(); }
      const sc = v.phase === 'over' ? v.scores[p.id].total : shownScore(v, p);
      html = sheetFrame(`<span class="seat-dot" style="--seat:${seatHue(p.id)}"></span>${avatar(p)} ${p.id === v.me ? t('ui.you') : esc(p.name)}`, `
        <div class="stats-row"><span class="st gold">${svg('gold')}<b>${p.gold}</b></span><span class="st">${svg('card')}<b>${p.handCount}</b></span>
        <span class="st">${svg('build')}<b>${p.city.length}/${v.cfg.goal}</b></span><span class="st">★<b>${sc}</b></span>
        ${p.chars.map(c => chip(c)).join('')}</div>
        <div class="cards-pick city">${p.city.length ? p.city.map(c => cardHTML(c, { attrs: 'data-a="none"' })).join('') : `<p class="muted">—</p>`}</div>`);
      wide = true;
    } else if (s === 'log') {
      html = sheetFrame(t('ui.log'), `<ol class="log">${L.log.map(l => `<li class="lk-${l.k}">${l.txt}</li>`).join('')}</ol>`, { cls: 'scroll' });
    } else if (s === 'rules') {
      const ids = [...new Set(v.cfg.chars)].sort((a, b) => rankOf(a) - rankOf(b));
      const purples = Object.keys(DIST).filter(id => DIST[id][1] === 'purple');
      html = sheetFrame(t('ui.rules'), `<div class="rules">${RULES[getLang()].replace('{goal}', v.cfg.goal)}</div>
        <div class="ccards compact static">${ids.map(id => charHTML(id, { attrs: 'tabindex="-1"' })).join('')}</div>
        <h3>${t('col.purple')}</h3><dl class="dlist">${purples.map(id => `<dt><span class="dot" style="background:${HUE.purple}"></span>${dname(id)} <span class="muted">${DIST[id][0]}</span></dt><dd>${ddesc(id)}</dd>`).join('')}</dl>
        <p class="note">${t('ui.keys')}</p><p class="note">${t('ui.camHint')}</p>`, { cls: 'scroll' });
      wide = true;
    } else if (s === 'menu') {
      const sp = ctx.getSpeed(), q = ctx.scene.quality;
      html = sheetFrame(t('ui.menu'), `
        <div class="menu-row"><span>${t('ui.sound')}</span><button class="btn small" data-a="sound" aria-pressed="${soundOn()}">${svg(soundOn() ? 'sound' : 'mute')}</button></div>
        <div class="menu-row"><span>${t('ui.music')}</span><button class="btn small" data-a="music" aria-pressed="${musicEnabled()}">${musicEnabled() ? '♪ ON' : '♪ OFF'}</button></div>
        ${ctx.mode() !== 'peer' ? `<div class="menu-row"><span>${t('lb.speed')}</span><div class="seg">${['slow', 'normal', 'fast'].map(k => `<button class="${sp === k ? 'on' : ''}" data-a="speed" data-v="${k}">${t('lb.' + k)}</button>`).join('')}</div></div>` : ''}
        <div class="menu-row"><span>${t('ui.quality')}</span><div class="seg">${['high', 'low'].map(k => `<button class="${q === k ? 'on' : ''}" data-a="quality" data-v="${k}">${t('ui.q.' + k)}</button>`).join('')}</div></div>
        <div class="menu-row"><span>${t('lb.lang')}</span><label class="lang-pick">${svg('lang')}${langSelect()}</label></div>
        <p class="note">${t('ui.keys')}</p>`,
        { foot: `<div class="sh-foot"><button class="btn danger" data-a="leave">${t('ui.leave')}</button></div>` });
    } else if (s === 'over') {
      const rows = [...v.scores].sort((a, b) => b.total - a.total);
      const win = v.winner === v.me;
      const cols = ['base', 'first', 'complete', 'colors', 'extra'].filter(k => rows.some(r => r.parts[k]));
      const rec = ctx.stats?.();
      html = `<div class="over ${win ? 'win' : ''}">
        <div class="over-ico">${svg('trophy')}</div>
        <h1>${win ? t('ui.youWin') : t('ui.youLose', { name: realName(v.winner) })}</h1>
        <table class="score"><thead><tr><th></th>${[...cols, 'total'].map(k => `<th>${t('ui.score.' + k)}</th>`).join('')}</tr></thead>
        <tbody>${rows.map((r, i) => `<tr class="${r.pid === v.winner ? 'w' : ''}" style="--d:${i * 120}ms;--seat:${seatHue(r.pid)}"><td>${avatar(P(r.pid))}${r.pid === v.me ? t('ui.you') : realName(r.pid)}</td>
          ${cols.map(k => `<td>${r.parts[k] || '·'}</td>`).join('')}<td class="tot">${r.total}</td></tr>`).join('')}</tbody></table>
        ${rec ? `<p class="note">${t('lb.stats', rec)}</p>` : ''}
        <div class="sh-foot two">${ctx.mode() !== 'peer' ? `<button class="btn primary" data-a="again">${svg('play')}${t('ui.again')}</button>` : ''}<button class="btn" data-a="home">${t('ui.home')}</button></div></div>`;
      wide = true;
    }
    if (!html) { L.sheet = null; els.wrap.classList.remove('open'); els.sheet.innerHTML = ''; return; }
    els.sheet.className = 'sheet' + (wide ? ' wide' : '') + (s === 'over' ? ' over-sheet' : '');
    els.sheet.innerHTML = html;
    if (s === 'log') { const b = $('.sh-body', els.sheet); b.scrollTop = b.scrollHeight; }
    markHint();
    // keyboard users land inside a decision dialog
    if (BLOCKING.includes(s) && !els.sheet.contains(document.activeElement)) els.sheet.querySelector('button:not([disabled]):not([data-a="close"])')?.focus({ preventScroll: true });
  }

  function openSheet(name) {
    L.sheet = name;
    L.multi.clear();
    renderSheet();
    ctx.scene.highlight(name === 'war' ? warTargets(L.view).filter(x => x.ok).map(x => x.card.uid) : []);
    sfx('click');
  }
  function closeSheet() {
    L.sheet = null; L.multi.clear(); renderSheet(); ctx.scene.highlight([]);
  }

  // ── input ──
  const go = a => { L.multi.clear(); L.hint = null; ctx.dispatch(a); };
  root.addEventListener('change', e => { if (e.target.dataset.a === 'lang') { setLang(e.target.value); ctx.relang(); } });
  root.addEventListener('click', e => {
    const el = e.target.closest('[data-a]');
    if (!$('.emote-wrap', root)?.contains(e.target)) els.top.classList.remove('emoting');
    if (!el || !root.contains(el)) {
      if (e.target === els.wrap && !els.wrap.classList.contains('blocking')) closeSheet();
      return;
    }
    const a = el.dataset.a, v = el.dataset.v, view = L.view;
    if (!view || a === 'lang') return; // the <select> handles itself (see 'change')
    const me = view.players[view.me];
    switch (a) {
      case 'close': return closeSheet();
      case 'sheet': return openSheet(v);
      case 'overview': ctx.scene.resetView(); return;
      case 'hint': return showHint();
      case 'emotes': els.top.classList.toggle('emoting'); return;
      case 'emote': els.top.classList.remove('emoting'); return ctx.emote(v);
      case 'inspect': L.inspect = +v; ctx.scene.focus(+v); return openSheet('inspect');
      case 'pick': sfx('click'); return go({ t: 'pick', charId: +el.dataset.char });
      case 'discard': sfx('click'); return go({ t: 'discard', charId: +el.dataset.char });
      case 'graveYes': return go({ t: 'graveyard', take: true });
      case 'graveNo': return go({ t: 'graveyard', take: false });
      case 'gold': return go({ t: 'gold' });
      case 'draw': return go({ t: 'draw' });
      case 'end': L.sel = null; return go({ t: 'end' });
      case 'smithy': return go({ t: 'smithy' });
      case 'card': {
        const uid = el.dataset.uid;
        if (el.dataset.why) toast(el.dataset.why);
        L.sel = L.sel === uid ? null : uid;
        sfx('click');
        return render(view);
      }
      case 'build': {
        const card = me.hand.find(c => c.uid === L.sel);
        if (!card) return;
        if (buildCost(me, card) > me.gold) return openSheet('den');
        L.sel = null;
        return go({ t: 'build', uid: card.uid });
      }
      case 'denBuild': { const uid = L.sel; L.sel = null; const pay = [...L.multi]; closeSheet(); return go({ t: 'build', uid, pay }); }
      case 'keep': return go({ t: 'keep', uids: [el.dataset.uid] });
      case 'kill': closeSheet(); return go({ t: 'kill', rank: +v });
      case 'rob': closeSheet(); return go({ t: 'rob', rank: +v });
      case 'swap': closeSheet(); return go({ t: 'swap', target: +v });
      case 'multi': {
        const uid = el.dataset.uid;
        // when the selection is already full (Seer give-back, Thieves' Den), a new pick replaces the oldest
        const V = L.view, sel = V.players[V.me].hand.find(c => c.uid === L.sel);
        const cap = L.sheet === 'seerGive' ? V.turn?.pending?.targets?.length : L.sheet === 'den' && sel ? buildCost(V.players[V.me], sel) : Infinity;
        if (L.multi.has(uid)) L.multi.delete(uid);
        else { if (L.multi.size >= cap) L.multi.delete(L.multi.values().next().value); L.multi.add(uid); }
        sfx('click');
        return renderSheet();
      }
      case 'redraw': { const uids = [...L.multi]; closeSheet(); return go({ t: 'redraw', uids }); }
      case 'destroy': closeSheet(); return go({ t: 'destroy', target: +el.dataset.t, uid: el.dataset.uid });
      case 'peek': closeSheet(); return go({ t: 'peek', target: +v });
      case 'wizTake': return go({ t: 'wizTake', uid: v, build: false });
      case 'wizBuild': return go({ t: 'wizTake', uid: v, build: true });
      case 'seerGo': closeSheet(); return go({ t: 'seer' });
      case 'seerGive': return go({ t: 'seerGive', uids: [...L.multi] });
      case 'nav': closeSheet(); return go({ t: 'nav', choice: v });
      case 'scholarGo': closeSheet(); return go({ t: 'scholar' });
      case 'lab': closeSheet(); return go({ t: 'lab', uid: el.dataset.uid });
      case 'sound': setSound(!soundOn()); return renderSheet();
      case 'music': setMusic(!musicEnabled()); return renderSheet();
      case 'speed': ctx.setSpeed(v); return renderSheet();
      case 'quality': ctx.scene.setQuality(v); return renderSheet();
      case 'leave': if (ctx.mode() === 'solo' || confirm(t('ui.leaveConfirm'))) ctx.leave(); return;
      case 'again': closeSheet(); return ctx.again();
      case 'home': closeSheet(); return ctx.leave();
    }
  });
  root.addEventListener('dblclick', e => {
    const el = e.target.closest('.hand .card.playable');
    if (!el) return;
    L.sel = el.dataset.uid;
    render(L.view);
    $('[data-a="build"]', els.actions)?.click();
  });
  addEventListener('keydown', e => {
    if (!root.classList.contains('on') || e.target.closest?.('input, textarea') || e.metaKey || e.ctrlKey || e.altKey) return;
    const click = sel => { const b = root.querySelector(sel); if (b && !b.disabled) { b.click(); e.preventDefault(); } };
    const k = e.key.toLowerCase();
    if (k === 'escape') { if (L.sheet && !els.wrap.classList.contains('blocking')) closeSheet(); else els.top.classList.remove('emoting'); return; }
    if (els.wrap.classList.contains('open') && !['h', 'l'].includes(k)) {
      if (/^[1-9]$/.test(k)) click(`.sheet .ccard:nth-of-type(${k}), .sheet .cards-big > :nth-child(${k}) [data-a], .sheet .cards-big > .card:nth-child(${k})`);
      return;
    }
    if (k === 'g') click('[data-a="gold"]');
    else if (k === 'd') click('[data-a="draw"]');
    else if (k === 'b') click('[data-a="build"]');
    else if (k === 'a') click('.actions .btn.ability');
    else if (k === 'e' || k === 'enter') click('[data-a="end"]');
    else if (k === 'h') showHint();
    else if (k === 'l') L.sheet === 'log' ? closeSheet() : openSheet('log');
    else if (/^[1-9]$/.test(k)) click(`.hand .card[data-k="${k}"]`);
  });

  // tooltips for cards, chips and 3D buildings
  function showTip(html, x, y) {
    els.tip.innerHTML = html;
    els.tip.classList.add('on');
    const w = els.tip.offsetWidth, h = els.tip.offsetHeight;
    els.tip.style.transform = `translate(${Math.min(innerWidth - w - 8, Math.max(8, x - w / 2))}px, ${y - h - 14 < 8 ? y + 18 : y - h - 14}px)`;
  }
  const hideTip = () => els.tip.classList.remove('on');
  const cardTip = card => `<b>${esc(dname(card))}</b> <span class="muted">· ${t('col.' + card.color)} · ${t('ui.cost', { n: card.cost })}</span>${ddesc(card.id) ? `<p>${esc(ddesc(card.id))}</p>` : ''}`;
  const charTip = id => `<b style="color:${CHAR[id].color}">${ROMAN[CHAR[id].rank]} · ${esc(cname(id))}</b><p>${esc(cabil(id))}</p>`;
  root.addEventListener('pointerover', e => {
    if (e.pointerType !== 'mouse') return;
    const c = e.target.closest('.card[data-id]'), ch = e.target.closest('[data-char]:not(.ccard)');
    if (!c && !ch) return hideTip();
    const r = (c || ch).getBoundingClientRect();
    if (c) showTip(cardTip({ id: c.dataset.id, color: DIST[c.dataset.id][1], cost: DIST[c.dataset.id][0] }) + (c.dataset.why ? `<p class="warn">${esc(c.dataset.why)}</p>` : ''), r.left + r.width / 2, r.top);
    else showTip(charTip(+ch.dataset.char), r.left + r.width / 2, r.top);
  });
  root.addEventListener('pointerout', e => { if (!e.relatedTarget || !root.contains(e.relatedTarget)) hideTip(); });
  // subtle 3D tilt on hand cards (desktop)
  els.hand.addEventListener('pointermove', e => {
    const c = e.target.closest('.card');
    if (!c || e.pointerType !== 'mouse') return;
    const r = c.getBoundingClientRect();
    c.style.setProperty('--rx', ((e.clientY - r.top) / r.height - 0.5) * -14 + 'deg');
    c.style.setProperty('--ry', ((e.clientX - r.left) / r.width - 0.5) * 14 + 'deg');
  });

  // 3D picks
  function onPick(h) {
    if (!L.view || !h) return;
    if (L.sheet === 'war' && h.card) {
      const tgt = warTargets(L.view).find(x => x.card.uid === h.card.uid && x.ok);
      if (tgt) { closeSheet(); return go({ t: 'destroy', target: tgt.o.id, uid: tgt.card.uid }); }
    }
    if (h.pid !== null && h.pid !== undefined) {
      L.inspect = h.pid;
      ctx.scene.focus(h.pid);
      openSheet('inspect');
    }
  }
  function onHover(h, x, y) {
    if (h?.card) showTip(cardTip(h.card), x, y);
    else hideTip();
  }

  return {
    render, event, frame, toast, onPick, onHover, showEmote,
    relang() { chrome(); if (L.view) render(L.view); },
    show() { root.classList.add('on'); insets(); },
    hide() { root.classList.remove('on'); L.sheet = null; L.log = []; L.shown = null; L.labelEls.forEach(el => el.remove()); L.labelEls.clear(); els.wrap.classList.remove('open'); hideTip(); },
    resetLog() { L.log = []; L.shown = null; },
  };
}
