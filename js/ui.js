// ═══════════════════════════════════════════════════════════════════════════════
// UI — DOM helpers and all render functions (except renderLobby, which is in lobby.js)
// ═══════════════════════════════════════════════════════════════════════════════

// ── DOM HELPERS ────────────────────────────────────────────────────────────────
function el(tag,attrs,text){
  const e=document.createElement(tag);
  if(attrs)for(const[k,v]of Object.entries(attrs)){if(k==='style')e.style.cssText=v;else if(k==='class')e.className=v;else e.setAttribute(k,v);}
  if(text!==undefined)e.textContent=text;return e;
}
function gbtn(label,color,onClick,extra){
  var b=el('button',{class:'gbtn',style:`--btn-clr:${color};${extra||''}`},label);
  b.onclick=onClick;return b;
}

// District card — landscape orientation (emoji left, info right)
function mkCard(d,opts){
  opts=opts||{};
  const cost=opts.player?buildCost(opts.player,d):d.cost;
  const disc=opts.player&&cost<d.cost;
  const portrait=opts.portrait;
  const small=opts.small;

  const div=el('div');
  let cls='dcard color-'+d.color;
  if(opts.onClick&&!opts.disabled)cls+=' clickable';
  if(opts.selected)cls+=' selected';
  if(portrait)cls+=' portrait';
  div.className=cls;

  if(!portrait){
    const h=small?42:54;const ew=small?30:42;const iw=small?62:96;
    div.style.cssText=`opacity:${opts.disabled?0.4:1};height:${h}px;width:${ew+iw}px`;
  }else{
    if(opts.disabled)div.style.opacity='0.4';
  }

  const emojiCol=el('div',{class:'dcard-emoji-col'});
  if(!portrait){
    const ew=small?30:42;
    emojiCol.style.width=ew+'px';
    emojiCol.style.fontSize=(small?14:22)+'px';
  }
  emojiCol.textContent=DEMOJI[d.id]||'🏛';
  // Try to load district art
  if(typeof IMG !== 'undefined' && IMG.district[d.id]) {
    var imgSrc = IMG.district[d.id].full;
    emojiCol.style.backgroundImage = 'url(' + imgSrc + ')';
    emojiCol.style.backgroundSize = 'cover';
    emojiCol.style.backgroundPosition = 'center';
    var probe = new Image();
    probe.onload = function() { emojiCol.textContent = ''; };
    probe.onerror = function() { emojiCol.style.backgroundImage = ''; };
    probe.src = imgSrc;
  }
  div.appendChild(emojiCol);

  const infoCol=el('div',{class:'dcard-info-col'});
  const costEl=el('div',{class:disc?'dcard-cost dcard-cost-disc':'dcard-cost'});
  costEl.textContent=disc?`${cost}✦ (${d.cost}✦)`:`${cost}✦`;
  const nm=el('div',{class:'dcard-name'});nm.textContent=d.name;
  const c=CS[d.color];
  const tp=el('div',{class:'dcard-type'});tp.textContent=c.label;
  infoCol.append(costEl,nm,tp);

  const showDesc=!opts.noDesc&&(portrait||(!small&&d.special))&&d.special&&SDESC[d.special];
  if(showDesc){
    const desc=el('div',{class:'dcard-desc'});
    desc.textContent=SDESC[d.special];
    infoCol.appendChild(desc);
  }

  div.appendChild(infoCol);
  if(opts.onClick&&!opts.disabled)div.onclick=opts.onClick;
  return div;
}

// ── GAME STATE ─────────────────────────────────────────────────────────────────
var S=null; // shared global; written by lobby.js, net.js, and game action handlers

