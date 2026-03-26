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
  const b=el('button',{class:'gbtn',style:`background:${color}20;border-color:${color}55;color:${color};${extra||''}`},label);
  b.onmouseenter=()=>b.style.background=color+'40';b.onmouseleave=()=>b.style.background=color+'20';b.onclick=onClick;return b;
}

// District card — landscape orientation (emoji left, info right)
function mkCard(d,opts){
  opts=opts||{};
  const c=CS[d.color];
  const cost=opts.player?buildCost(opts.player,d):d.cost;
  const disc=opts.player&&cost<d.cost;
  const portrait=opts.portrait;
  const small=opts.small;

  const div=el('div');
  let cls='dcard';
  if(opts.onClick&&!opts.disabled)cls+=' clickable';
  if(opts.selected)cls+=' selected';
  if(portrait)cls+=' portrait';
  div.className=cls;

  if(portrait){
    div.style.cssText=`background:${c.bg};border-color:${opts.selected?c.txt:c.bdr};opacity:${opts.disabled?0.4:1}`;
  }else{
    const h=small?42:54;const ew=small?30:42;const iw=small?62:96;
    div.style.cssText=`background:${c.bg};border-color:${opts.selected?c.txt:c.bdr};opacity:${opts.disabled?0.4:1};height:${h}px;width:${ew+iw}px`;
  }

  const emojiCol=el('div',{class:'dcard-emoji-col'});
  emojiCol.style.cssText=`background:${c.bdr}33;border-color:${c.bdr}`;
  if(!portrait){
    const ew=small?30:42;
    emojiCol.style.width=ew+'px';
    emojiCol.style.fontSize=(small?14:22)+'px';
  }
  emojiCol.textContent=DEMOJI[d.id]||'🏛';
  div.appendChild(emojiCol);

  const infoCol=el('div',{class:'dcard-info-col'});
  const costEl=el('div',{class:'dcard-cost'});
  costEl.style.color=disc?'#e0975c':c.txt;
  costEl.textContent=disc?`${cost}✦ (${d.cost}✦)`:`${cost}✦`;
  const nm=el('div',{class:'dcard-name'});nm.style.color=c.txt;nm.textContent=d.name;
  const tp=el('div',{class:'dcard-type'});tp.style.color=c.txt;tp.textContent=c.label;
  infoCol.append(costEl,nm,tp);

  const showDesc=!opts.noDesc&&(portrait||(!small&&d.special))&&d.special&&SDESC[d.special];
  if(showDesc){
    const desc=el('div',{class:'dcard-desc'});
    desc.style.color=c.txt;
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

  const wrap=el('div',{style:'display:flex;flex-direction:column;height:100vh;overflow:hidden'});

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
  const endBtn=el('button',{style:'margin-left:auto;background:#2a0a0a;border:1px solid #6a2020;color:#cc6666;border-radius:5px;padding:4px 11px;font-size:11px;font-family:Cinzel,serif;cursor:pointer;transition:background .15s'},'✕ End Game');
  endBtn.onmouseenter=()=>endBtn.style.background='#3a1010';
  endBtn.onmouseleave=()=>endBtn.style.background='#2a0a0a';
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
    if(isMe)pDiv.style.cssText+='border-color:#4a7a4a;background:#0d1a0d;';
    const r1=el('div',{class:'tb-player-row1'});
    if(S.crown===p.id)r1.appendChild(el('span',null,'👑'));
    r1.appendChild(el('span',{class:'tb-player-name'},p.name));
    if(isMe)r1.appendChild(el('span',{style:'background:#2a4a2a;color:#4db87a;font-size:9px;padding:1px 5px;border-radius:8px;font-family:Cinzel,serif;border:1px solid #3a6a3a'},'YOU'));
    if(p.dead)r1.appendChild(el('span',{style:'color:#cc4444;font-size:11px'},'☠️'));
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
      const badge=el('span',{class:'tb-player-char',style:`color:${c.clr};border-color:${c.clr}44;background:${c.clr}12`});
      badge.textContent=`${c.emoji} ${c.name}`;r1.appendChild(badge);}
    else if(p.char && !charRevealed && !isMe){
      const badge=el('span',{class:'tb-player-char',style:'color:#3a3560;border-color:#2a2445;background:#1a1535'});
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
        const c=CS[d.color];
        const isUnique=d.color==='purple'&&d.special&&SDESC[d.special];
        const chip=el('div',{class:'tb-chip'+(isUnique?' has-tip':'')});
        const label=el('span',{class:'tb-chip-label',style:`background:${c.bg};border-color:${c.bdr};color:${c.txt}`});
        label.appendChild(document.createTextNode(`${DEMOJI[d.id]||'🏛'} ${d.name} `));
        const ptsSpan=el('span',{class:'tb-chip-pts'});
        ptsSpan.textContent=`${d.cost}✦`;
        ptsSpan.style.color=c.txt;
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
      center.appendChild(el('div',{style:'text-align:center;padding:20px;color:#6060a0;font-family:Cinzel,serif;font-size:14px'},msg));
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
      center.appendChild(el('div',{style:'text-align:center;padding:20px;color:#6060a0;font-family:Cinzel,serif;font-size:14px'},waitMsg));
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
    botHand.appendChild(el('div',{style:`font-size:12px;color:${c.clr};font-family:Cinzel,serif;margin-bottom:6px`},`${c.emoji} Playing as ${c.name}`));}
  const handWrap=el('div',{class:'cards-wrap'});
  if(me.hand.length)me.hand.forEach(d=>handWrap.appendChild(mkCard(d,{portrait:true,player:me})));
  else handWrap.appendChild(el('span',{style:'color:#9a8a64;font-size:13px;padding:4px'},'No cards in hand'));
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
  }else cityWrap.appendChild(el('span',{style:'color:#9a8a64;font-size:13px;padding:4px'},'Nothing built yet'));
  botCity.appendChild(cityWrap);

  bottom.append(botHand,botCity);wrap.appendChild(bottom);

  // Confirmation modal
  if(S._confirmEnd){
    const overlay=el('div',{class:'confirm-overlay'});
    const box=el('div',{class:'confirm-box'});
    box.appendChild(el('h3',null,'End the Game?'));
    box.appendChild(el('p',null,'This will immediately end the current game and return to the home screen. All progress will be lost.'));
    const btns=el('div',{class:'confirm-btns'});
    const cancelBtn=el('button',{style:'background:#1a1e35;border-color:#2a2f55;color:#a89878'},'Keep Playing');
    cancelBtn.onmouseenter=()=>cancelBtn.style.background='#252a45';
    cancelBtn.onmouseleave=()=>cancelBtn.style.background='#1a1e35';
    cancelBtn.onclick=()=>{S={...S,_confirmEnd:false};render();};
    const confirmBtn=el('button',{style:'background:#2a0a0a;border-color:#8a2020;color:#e07070'},'End Game');
    confirmBtn.onmouseenter=()=>confirmBtn.style.background='#3a1010';
    confirmBtn.onmouseleave=()=>confirmBtn.style.background='#2a0a0a';
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
    const pip=el('div',{class:'herald-pip'});
    pip.style.background=i===S.heraldIdx?qc.clr:(i<S.heraldIdx?qc.clr+'55':'#1e2245');
    pip.title=`${q.charId}. ${qc.name}`;pips.appendChild(pip);}
  wrap.appendChild(pips);
  const card=el('div',{class:'herald-card'});
  card.appendChild(el('div',{class:'herald-char-num'},`Character ${beat.charId} of ${Math.max(0,...S.charPool.map(charRank))}`));
  const iconRow=el('div',{style:'display:flex;align-items:center;gap:12px;margin-bottom:6px'});
  iconRow.appendChild(el('span',{style:'font-size:48px;line-height:1'},c.emoji));
  const titleBlock=el('div');
  const titleEl=el('div',{class:'herald-title'});titleEl.style.color=c.clr;titleEl.textContent=c.name;titleBlock.appendChild(titleEl);
  titleBlock.appendChild(el('div',{style:'font-size:10px;color:#5858a0;margin-top:2px'},c.ability));
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
  const cb=el('button',{class:'herald-cont'});cb.style.cssText+=`background:${c.clr}18;border-color:${c.clr}55;color:${c.clr};`;
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
  cb.onmouseenter=()=>{if(!iHaveAcked||humans.length===1)cb.style.background=c.clr+'35';};
  cb.onmouseleave=()=>cb.style.background=c.clr+(iHaveAcked&&humans.length>1?'08':'18');
  card.appendChild(cb);wrap.appendChild(card);return wrap;
}

