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
  const nm=el('div',{class:'dcard-name'});nm.textContent=dn(d);
  const tp=el('div',{class:'dcard-type'});tp.textContent=clabel(d.color);
  infoCol.append(costEl,nm,tp);

  const showDesc=!opts.noDesc&&(portrait||(!small&&d.special))&&d.special&&SDESC[d.special];
  if(showDesc){
    const desc=el('div',{class:'dcard-desc'});
    desc.textContent=sdesc(d.special);
    infoCol.appendChild(desc);
  }

  div.appendChild(infoCol);
  if(opts.onClick&&!opts.disabled){
    div.onclick=opts.onClick;
  }else if(portrait&&!opts.disabled){
    // Tap portrait card (hand/city) → enlarged detail popup
    div.style.cursor='pointer';
    div.onclick=function(e){e.stopPropagation();showCardDetail(d,cost,disc);};
  }
  return div;
}

function showCardDetail(d,cost,disc){
  var existing=document.getElementById('card-detail-overlay');
  if(existing){existing.remove();return;}
  var overlay=el('div',{id:'card-detail-overlay'});
  overlay.onclick=function(e){if(e.target===overlay)overlay.remove();};
  var box=el('div',{class:'card-detail-box color-'+d.color});
  // Art zone
  var art=el('div',{class:'card-detail-art'});
  var emoji=DEMOJI[d.id]||'🏛';
  art.textContent=emoji;
  if(typeof IMG!=='undefined'&&IMG.district[d.id]){
    var src=IMG.district[d.id].full;
    art.style.backgroundImage='url('+src+')';
    art.style.backgroundSize='cover';
    art.style.backgroundPosition='center';
    var probe=new Image();
    probe.onload=function(){art.textContent='';};
    probe.onerror=function(){art.style.backgroundImage='';};
    probe.src=src;
  }
  box.appendChild(art);
  // Info zone
  var info=el('div',{class:'card-detail-info'});
  var costStr=disc?t('cost.normally',{cost,orig:d.cost}):cost+'✦';
  info.appendChild(el('div',{class:'card-detail-cost'},costStr));
  info.appendChild(el('div',{class:'card-detail-name'},dn(d)));
  info.appendChild(el('div',{class:'card-detail-type'},clabel(d.color)));
  if(d.special&&SDESC[d.special]){
    info.appendChild(el('div',{class:'card-detail-desc'},sdesc(d.special)));
  }
  var closeBtn=el('button',{class:'card-detail-close'},'✕');
  closeBtn.onclick=function(){overlay.remove();};
  info.appendChild(closeBtn);
  box.appendChild(info);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
}

// ── GAME STATE ─────────────────────────────────────────────────────────────────
var S=null; // shared global; written by lobby.js, net.js, and game action handlers