// ── MAIN RENDER ───────────────────────────────────────────────────────────────
function render(){
  if(!S){renderLobby({screen:'home'});return;}

  const app=document.getElementById('app');app.innerHTML='';
  if(S.phase==='gameover'){app.appendChild(renderGameOver());return;}

  const wrap=el('div',{class:`game-wrap phase-${S.phase}`});
  if(typeof IMG !== 'undefined') {
    wrap.style.backgroundImage = 'url(' + IMG.bg.game + ')';
    wrap.style.backgroundSize = 'cover';
  }

  // ── TOP BAR ──────────────────────────────────────────────────────────────────
  const topbar=el('div',{id:'topbar'});
  const tbHdr=el('div',{class:'tb-header'});
  tbHdr.appendChild(el('span',{class:'tb-title'},'⚜ Citadels'));
  tbHdr.appendChild(el('span',{class:'tb-meta'},`Round ${S.round} · Crown: ${S.players[S.crown].name}`));
  if((S.phase==='action'||S.phase==='herald')&&S.callIdx<=Math.max(0,...S.charPool.map(charRank))){
    const activeChar=S.players.find(p=>charRank(p.char)===S.callIdx);
    const c=activeChar?charById(activeChar.char):CHARS.find(ch=>ch.rank===S.callIdx)||{emoji:'?',name:'?',clr:'#888'};
    tbHdr.appendChild(el('span',{class:'tb-calling',style:`color:${c.clr}`},`${c.emoji} Calling: ${c.name}`));
  }
  const endBtn=el('button',{class:'btn-danger'},'✕ End Game');
  endBtn.onclick=()=>{S={...S,_confirmEnd:true};render();};
  tbHdr.appendChild(endBtn);
  topbar.appendChild(tbHdr);

  const tbGrid=el('div',{class:'tb-grid'});
  const displayOrder=[...S.players].sort((a,b)=>{
    const ai=S.draftOrder.indexOf(a.id);const bi=S.draftOrder.indexOf(b.id);
    return(ai===-1?99:ai)-(bi===-1?99:bi);
  });
  displayOrder.forEach(p=>{
    const isActive=(S.phase==='action')&&charRank(p.char)===S.callIdx&&!p.dead;
    const isMe=p.id===0;
    const pDiv=el('div',{class:'tb-player'+(isActive?' active':'')+(isMe?' me':'')});
    const r1=el('div',{class:'tb-player-row1'});
    if(S.crown===p.id)r1.appendChild(el('span',null,'👑'));
    r1.appendChild(el('span',{class:'tb-player-name'},p.name));
    if(isMe)r1.appendChild(el('span',{class:'badge-you'},'YOU'));
    if(p.dead)r1.appendChild(el('span',{class:'badge-dead'},'☠️'));
    let charRevealed=isMe;
    if(!charRevealed&&p.char){
      if(S.phase==='action'){
        charRevealed=charRank(p.char)<S.callIdx;
      }else if(S.phase==='herald'){
        const beatIdx=S.heraldQueue.findIndex(b=>b.charId===p.char);
        charRevealed=beatIdx>=0&&beatIdx<S.heraldIdx;
      }
    }
    if(p.char && charRevealed){const c=charById(p.char);
      const badge=el('span',{class:'tb-player-char',style:`--char-clr:${c.clr};color:var(--char-clr);border-color:color-mix(in srgb,var(--char-clr) 35%,var(--border-main));background:color-mix(in srgb,var(--char-clr) 10%,var(--bg-card))`});
      badge.textContent=`${c.emoji} ${c.name}`;r1.appendChild(badge);}
    else if(p.char && !charRevealed && !isMe){
      const badge=el('span',{class:'tb-player-char badge-hidden'});
      badge.textContent='🎭 Hidden';r1.appendChild(badge);
    }
    pDiv.appendChild(r1);
    const r2=el('div',{class:'tb-player-stats'});
    r2.innerHTML=`<span>💰<span class="tb-stat-val"> ${p.gold}✦</span></span>`+
      `<span>🏰<span class="tb-stat-val"> ${p.city.length}/8</span></span>`+
      `<span>🃏<span class="tb-stat-val"> ${p.hand.length}</span></span>`+
      `<span>📊<span class="tb-stat-val"> ${calcScore(p,S.firstCompleter===p.id)}pts</span></span>`;
    pDiv.appendChild(r2);
    if(p.city.length){
      const cityDiv=el('div',{class:'tb-city'});
      p.city.forEach(d=>{
        const isUnique=d.color==='purple'&&d.special&&SDESC[d.special];
        const chip=el('div',{class:'tb-chip'+(isUnique?' has-tip':'')});
        const label=el('span',{class:'tb-chip-label color-'+d.color});
        label.appendChild(document.createTextNode(`${DEMOJI[d.id]||'🏛'} ${d.name} `));
        const ptsSpan=el('span',{class:'tb-chip-pts'});
        ptsSpan.textContent=`${d.cost}✦`;
        label.appendChild(ptsSpan);
        chip.appendChild(label);
        if(isUnique){
          const tip=el('div',{class:'tb-chip-tip'});
          tip.textContent=`✨ ${d.name}\n${SDESC[d.special]}`;
          chip.appendChild(tip);
        }
        cityDiv.appendChild(chip);
      });
      pDiv.appendChild(cityDiv);
    }
    tbGrid.appendChild(pDiv);
  });
  topbar.appendChild(tbGrid);
  wrap.appendChild(topbar);

  // ── CENTER ────────────────────────────────────────────────────────────────────
  const main=el('div',{id:'main'});
  const center=el('div',{id:'center'});
  if(S.phase==='draft'){
    const currentDrafter=S.draftOrder[S.draftIdx];
    const draftingPlayer=S.players[currentDrafter];
    if(currentDrafter===0)center.appendChild(renderDraft());
    else{
      const msg=draftingPlayer&&!draftingPlayer.ai
        ?`⏳ Waiting for ${draftingPlayer.name} to choose their character...`
        :'⏳ Others are choosing characters...';
      center.appendChild(el('div',{class:'state-waiting'},msg));
    }
  }else if(S.phase==='herald'){
    center.appendChild(renderHerald());
  }else if(S.phase==='action'){
    const me=S.players[0];
    const humanIsNow=me&&charRank(me.char)===S.callIdx&&!me.dead&&S.sub!=='idle';
    if(humanIsNow)center.appendChild(renderAction());
    else{
      const activePlayer=S.players.find(p=>charRank(p.char)===S.callIdx&&!p.dead&&!p.ai);
      const waitMsg=activePlayer&&activePlayer.id!==0
        ?`⏳ Waiting for ${activePlayer.name}...`:'⏳ Waiting...';
      center.appendChild(el('div',{class:'state-waiting'},waitMsg));
    }
  }
  main.appendChild(center);wrap.appendChild(main);

  // ── BOTTOM PANEL ──────────────────────────────────────────────────────────────
  const bottom=el('div',{id:'bottom'});
  const me=S.players[0];const myScore=calcScore(me,S.firstCompleter===me.id);

  const botHand=el('div',{id:'bot-hand'});
  const handLabel=el('div',{class:'bot-label'});
  handLabel.innerHTML=`<span>YOUR HAND</span><span class="bot-label-right">💰 ${me.gold}✦ &nbsp;🃏 ${me.hand.length} cards</span>`;
  botHand.appendChild(handLabel);
  if(me.char){const c=charById(me.char);
    const paDiv=el('div',{class:'playing-as',style:`color:${c.clr}`},`${c.emoji} Playing as ${c.name}`);
    botHand.appendChild(paDiv);}
  const handWrap=el('div',{class:'cards-wrap'});
  if(me.hand.length)me.hand.forEach(d=>handWrap.appendChild(mkCard(d,{portrait:true,player:me})));
  else handWrap.appendChild(el('span',{class:'state-empty'},'No cards in hand'));
  botHand.appendChild(handWrap);

  const botCity=el('div',{id:'bot-city'});
  const cityLabel=el('div',{class:'bot-label'});
  cityLabel.innerHTML=`<span>YOUR CITY (${me.city.length}/8)</span><span class="bot-label-right">📊 ~${myScore} pts</span>`;
  botCity.appendChild(cityLabel);
  const cityWrap=el('div',{class:'cards-wrap'});
  if(me.city.length){
    ['yellow','blue','green','red','purple'].forEach(col=>{
      me.city.filter(d=>d.color===col).forEach(d=>cityWrap.appendChild(mkCard(d,{portrait:true,player:me})));
    });
  }else cityWrap.appendChild(el('span',{class:'state-empty'},'Nothing built yet'));
  botCity.appendChild(cityWrap);

  bottom.append(botHand,botCity);wrap.appendChild(bottom);

  // Confirmation modal
  if(S._confirmEnd){
    const overlay=el('div',{class:'confirm-overlay'});
    const box=el('div',{class:'confirm-box'});
    box.appendChild(el('h3',null,'End the Game?'));
    box.appendChild(el('p',null,'This will immediately end the current game and return to the home screen. All progress will be lost.'));
    const btns=el('div',{class:'confirm-btns'});
    const cancelBtn=el('button',{class:'btn-cancel'},'Keep Playing');
    cancelBtn.onclick=()=>{S={...S,_confirmEnd:false};render();};
    const confirmBtn=el('button',{class:'btn-danger'},'End Game');
    confirmBtn.onclick=()=>{
      try{NET.peer?.destroy();}catch(e){}
      NET.mode='solo';NET.peer=null;NET.hostConn=null;NET.conns={};
      S=null;renderLobby({screen:'home'});
    };
    btns.append(cancelBtn,confirmBtn);box.appendChild(btns);
    overlay.appendChild(box);wrap.appendChild(overlay);
  }

  app.appendChild(wrap);
}