// ── DRAFT ──────────────────────────────────────────────────────────────────────
function renderDraft(){
  const wrap=el('div',null);
  wrap.appendChild(el('div',{style:'font-family:Cinzel,serif;color:#d4a843;font-size:15px;margin-bottom:14px'},'Choose your character for this round:'));
  const grid=el('div',{style:'display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px'});
  CHARS.filter(c=>S.charPool.includes(c.id)).forEach(c=>{
    const avail=S.avail.includes(c.id);
    const card=el('div',{class:'charcard',style:`border-color:${avail?c.clr+'55':'#1e1e2e'};background:${avail?'#141830':'#0e1020'};opacity:${avail?1:0.28};cursor:${avail?'pointer':'default'}`});
    card.appendChild(el('div',{class:'charcard-emoji'},c.emoji));
    card.appendChild(el('div',{class:'charcard-name',style:`color:${c.clr}`},`${c.rank}. ${c.name}`));
    card.appendChild(el('div',{class:'charcard-ability'},c.ability));
    if(avail){card.onclick=()=>{
      const result=humanDraft(S,c.id);
      if(result)S=result;
      render();
    };
      card.onmouseenter=()=>card.style.background='#1c2040';card.onmouseleave=()=>card.style.background='#141830';}
    grid.appendChild(card);
  });
  wrap.appendChild(grid);return wrap;
}