// ── MAIN RENDER ───────────────────────────────────────────────────────────────
function render(){
  if(!S){renderLobby({screen:'home'});return;}

  const app=document.getElementById('app');app.innerHTML='';
  // Clean up floating panels from previous render
  ['char-ref-panel','char-ref-tip'].forEach(function(id){var e=document.getElementById(id);if(e)e.remove();});
  if(S.phase==='gameover'){app.appendChild(renderGameOver());return;}

  const isMobile=window.innerWidth<=768;
  const wrap=el('div',{class:`game-wrap phase-${S.phase}${isMobile?' mobile':''}`});
  if(typeof IMG !== 'undefined') {
    wrap.style.background = 'linear-gradient(150deg, #faf7f0 0%, #ece5d8 100%)';
  }

  // ── TOP BAR ──────────────────────────────────────────────────────────────────
  const topbar=el('div',{id:'topbar'});

  if(isMobile){
    // ── MOBILE: Mini HUD bar (two rows) ──
    const hud=el('div',{class:'mob-hud'});
    // Row 1: round info + your stats + end button
    const row1=el('div',{class:'mob-hud-row1'});
    const hudLeft=el('div',{class:'mob-hud-left'});
    hudLeft.appendChild(el('span',{class:'mob-hud-round'},`R${S.round}`));
    if((S.phase==='action'||S.phase==='herald')&&S.callIdx<=Math.max(0,...S.charPool.map(charRank))){
      const activeChar=S.players.find(p=>charRank(p.char)===S.callIdx);
      const c=activeChar?charById(activeChar.char):CHARS.find(ch=>ch.rank===S.callIdx)||{emoji:'?',name:'?',clr:'#888'};
      hudLeft.appendChild(el('span',{class:'mob-hud-calling',style:`--char-clr:${c.clr}`},`${c.emoji} ${cn(c.id)}`));
    }else if(S.phase==='draft'){
      hudLeft.appendChild(el('span',{class:'mob-hud-calling'},t('topbar.draft')));
    }
    row1.appendChild(hudLeft);
    const meH=S.players[0];
    const hudStats=el('div',{class:'mob-hud-stats'});
    var statsSpan=el('span',null,'');
    statsSpan.innerHTML='💰'+meH.gold+' 🃏'+meH.hand.length+' 🏰'+meH.city.length+'/8';
    hudStats.appendChild(statsSpan);
    row1.appendChild(hudStats);
    const hudRight=el('div',{class:'mob-hud-right'});
    hudRight.appendChild(mkLangToggle());
    const endBtn=el('button',{class:'btn-danger mob-end-btn'},t('topbar.end_btn_short'));
    endBtn.onclick=()=>{S={...S,_confirmEnd:true};render();};
    hudRight.appendChild(endBtn);
    row1.appendChild(hudRight);
    hud.appendChild(row1);
    // Row 2: opponent chips (horizontally scrollable)
    const row2=el('div',{class:'mob-hud-row2'});
    const chips=el('div',{class:'mob-opp-chips'});
    S.players.filter(function(p){return p.id!==0;}).forEach(function(p){
      var avatar=typeof getAvatar==='function'?getAvatar(p.id):(p.ai?'🤖':'👤');
      var chip=el('div',{class:'mob-opp-chip'+(p.dead?' dead':'')});
      chip.appendChild(el('span',{class:'mob-opp-chip-avatar'},avatar));
      var stat=el('span',{class:'mob-opp-chip-stat'});
      stat.innerHTML='💰'+p.gold+'&thinsp;🏰'+p.city.length;
      chip.appendChild(stat);
      chip.onclick=function(e){
        e.stopPropagation();
        var existing=document.getElementById('player-detail-sheet');
        if(existing){existing.remove();return;}
        var sheet=el('div',{id:'player-detail-sheet'});
        sheet.onclick=function(ev){if(ev.target===sheet)sheet.remove();};
        var box=el('div',{class:'player-detail-box'});
        var hdr=el('div',{class:'player-detail-hdr'});
        var charRevealed=false;
        if(p.char){
          if(S.phase==='action'){charRevealed=charRank(p.char)<S.callIdx;}
          else if(S.phase==='herald'&&S.heraldQueue){
            var beatIdx=S.heraldQueue.findIndex(function(b){return b.playerId===p.id;});
            charRevealed=beatIdx>=0&&beatIdx<S.heraldIdx;
          }else if(S.phase==='gameover'){charRevealed=true;}
        }
        var charObj=charRevealed&&p.char?charById(p.char):null;
        var nameText=p.name+(charObj?' · '+charObj.emoji+' '+cn(charObj.id):'');
        hdr.appendChild(el('span',{class:'player-detail-name'},nameText));
        var score=calcScore(p,S.firstCompleter===p.id);
        hdr.appendChild(el('span',{class:'player-detail-score'},'💰'+p.gold+'  🃏'+p.hand.length+'  🏰'+p.city.length+'/8  ~'+score+'pts'));
        var closeBtn=el('button',{class:'player-detail-close'},'✕');
        closeBtn.onclick=function(){sheet.remove();};
        hdr.appendChild(closeBtn);
        box.appendChild(hdr);
        if(p.city.length){
          var cityWrap=el('div',{class:'player-detail-city'});
          ['yellow','blue','green','red','purple'].forEach(function(col){
            p.city.filter(function(d){return d.color===col;}).forEach(function(d){cityWrap.appendChild(mkCard(d,{portrait:true,player:p}));});
          });
          box.appendChild(cityWrap);
        }else{box.appendChild(el('p',{class:'player-detail-empty'},t('player.no_city')));}
        sheet.appendChild(box);
        document.body.appendChild(sheet);
      };
      chips.appendChild(chip);
    });
    row2.appendChild(chips);
    hud.appendChild(row2);
    topbar.appendChild(hud);
  }else{
    // ── DESKTOP: Full topbar ──
    const tbHdr=el('div',{class:'tb-header'});
    tbHdr.appendChild(el('span',{class:'tb-title'},t('topbar.title')));
    tbHdr.appendChild(el('span',{class:'tb-meta'},t('topbar.round_crown',{n:S.round,name:S.players[S.crown].name})));
    if((S.phase==='action'||S.phase==='herald')&&S.callIdx<=Math.max(0,...S.charPool.map(charRank))){
      const activeChar=S.players.find(p=>charRank(p.char)===S.callIdx);
      const c=activeChar?charById(activeChar.char):CHARS.find(ch=>ch.rank===S.callIdx)||{emoji:'?',name:'?',clr:'#888'};
      tbHdr.appendChild(el('span',{class:'tb-calling',style:`--char-clr:${c.clr}`},t('topbar.calling',{emoji:c.emoji,name:cn(c.id)})));
    }
    tbHdr.appendChild(mkLangToggle());
    const endBtn=el('button',{class:'btn-danger'},t('topbar.end_game'));
    endBtn.onclick=()=>{S={...S,_confirmEnd:true};render();};
    tbHdr.appendChild(endBtn);
    topbar.appendChild(tbHdr);
  }

  // Helper: build a player panel div
  function mkPlayerPanel(p,compact){
    const isActive=(S.phase==='action')&&charRank(p.char)===S.callIdx&&!p.dead;
    const isMe=p.id===0;
    const cls='tb-player'+(isActive?' active':'')+(isMe?' me':'')+(compact?' tb-player-compact':'');
    const pDiv=el('div',{class:cls});
    // Row 1: crown + name (+ YOU/dead badge). In compact mode: name truncates, char badge moves to r2.
    const r1=el('div',{class:'tb-player-row1'});
    if(S.crown===p.id)r1.appendChild(el('span',null,'👑'));
    r1.appendChild(el('span',{class:'tb-player-name'},p.name));
    if(isMe)r1.appendChild(el('span',{class:'badge-you'},t('badge.you')));
    if(p.dead)r1.appendChild(el('span',{class:'badge-dead'},'☠️'));
    pDiv.appendChild(r1);
    // Character visibility
    let charRevealed=isMe;
    if(!charRevealed&&p.char){
      if(S.phase==='action'){charRevealed=charRank(p.char)<S.callIdx;}
      else if(S.phase==='herald'){
        const beatIdx=S.heraldQueue.findIndex(b=>b.charId===p.char);
        charRevealed=beatIdx>=0&&beatIdx<S.heraldIdx;
      }
    }
    // In full panels: char badge in row1. In compact: char badge in row2 inline with stats.
    const r2=el('div',{class:'tb-player-stats'});
    if(!compact){
      if(p.char&&charRevealed){const c=charById(p.char);
        // Character thumbnail
        if(typeof IMG!=='undefined'&&IMG.char[c.id]){
          var thumbImg=el('img',{src:IMG.char[c.id].thumb,alt:c.name,class:'tb-char-thumb',loading:'lazy',decoding:'async'});
          thumbImg.onerror=function(){thumbImg.style.display='none';};
          r1.appendChild(thumbImg);
        }
        const badge=el('span',{class:'tb-player-char',style:`--char-clr:${c.clr};color:var(--char-clr);border-color:color-mix(in srgb,var(--char-clr) 35%,var(--border-main));background:color-mix(in srgb,var(--char-clr) 10%,var(--bg-card))`});
        badge.textContent=`${c.emoji} ${cn(c.id)}`;r1.appendChild(badge);
      }else if(p.char&&!charRevealed&&!isMe){
        const badge=el('span',{class:'tb-player-char badge-hidden'});badge.textContent=t('badge.hidden');r1.appendChild(badge);
      }
    }else{
      // Compact: tiny char indicator prefixed to stats row
      if(p.char&&charRevealed){const c=charById(p.char);
        const badge=el('span',{class:'tb-player-char tb-char-compact',style:`--char-clr:${c.clr};color:var(--char-clr)`});
        badge.textContent=`${c.emoji}`;r2.appendChild(badge);
      }else if(p.char&&!charRevealed&&!isMe){
        const badge=el('span',{class:'tb-char-compact tb-char-hidden'},'🎭');r2.appendChild(badge);
      }
    }
    r2.innerHTML=`<span>💰<span class="tb-stat-val"> ${p.gold}✦</span></span>`+
      `<span>🏰<span class="tb-stat-val"> ${p.city.length}/8</span></span>`+
      `<span>🃏<span class="tb-stat-val"> ${p.hand.length}</span></span>`+
      `<span>📊<span class="tb-stat-val"> ${calcScore(p,S.firstCompleter===p.id)} ${t('pts.suffix')}</span></span>`;
    pDiv.appendChild(r2);
    if(!compact&&p.city.length){
      const cityDiv=el('div',{class:'tb-city'});
      p.city.forEach(d=>{
        const isUnique=d.color==='purple'&&d.special&&SDESC[d.special];
        const chip=el('div',{class:'tb-chip'+(isUnique?' has-tip':'')});
        const label=el('span',{class:'tb-chip-label color-'+d.color});
        label.appendChild(document.createTextNode(`${DEMOJI[d.id]||'🏛'} ${dn(d)} `));
        const ptsSpan=el('span',{class:'tb-chip-pts'});ptsSpan.textContent=`${d.cost}✦`;
        label.appendChild(ptsSpan);chip.appendChild(label);
        if(isUnique){const tip=el('div',{class:'tb-chip-tip'});tip.textContent=`✨ ${dn(d)}\n${sdesc(d.special)}`;chip.appendChild(tip);}
        cityDiv.appendChild(chip);
      });
      pDiv.appendChild(cityDiv);
    }
    // Tap any panel to see city details in a bottom sheet
    pDiv.style.cursor='pointer';
    pDiv.onclick=function(e){
      e.stopPropagation();
      var existing=document.getElementById('player-detail-sheet');
      if(existing){existing.remove();return;}
      var sheet=el('div',{id:'player-detail-sheet'});
      sheet.onclick=function(ev){if(ev.target===sheet)sheet.remove();};
      var box=el('div',{class:'player-detail-box'});
      var hdr=el('div',{class:'player-detail-hdr'});
      hdr.appendChild(el('span',{class:'player-detail-name'},p.name+(isMe?t('player.you'):'')));
      var score=calcScore(p,S.firstCompleter===p.id);
      hdr.appendChild(el('span',{class:'player-detail-score'},`💰${p.gold}✦  🏰${p.city.length}/8  📊${score}pts`));
      var closeBtn=el('button',{class:'player-detail-close'},'✕');
      closeBtn.onclick=function(){sheet.remove();};
      hdr.appendChild(closeBtn);
      box.appendChild(hdr);
      if(p.city.length){
        var cityWrap=el('div',{class:'player-detail-city'});
        ['yellow','blue','green','red','purple'].forEach(function(col){
          p.city.filter(function(d){return d.color===col;}).forEach(function(d){cityWrap.appendChild(mkCard(d,{portrait:true,player:p}));});
        });
        box.appendChild(cityWrap);
      }else{
        box.appendChild(el('p',{class:'player-detail-empty'},t('player.no_city')));
      }
      sheet.appendChild(box);
      document.body.appendChild(sheet); // attach to body so render() can't wipe it
    };
    return pDiv;
  }

  // All players in a single compact grid (desktop only)
  const me=S.players[0];
  if(!isMobile){
    const tbGrid=el('div',{class:'tb-grid'});
    const allOrder=[me,...S.players.filter(p=>p.id!==0).sort((a,b)=>{
      const ai=S.draftOrder.indexOf(a.id);const bi=S.draftOrder.indexOf(b.id);
      return(ai===-1?99:ai)-(bi===-1?99:bi);
    })];
    allOrder.forEach(p=>tbGrid.appendChild(mkPlayerPanel(p,true)));
    topbar.appendChild(tbGrid);
  }
  wrap.appendChild(topbar);

  // Mobile: all-players bottom sheet (triggered by opponents button)
  function showAllPlayersSheet(){
    var existing=document.getElementById('player-detail-sheet');
    if(existing){existing.remove();return;}
    var sheet=el('div',{id:'player-detail-sheet'});
    sheet.onclick=function(ev){if(ev.target===sheet)sheet.remove();};
    var box=el('div',{class:'player-detail-box mob-all-players'});
    var hdr=el('div',{class:'player-detail-hdr'});
    hdr.appendChild(el('span',{class:'player-detail-name'},t('all_players')));
    var closeBtn=el('button',{class:'player-detail-close'},'✕');
    closeBtn.onclick=function(){sheet.remove();};
    hdr.appendChild(closeBtn);
    box.appendChild(hdr);
    var allOrder=[...S.players].sort(function(a,b){
      var ai=S.draftOrder.indexOf(a.id);var bi=S.draftOrder.indexOf(b.id);
      return(ai===-1?99:ai)-(bi===-1?99:bi);
    });
    allOrder.forEach(function(p){
      var panel=mkPlayerPanel(p,false);
      panel.style.cursor='default';
      // Re-bind tap to show city detail inside the sheet
      panel.onclick=function(e){e.stopPropagation();
        var existingSub=document.getElementById('player-detail-sheet');
        if(existingSub)existingSub.remove();
        // Open individual player detail
        var subSheet=el('div',{id:'player-detail-sheet'});
        subSheet.onclick=function(ev){if(ev.target===subSheet)subSheet.remove();};
        var subBox=el('div',{class:'player-detail-box'});
        var subHdr=el('div',{class:'player-detail-hdr'});
        subHdr.appendChild(el('span',{class:'player-detail-name'},p.name+(p.id===0?t('player.you'):'')));
        var score=calcScore(p,S.firstCompleter===p.id);
        subHdr.appendChild(el('span',{class:'player-detail-score'},'💰'+p.gold+'✦  🏰'+p.city.length+'/8  📊'+score+'pts'));
        var subClose=el('button',{class:'player-detail-close'},'✕');
        subClose.onclick=function(){subSheet.remove();};
        subHdr.appendChild(subClose);
        subBox.appendChild(subHdr);
        if(p.city.length){
          var cityWrap=el('div',{class:'player-detail-city'});
          ['yellow','blue','green','red','purple'].forEach(function(col){
            p.city.filter(function(d){return d.color===col;}).forEach(function(d){cityWrap.appendChild(mkCard(d,{portrait:true,player:p}));});
          });
          subBox.appendChild(cityWrap);
        }else{subBox.appendChild(el('p',{class:'player-detail-empty'},t('player.no_city')));}
        subSheet.appendChild(subBox);
        document.body.appendChild(subSheet);
      };
      box.appendChild(panel);
    });
    sheet.appendChild(box);
    document.body.appendChild(sheet);
  }

  // ── CENTER ────────────────────────────────────────────────────────────────────
  const main=el('div',{id:'main'});
  const center=el('div',{id:'center'});
  // Player bar — persistent across all game phases
  if(S.phase==='draft'||S.phase==='herald'||S.phase==='action'){
    center.appendChild(renderPlayerBar());
  }

  if(S.phase==='draft'){
    const currentDrafter=S.draftOrder[S.draftIdx];
    const draftingPlayer=S.players[currentDrafter];
    if(currentDrafter===0)center.appendChild(renderDraft());
    else{
      const msg=draftingPlayer&&!draftingPlayer.ai
        ?t('state.waiting_peer',{name:draftingPlayer.name})
        :t('state.waiting_others');
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
        ?t('state.waiting_player',{name:activePlayer.name}):t('state.waiting_dot');
      center.appendChild(el('div',{class:'state-waiting'},waitMsg));
    }
  }
  main.appendChild(center);

  // ── YOUR CITY (mobile: collapsible in #main; desktop: in #bottom) ──
  const myScore=calcScore(me,S.firstCompleter===me.id);
  const botCity=el('div',{id:'bot-city'});
  if(isMobile&&me.city.length>0){
    // Collapsible city section — only shown when player has built districts
    const cityHdr=el('div',{class:'mob-city-hdr'});
    cityHdr.innerHTML=`<span>${t('city.label',{n:me.city.length,pts:myScore})}</span><span class="mob-city-toggle">▼</span>`;
    botCity.appendChild(cityHdr);
    const cityWrap=el('div',{class:'cards-wrap mob-city-cards'});
    cityWrap.style.display='none';
    ['yellow','blue','green','red','purple'].forEach(col=>{
      me.city.filter(d=>d.color===col).forEach(d=>cityWrap.appendChild(mkCard(d,{portrait:true,player:me})));
    });
    botCity.appendChild(cityWrap);
    cityHdr.onclick=function(){
      var cards=cityHdr.nextElementSibling;
      var toggle=cityHdr.querySelector('.mob-city-toggle');
      if(cards.style.display==='none'){cards.style.display='';toggle.textContent='▲';}
      else{cards.style.display='none';toggle.textContent='▼';}
    };
    main.appendChild(botCity);
  }

  wrap.appendChild(main);

  // ── BOTTOM PANEL ──────────────────────────────────────────────────────────────
  const bottom=el('div',{id:'bottom'});

  const botHand=el('div',{id:'bot-hand'});
  if(isMobile){
    // Mobile: compact hand label
    const handLabel=el('div',{class:'bot-label'});
    const handLeft=el('span',{class:'bot-label-left'});
    handLeft.appendChild(el('span',null,t('hand.label_mobile')));
    if(me.char){const c=charById(me.char);
      handLeft.appendChild(el('span',{class:'bot-char-badge',style:`--char-clr:${c.clr}`},`${c.emoji} ${cn(c.id)}`));
    }
    handLabel.appendChild(handLeft);
    botHand.appendChild(handLabel);
  }else{
    // Desktop: full hand label
    const handLabel=el('div',{class:'bot-label'});
    const handLeft=el('span',{class:'bot-label-left'});
    handLeft.appendChild(el('span',null,t('hand.label')));
    if(me.char){const c=charById(me.char);
      const charBadge=el('span',{class:'bot-char-badge',style:`--char-clr:${c.clr}`},`${c.emoji} ${cn(c.id)}`);
      handLeft.appendChild(charBadge);
    }
    handLabel.appendChild(handLeft);
    handLabel.appendChild(el('span',{class:'bot-label-right'},`💰 ${me.gold}✦  🃏 ${me.hand.length}`));
    botHand.appendChild(handLabel);
  }
  const handWrap=el('div',{class:'cards-wrap'});
  if(me.hand.length)me.hand.forEach(d=>handWrap.appendChild(mkCard(d,{portrait:true,player:me})));
  else handWrap.appendChild(el('span',{class:'state-empty'},t('hand.empty')));
  botHand.appendChild(handWrap);

  if(!isMobile){
    // Desktop: city in bottom panel
    const cityLabel=el('div',{class:'bot-label'});
    cityLabel.innerHTML=`<span>${t('city.desktop',{n:me.city.length})}</span><span class="bot-label-right">📊 ~${myScore} ${t('pts.suffix')}</span>`;
    botCity.appendChild(cityLabel);
    const cityWrap=el('div',{class:'cards-wrap'});
    if(me.city.length){
      ['yellow','blue','green','red','purple'].forEach(col=>{
        me.city.filter(d=>d.color===col).forEach(d=>cityWrap.appendChild(mkCard(d,{portrait:true,player:me})));
      });
    }else cityWrap.appendChild(el('span',{class:'state-empty'},t('hand.nothing_built')));
    botCity.appendChild(cityWrap);
    bottom.append(botHand,botCity);
  }else{
    bottom.appendChild(botHand);
  }
  wrap.appendChild(bottom);

  // Confirmation modal
  if(S._confirmEnd){
    const overlay=el('div',{class:'confirm-overlay'});
    const box=el('div',{class:'confirm-box'});
    box.appendChild(el('h3',null,t('confirm.end.title')));
    box.appendChild(el('p',null,t('confirm.end.body')));
    const btns=el('div',{class:'confirm-btns'});
    const cancelBtn=el('button',{class:'btn-cancel'},t('confirm.end.cancel'));
    cancelBtn.onclick=()=>{S={...S,_confirmEnd:false};render();};
    const confirmBtn=el('button',{class:'btn-danger'},t('confirm.end.confirm'));
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
  const nextLabel=isLast?(S.heraldAfter==='end_round'?t('herald.end_round'):t('herald.your_turn')):t('herald.next');
  const wrap=el('div',{class:'herald-wrap'});
  const pips=el('div',{class:'herald-pips'});
  for(let i=0;i<total;i++){const q=S.heraldQueue[i];const qc=charByRank(q.charId);
    const pipCls='herald-pip'+(i===S.heraldIdx?' current':i<S.heraldIdx?' past':' future');
    const pip=el('div',{class:pipCls});
    pip.textContent=qc.emoji;
    pip.style.setProperty('--pip-clr',qc.clr);
    pip.style.borderColor='var(--pip-clr)';
    if(i===S.heraldIdx)pip.style.background='color-mix(in srgb, var(--pip-clr) 10%, transparent)';
    else if(i<S.heraldIdx)pip.style.background='color-mix(in srgb, var(--pip-clr) 8%, transparent)';
    pip.title=`${q.charId}. ${cn(qc.id)}`;pips.appendChild(pip);}
  wrap.appendChild(pips);
  const card=el('div',{class:'herald-card'});
  card.style.setProperty('--herald-clr',c.clr);
  card.appendChild(el('div',{class:'herald-char-num'},t('herald.char_n_of_m',{n:beat.charId,m:Math.max(0,...S.charPool.map(charRank))})));
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
  const titleEl=el('div',{class:'herald-title'});titleEl.style.color=c.clr;titleEl.textContent=cn(c.id);titleBlock.appendChild(titleEl);
  titleBlock.appendChild(el('div',{class:'herald-ability'},ca(c.id)));
  iconRow.appendChild(titleBlock);card.appendChild(iconRow);
  if(!beat.holderName){
    card.appendChild(el('div',{class:'herald-empty'},t('herald.no_one')));
  }else{
    // Visual player→character assignment chip
    const who=el('div',{class:'herald-sub'});
    if(beat.isStartOnly){
      who.textContent=beat.holderName;
    }else{
      var holder=S.players.find(function(p){return p.name===beat.holderName;});
      var hAvatar=holder&&typeof getAvatar==='function'?getAvatar(holder.id):(beat.isHuman?'👤':'🤖');
      var hName=beat.isHuman?(beat.holderName===(S.players[0]?.name||'You')?S.players[0]?.name||'You':beat.holderName):beat.holderName;
      var pChip=el('span',{class:'herald-chip herald-chip-player'});
      pChip.innerHTML='<span class="hc-avatar">'+hAvatar+'</span><span class="hc-label">'+hName+'</span>';
      var arrow=el('span',{class:'herald-arrow'},'→');
      var cChip=el('span',{class:'herald-chip herald-chip-char'});
      cChip.style.setProperty('--chip-clr',c.clr);
      cChip.innerHTML='<span class="hc-avatar">'+c.emoji+'</span><span class="hc-label">'+cn(c.id)+'</span>';
      who.append(pChip,arrow,cChip);
      if(beat.isHuman)who.appendChild(el('span',{class:'herald-turn-label'},t('herald.turn_summary')));
    }
    card.appendChild(who);
    if(beat.events.length){
      const evts=el('div',{class:'herald-events'});
      beat.events.forEach(function(ev,idx){
        var row=el('div',{class:'herald-event'});row.style.borderLeftColor=ev.color;
        row.style.animationDelay=(idx*80)+'ms';
        var iconWrap=el('div',{class:'herald-ev-icon'});
        iconWrap.style.setProperty('--ev-clr',ev.color);
        iconWrap.textContent=ev.icon;
        // Parse amounts from text for visual badges
        var txt=el('div',{class:'herald-ev-text'});
        var t=ev.text;
        // Highlight gold amounts like "2✦" or "1✦"
        t=t.replace(/(\d+)✦/g,'<span class="ev-gold">$1✦</span>');
        // Highlight card counts like "draws 3 cards"
        t=t.replace(/draws? (\d+) card/g,'draws <span class="ev-cards">$1</span> card');
        txt.innerHTML=t;
        row.append(iconWrap,txt);evts.appendChild(row);
      });
      card.appendChild(evts);
    }else card.appendChild(el('div',{class:'herald-empty'},t('herald.no_actions')));
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
      cb.textContent=t('herald.ready',{n:ackedCount,m:totalHumans});
      cb.style.opacity='0.5';cb.style.cursor='default';
      cb.onclick=null;
    }else{
      cb.textContent=t('herald.next_multi',{label:nextLabel,n:ackedCount,m:totalHumans});
      cb.onclick=()=>{{const _nr=heraldNext(S);if(_nr)S=_nr;render();};};
    }
  }else{
    cb.textContent=nextLabel;
    cb.onclick=()=>{{const _nr=heraldNext(S);if(_nr)S=_nr;render();};};
  }
  card.appendChild(cb);wrap.appendChild(card);return wrap;
}