// ── HERALD ─────────────────────────────────────────────────────────────────────
function charByRank(rank){
  // Find the player who holds a char of that rank (for correct character display in herald)
  const holder=S.players.find(p=>p.char&&charRank(p.char)===rank);
  if(holder)return charById(holder.char);
  return CHARS.find(c=>c.rank===rank)||{emoji:'?',name:'?',clr:'#888',ability:''};
}
function renderHerald(){
  const beat=S.heraldQueue[S.heraldIdx];if(!beat)return el('div',null,'');
  const c=charByRank(beat.charId);const total=S.heraldQueue.length;
  const isLast=S.heraldIdx===total-1;
  const nextLabel=isLast?(S.heraldAfter==='end_round'?'End Round ›':'Your Turn ›'):'Next ›';
  const wrap=el('div',{class:'herald-wrap'});
  const pips=el('div',{class:'herald-pips'});
  for(let i=0;i<total;i++){const q=S.heraldQueue[i];const qc=charByRank(q.charId);
    const pip=el('div',{class:'herald-pip'+(i>=S.heraldIdx&&i!==S.heraldIdx?' inactive':'')});
    if(i===S.heraldIdx)pip.style.background=qc.clr;
    else if(i<S.heraldIdx)pip.style.background=qc.clr+'88';
    pip.title=`${q.charId}. ${qc.name}`;pips.appendChild(pip);}
  wrap.appendChild(pips);
  const card=el('div',{class:'herald-card'});
  card.appendChild(el('div',{class:'herald-char-num'},`Character ${beat.charId} of ${Math.max(0,...S.charPool.map(charRank))}`));
  const iconRow=el('div',{class:'herald-icon-row'});
  var portraitEl;
  if(typeof IMG !== 'undefined' && IMG.char[c.id]) {
    portraitEl = el('img', {src: IMG.char[c.id].full, alt: c.name, class: 'herald-portrait'});
    portraitEl.onerror = function() {
      var span = el('span', {class:'herald-icon'});
      span.textContent = c.emoji;
      if(portraitEl.parentNode) portraitEl.parentNode.replaceChild(span, portraitEl);
    };
  } else {
    portraitEl = el('span', {class:'herald-icon'});
    portraitEl.textContent = c.emoji;
  }
  iconRow.appendChild(portraitEl);
  const titleBlock=el('div',{class:'herald-title-block'});
  const titleEl=el('div',{class:'herald-title'});titleEl.style.color=c.clr;titleEl.textContent=c.name;titleBlock.appendChild(titleEl);
  titleBlock.appendChild(el('div',{class:'herald-ability'},c.ability));
  iconRow.appendChild(titleBlock);card.appendChild(iconRow);
  if(!beat.holderName){
    card.appendChild(el('div',{class:'herald-empty'},'No one answered this call.'));
  }else{
    const who=el('div',{class:'herald-sub'});
    if(beat.isStartOnly){
      who.textContent=`${beat.holderName}`;
    }else if(beat.isHuman){
      const localName=S.players[0]?.name||'You';
      const isMe=beat.holderName===localName;
      who.textContent=isMe?`${beat.holderName} (You) — turn summary:`:`${beat.holderName} — turn summary:`;
    }else{
      who.textContent=`${beat.holderName} plays as ${c.name}.`;
    }
    card.appendChild(who);
    if(beat.events.length){
      const evts=el('div',{class:'herald-events'});
      beat.events.forEach(ev=>{const row=el('div',{class:'herald-event'});row.style.borderLeftColor=ev.color;
        const icon=el('div',{class:'herald-ev-icon'});icon.textContent=ev.icon;
        const txt=el('div',{class:'herald-ev-text'});txt.textContent=ev.text;row.append(icon,txt);evts.appendChild(row);});
      card.appendChild(evts);
    }else card.appendChild(el('div',{class:'herald-empty'},'No actions taken.'));
  }
  const cb=el('button',{class:'herald-cont'});
  cb.style.cssText=`--btn-clr:${c.clr};background:color-mix(in srgb,var(--btn-clr) 12%,var(--bg-panel));border-color:color-mix(in srgb,var(--btn-clr) 35%,var(--border-main));color:var(--btn-clr)`;
  const humans=humanSlots(S);
  const myOrigSlot=NET.mode==='peer'?NET.mySlot:0;
  const iHaveAcked=(S.heraldAcks||[]).includes(myOrigSlot);
  if(humans.length>1){
    const ackedCount=(S.heraldAcks||[]).length;
    const totalHumans=humans.length;
    if(iHaveAcked){
      cb.textContent=`✓ Ready (${ackedCount}/${totalHumans} players ready)`;
      cb.style.opacity='0.5';cb.style.cursor='default';
      cb.onclick=null;
    }else{
      cb.textContent=`${nextLabel} (${ackedCount}/${totalHumans} ready)`;
      cb.onclick=()=>{{const _nr=heraldNext(S);if(_nr)S=_nr;render();};};
    }
  }else{
    cb.textContent=nextLabel;
    cb.onclick=()=>{{const _nr=heraldNext(S);if(_nr)S=_nr;render();};};
  }
  card.appendChild(cb);wrap.appendChild(card);return wrap;
}