// ── ACTION ─────────────────────────────────────────────────────────────────────
function renderAction(){
  const me=S.players[0];const charId=me.char;const c=charById(charId);const maxB=charId===7?3:(charId===14||charId===15||charId===16)?2:1;
  const wrap=el('div',null);
  const banner=el('div',{class:'action-banner',style:`background:${c.clr}10;border-color:${c.clr}33`});
  banner.appendChild(el('div',{class:'action-banner-emoji'},c.emoji));
  const bInfo=el('div',{class:'action-banner-info'});
  bInfo.appendChild(el('div',{style:`font-family:Cinzel,serif;color:${c.clr};font-size:15px;font-weight:700`},`${c.name}`));
  bInfo.appendChild(el('div',{style:'font-size:11px;color:#8a7a6a;margin-top:3px'},c.ability));
  if(charId===7)bInfo.appendChild(el('div',{style:'font-size:10px;color:#e0975c;margin-top:5px'},`✓ +2 cards drawn already (${me.hand.length} in hand). Build up to 3 districts.`));
  if(charId===14)bInfo.appendChild(el('div',{style:'font-size:10px;color:#e0975c;margin-top:5px'},'✓ Scholar: draw 7, keep 1 for income. Build up to 2 districts.'));
  if(charId===15)bInfo.appendChild(el('div',{style:'font-size:10px;color:#9b6fff;margin-top:5px'},'✓ Seer: use special to take 1 card from each opponent. Build up to 2 districts.'));
  if(charId===16)bInfo.appendChild(el('div',{style:'font-size:10px;color:#4db87a;margin-top:5px'},`✓ Trader: +${me.city.filter(d=>d.color==='green').length}✦ from Trade districts applied. Build up to 2 districts.`));
  banner.appendChild(bInfo);wrap.appendChild(banner);

  if(S.sub==='draw_pick'){
    const drawPickLabel=charId===14?`Choose one card to keep (Scholar: ${S.drawOpts.length} shown):`:
      `Choose one card to keep${me.city.some(d=>d.id==='observatory')?' (Observatory: 3 shown)':''}:`;
    wrap.appendChild(el('div',{style:'font-family:Cinzel,serif;color:#d4a843;margin-bottom:12px;font-size:13px'},drawPickLabel));
    const row=el('div',{style:'display:flex;gap:10px;flex-wrap:wrap'});
    S.drawOpts.forEach(d=>row.appendChild(mkCard(d,{portrait:true,onClick:()=>{{const _nr=humanKeepCard(S,d.uid);if(_nr)S=_nr;render();};}})));
    wrap.appendChild(row);return wrap;
  }

  // Income
  if(!S.collected){
    wrap.appendChild(el('div',{class:'sect-label'},'COLLECT INCOME'));
    if(charId===10){
      const row=el('div',{style:'display:flex;gap:8px;margin-bottom:6px;flex-wrap:wrap'});
      row.appendChild(gbtn('⚓ Take 4 Gold','#4a90d9',()=>{{const _nr=humanNavigator(S,'gold');if(_nr)S=_nr;render();};},'padding:10px 18px;font-size:12px;font-family:Cinzel,serif'));
      if(S.deck.length)row.appendChild(gbtn('⚓ Draw 4 Cards','#4a90d9',()=>{{const _nr=humanNavigator(S,'cards');if(_nr)S=_nr;render();};},'padding:10px 18px;font-size:12px;font-family:Cinzel,serif'));
      wrap.appendChild(row);
      wrap.appendChild(el('div',{style:'font-size:10px;color:#8a7a5a;margin-bottom:10px'},'⚠ Navigator cannot build a district this turn.'));
    }else{
      const row=el('div',{style:'display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap'});
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
    wrap.appendChild(el('div',{style:'color:#9b6fff;font-size:12px;margin-bottom:8px;font-family:Cinzel,serif'},'Swap your hand with:'));
    const r=el('div',{style:'display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px'});
    S.players.filter(p=>p.id!==0).forEach(p=>r.appendChild(gbtn(`${p.name} (${p.hand.length} cards)`,'#9b6fff',()=>{{const _nr=humanMagSwap(S,p.id);if(_nr)S=_nr;render();};})));
    r.appendChild(gbtn('Cancel','#555',()=>{S={...S,sub:'choose'};render();}));wrap.appendChild(r);
  }
  if(S.sub==='mag_discard'){
    wrap.appendChild(el('div',{style:'color:#9b6fff;font-size:12px;margin-bottom:8px;font-family:Cinzel,serif'},'Select cards to discard & redraw:'));
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
      wrap.appendChild(el('div',{style:'color:#9b6fff;font-size:12px;margin-bottom:8px;font-family:Cinzel,serif'},`${target.name}'s hand — choose a card to take:`));
      if(!target.hand.length){
        wrap.appendChild(el('div',{style:'color:#9a8a64;font-size:12px;margin-bottom:8px'},'No cards in their hand.'));
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
    const smithyRow=el('div',{style:'display:flex;align-items:center;gap:10px;background:#1a0830;border:1px solid #4a1a7a44;border-radius:6px;padding:7px 11px;margin-bottom:10px'});
    smithyRow.appendChild(el('span',{style:'font-size:20px'},'⚒️'));
    const smithyInfo=el('div',{style:'flex:1'});
    smithyInfo.appendChild(el('div',{style:'font-family:Cinzel,serif;font-size:11px;color:#c084fc'},'Smithy'));
    smithyInfo.appendChild(el('div',{style:'font-size:10px;color:#7a5a9a'},'Pay 2✦ to draw 3 district cards (once per turn)'));
    smithyRow.appendChild(smithyInfo);
    smithyRow.appendChild(gbtn('Use (−2✦)','#c084fc',()=>{{const _nr=humanUseSmithy(S);if(_nr)S=_nr;render();};}));
    wrap.appendChild(smithyRow);
  }

  if(S.collected&&S.sub==='choose'&&!S.noBuild){
    wrap.appendChild(el('div',{class:'sect-label'},`BUILD DISTRICT (${S.builtCount}/${maxB})`));
    const canBuild=S.builtCount<maxB;
    const affordable=me.hand.filter(d=>{const cost=buildCost(me,d);return cost<=me.gold&&canBuildDistrict(me,d);});
    const rest=me.hand.filter(d=>!affordable.includes(d));
    if(!me.hand.length)wrap.appendChild(el('div',{style:'color:#9a8a64;font-size:12px;margin-bottom:8px'},'No cards in hand.'));
    else{
      if(affordable.length){
        const row=el('div',{class:'cards-wrap',style:'margin-bottom:10px'});
        affordable.forEach(d=>row.appendChild(mkCard(d,{player:me,noDesc:true,onClick:canBuild?()=>{{const _nr=humanBuild(S,d.uid);if(_nr)S=_nr;render();};}:null,disabled:!canBuild})));
        wrap.appendChild(row);
      }
      if(rest.length){
        wrap.appendChild(el('div',{style:'font-size:10px;color:#9a8a64;margin-bottom:5px'},'Too costly or already built:'));
        const row2=el('div',{class:'cards-wrap',style:'margin-bottom:10px'});
        rest.forEach(d=>row2.appendChild(mkCard(d,{player:me,disabled:true,noDesc:true})));wrap.appendChild(row2);
      }
      if(!affordable.length)wrap.appendChild(el('div',{style:'color:#9a8a64;font-size:12px;margin-bottom:8px'},'Cannot afford to build.'));
    }
  }
  if(S.noBuild&&S.collected&&S.sub==='choose'){
    wrap.appendChild(el('div',{style:'background:#080e18;border:1px solid #1a2540;border-radius:6px;padding:8px 12px;margin-bottom:10px;font-size:11px;color:#6080a0'},'⚓ Navigator: income collected. No district may be built this turn.'));
  }
  if(S.collected&&S.sub==='choose'){
    wrap.appendChild(gbtn('End Turn →','#4db87a',()=>{{const _nr=humanEndTurn(S);if(_nr)S=_nr;render();};},'padding:11px 20px;font-size:12px;font-family:Cinzel,serif;margin-top:10px;width:100%'));
  }
  return wrap;
}

function renderSpecial(charId){
  const me=S.players[0];const wrap=el('div',{style:'margin-bottom:6px'});

  // Extension UI hook — checked first so expansions can override base characters too
  if(EXT._specialHooks[charId]){
    const extEl=EXT._specialHooks[charId](S,charId);
    if(extEl){wrap.appendChild(extEl);return wrap;}
  }

  // ── Assassin ──
  if(charId===1){
    if(S.sub==='assassin_pick'){
      wrap.appendChild(el('div',{style:'color:#cc7777;font-size:12px;margin-bottom:8px;font-family:Cinzel,serif'},'Choose a character to assassinate:'));
      const r=el('div',{style:'display:flex;flex-wrap:wrap;gap:5px;margin-bottom:8px'});
      CHARS.filter(ch=>S.charPool.includes(ch.id)&&ch.rank!==1).forEach(ch=>r.appendChild(gbtn(`${ch.emoji} ${ch.name}`,'#cc7777',()=>{{const _nr=humanKill(S,ch.id);if(_nr)S=_nr;render();};})));
      r.appendChild(gbtn('Cancel','#555',()=>{S={...S,sub:'choose'};render();}));
      wrap.appendChild(r);
    }else if(me.pendingKill){
      // pendingKill stores rank; find the char in charPool with that rank
      const pkChar=CHARS.find(ch=>S.charPool.includes(ch.id)&&ch.rank===me.pendingKill);
      const c=pkChar||{emoji:'?',name:'?'};
      const box=el('div',{style:'display:flex;align-items:center;gap:10px;background:#2a0a0a;border:1px solid #8a2020;border-radius:7px;padding:8px 12px'});
      box.appendChild(el('span',{style:'font-size:20px'},'☠️'));
      const info=el('div',{style:'flex:1'});
      info.appendChild(el('div',{style:'font-family:Cinzel,serif;font-size:11px;color:#cc7777'},'Will assassinate:'));
      info.appendChild(el('div',{style:'font-size:13px;color:#e8dfc8'},`${c.emoji} ${c.name}`));
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
      wrap.appendChild(el('div',{style:'color:#b0b0b0;font-size:12px;margin-bottom:8px;font-family:Cinzel,serif'},'Steal from which character?'));
      const r=el('div',{style:'display:flex;flex-wrap:wrap;gap:5px;margin-bottom:8px'});
      CHARS.filter(ch=>S.charPool.includes(ch.id)&&ch.rank!==1&&ch.rank!==2).forEach(ch=>r.appendChild(gbtn(`${ch.emoji} ${ch.name}`,'#b0b0b0',()=>{{const _nr=humanSteal(S,ch.id);if(_nr)S=_nr;render();};})));
      r.appendChild(gbtn('Cancel','#555',()=>{S={...S,sub:'choose'};render();}));
      wrap.appendChild(r);
    }else if(me.stolenTarget){
      // stolenTarget stores rank; find the char in charPool with that rank
      const stChar=CHARS.find(ch=>S.charPool.includes(ch.id)&&ch.rank===me.stolenTarget);
      const c=stChar||{emoji:'?',name:'?'};
      const box=el('div',{style:'display:flex;align-items:center;gap:10px;background:#1a1a20;border:1px solid #606060;border-radius:7px;padding:8px 12px'});
      box.appendChild(el('span',{style:'font-size:20px'},'🕵️'));
      const info=el('div',{style:'flex:1'});
      info.appendChild(el('div',{style:'font-family:Cinzel,serif;font-size:11px;color:#b0b0b0'},'Will steal from:'));
      info.appendChild(el('div',{style:'font-size:13px;color:#e8dfc8'},`${c.emoji} ${c.name}`));
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
    const r=el('div',{style:'display:flex;gap:8px;flex-wrap:wrap'});
    r.appendChild(gbtn('🔄 Swap Hand','#9b6fff',()=>{S={...S,sub:'mag_swap'};render();}));
    r.appendChild(gbtn('🗑️ Discard & Redraw','#9b6fff',()=>{S={...S,sub:'mag_discard',selCards:[]};render();}));
    wrap.appendChild(r);return wrap;
  }

  // ── King ──
  if(charId===4){
    const yellows=me.city.filter(d=>d.color==='yellow').length;
    const txt=yellows>0?`👑 Crown taken — you pick roles first next round. +${yellows}✦ from ${yellows} Noble district${yellows>1?'s':''} added.`:`👑 Crown taken — you pick roles first next round. Build Noble (yellow) districts to earn gold each round as King.`;
    wrap.appendChild(el('div',{style:'color:#d4a843;font-size:12px;background:#1c1608;border:1px solid #6a4e1044;border-radius:5px;padding:6px 10px'},txt));return wrap;
  }

  // ── Patrician ──
  if(charId===12){
    const yellows=me.city.filter(d=>d.color==='yellow').length;
    const txt=yellows>0?`🏅 Crown taken — you pick roles first next round. Drew ${yellows} card${yellows>1?'s':''} from Noble districts.`:`🏅 Crown taken — you pick roles first next round. Build Noble (yellow) districts to draw cards each round as Patrician.`;
    wrap.appendChild(el('div',{style:'color:#d4a843;font-size:12px;background:#1c1608;border:1px solid #6a4e1044;border-radius:5px;padding:6px 10px'},txt));return wrap;
  }

  // ── Bishop ──
  if(charId===5){wrap.appendChild(el('div',{style:'color:#5a4e3a;font-size:12px'},`⛪ Protected from Warlord. +${me.city.filter(d=>d.color==='blue').length}✦ from Religious applied.`));return wrap;}

  // ── Abbot ──
  if(charId===13){wrap.appendChild(el('div',{style:'color:#5a4e3a;font-size:12px'},`🧎 +${me.city.filter(d=>d.color==='blue').length}✦ from Religious applied. Took 1✦ from richest opponent if any.`));return wrap;}

  // ── Merchant ──
  if(charId===6){wrap.appendChild(el('div',{style:'color:#5a4e3a;font-size:12px'},`💰 +1✦ Merchant bonus + Trade income applied.`));return wrap;}

  // ── Architect ──
  if(charId===7){
    wrap.appendChild(el('div',{style:'color:#5a4e3a;font-size:12px'},'🏗️ +2 cards drawn. Build up to 3 districts this turn.'));
    return wrap;
  }

  // ── Scholar ──
  if(charId===14){
    wrap.appendChild(el('div',{style:'color:#5a4e3a;font-size:12px'},'📖 Drew 7 cards, kept 1. Build up to 2 districts this turn.'));
    return wrap;
  }

  // ── Queen ──
  if(charId===9){
    wrap.appendChild(el('div',{style:'color:#5a4e3a;font-size:12px'},'🫅 Queen bonus applied at start of turn if seated beside the King.'));return wrap;
  }

  // ── Navigator ──
  if(charId===10){
    wrap.appendChild(el('div',{style:'color:#4a90d9;font-size:12px'},'⚓ Income collected above. No district may be built this turn.'));return wrap;
  }

  // ── Wizard ──
  if(charId===11&&S.sub==='choose'){
    if(!S.wizardTargetId){
      const others=S.players.filter(p=>p.id!==0&&p.hand.length>0);
      if(!others.length){
        wrap.appendChild(el('div',{style:'color:#9a8a64;font-size:12px'},'No opponents have cards to take.'));
      }else{
        wrap.appendChild(el('div',{style:'color:#9b6fff;font-size:12px;margin-bottom:8px;font-family:Cinzel,serif'},'Look at a player\'s hand — choose who to target:'));
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
      wrap.appendChild(el('div',{style:'color:#9a8a64;font-size:12px'},'🔯 Seer ability used this turn.'));
    }else{
      const opps=S.players.filter(p=>p.id!==0&&p.hand.length>0);
      if(!opps.length){
        wrap.appendChild(el('div',{style:'color:#9a8a64;font-size:12px'},'No opponents have cards to take.'));
      }else{
        wrap.appendChild(gbtn(`🔯 Take from All (${opps.length} opponent${opps.length>1?'s':''})`,
          '#9b6fff',()=>{{const _nr=humanSeer(S);if(_nr)S=_nr;render();};},'font-size:12px;padding:8px 14px;font-family:Cinzel,serif'));
        wrap.appendChild(el('div',{style:'font-size:10px;color:#9a8a64;margin-top:5px'},
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
    wrap.appendChild(el('div',{style:'color:#4db87a;font-size:12px;background:#081408;border:1px solid #1a4a2044;border-radius:5px;padding:6px 10px'},txt));
    return wrap;
  }

  // ── Warlord ──
  if(charId===8){
    if(S.sub==='warlord_pick'){
      wrap.appendChild(el('div',{style:'color:#d45a5a;font-size:12px;margin-bottom:8px;font-family:Cinzel,serif'},'Destroy which district?'));
      const targets=[];
      S.players.forEach(p=>{if(charRank(p.char)===5&&!p.dead)return;
        const wall=p.city.some(w=>w.id==='great_wall');
        p.city.forEach(d=>{if(d.id==='keep')return;const c1=wall?d.cost:Math.max(0,d.cost-1);
          if(c1<=me.gold)targets.push({pid:p.id,pname:p.name,d,c1,wall});});});
      const r=el('div',{style:'display:flex;flex-wrap:wrap;gap:5px;margin-bottom:8px'});
      if(!targets.length)r.appendChild(el('span',{style:'color:#4a2020;font-size:12px'},'No valid targets.'));
      targets.forEach(t=>r.appendChild(gbtn(`${DEMOJI[t.d.id]||'🏛'} ${t.pname}: ${t.d.name} (${t.c1}✦${t.wall?' 🧱':''})`, '#d45a5a',()=>{{const _nr=humanWarlord(S,t.pid,t.d.uid);if(_nr)S=_nr;render();};})));
      r.appendChild(gbtn('Cancel','#555',()=>{S={...S,sub:'choose'};render();}));
      wrap.appendChild(r);
    }else if(S.pendingDestroy){
      const pd=S.pendingDestroy;
      const box=el('div',{style:'display:flex;align-items:center;gap:10px;background:#2a0808;border:1px solid #8a2020;border-radius:7px;padding:8px 12px'});
      box.appendChild(el('span',{style:'font-size:20px'},'💥'));
      const info=el('div',{style:'flex:1'});
      info.appendChild(el('div',{style:'font-family:Cinzel,serif;font-size:11px;color:#d45a5a'},'Destroyed:'));
      info.appendChild(el('div',{style:'font-size:13px;color:#e8dfc8'},`${pd.tpName}'s ${pd.name} (−${pd.cost}✦)`));
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
  const wrap=el('div',{style:'min-height:100vh;display:flex;align-items:center;justify-content:center;background:#090c18'});
  const box=el('div',{style:'background:#111530;border:1px solid #5a3f10;border-radius:14px;padding:28px 32px;max-width:520px;width:92%'});
  box.append(el('div',{style:'font-family:Cinzel,serif;font-size:22px;color:#d4a843;text-align:center;margin-bottom:6px'},'🏆 Game Over'),
             el('div',{style:'color:#8a7a5a;text-align:center;margin-bottom:20px;font-size:12px'},`Round ${S.round} complete`));
  scores.forEach((sc,i)=>{
    const medals=['🥇','🥈','🥉','🏅'];
    const row=el('div',{style:`display:flex;align-items:flex-start;gap:12px;margin-bottom:9px;background:${i===0?'rgba(212,168,67,0.08)':'rgba(255,255,255,0.02)'};border:1px solid ${i===0?'#5a3f10':'#252945'};border-radius:8px;padding:10px 14px`});
    const info=el('div',{style:'flex:1'});
    info.append(el('div',{style:'font-family:Cinzel,serif;color:#d4a843;font-size:13px'},sc.p.name),
                el('div',{style:'font-size:11px;color:#8a7a5a;margin-top:2px'},`${sc.p.city.length} districts built`));
    if(sc.p.city.some(d=>d.color==='purple')){
      const purps=el('div',{style:'font-size:10px;color:#9060c0;margin-top:3px;display:flex;flex-wrap:wrap;gap:4px'});
      sc.p.city.filter(d=>d.color==='purple').forEach(d=>{
        purps.appendChild(el('span',{style:'background:#1a0830;border:1px solid #4a1a7a;border-radius:3px;padding:1px 5px'},`${DEMOJI[d.id]||'✨'} ${d.name}`));
      });info.appendChild(purps);}
    row.append(el('span',{style:'font-size:20px'},medals[i]||`${i+1}`),info,
               el('span',{style:'font-family:Cinzel,serif;color:#d4a843;font-size:20px'},`${sc.score}✦`));
    box.appendChild(row);
  });
  box.appendChild(gbtn('🎲 Play Again','#d4a843',()=>{S=runAIDraft(newGame());render();},'width:100%;margin-top:18px;padding:12px;font-family:Cinzel,serif;font-size:14px'));
  wrap.appendChild(box);return wrap;
}