// ── PLAYER BAR — persistent across all phases ─────────────────────────────────
function renderPlayerBar(){
  const bar=el('div',{class:'draft-order'});
  // Determine player order — use draftOrder if available, else by id
  const order=S.draftOrder||S.players.map(function(p){return p.id;});
  order.forEach(function(pid,i){
    const p=S.players[pid];
    if(!p)return;
    const avatar=typeof getAvatar==='function'?getAvatar(pid):(p.ai?'🤖':'👤');
    var state='neutral';
    var statusText='';
    if(S.phase==='draft'){
      state=i<S.draftIdx?'done':i===S.draftIdx?'active':'waiting';
      statusText=state==='done'?t('state.picked'):state==='active'?t('state.choosing'):t('state.waiting');
    }else if(S.phase==='herald'||S.phase==='action'){
      // Highlight the player whose character is currently being called
      var ch=p.char;
      var isActive=ch&&charRank(ch)===S.callIdx&&!p.dead;
      state=isActive?'active':'neutral';
      var charObj=ch?charById(ch):null;
      statusText=isActive?(charObj?charObj.emoji+' '+cn(charObj.id):t('state.active')):(p.dead?t('state.killed'):'');
    }
    const pip=el('div',{class:'draft-pip '+ state});
    pip.textContent=(S.phase==='draft'&&state==='done')?'✓':avatar;
    if(S.phase!=='draft'&&p.dead)pip.classList.add('dead');
    // Rich hover tooltip
    pip.onmouseenter=function(e){
      var tip=document.getElementById('draft-pip-tip');
      if(!tip){tip=document.createElement('div');tip.id='draft-pip-tip';tip.className='draft-pip-tip';document.body.appendChild(tip);}
      var label=pid===0?'You':p.name;
      var charInfo='';
      if(S.phase!=='draft'&&p.char&&!isActive){var co=charById(p.char);if(co&&charRank(p.char)<S.callIdx)charInfo='<div class="dpt-char" style="color:'+co.clr+'">'+co.emoji+' '+cn(co.id)+'</div>';}
      var extra='';
      if(p.dead)extra='<div class="dpt-status dpt-dead">💀 '+t('state.killed')+'</div>';
      else if(statusText)extra='<div class="dpt-status dpt-'+state+'">'+statusText+'</div>';
      tip.innerHTML='<div class="dpt-avatar">'+avatar+'</div><div class="dpt-name">'+label+'</div>'+charInfo+extra;
      tip.style.display='block';
      var r=pip.getBoundingClientRect();
      tip.style.left=Math.max(8,Math.min(r.left+r.width/2-tip.offsetWidth/2,window.innerWidth-tip.offsetWidth-8))+'px';
      tip.style.top=(r.bottom+8)+'px';
    };
    pip.onmouseleave=function(){var tip=document.getElementById('draft-pip-tip');if(tip)tip.style.display='none';};
    bar.appendChild(pip);
  });
  // Character reference button
  var refBtn=el('button',{class:'char-ref-btn'},'ℹ');
  refBtn.title=t('char_ref.title');
  refBtn.onclick=function(e){
    e.stopPropagation();
    var existing=document.getElementById('char-ref-panel');
    if(existing){existing.remove();var et=document.getElementById('char-ref-tip');if(et)et.remove();return;}
    var panel=el('div',{id:'char-ref-panel',class:'char-ref-panel'});
    var hdr=el('div',{class:'char-ref-hdr'});
    hdr.appendChild(el('span',{class:'char-ref-title'},t('char_ref.title')));
    var closeBtn=el('button',{class:'char-ref-close'},'✕');
    closeBtn.onclick=function(){panel.remove();var t=document.getElementById('char-ref-tip');if(t)t.remove();};
    hdr.appendChild(closeBtn);
    panel.appendChild(hdr);
    var pool=(S.charPool||[]).slice().sort(function(a,b){
      var ra=CHARS.find(function(c){return c.id===a;});
      var rb=CHARS.find(function(c){return c.id===b;});
      return ((ra&&ra.rank)||0)-((rb&&rb.rank)||0);
    });
    pool.forEach(function(charId){
      var c=CHARS.find(function(ch){return ch.id===charId;});
      if(!c)return;
      var row=el('div',{class:'char-ref-row'});
      row.appendChild(el('span',{class:'char-ref-rank'},String(c.rank)));
      row.appendChild(el('span',{class:'char-ref-emoji'},c.emoji));
      row.appendChild(el('span',{class:'char-ref-name',style:'--char-clr:'+c.clr},cn(c.id)));
      row.onmouseenter=function(){
        var tip=document.getElementById('char-ref-tip');
        if(!tip){tip=document.createElement('div');tip.id='char-ref-tip';tip.className='char-ref-tip';document.body.appendChild(tip);}
        tip.innerHTML='<div class="crt-header"><span class="crt-emoji">'+c.emoji+'</span><span class="crt-name" style="--char-clr:'+c.clr+'">'+cn(c.id)+'</span></div><p class="crt-ability">'+ca(c.id)+'</p>';
        tip.style.display='block';
        var pr=panel.getBoundingClientRect();var rr=row.getBoundingClientRect();
        setTimeout(function(){
          var tw=tip.offsetWidth;var th=tip.offsetHeight;
          var tipLeft=pr.right+8;
          var fitsRight=tipLeft+tw<=window.innerWidth-8;
          var fitsLeft=pr.left-tw-8>=8;
          if(fitsRight){tip.style.left=tipLeft+'px';}
          else if(fitsLeft){tip.style.left=(pr.left-tw-8)+'px';}
          else{
            // Not enough room on sides — show below the row, same x as panel
            tip.style.left=Math.max(8,Math.min(pr.left,window.innerWidth-tw-8))+'px';
            tip.style.top=Math.min(rr.bottom+6,window.innerHeight-th-8)+'px';
            return;
          }
          var tipTop=rr.top;
          if(tipTop+th>window.innerHeight-8)tipTop=window.innerHeight-th-8;
          tip.style.top=Math.max(8,tipTop)+'px';
        },0);
      };
      row.onmouseleave=function(){var tip=document.getElementById('char-ref-tip');if(tip)tip.style.display='none';};
      panel.appendChild(row);
    });
    document.body.appendChild(panel);
    var br=refBtn.getBoundingClientRect();
    panel.style.top=(br.bottom+8)+'px';
    setTimeout(function(){
      var pw=panel.offsetWidth;
      var left=br.right-pw;
      if(left<8)left=8;
      if(left+pw>window.innerWidth-8)left=window.innerWidth-pw-8;
      panel.style.left=left+'px';
    },0);
    function closePanel(){
      panel.remove();var t=document.getElementById('char-ref-tip');if(t)t.remove();
      document.removeEventListener('click',outsideClick,true);
    }
    function outsideClick(ev){
      if(!panel.contains(ev.target)&&ev.target!==refBtn){closePanel();}
    }
    // Store cleanup reference so re-opens don't accumulate listeners
    if(refBtn._cleanupCharRef)refBtn._cleanupCharRef();
    refBtn._cleanupCharRef=function(){document.removeEventListener('click',outsideClick,true);};
    setTimeout(function(){document.addEventListener('click',outsideClick,true);},50);
  };
  bar.appendChild(refBtn);
  return bar;
}