// ── DRAFT ──────────────────────────────────────────────────────────────────────
function renderDraft(){
  const wrap=el('div',null);
  const faceDown=S.faceDown||[];const faceUp=S.faceUp||[];

  wrap.appendChild(el('div',{class:'draft-title'},'Choose your character for this round:'));

  // Info bar: show what was removed before the draft
  if(faceDown.length||faceUp.length){
    const info=el('div',{class:'draft-info'});
    if(faceDown.length)info.appendChild(el('span',{class:'draft-info-ghost'},
      `🎴 ${faceDown.length} card${faceDown.length>1?'s':''} set aside face-down before drafting — unknown to everyone`));
    if(faceDown.length&&faceUp.length)info.appendChild(el('span',{class:'draft-info-sep'},'·'));
    if(faceUp.length){
      const names=faceUp.map(id=>{const c=CHARS.find(q=>q.id===id);return c?`${c.emoji} ${c.name}`:'?';}).join(', ');
      info.appendChild(el('span',{class:'draft-info-removed'},`✕ Removed before draft (visible to all): ${names}`));
    }
    wrap.appendChild(info);
  }

  const grid=el('div',{class:'draft-grid'});
  CHARS.filter(c=>S.charPool.includes(c.id)).forEach(c=>{
    const avail=S.avail.includes(c.id);
    const removed=faceUp.includes(c.id);
    const stateClass=avail?'available':removed?'removed':'unavailable';
    const card=el('div',{class:`charcard ${stateClass}`,style:`--char-clr:${c.clr}`});
    // Image zone — top portion of card
    const imgZone=el('div',{class:'charcard-img-zone'});
    if(typeof IMG!=='undefined'&&IMG.char[c.id]){
      const img=el('img',{src:IMG.char[c.id].full,alt:c.name,class:'charcard-portrait'});
      img.onerror=function(){imgZone.textContent=c.emoji;imgZone.classList.add('charcard-img-fallback');};
      imgZone.appendChild(img);
    }else{
      imgZone.classList.add('charcard-img-fallback');
      imgZone.textContent=c.emoji;
    }
    card.appendChild(imgZone);
    // Info zone — bottom portion, always clean background
    const infoZone=el('div',{class:'charcard-info-zone'});
    infoZone.appendChild(el('div',{class:`charcard-name${avail?' available':''}`},`${c.rank}. ${c.name}`));
    if(removed){
      infoZone.appendChild(el('div',{class:'charcard-removed-label'},'✕ NOT IN PLAY'));
    }else{
      infoZone.appendChild(el('div',{class:'charcard-ability'},c.ability));
    }
    card.appendChild(infoZone);
    if(avail){
      card.onclick=()=>{const result=humanDraft(S,c.id);if(result)S=result;render();};
    }
    grid.appendChild(card);
  });
  wrap.appendChild(grid);return wrap;
}

// ── ACTION ─────────────────────────────────────────────────────────────────────
function renderAction(){
  const me=S.players[0];const charId=me.char;const c=charById(charId);const maxB=charId===7?3:(charId===14||charId===15||charId===16)?2:1;
  const wrap=el('div',null);
  const banner=el('div',{class:'action-banner',style:`--char-clr:${c.clr};background:color-mix(in srgb,var(--char-clr) 8%,var(--bg-card));border-color:color-mix(in srgb,var(--char-clr) 25%,var(--border-main))`});
  banner.appendChild(el('div',{class:'action-banner-emoji'},c.emoji));
  const bInfo=el('div',{class:'action-banner-info'});
  const charNameEl=el('div',{class:'action-char-name',style:`color:${c.clr}`},`${c.name}`);
  bInfo.appendChild(charNameEl);
  bInfo.appendChild(el('div',{class:'action-char-ability'},c.ability));
  if(charId===7)bInfo.appendChild(el('div',{class:'action-note'},`✓ +2 cards drawn already (${me.hand.length} in hand). Build up to 3 districts.`));
  if(charId===14)bInfo.appendChild(el('div',{class:'action-note'},'✓ Scholar: draw 7, keep 1 for income. Build up to 2 districts.'));
  if(charId===15)bInfo.appendChild(el('div',{class:'action-note',style:'color:var(--c-purple-txt)'},'✓ Seer: use special to take 1 card from each opponent. Build up to 2 districts.'));
  if(charId===16)bInfo.appendChild(el('div',{class:'action-note',style:'color:var(--c-green-txt)'},`✓ Trader: +${me.city.filter(d=>d.color==='green').length}✦ from Trade districts applied. Build up to 2 districts.`));
  banner.appendChild(bInfo);wrap.appendChild(banner);

  if(S.sub==='draw_pick'){
    const drawPickLabel=charId===14?`Choose one card to keep (Scholar: ${S.drawOpts.length} shown):`:
      `Choose one card to keep${me.city.some(d=>d.id==='observatory')?' (Observatory: 3 shown)':''}:`;
    wrap.appendChild(el('div',{class:'draw-pick-label'},drawPickLabel));
    const row=el('div',{class:'draw-pick-row'});
    S.drawOpts.forEach(d=>row.appendChild(mkCard(d,{portrait:true,onClick:()=>{{const _nr=humanKeepCard(S,d.uid);if(_nr)S=_nr;render();};}})));
    wrap.appendChild(row);return wrap;
  }

  // Income
  if(!S.collected){
    wrap.appendChild(el('div',{class:'sect-label'},'COLLECT INCOME'));
    if(charId===10){
      const row=el('div',{class:'income-row-nav'});
      row.appendChild(gbtn('⚓ Take 4 Gold','#4a90d9',()=>{{const _nr=humanNavigator(S,'gold');if(_nr)S=_nr;render();};},'padding:10px 18px;font-size:12px;font-family:Cinzel,serif'));
      if(S.deck.length)row.appendChild(gbtn('⚓ Draw 4 Cards','#4a90d9',()=>{{const _nr=humanNavigator(S,'cards');if(_nr)S=_nr;render();};},'padding:10px 18px;font-size:12px;font-family:Cinzel,serif'));
      wrap.appendChild(row);
      wrap.appendChild(el('div',{class:'action-note-warning'},'⚠ Navigator cannot build a district this turn.'));
    }else{
      const row=el('div',{class:'income-row'});
      row.appendChild(gbtn('💰 Take 2 Gold','#d4a843',()=>{{const _nr=humanCollectGold(S);if(_nr)S=_nr;render();};},'padding:10px 18px;font-size:12px;font-family:Cinzel,serif'));
      if(S.deck.length){
        const label=charId===14?'📖 Draw 7, Keep 1 (Scholar)':
                    me.city.some(d=>d.id==='library')?'📚 Draw 2, Keep BOTH (Library)':
                    me.city.some(d=>d.id==='observatory')?'🔭 Draw 3, Keep 1 (Observatory)':'🃏 Draw 2, Keep 1';
        row.appendChild(gbtn(label,'#5a9fd4',()=>{{const _nr=humanCollectCards(S);if(_nr)S=_nr;render();};},'padding:10px 18px;font-size:12px;font-family:Cinzel,serif'));
      }
      wrap.appendChild(row);
    }
  }

  if(S.sub==='choose'||S.sub==='assassin_pick'||S.sub==='thief_pick'||S.sub==='warlord_pick'||S.sub==='wizard_pick'){
    wrap.appendChild(el('div',{class:'sect-label'},'SPECIAL ABILITY'));
    wrap.appendChild(renderSpecial(charId));
  }

  if(S.sub==='mag_swap'){
    wrap.appendChild(el('div',{class:'action-mag-prompt-purple'},'Swap your hand with:'));
    const r=el('div',{style:'display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px'});
    S.players.filter(p=>p.id!==0).forEach(p=>r.appendChild(gbtn(`${p.name} (${p.hand.length} cards)`,'#9b6fff',()=>{{const _nr=humanMagSwap(S,p.id);if(_nr)S=_nr;render();};})));
    r.appendChild(gbtn('Cancel','#555',()=>{S={...S,sub:'choose'};render();}));wrap.appendChild(r);
  }
  if(S.sub==='mag_discard'){
    wrap.appendChild(el('div',{class:'action-mag-prompt-purple'},'Select cards to discard & redraw:'));
    const r=el('div',{style:'display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px'});
    me.hand.forEach(d=>{const sel=S.selCards.includes(d.uid);r.appendChild(mkCard(d,{portrait:true,selected:sel,onClick:()=>{
      const sc=S.selCards.includes(d.uid)?S.selCards.filter(x=>x!==d.uid):[...S.selCards,d.uid];S={...S,selCards:sc};render();}}));});
    wrap.appendChild(r);
    const r2=el('div',{style:'display:flex;gap:6px'});
    if(S.selCards.length)r2.appendChild(gbtn(`Discard ${S.selCards.length} → Draw ${S.selCards.length}`,'#9b6fff',()=>{{const _nr=humanMagDiscard(S,S.selCards);if(_nr)S=_nr;render();};}));
    r2.appendChild(gbtn('Cancel','#555',()=>{S={...S,sub:'choose',selCards:[]};render();}));wrap.appendChild(r2);
  }
  if(S.sub==='wizard_pick'){
    const target=S.players.find(p=>p.id===S.wizardTargetId);
    if(target){
      wrap.appendChild(el('div',{class:'action-mag-prompt-purple'},`${target.name}'s hand — choose a card to take:`));
      if(!target.hand.length){
        wrap.appendChild(el('div',{class:'state-empty',style:'margin-bottom:8px'},'No cards in their hand.'));
      }else{
        const r=el('div',{style:'display:flex;flex-wrap:wrap;gap:10px;margin-bottom:8px'});
        target.hand.forEach(d=>{
          const canBuild=buildCost(me,d)<=me.gold&&canBuildDistrict(me,d);
          const cardWrap=el('div',{style:'display:flex;flex-direction:column;align-items:center;gap:3px'});
          cardWrap.appendChild(mkCard(d,{portrait:true}));
          const takeBtn=gbtn('Take','#9b6fff',()=>{{const _nr=humanWizardTake(S,d.uid,false);if(_nr)S=_nr;render();};},'font-size:10px;padding:3px 10px;width:100%');
          cardWrap.appendChild(takeBtn);
          if(canBuild){
            const buildBtn=gbtn(`Build (${buildCost(me,d)}✦)`,'#7a4fcc',()=>{{const _nr=humanWizardTake(S,d.uid,true);if(_nr)S=_nr;render();};},'font-size:10px;padding:3px 8px;width:100%');
            cardWrap.appendChild(buildBtn);
          }
          r.appendChild(cardWrap);
        });
        wrap.appendChild(r);
      }
      wrap.appendChild(gbtn('Cancel','#555',()=>{S={...S,sub:'choose',wizardTargetId:null};render();}));
    }
    return wrap;
  }

  if(S.collected&&S.sub==='choose'&&me.city.some(d=>d.id==='smithy')&&!me.smithyUsed&&me.gold>=2&&S.deck.length){
    wrap.appendChild(el('div',{class:'sect-label'},'ACTIVE BUILDINGS'));
    const smithyRow=el('div',{class:'action-smithy-row'});
    smithyRow.appendChild(el('span',{class:'action-smithy-icon'},'⚒️'));
    const smithyInfo=el('div',{class:'action-smithy-info'});
    smithyInfo.appendChild(el('div',{class:'action-smithy-title'},'Smithy'));
    smithyInfo.appendChild(el('div',{class:'action-smithy-desc'},'Pay 2✦ to draw 3 district cards (once per turn)'));
    smithyRow.appendChild(smithyInfo);
    smithyRow.appendChild(gbtn('Use (−2✦)','#c084fc',()=>{{const _nr=humanUseSmithy(S);if(_nr)S=_nr;render();};}));
    wrap.appendChild(smithyRow);
  }

  if(S.collected&&S.sub==='choose'&&!S.noBuild){
    wrap.appendChild(el('div',{class:'sect-label'},`BUILD DISTRICT (${S.builtCount}/${maxB})`));
    const canBuild=S.builtCount<maxB;
    const affordable=me.hand.filter(d=>{const cost=buildCost(me,d);return cost<=me.gold&&canBuildDistrict(me,d);});
    const rest=me.hand.filter(d=>!affordable.includes(d));
    if(!me.hand.length)wrap.appendChild(el('div',{class:'state-empty',style:'margin-bottom:8px'},'No cards in hand.'));
    else{
      if(affordable.length){
        const row=el('div',{class:'cards-wrap build-row'});
        affordable.forEach(d=>row.appendChild(mkCard(d,{player:me,noDesc:true,onClick:canBuild?()=>{{const _nr=humanBuild(S,d.uid);if(_nr)S=_nr;render();};}:null,disabled:!canBuild})));
        wrap.appendChild(row);
      }
      if(rest.length){
        wrap.appendChild(el('div',{class:'build-too-costly'},'Too costly or already built:'));
        const row2=el('div',{class:'cards-wrap build-row'});
        rest.forEach(d=>row2.appendChild(mkCard(d,{player:me,disabled:true,noDesc:true})));wrap.appendChild(row2);
      }
      if(!affordable.length)wrap.appendChild(el('div',{class:'state-empty',style:'margin-bottom:8px'},'Cannot afford to build.'));
    }
  }
  if(S.noBuild&&S.collected&&S.sub==='choose'){
    wrap.appendChild(el('div',{class:'action-navigator-note'},'⚓ Navigator: income collected. No district may be built this turn.'));
  }
  if(S.collected&&S.sub==='choose'){
    wrap.appendChild(gbtn('End Turn →','#4db87a',()=>{{const _nr=humanEndTurn(S);if(_nr)S=_nr;render();};},'padding:11px 20px;font-size:12px;font-family:Cinzel,serif;margin-top:10px;width:100%'));
  }
  return wrap;
}