function renderDraft(){
  const wrap=el('div',null);
  const faceDown=S.faceDown||[];const faceUp=S.faceUp||[];

  wrap.appendChild(el('div',{class:'draft-title'},t('draft.choose')));

  // Only hint at how many cards total are out of play — never reveal which ones
  const totalRemoved=(faceDown.length||0)+(faceUp.length||0);
  if(totalRemoved){
    const info=el('div',{class:'draft-info'});
    info.appendChild(el('span',{class:'draft-info-ghost'},
      totalRemoved>1?t('draft.removed_p',{n:totalRemoved}):t('draft.removed_s',{n:totalRemoved})));
    wrap.appendChild(info);
  }

  const grid=el('div',{class:'draft-grid'});
  CHARS.filter(c=>S.charPool.includes(c.id)).forEach(c=>{
    const avail=S.avail.includes(c.id);
    const removed=faceUp.includes(c.id);
    // Only show cards still available to pick — hide drafted + removed cards
    // (face-up removed would tell you what's gone; that breaks the guessing game)
    if(!avail)return;
    const stateClass='available';
    const card=el('div',{class:`charcard ${stateClass} animate-in`,style:`--char-clr:${c.clr}`});
    // Rank badge
    card.appendChild(el('div',{class:'charcard-rank'},String(c.rank)));
    // Image zone — top portion of card
    const imgZone=el('div',{class:'charcard-img-zone'});
    if(typeof IMG!=='undefined'&&IMG.char[c.id]){
      const img=el('img',{src:IMG.char[c.id].full,alt:c.name,class:'charcard-portrait',loading:'lazy',decoding:'async'});
      img.onerror=function(){imgZone.textContent=c.emoji;imgZone.classList.add('charcard-img-fallback');};
      imgZone.appendChild(img);
    }else{
      imgZone.classList.add('charcard-img-fallback');
      imgZone.textContent=c.emoji;
    }
    card.appendChild(imgZone);
    // Info zone — bottom portion, always clean background
    const infoZone=el('div',{class:'charcard-info-zone'});
    infoZone.appendChild(el('div',{class:`charcard-name${avail?' available':''}`},`${c.rank}. ${cn(c.id)}`));
    if(removed){// defensive: dealDraft excludes removed chars, but extensions may add face-up removed cards
      infoZone.appendChild(el('div',{class:'charcard-removed-label'},t('draft.not_in_play')));
    }else{
      infoZone.appendChild(el('div',{class:'charcard-ability'},ca(c.id)));
    }
    card.appendChild(infoZone);
    if(avail){
      card.tabIndex=0;
      card.onclick=()=>{const result=humanDraft(S,c.id);if(result)S=result;render();};
      card.onkeydown=function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();const result=humanDraft(S,c.id);if(result)S=result;render();}};
    }else{
      card.tabIndex=-1;
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
  // Portrait image or emoji fallback
  if(typeof IMG!=='undefined'&&IMG.char[charId]){
    var bannerImg=el('img',{src:IMG.char[charId].full,alt:c.name,class:'action-banner-portrait'});
    bannerImg.onerror=function(){var span=el('div',{class:'action-banner-emoji'},c.emoji);if(bannerImg.parentNode)bannerImg.parentNode.replaceChild(span,bannerImg);};
    banner.appendChild(bannerImg);
  }else{
    banner.appendChild(el('div',{class:'action-banner-emoji'},c.emoji));
  }
  const bInfo=el('div',{class:'action-banner-info'});
  const charNameEl=el('div',{class:'action-char-name',style:`--char-clr:${c.clr}`},cn(c.id));
  bInfo.appendChild(charNameEl);
  bInfo.appendChild(el('div',{class:'action-char-ability'},ca(c.id)));
  if(charId===7)bInfo.appendChild(el('div',{class:'action-note'},t('note.arch_hand',{n:me.hand.length})));
  if(charId===14)bInfo.appendChild(el('div',{class:'action-note'},t('note.scholar_action')));
  if(charId===15)bInfo.appendChild(el('div',{class:'action-note-purple'},t('note.seer_action')));
  if(charId===16)bInfo.appendChild(el('div',{class:'action-note-green'},t('note.trader_action',{n:me.city.filter(d=>d.color==='green').length})));
  banner.appendChild(bInfo);wrap.appendChild(banner);

  if(S.sub==='draw_pick'){
    const drawPickLabel=charId===14?t('draw_pick.scholar',{n:S.drawOpts.length}):
      me.city.some(d=>d.id==='observatory')?t('draw_pick.obs'):t('draw_pick.normal');
    wrap.appendChild(el('div',{class:'draw-pick-label'},drawPickLabel));
    const row=el('div',{class:'draw-pick-row'});
    S.drawOpts.forEach(d=>row.appendChild(mkCard(d,{portrait:true,onClick:()=>{{const _nr=humanKeepCard(S,d.uid);if(_nr)S=_nr;render();};}})));
    wrap.appendChild(row);return wrap;
  }

  // Income
  if(!S.collected){
    wrap.appendChild(el('div',{class:'sect-label'},t('income.label')));
    if(charId===10){
      const row=el('div',{class:'income-row-nav'});
      row.appendChild(gbtn(t('income.nav_gold'),'#4a90d9',()=>{{const _nr=humanNavigator(S,'gold');if(_nr)S=_nr;render();};},'padding:10px 18px;font-size:12px;font-family:Cinzel,serif'));
      if(S.deck.length)row.appendChild(gbtn(t('income.nav_cards'),'#4a90d9',()=>{{const _nr=humanNavigator(S,'cards');if(_nr)S=_nr;render();};},'padding:10px 18px;font-size:12px;font-family:Cinzel,serif'));
      wrap.appendChild(row);
      wrap.appendChild(el('div',{class:'action-note-warning'},t('income.nav_warning')));
    }else{
      const row=el('div',{class:'income-row'});
      row.appendChild(gbtn(t('income.take_gold'),'#d4a843',()=>{{const _nr=humanCollectGold(S);if(_nr)S=_nr;render();};},'padding:10px 18px;font-size:12px;font-family:Cinzel,serif'));
      if(S.deck.length){
        const label=charId===14?t('income.draw_scholar'):
                    me.city.some(d=>d.id==='observatory')?t('income.draw_obs'):
                    me.city.some(d=>d.id==='library')?t('income.draw_library'):t('income.draw_normal');
        row.appendChild(gbtn(label,'#5a9fd4',()=>{{const _nr=humanCollectCards(S);if(_nr)S=_nr;render();};},'padding:10px 18px;font-size:12px;font-family:Cinzel,serif'));
      }
      wrap.appendChild(row);
    }
  }

  if(S.sub==='choose'||S.sub==='assassin_pick'||S.sub==='thief_pick'||S.sub==='warlord_pick'||S.sub==='wizard_pick'){
    wrap.appendChild(el('div',{class:'sect-label'},t('special.label')));
    wrap.appendChild(renderSpecial(charId));
  }

  if(S.sub==='mag_swap'){
    wrap.appendChild(el('div',{class:'action-mag-prompt-purple'},t('mag.swap_with')));
    const r=el('div',{class:'spec-row'});
    S.players.filter(p=>p.id!==0).forEach(p=>r.appendChild(gbtn(`${p.name} (${p.hand.length})`, '#9b6fff',()=>{{const _nr=humanMagSwap(S,p.id);if(_nr)S=_nr;render();};})));
    r.appendChild(gbtn(t('mag.cancel'),'#555',()=>{S={...S,sub:'choose'};render();}));wrap.appendChild(r);
  }
  if(S.sub==='mag_discard'){
    wrap.appendChild(el('div',{class:'action-mag-prompt-purple'},t('mag.discard_select')));
    const r=el('div',{class:'spec-row'});
    me.hand.forEach(d=>{const sel=S.selCards.includes(d.uid);r.appendChild(mkCard(d,{portrait:true,selected:sel,onClick:()=>{
      const sc=S.selCards.includes(d.uid)?S.selCards.filter(x=>x!==d.uid):[...S.selCards,d.uid];S={...S,selCards:sc};render();}}));});
    wrap.appendChild(r);
    const r2=el('div',{class:'spec-row-inline'});
    if(S.selCards.length)r2.appendChild(gbtn(t('mag.discard_confirm',{n:S.selCards.length}),'#9b6fff',()=>{{const _nr=humanMagDiscard(S,S.selCards);if(_nr)S=_nr;render();};}));
    r2.appendChild(gbtn(t('mag.cancel'),'#555',()=>{S={...S,sub:'choose',selCards:[]};render();}));wrap.appendChild(r2);
  }
  if(S.sub==='wizard_pick'){
    const target=S.players.find(p=>p.id===S.wizardTargetId);
    if(target){
      wrap.appendChild(el('div',{class:'action-mag-prompt-purple'},t('wizard.hand_of',{name:target.name})));
      if(!target.hand.length){
        wrap.appendChild(el('div',{class:'state-empty mb-sm'},t('wizard.no_cards')));
      }else{
        const r=el('div',{class:'spec-row-lg'});
        target.hand.forEach(d=>{
          const canBuild=buildCost(me,d)<=me.gold&&canBuildDistrict(me,d);
          const cardWrap=el('div',{class:'spec-col'});
          cardWrap.appendChild(mkCard(d,{portrait:true}));
          const takeBtn=gbtn(t('wizard.take'),'#9b6fff',()=>{{const _nr=humanWizardTake(S,d.uid,false);if(_nr)S=_nr;render();};},'font-size:10px;padding:3px 10px;width:100%');
          cardWrap.appendChild(takeBtn);
          if(canBuild){
            const buildBtn=gbtn(t('wizard.build',{cost:buildCost(me,d)}),'#7a4fcc',()=>{{const _nr=humanWizardTake(S,d.uid,true);if(_nr)S=_nr;render();};},'font-size:10px;padding:3px 8px;width:100%');
            cardWrap.appendChild(buildBtn);
          }
          r.appendChild(cardWrap);
        });
        wrap.appendChild(r);
      }
      wrap.appendChild(gbtn(t('wizard.cancel'),'#555',()=>{S={...S,sub:'choose',wizardTargetId:null};render();}));
    }
    return wrap;
  }

  if(S.collected&&S.sub==='choose'&&(
    (me.city.some(d=>d.id==='smithy')&&!me.smithyUsed&&me.gold>=2&&S.deck.length)||
    (me.city.some(d=>d.id==='laboratory')&&!me.labUsed&&me.hand.length>0)
  )){
    wrap.appendChild(el('div',{class:'sect-label'},t('active_bldg.label')));
    if(me.city.some(d=>d.id==='smithy')&&!me.smithyUsed&&me.gold>=2&&S.deck.length){
      const smithyRow=el('div',{class:'action-smithy-row'});
      smithyRow.appendChild(el('span',{class:'action-smithy-icon'},'⚒️'));
      const smithyInfo=el('div',{class:'action-smithy-info'});
      smithyInfo.appendChild(el('div',{class:'action-smithy-title'},t('smithy.title')));
      smithyInfo.appendChild(el('div',{class:'action-smithy-desc'},t('smithy.desc')));
      smithyRow.appendChild(smithyInfo);
      smithyRow.appendChild(gbtn(t('smithy.use'),'#c084fc',()=>{{const _nr=humanUseSmithy(S);if(_nr)S=_nr;render();};}));
      wrap.appendChild(smithyRow);
    }
    if(me.city.some(d=>d.id==='laboratory')&&!me.labUsed&&me.hand.length>0){
      const labRow=el('div',{class:'action-smithy-row'});
      labRow.appendChild(el('span',{class:'action-smithy-icon'},'⚗️'));
      const labInfo=el('div',{class:'action-smithy-info'});
      labInfo.appendChild(el('div',{class:'action-smithy-title'},t('lab.title')));
      labInfo.appendChild(el('div',{class:'action-smithy-desc'},t('lab.desc')));
      labRow.appendChild(labInfo);
      wrap.appendChild(labRow);
      // Show hand cards as discard targets
      const labCardRow=el('div',{class:'cards-wrap build-row'});
      me.hand.forEach(function(d){
        const c=mkCard(d,{portrait:true,player:me,noDesc:true});
        c.style.cursor='pointer';
        c.onclick=function(e){e.stopPropagation();var _nr=humanUseLab(S,d.uid);if(_nr&&_nr!==S){S=_nr;render();}};
        labCardRow.appendChild(c);
      });
      wrap.appendChild(labCardRow);
    }
  }

  if(S.collected&&S.sub==='choose'&&!S.noBuild){
    const canBuild=S.builtCount<maxB;
    if(canBuild){
      wrap.appendChild(el('div',{class:'sect-label'},t('build.label',{n:S.builtCount,m:maxB,gold:me.gold})));
      if(!me.hand.length)wrap.appendChild(el('div',{class:'state-empty mb-sm'},t('build.no_cards')));
      else{
        const row=el('div',{class:'cards-wrap build-row'});
        me.hand.forEach(d=>{
          const cost=buildCost(me,d);
          var canAfford=cost<=me.gold&&canBuildDistrict(me,d);
          // Thieves' Den: affordable if gold + other cards in hand >= cost
          var isDen=d.id==='thieves_den';
          if(!canAfford&&isDen&&canBuildDistrict(me,d)){
            var cardsAvail=me.hand.length-1;
            canAfford=cost<=me.gold+cardsAvail;
          }
          const card=mkCard(d,{portrait:true,player:me,noDesc:true,disabled:false});
          if(!canAfford)card.style.opacity='0.45';
          card.style.cursor='pointer';
          card.onclick=function(e){e.stopPropagation();showBuildConfirm(d,cost,canAfford,isDen);};
          row.appendChild(card);
        });
        wrap.appendChild(row);
        if(!me.hand.some(d=>{var c=buildCost(me,d);if(c<=me.gold&&canBuildDistrict(me,d))return true;if(d.id==='thieves_den'&&canBuildDistrict(me,d)&&c<=me.gold+(me.hand.length-1))return true;return false;}))
          wrap.appendChild(el('div',{class:'state-empty mb-sm'},t('build.cannot_afford')));
      }
    }else if(S.builtCount>0){
      wrap.appendChild(el('div',{class:'build-done-msg'},t('build.done',{n:S.builtCount,m:maxB})));
    }
  }
  // Build confirm popup: shows card detail + build button
  function showBuildConfirm(d,cost,canAfford,isDen){
    var existing=document.getElementById('card-detail-overlay');
    if(existing)existing.remove();
    var overlay=el('div',{id:'card-detail-overlay'});
    overlay.onclick=function(e){if(e.target===overlay)overlay.remove();};
    var box=el('div',{class:'card-detail-box color-'+d.color});
    var art=el('div',{class:'card-detail-art'});
    art.textContent=DEMOJI[d.id]||'🏛';
    if(typeof IMG!=='undefined'&&IMG.district[d.id]){
      var src=IMG.district[d.id].full;
      art.style.backgroundImage='url('+src+')';art.style.backgroundSize='cover';art.style.backgroundPosition='center';
      var probe=new Image();probe.onload=function(){art.textContent='';};probe.onerror=function(){art.style.backgroundImage='';};probe.src=src;
    }
    box.appendChild(art);
    var info=el('div',{class:'card-detail-info'});
    info.appendChild(el('div',{class:'card-detail-cost'},cost+'✦'));
    info.appendChild(el('div',{class:'card-detail-name'},dn(d)));
    info.appendChild(el('div',{class:'card-detail-type'},clabel(d.color)));
    if(d.special&&SDESC[d.special])info.appendChild(el('div',{class:'card-detail-desc'},sdesc(d.special)));
    // Thieves' Den: needs card payment UI if not enough gold
    if(canAfford&&isDen&&cost>me.gold){
      var deficit=cost-me.gold;
      var otherCards=me.hand.filter(function(c){return c.uid!==d.uid;});
      var selected={};
      info.appendChild(el('div',{class:'den-pay-label'},t('den.pay',{cost,gold:me.gold,deficit})));
      var cardList=el('div',{class:'den-card-list'});
      otherCards.forEach(function(c){
        var item=el('div',{class:'den-card-item'});
        item.textContent=(DEMOJI[c.id]||'🏛')+' '+dn(c)+' ('+c.cost+'✦)';
        item.onclick=function(){
          if(selected[c.uid]){delete selected[c.uid];item.classList.remove('den-card-selected');}
          else{selected[c.uid]=true;item.classList.add('den-card-selected');}
          var cnt=Object.keys(selected).length;
          buildBtn.textContent=t('den.build_btn',{gold:me.gold,n:cnt});
          buildBtn.disabled=cnt<deficit;
          buildBtn.style.opacity=cnt<deficit?'0.5':'1';
        };
        cardList.appendChild(item);
      });
      info.appendChild(cardList);
      var buildBtn=el('button',{class:'gbtn build-confirm-btn'},t('den.build_btn_zero',{gold:me.gold}));
      buildBtn.disabled=true;
      buildBtn.style.cssText='margin-top:10px;width:100%;background:#4db87a;color:#fff;border:none;padding:10px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;opacity:0.5';
      buildBtn.onclick=function(){
        var uids=Object.keys(selected);
        if(uids.length<deficit)return;
        overlay.remove();var _nr=humanBuild(S,d.uid,uids);if(_nr){S=_nr;render();}
      };
      info.appendChild(buildBtn);
    }else if(canAfford){
      var buildBtn=el('button',{class:'gbtn build-confirm-btn'},t('build.confirm_for',{cost}));
      buildBtn.style.cssText='margin-top:10px;width:100%;background:#4db87a;color:#fff;border:none;padding:10px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer';
      buildBtn.onclick=function(){overlay.remove();var _nr=humanBuild(S,d.uid);if(_nr){S=_nr;render();}};
      info.appendChild(buildBtn);
    }else{
      var reason=!canBuildDistrict(me,d)?t('build.already_built'):t('build.not_enough_gold',{cost,gold:me.gold});
      info.appendChild(el('div',{class:'build-cant-reason'},reason));
    }
    var closeBtn=el('button',{class:'card-detail-close'},'✕');
    closeBtn.onclick=function(){overlay.remove();};
    info.appendChild(closeBtn);
    box.appendChild(info);overlay.appendChild(box);document.body.appendChild(overlay);
  }
  if(S.noBuild&&S.collected&&S.sub==='choose'){
    wrap.appendChild(el('div',{class:'action-navigator-note'},t('navigator.note')));
  }
  if(S.collected&&S.sub==='choose'){
    var endBtn=el('button',{class:'action-end-turn'},t('action.end_turn'));
    endBtn.onclick=function(){var _nr=humanEndTurn(S);if(_nr)S=_nr;render();};
    wrap.appendChild(endBtn);
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
      wrap.appendChild(el('div',{class:'action-assassin-prompt'},t('assassin.choose')));
      const r=el('div',{class:'spec-row-sm'});
      CHARS.filter(ch=>S.charPool.includes(ch.id)&&ch.rank!==1).forEach(ch=>r.appendChild(gbtn(`${ch.emoji} ${cn(ch.id)}`,'#cc7777',()=>{{const _nr=humanKill(S,ch.id);if(_nr)S=_nr;render();};})));
      r.appendChild(gbtn(t('btn.cancel'),'#555',()=>{S={...S,sub:'choose'};render();}));
      wrap.appendChild(r);
    }else if(me.pendingKill){
      const pkChar=CHARS.find(ch=>S.charPool.includes(ch.id)&&ch.rank===me.pendingKill);
      const c=pkChar||{emoji:'?',name:'?'};
      const box=el('div',{class:'action-pending-box'});
      box.appendChild(el('span',{class:'action-pending-icon'},'☠️'));
      const info=el('div',{class:'action-pending-info'});
      info.appendChild(el('div',{class:'action-pending-label-red'},t('assassin.will_kill')));
      info.appendChild(el('div',{class:'action-pending-target'},`${c.emoji} ${cn(c.id)}`));
      box.appendChild(info);
      box.appendChild(gbtn(t('btn.change'),'#886',()=>{S={...S,sub:'assassin_pick'};render();}));
      wrap.appendChild(box);
    }else{
      wrap.appendChild(gbtn(t('assassin.btn'),'#cc7777',()=>{S={...S,sub:'assassin_pick'};render();}));
    }
    return wrap;
  }

  // ── Thief ──
  if(charId===2){
    if(S.sub==='thief_pick'){
      wrap.appendChild(el('div',{class:'action-thief-prompt'},t('thief.choose')));
      const r=el('div',{class:'spec-row-sm'});
      CHARS.filter(ch=>S.charPool.includes(ch.id)&&ch.rank!==1&&ch.rank!==2).forEach(ch=>r.appendChild(gbtn(`${ch.emoji} ${cn(ch.id)}`,'#b0b0b0',()=>{{const _nr=humanSteal(S,ch.id);if(_nr)S=_nr;render();};})));
      r.appendChild(gbtn(t('btn.cancel'),'#555',()=>{S={...S,sub:'choose'};render();}));
      wrap.appendChild(r);
    }else if(me.stolenTarget){
      const stChar=CHARS.find(ch=>S.charPool.includes(ch.id)&&ch.rank===me.stolenTarget);
      const c=stChar||{emoji:'?',name:'?'};
      const box=el('div',{class:'action-pending-box-thief'});
      box.appendChild(el('span',{class:'action-pending-icon'},'🕵️'));
      const info=el('div',{class:'action-pending-info'});
      info.appendChild(el('div',{class:'action-pending-label-muted'},t('thief.will_steal')));
      info.appendChild(el('div',{class:'action-pending-target'},`${c.emoji} ${cn(c.id)}`));
      box.appendChild(info);
      box.appendChild(gbtn(t('btn.change'),'#886',()=>{
        S={...S,sub:'thief_pick',players:S.players.map(p=>p.id===0?{...p,stolenTarget:null}:p)};render();
      }));
      wrap.appendChild(box);
    }else{
      wrap.appendChild(gbtn(t('thief.btn'),'#b0b0b0',()=>{S={...S,sub:'thief_pick'};render();}));
    }
    return wrap;
  }

  // ── Magician ──
  if(charId===3){
    if(me.magicianUsed){
      wrap.appendChild(el('div',{class:'state-info'},t('magician.used')));
    }else{
      const r=el('div',{class:'spec-row-actions'});
      r.appendChild(gbtn(t('magician.swap_btn'),'#9b6fff',()=>{S={...S,sub:'mag_swap'};render();}));
      r.appendChild(gbtn(t('magician.discard_btn'),'#9b6fff',()=>{S={...S,sub:'mag_discard',selCards:[]};render();}));
      wrap.appendChild(r);
    }
    return wrap;
  }

  // ── King ──
  if(charId===4){
    const yellows=me.city.filter(d=>d.color==='yellow').length;
    const txt=yellows>0?t('king.note_with_gold',{n:yellows}):t('king.note_no_gold');
    wrap.appendChild(el('div',{class:'action-king-note'},txt));return wrap;
  }

  // ── Patrician ──
  if(charId===12){
    const yellows=me.city.filter(d=>d.color==='yellow').length;
    const txt=yellows>0?t('patrician.note_with_cards',{n:yellows}):t('patrician.note_no_cards');
    wrap.appendChild(el('div',{class:'action-king-note'},txt));return wrap;
  }

  // ── Bishop ──
  if(charId===5){wrap.appendChild(el('div',{class:'action-bishop-note'},t('bishop.note',{n:me.city.filter(d=>d.color==='blue').length})));return wrap;}

  // ── Abbot ──
  if(charId===13){wrap.appendChild(el('div',{class:'action-bishop-note'},t('abbot.note',{n:me.city.filter(d=>d.color==='blue').length})));return wrap;}

  // ── Merchant ──
  if(charId===6){wrap.appendChild(el('div',{class:'action-bishop-note'},t('merchant.note')));return wrap;}

  // ── Architect ──
  if(charId===7){
    wrap.appendChild(el('div',{class:'action-bishop-note'},t('architect.note')));
    return wrap;
  }

  // ── Scholar ──
  if(charId===14){
    wrap.appendChild(el('div',{class:'action-bishop-note'},t('scholar.note')));
    return wrap;
  }

  // ── Queen ──
  if(charId===9){
    wrap.appendChild(el('div',{class:'action-bishop-note'},t('queen.note')));return wrap;
  }

  // ── Navigator ──
  if(charId===10){
    wrap.appendChild(el('div',{class:'state-info',style:'color:var(--c-blue-txt)'},t('navigator.note_short')));return wrap;
  }

  // ── Wizard ──
  if(charId===11&&S.sub==='choose'){
    if(me.wizardUsed){
      wrap.appendChild(el('div',{class:'state-info'},t('wizard.used')));
    }else if(!S.wizardTargetId){
      const others=S.players.filter(p=>p.id!==0&&p.hand.length>0);
      if(!others.length){
        wrap.appendChild(el('div',{class:'state-info'},t('wizard.no_opponents')));
      }else{
        wrap.appendChild(el('div',{class:'action-wiz-prompt'},t('wizard.choose_target')));
        const r=el('div',{class:'spec-row-bare'});
        others.forEach(p=>r.appendChild(gbtn(t('wizard.player_cards',{name:p.name,n:p.hand.length}),'#9b6fff',()=>{{const _nr=humanWizardTarget(S,p.id);if(_nr)S=_nr;render();}})));
        wrap.appendChild(r);
      }
    }
    return wrap;
  }

  // ── Seer ──
  if(charId===15){
    if(me.seerUsed){
      wrap.appendChild(el('div',{class:'state-info'},t('seer.used')));
    }else{
      const opps=S.players.filter(p=>p.id!==0&&p.hand.length>0);
      if(!opps.length){
        wrap.appendChild(el('div',{class:'state-info'},t('wizard.no_opponents')));
      }else{
        wrap.appendChild(gbtn(t('seer.btn',{n:opps.length}),
          '#9b6fff',()=>{{const _nr=humanSeer(S);if(_nr)S=_nr;render();};},'font-size:12px;padding:8px 14px;font-family:Cinzel,serif'));
        wrap.appendChild(el('div',{class:'action-seer-note'},
          t('seer.note',{n:opps.length})));
      }
    }
    return wrap;
  }

  // ── Trader ──
  if(charId===16){
    const greens=me.city.filter(d=>d.color==='green').length;
    const txt=greens>0?t('trader.note_with_gold',{n:greens}):t('trader.note_no_gold');
    wrap.appendChild(el('div',{class:'action-green-note'},txt));
    return wrap;
  }

  // ── Warlord ──
  if(charId===8){
    if(S.sub==='warlord_pick'){
      wrap.appendChild(el('div',{class:'action-warlord-prompt'},t('warlord.choose')));
      const targets=[];
      S.players.forEach(p=>{if(p.id===me.id)return;if(p.char===5&&!p.dead)return;if(p.city.length>=8)return;
        const wall=p.city.some(w=>w.id==='great_wall');
        p.city.forEach(d=>{if(d.id==='keep')return;const c1=wall?d.cost:Math.max(0,d.cost-1);
          if(c1<=me.gold)targets.push({pid:p.id,pname:p.name,d,c1,wall});});});
      const r=el('div',{class:'spec-row-sm'});
      if(!targets.length)r.appendChild(el('span',{class:'action-warlord-no-targets'},t('warlord.no_targets')));
      targets.forEach(tgt=>r.appendChild(gbtn(`${DEMOJI[tgt.d.id]||'🏛'} ${tgt.pname}: ${dn(tgt.d)} (${tgt.c1}✦${tgt.wall?' 🧱':''})`, '#d45a5a',()=>{{const _nr=humanWarlord(S,tgt.pid,tgt.d.uid);if(_nr)S=_nr;render();};})));
      r.appendChild(gbtn(t('btn.cancel'),'#555',()=>{S={...S,sub:'choose'};render();}));
      wrap.appendChild(r);
    }else if(S.pendingDestroy){
      const pd=S.pendingDestroy;
      const box=el('div',{class:'action-pending-box'});
      box.appendChild(el('span',{class:'action-pending-icon'},'💥'));
      const info=el('div',{class:'action-pending-info'});
      info.appendChild(el('div',{class:'action-pending-label-red'},t('warlord.destroyed')));
      info.appendChild(el('div',{class:'action-pending-target'},t('warlord.destroyed_detail',{pname:pd.tpName,dname:dn(pd.distObj||pd),cost:pd.cost})));
      box.appendChild(info);
      box.appendChild(gbtn(t('btn.undo'),'#886',()=>{
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
      wrap.appendChild(gbtn(t('warlord.btn'),'#d45a5a',()=>{S={...S,sub:'warlord_pick'};render();}));
    }
    return wrap;
  }

  return wrap;
}

function renderGameOver(){
  const fp=S.firstCompleter;
  const scores=S.players.map(p=>({p,score:calcScore(p,fp===p.id)})).sort((a,b)=>b.score-a.score);
  const maxScore=scores[0]?scores[0].score:1;
  const wrap=el('div',{class:'gameover-wrap'});
  const box=el('div',{class:'gameover-box'});
  box.append(el('div',{class:'gameover-title'},t('gameover.title')),
             el('div',{class:'gameover-subtitle'},t('gameover.subtitle',{n:S.round})));
  // Winner portrait/avatar
  var winner=scores[0]?scores[0].p:null;
  if(winner){
    var winAvatar=typeof getAvatar==='function'?getAvatar(winner.id):'🏆';
    var winAvatarEl=el('div',{class:'gameover-winner-emoji'},winAvatar);
    box.appendChild(winAvatarEl);
  }
  scores.forEach((sc,i)=>{
    const medals=['🥇','🥈','🥉','🏅'];
    const row=el('div',{class:'gameover-row'+(i===0?' first':'')});
    const info=el('div',{class:'gameover-row-info'});
    var avatar=typeof getAvatar==='function'?getAvatar(sc.p.id):'';
    info.append(el('div',{class:'gameover-name'},(avatar?avatar+' ':'')+sc.p.name),
                el('div',{class:'gameover-districts'},t('gameover.districts',{n:sc.p.city.length})));
    // Score bar
    var scorePct=maxScore>0?Math.round(sc.score/maxScore*100):0;
    var barWrap=el('div',{class:'gameover-score-bar'});
    var barFill=el('div',{class:'gameover-score-fill'});
    barFill.style.setProperty('--score-pct',scorePct+'%');
    barFill.style.animationDelay=(i*0.1)+'s';
    barWrap.appendChild(barFill);
    info.appendChild(barWrap);
    if(sc.p.city.some(d=>d.color==='purple')){
      const purps=el('div',{class:'gameover-purps'});
      sc.p.city.filter(d=>d.color==='purple').forEach(d=>{
        purps.appendChild(el('span',{class:'gameover-purp-badge'},`${DEMOJI[d.id]||'✨'} ${dn(d)}`));
      });info.appendChild(purps);}
    row.append(el('span',{class:'gameover-medal'},medals[i]||`${i+1}`),info,
               el('span',{class:'gameover-score'},`${sc.score}✦`));
    box.appendChild(row);
  });
  box.appendChild(gbtn(t('gameover.play_again'),'#d4a843',()=>{S=runAIDraft(newGame());render();},'width:100%;margin-top:18px;padding:12px;font-family:Cinzel,serif;font-size:14px'));
  wrap.appendChild(box);return wrap;
}