function renderSpecial(charId){
  const me=S.players[0];const wrap=el('div',{class:'special-wrap'});

  // Extension UI hook — checked first so expansions can override base characters too
  if(EXT._specialHooks[charId]){
    const extEl=EXT._specialHooks[charId](S,charId);
    if(extEl){wrap.appendChild(extEl);return wrap;}
  }

  // ── Assassin ──
  if(charId===1){
    if(S.sub==='assassin_pick'){
      wrap.appendChild(el('div',{class:'action-assassin-prompt'},'Choose a character to assassinate:'));
      const r=el('div',{style:'display:flex;flex-wrap:wrap;gap:5px;margin-bottom:8px'});
      CHARS.filter(ch=>S.charPool.includes(ch.id)&&ch.rank!==1).forEach(ch=>r.appendChild(gbtn(`${ch.emoji} ${ch.name}`,'#cc7777',()=>{{const _nr=humanKill(S,ch.id);if(_nr)S=_nr;render();};})));
      r.appendChild(gbtn('Cancel','#555',()=>{S={...S,sub:'choose'};render();}));
      wrap.appendChild(r);
    }else if(me.pendingKill){
      const pkChar=CHARS.find(ch=>S.charPool.includes(ch.id)&&ch.rank===me.pendingKill);
      const c=pkChar||{emoji:'?',name:'?'};
      const box=el('div',{class:'action-pending-box'});
      box.appendChild(el('span',{class:'action-pending-icon'},'☠️'));
      const info=el('div',{class:'action-pending-info'});
      info.appendChild(el('div',{class:'action-pending-label-red'},'Will assassinate:'));
      info.appendChild(el('div',{class:'action-pending-target'},`${c.emoji} ${c.name}`));
      box.appendChild(info);
      box.appendChild(gbtn('Change','#886',()=>{S={...S,sub:'assassin_pick'};render();}));
      wrap.appendChild(box);
    }else{
      wrap.appendChild(gbtn('🗡️ Assassinate','#cc7777',()=>{S={...S,sub:'assassin_pick'};render();}));
    }
    return wrap;
  }

  // ── Thief ──
  if(charId===2){
    if(S.sub==='thief_pick'){
      wrap.appendChild(el('div',{class:'action-thief-prompt'},'Steal from which character?'));
      const r=el('div',{style:'display:flex;flex-wrap:wrap;gap:5px;margin-bottom:8px'});
      CHARS.filter(ch=>S.charPool.includes(ch.id)&&ch.rank!==1&&ch.rank!==2).forEach(ch=>r.appendChild(gbtn(`${ch.emoji} ${ch.name}`,'#b0b0b0',()=>{{const _nr=humanSteal(S,ch.id);if(_nr)S=_nr;render();};})));
      r.appendChild(gbtn('Cancel','#555',()=>{S={...S,sub:'choose'};render();}));
      wrap.appendChild(r);
    }else if(me.stolenTarget){
      const stChar=CHARS.find(ch=>S.charPool.includes(ch.id)&&ch.rank===me.stolenTarget);
      const c=stChar||{emoji:'?',name:'?'};
      const box=el('div',{class:'action-pending-box-thief'});
      box.appendChild(el('span',{class:'action-pending-icon'},'🕵️'));
      const info=el('div',{class:'action-pending-info'});
      info.appendChild(el('div',{class:'action-pending-label-muted'},'Will steal from:'));
      info.appendChild(el('div',{class:'action-pending-target'},`${c.emoji} ${c.name}`));
      box.appendChild(info);
      box.appendChild(gbtn('Change','#886',()=>{
        S={...S,sub:'thief_pick',players:S.players.map(p=>p.id===0?{...p,stolenTarget:null}:p)};render();
      }));
      wrap.appendChild(box);
    }else{
      wrap.appendChild(gbtn('🦹 Declare Theft','#b0b0b0',()=>{S={...S,sub:'thief_pick'};render();}));
    }
    return wrap;
  }

  // ── Magician ──
  if(charId===3){
    if(me.magicianUsed){
      wrap.appendChild(el('div',{class:'state-info'},'🧙 Magician ability used this turn.'));
    }else{
      const r=el('div',{style:'display:flex;gap:8px;flex-wrap:wrap'});
      r.appendChild(gbtn('🔄 Swap Hand','#9b6fff',()=>{S={...S,sub:'mag_swap'};render();}));
      r.appendChild(gbtn('🗑️ Discard & Redraw','#9b6fff',()=>{S={...S,sub:'mag_discard',selCards:[]};render();}));
      wrap.appendChild(r);
    }
    return wrap;
  }

  // ── King ──
  if(charId===4){
    const yellows=me.city.filter(d=>d.color==='yellow').length;
    const txt=yellows>0?`👑 Crown taken — you pick roles first next round. +${yellows}✦ from ${yellows} Noble district${yellows>1?'s':''} added.`:`👑 Crown taken — you pick roles first next round. Build Noble (yellow) districts to earn gold each round as King.`;
    wrap.appendChild(el('div',{class:'action-king-note'},txt));return wrap;
  }

  // ── Patrician ──
  if(charId===12){
    const yellows=me.city.filter(d=>d.color==='yellow').length;
    const txt=yellows>0?`🏅 Crown taken — you pick roles first next round. Drew ${yellows} card${yellows>1?'s':''} from Noble districts.`:`🏅 Crown taken — you pick roles first next round. Build Noble (yellow) districts to draw cards each round as Patrician.`;
    wrap.appendChild(el('div',{class:'action-king-note'},txt));return wrap;
  }

  // ── Bishop ──
  if(charId===5){wrap.appendChild(el('div',{class:'action-bishop-note'},`⛪ Protected from Warlord. +${me.city.filter(d=>d.color==='blue').length}✦ from Religious applied.`));return wrap;}

  // ── Abbot ──
  if(charId===13){wrap.appendChild(el('div',{class:'action-bishop-note'},`🧎 +${me.city.filter(d=>d.color==='blue').length}✦ from Religious applied. Took 1✦ from richest opponent if any.`));return wrap;}

  // ── Merchant ──
  if(charId===6){wrap.appendChild(el('div',{class:'action-bishop-note'},'💰 +1✦ Merchant bonus + Trade income applied.'));return wrap;}

  // ── Architect ──
  if(charId===7){
    wrap.appendChild(el('div',{class:'action-bishop-note'},'🏗️ +2 cards drawn. Build up to 3 districts this turn.'));
    return wrap;
  }

  // ── Scholar ──
  if(charId===14){
    wrap.appendChild(el('div',{class:'action-bishop-note'},'📖 Drew 7 cards, kept 1. Build up to 2 districts this turn.'));
    return wrap;
  }

  // ── Queen ──
  if(charId===9){
    wrap.appendChild(el('div',{class:'action-bishop-note'},'🫅 Queen bonus applied at start of turn if seated beside the King.'));return wrap;
  }

  // ── Navigator ──
  if(charId===10){
    wrap.appendChild(el('div',{class:'state-info',style:'color:var(--c-blue-txt)'},'⚓ Income collected above. No district may be built this turn.'));return wrap;
  }

  // ── Wizard ──
  if(charId===11&&S.sub==='choose'){
    if(me.wizardUsed){
      wrap.appendChild(el('div',{class:'state-info'},'🔮 Wizard ability used this turn.'));
    }else if(!S.wizardTargetId){
      const others=S.players.filter(p=>p.id!==0&&p.hand.length>0);
      if(!others.length){
        wrap.appendChild(el('div',{class:'state-info'},'No opponents have cards to take.'));
      }else{
        wrap.appendChild(el('div',{class:'action-wiz-prompt'},'Look at a player\'s hand — choose who to target:'));
        const r=el('div',{style:'display:flex;flex-wrap:wrap;gap:6px'});
        others.forEach(p=>r.appendChild(gbtn(`${p.name} (${p.hand.length} cards)`,'#9b6fff',()=>{{const _nr=humanWizardTarget(S,p.id);if(_nr)S=_nr;render();}})));
        wrap.appendChild(r);
      }
    }
    return wrap;
  }

  // ── Seer ──
  if(charId===15){
    if(me.seerUsed){
      wrap.appendChild(el('div',{class:'state-info'},'🔯 Seer ability used this turn.'));
    }else{
      const opps=S.players.filter(p=>p.id!==0&&p.hand.length>0);
      if(!opps.length){
        wrap.appendChild(el('div',{class:'state-info'},'No opponents have cards to take.'));
      }else{
        wrap.appendChild(gbtn(`🔯 Take from All (${opps.length} opponent${opps.length>1?'s':''})`,
          '#9b6fff',()=>{{const _nr=humanSeer(S);if(_nr)S=_nr;render();};},'font-size:12px;padding:8px 14px;font-family:Cinzel,serif'));
        wrap.appendChild(el('div',{class:'action-seer-note'},
          `Takes 1 random card from each of ${opps.length} opponent${opps.length>1?'s':''}.`));
      }
    }
    return wrap;
  }

  // ── Trader ──
  if(charId===16){
    const greens=me.city.filter(d=>d.color==='green').length;
    const txt=greens>0
      ?`🏦 Earned ${greens}✦ from ${greens} Trade district${greens>1?'s':''}. Build up to 2 districts this turn.`
      :'🏦 Build Trade (green) districts to earn gold each round as Trader. Build up to 2 districts this turn.';
    wrap.appendChild(el('div',{class:'action-green-note'},txt));
    return wrap;
  }

  // ── Warlord ──
  if(charId===8){
    if(S.sub==='warlord_pick'){
      wrap.appendChild(el('div',{class:'action-warlord-prompt'},'Destroy which district?'));
      const targets=[];
      S.players.forEach(p=>{if(p.id===me.id)return;if(p.char===5&&!p.dead)return;
        const wall=p.city.some(w=>w.id==='great_wall');
        p.city.forEach(d=>{if(d.id==='keep')return;const c1=wall?d.cost:Math.max(0,d.cost-1);
          if(c1<=me.gold)targets.push({pid:p.id,pname:p.name,d,c1,wall});});});
      const r=el('div',{style:'display:flex;flex-wrap:wrap;gap:5px;margin-bottom:8px'});
      if(!targets.length)r.appendChild(el('span',{class:'action-warlord-no-targets'},'No valid targets.'));
      targets.forEach(t=>r.appendChild(gbtn(`${DEMOJI[t.d.id]||'🏛'} ${t.pname}: ${t.d.name} (${t.c1}✦${t.wall?' 🧱':''})`, '#d45a5a',()=>{{const _nr=humanWarlord(S,t.pid,t.d.uid);if(_nr)S=_nr;render();};})));
      r.appendChild(gbtn('Cancel','#555',()=>{S={...S,sub:'choose'};render();}));
      wrap.appendChild(r);
    }else if(S.pendingDestroy){
      const pd=S.pendingDestroy;
      const box=el('div',{class:'action-pending-box'});
      box.appendChild(el('span',{class:'action-pending-icon'},'💥'));
      const info=el('div',{class:'action-pending-info'});
      info.appendChild(el('div',{class:'action-pending-label-red'},'Destroyed:'));
      info.appendChild(el('div',{class:'action-pending-target'},`${pd.tpName}'s ${pd.name} (−${pd.cost}✦)`));
      box.appendChild(info);
      box.appendChild(gbtn('Undo ↩','#886',()=>{
        const pd=S.pendingDestroy;
        S={...S,pendingDestroy:null,sub:'choose',players:S.players.map(p=>{
          if(p.id===0)return{...p,gold:p.gold+pd.cost};
          if(p.id===pd.pid)return{...p,city:[...p.city,pd.distObj]};
          return p;
        })};
        render();
      }));
      wrap.appendChild(box);
    }else{
      wrap.appendChild(gbtn('⚔️ Destroy a District','#d45a5a',()=>{S={...S,sub:'warlord_pick'};render();}));
    }
    return wrap;
  }

  return wrap;
}

function renderGameOver(){
  const fp=S.firstCompleter;
  const scores=S.players.map(p=>({p,score:calcScore(p,fp===p.id)})).sort((a,b)=>b.score-a.score);
  const wrap=el('div',{class:'gameover-wrap'});
  const box=el('div',{class:'gameover-box'});
  box.append(el('div',{class:'gameover-title'},'🏆 Game Over'),
             el('div',{class:'gameover-subtitle'},`Round ${S.round} complete`));
  scores.forEach((sc,i)=>{
    const medals=['🥇','🥈','🥉','🏅'];
    const row=el('div',{class:'gameover-row'+(i===0?' first':'')});
    const info=el('div',{class:'gameover-row-info'});
    info.append(el('div',{class:'gameover-name'},sc.p.name),
                el('div',{class:'gameover-districts'},`${sc.p.city.length} districts built`));
    if(sc.p.city.some(d=>d.color==='purple')){
      const purps=el('div',{class:'gameover-purps'});
      sc.p.city.filter(d=>d.color==='purple').forEach(d=>{
        purps.appendChild(el('span',{class:'gameover-purp-badge'},`${DEMOJI[d.id]||'✨'} ${d.name}`));
      });info.appendChild(purps);}
    row.append(el('span',{class:'gameover-medal'},medals[i]||`${i+1}`),info,
               el('span',{class:'gameover-score'},`${sc.score}✦`));
    box.appendChild(row);
  });
  box.appendChild(gbtn('🎲 Play Again','#d4a843',()=>{S=runAIDraft(newGame());render();},'width:100%;margin-top:18px;padding:12px;font-family:Cinzel,serif;font-size:14px'));
  wrap.appendChild(box);return wrap;
}
