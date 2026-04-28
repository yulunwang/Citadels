// ═══════════════════════════════════════════════════════════════════════════════
// LOBBY — Home screen, room creation, join flow
// ═══════════════════════════════════════════════════════════════════════════════

var LS={screen:'home',hostSlots:null,hostName:'',joinName:'',joinCode:'',error:null,
  soloNumAI:3,soloCharPreset:'standard',soloCharSet:[1,2,3,4,5,6,7,8],
  hostCharPreset:'standard',hostCharSet:[1,2,3,4,5,6,7,8],
  charExpanded:false,myAvatar:'🦊',hostStep:1};

function lobbyError(msg){
  NET.mode='solo';try{NET.peer?.destroy();}catch(e){}NET.peer=null;NET.hostConn=null;NET.conns={};
  LS.error=msg;renderLobby(LS);
}

function autoPreset(n){
  if(n<=4)return 'standard';
  return 'extended';
}

// ── CHARACTER TOOLTIP ──────────────────────────────────────────────────────────
function _ensureCharTooltip(){
  var tip=document.getElementById('char-tooltip');
  if(!tip){
    tip=document.createElement('div');
    tip.id='char-tooltip';
    tip.className='char-tooltip';
    document.body.appendChild(tip);
  }
  return tip;
}
function showCharTooltip(ch,triggerEl){
  var tip=_ensureCharTooltip();
  tip.innerHTML='';

  // Header row: emoji + name + rank
  var hdr=document.createElement('div');
  hdr.className='char-tooltip-hdr';
  hdr.style.borderBottomColor=ch.clr+'44';
  var emo=document.createElement('span');
  emo.className='char-tooltip-emoji';emo.textContent=ch.emoji;
  var nameBlock=document.createElement('div');
  nameBlock.className='char-tooltip-nameblock';
  var nm=document.createElement('div');
  nm.className='char-tooltip-name';nm.style.color=ch.clr;nm.textContent=cn(ch.id);
  var rankEl=document.createElement('div');
  rankEl.className='char-tooltip-rank';
  rankEl.textContent=t('lobby.char.rank',{n:ch.rank});
  nameBlock.append(nm,rankEl);hdr.append(emo,nameBlock);tip.appendChild(hdr);

  // Ability text
  var ab=document.createElement('div');
  ab.className='char-tooltip-ability';ab.textContent=ca(ch.id);tip.appendChild(ab);

  // Alternatives note (other chars at same rank)
  var alts=CHARS.filter(q=>q.rank===ch.rank&&q.id!==ch.id);
  if(alts.length){
    var altRow=document.createElement('div');
    altRow.className='char-tooltip-alts';
    altRow.textContent=t('lobby.char.replaces',{names:alts.map(q=>q.emoji+' '+cn(q.id)).join(', ')});
    tip.appendChild(altRow);
  }

  // Position: below button, clamped to viewport
  tip.style.display='block';
  var rect=triggerEl.getBoundingClientRect();
  var tw=tip.offsetWidth||270;var th=tip.offsetHeight||130;
  var vw=window.innerWidth;var vh=window.innerHeight;
  var left=rect.left;var top=rect.bottom+8;
  if(top+th>vh-10)top=rect.top-th-8;
  if(left+tw>vw-10)left=vw-tw-10;
  if(left<10)left=10;
  tip.style.left=left+'px';tip.style.top=top+'px';
  tip.style.borderColor=ch.clr+'66';
}
function hideCharTooltip(){
  const tip=document.getElementById('char-tooltip');
  if(tip)tip.style.display='none';
}
function renderAvatarPicker(){
  const wrap=el('div',{class:'avatar-picker'});
  wrap.appendChild(el('div',{class:'lobby-label'},t('lobby.avatar.label')));
  const row=el('div',{class:'avatar-grid'});
  AVATAR_POOL.forEach(a=>{
    const btn=el('button',{class:`avatar-btn${LS.myAvatar===a?' active':''}`},a);
    btn.onclick=()=>{LS.myAvatar=a;renderLobby({});};
    row.appendChild(btn);
  });
  wrap.appendChild(row);
  return wrap;
}

function renderCharSelect(mode){
  const wrap=el('div',null);
  const charSet=mode==='solo'?LS.soloCharSet:LS.hostCharSet;
  const setCharSet=(newSet)=>{
    if(mode==='solo'){LS.soloCharSet=newSet;LS.soloCharPreset='custom';}
    else{LS.hostCharSet=newSet;LS.hostCharPreset='custom';}
    LS.charExpanded=true;
    renderLobby({});
  };

  wrap.appendChild(el('div',{class:'charsel-label'},t('lobby.chars.label')));

  // Quick preset buttons
  const presetRow=el('div',{class:'charsel-preset-row'});
  const presets=[
    {label:'Standard',chars:[1,2,3,4,5,6,7,8]},
    {label:'+ Queen',  chars:[1,2,3,4,5,6,7,8,9]},
    {label:'Expanded', chars:[1,2,11,12,13,6,14,8,9]},
    {label:'Full Mix', chars:[1,2,15,12,13,16,10,8,9]},
  ];
  presets.forEach(opt=>{
    const active=JSON.stringify(charSet.slice().sort((a,b)=>a-b))===JSON.stringify(opt.chars.slice().sort((a,b)=>a-b));
    presetRow.appendChild(gbtn(opt.label,active?'#d4a843':'#555',()=>{
      if(mode==='solo'){LS.soloCharSet=[...opt.chars];LS.soloCharPreset=opt.label;}
      else{LS.hostCharSet=[...opt.chars];LS.hostCharPreset=opt.label;}
      LS.charExpanded=false;
      renderLobby({});
    },'font-size:11px;padding:5px 10px'));
  });
  wrap.appendChild(presetRow);

  // Summary: show selected characters as emoji strip
  const summaryRow=el('div',{class:'charsel-summary'});
  charSet.slice().sort((a,b)=>{
    const ra=CHARS.find(c=>c.id===a)?.rank||99;
    const rb=CHARS.find(c=>c.id===b)?.rank||99;
    return ra-rb;
  }).forEach(id=>{
    const ch=CHARS.find(c=>c.id===id);
    if(ch){
      const chip=el('span',{class:'charsel-chip',style:`--char-clr:${ch.clr}`},ch.emoji);
      chip.onmouseenter=()=>showCharTooltip(ch,chip);
      chip.onmouseleave=()=>hideCharTooltip();
      chip.onfocus=()=>showCharTooltip(ch,chip);
      chip.onblur=()=>hideCharTooltip();
      summaryRow.appendChild(chip);
    }
  });
  // Customize toggle
  const toggleBtn=el('button',{class:'charsel-toggle'},LS.charExpanded?t('lobby.charsel.less'):t('lobby.charsel.customize'));
  toggleBtn.onclick=()=>{LS.charExpanded=!LS.charExpanded;renderLobby({});};
  summaryRow.appendChild(toggleBtn);
  wrap.appendChild(summaryRow);

  // Per-rank detail — collapsible
  if(LS.charExpanded){
    const detail=el('div',{class:'charsel-detail'});
    const ranks=[1,2,3,4,5,6,7,8];
    ranks.forEach(r=>{
      const charsAtRank=CHARS.filter(c=>c.rank===r);
      const selected=charSet.find(id=>CHARS.find(c=>c.id===id)?.rank===r);
      const row=el('div',{class:'charsel-rank-row'});
      row.appendChild(el('span',{class:'charsel-rank-lbl'},t('lobby.char.rank_lbl',{n:r})));
      charsAtRank.forEach(ch=>{
        const active=selected===ch.id;
        const btn=el('button',{class:`charsel-btn${active?' active':''}`,style:`--char-clr:${ch.clr}`},`${ch.emoji} ${cn(ch.id)}${ch.id>=9?' ✦':''}`);
        btn.onclick=()=>{
          const newSet=charSet.filter(id=>CHARS.find(c=>c.id===id)?.rank!==r);
          setCharSet([...newSet,ch.id]);
        };
        btn.onmouseenter=()=>showCharTooltip(ch,btn);
        btn.onmouseleave=()=>hideCharTooltip();
        btn.onfocus=()=>showCharTooltip(ch,btn);
        btn.onblur=()=>hideCharTooltip();
        row.appendChild(btn);
      });
      detail.appendChild(row);
    });

    // Rank 9 toggle (optional)
    const has9=charSet.some(id=>CHARS.find(c=>c.id===id)?.rank===9);
    const rank9chars=CHARS.filter(c=>c.rank===9);
    const r9row=el('div',{class:'charsel-rank-row'});
    r9row.appendChild(el('span',{class:'charsel-rank-lbl'},t('lobby.char.rank_lbl',{n:9})));
    const noBtn=el('button',{class:`charsel-btn${!has9?' active':''}`,style:'--char-clr:var(--text-muted)'},t('btn.none'));
    noBtn.onclick=()=>setCharSet(charSet.filter(id=>CHARS.find(c=>c.id===id)?.rank!==9));
    r9row.appendChild(noBtn);
    rank9chars.forEach(ch=>{
      const active=has9&&charSet.includes(ch.id);
      const btn=el('button',{class:`charsel-btn${active?' active':''}`,style:`--char-clr:${ch.clr}`},`${ch.emoji} ${cn(ch.id)} ✦`);
      btn.onclick=()=>{
        const newSet=charSet.filter(id=>CHARS.find(c=>c.id===id)?.rank!==9);
        setCharSet([...newSet,ch.id]);
      };
      btn.onmouseenter=()=>showCharTooltip(ch,btn);
      btn.onmouseleave=()=>hideCharTooltip();
      r9row.appendChild(btn);
    });
    detail.appendChild(r9row);
    wrap.appendChild(detail);
  }

  return wrap;
}

function renderLobby(opts){
  LS={...LS,...opts};
  hideCharTooltip();
  const app=document.getElementById('app');app.innerHTML='';
  // page is exactly 100vh and scrolls internally — inner wrapper provides flex-centering for short content
  const page=el('div',{class:'lobby-page'});
  if(typeof IMG !== 'undefined') {
    page.style.backgroundImage = 'url(' + IMG.bg.lobby + ')';
    page.style.backgroundSize = 'cover';
  }
  const inner=el('div',{class:'lobby-inner'});
  const box=el('div',{class:'lobby-box'});

  // Language toggle — fixed top-right
  page.appendChild(mkLangToggle('lobby-lang-toggle'));

  box.appendChild(el('div',{class:'lobby-title'},t('lobby.title')));
  box.appendChild(el('div',{class:'lobby-subtitle'},t('lobby.subtitle')));

  if(LS.error){
    box.appendChild(el('div',{class:'lobby-error'},'⚠ '+LS.error));
    const clrBtn=gbtn(t('btn.dismiss'),'#886',()=>{LS.error=null;renderLobby({});});
    clrBtn.style.display='block';clrBtn.style.margin='0 auto 8px';box.appendChild(clrBtn);
  }

  if(LS.screen==='home'){
    box.appendChild(el('div',{class:'lobby-section-title-sm'},t('lobby.how_to_play')));
    const grid=el('div',{class:'lobby-mode-grid'});
    [
      {icon:'🤖',title:t('lobby.mode.solo.title'),desc:t('lobby.mode.solo.desc'),fn:()=>{LS.screen='solo_config';renderLobby({});}},
      {icon:'🏠',title:t('lobby.mode.host.title'),desc:t('lobby.mode.host.desc'),fn:()=>{LS.screen='host_config';renderLobby({});}},
      {icon:'🚪',title:t('lobby.mode.join.title'),desc:t('lobby.mode.join.desc'),fn:()=>{LS.screen='join';renderLobby({});}},
    ].forEach(m=>{
      const c=el('div',{class:'lobby-mode-card animate-in'});
      c.appendChild(el('div',{class:'lobby-mode-icon'},m.icon));
      const txt=el('div',{class:'lobby-mode-text'});
      txt.appendChild(el('div',{class:'lobby-mode-title'},m.title));
      txt.appendChild(el('div',{class:'lobby-mode-desc'},m.desc));
      c.appendChild(txt);
      c.onclick=m.fn;grid.appendChild(c);
    });
    box.appendChild(grid);
  }

  else if(LS.screen==='solo_config'){
    box.appendChild(el('div',{class:'lobby-section-title'},t('lobby.solo.title')));
    box.appendChild(renderAvatarPicker());
    box.appendChild(el('div',{class:'lobby-label'},t('lobby.solo.ai_count')));
    const cntRow=el('div',{class:'lobby-cnt-row'});
    const decBtn=gbtn('−','#555',()=>{if(LS.soloNumAI>1){LS.soloNumAI--;const p=autoPreset(1+LS.soloNumAI);LS.soloCharPreset=p;LS.soloCharSet=[...(CHAR_PRESETS[1+LS.soloNumAI]||[1,2,3,4,5,6,7,8])];renderLobby({});}},'width:30px;height:30px;text-align:center;padding:0;font-size:16px;border-radius:50%;min-height:auto');
    const cntLabel=el('div',{class:'lobby-cnt-label'},t('lobby.solo.ai_label',{n:LS.soloNumAI}));
    const incBtn=gbtn('+','#555',()=>{if(LS.soloNumAI<6){LS.soloNumAI++;const p=autoPreset(1+LS.soloNumAI);LS.soloCharPreset=p;LS.soloCharSet=[...(CHAR_PRESETS[1+LS.soloNumAI]||[1,2,3,4,5,6,7,8])];renderLobby({});}},'width:30px;height:30px;text-align:center;padding:0;font-size:16px;border-radius:50%;min-height:auto');
    cntRow.append(decBtn,cntLabel,incBtn);box.appendChild(cntRow);
    box.appendChild(renderCharSelect('solo'));
    const br=el('div',{class:'lobby-btn-row'});
    br.appendChild(gbtn(t('lobby.solo.back'),'#555',()=>{LS.screen='home';renderLobby({});}));
    br.appendChild(gbtn(t('lobby.solo.start'),'#4db87a',()=>{
      PLAYER_AVATARS={};PLAYER_AVATARS[0]=LS.myAvatar||'🦊';
      NET.mode='solo';S=runAIDraft(newGame({numAI:LS.soloNumAI,charPool:LS.soloCharSet}));assignAvatars(S.players);render();
    },'flex:1;padding:10px;font-family:Cinzel,serif;font-size:13px;text-align:center'));
    box.appendChild(br);
  }

  else if(LS.screen==='host_config'){
    if(!LS.hostSlots)LS.hostSlots=[
      {slot:0,name:'Host',ai:false,locked:true},
      {slot:1,name:'Lady Mira',ai:true},
      {slot:2,name:'Duke Arven',ai:true},
      {slot:3,name:'Baron Selt',ai:true},
    ];

    if(LS.hostStep===1){
      // Step 1: Players
      box.appendChild(el('div',{class:'lobby-section-title'},t('lobby.host.players.title')));
      box.appendChild(renderAvatarPicker());

      const hnRow=el('div',{class:'mb-lg'});
      hnRow.appendChild(el('div',{class:'lobby-label-sm'},t('lobby.host.name_label')));
      const hnIn=document.createElement('input');
      hnIn.value=LS.hostName||'';hnIn.placeholder='Your display name (e.g. Alex)';
      hnIn.className='lobby-input';
      hnRow.appendChild(hnIn);box.appendChild(hnRow);

      box.appendChild(el('div',{class:'lobby-label'},t('lobby.host.slots.label')));
      box.appendChild(el('div',{class:'lobby-hint'},t('lobby.host.slots.hint')));
      const AI_NAMES=['Lady Mira','Duke Arven','Baron Selt','Countess Vael','Lord Draven','Dame Isolde'];
      const slotHdr=el('div',{class:'lobby-slot-hdr'});
      slotHdr.appendChild(el('span',{class:'lobby-slot-count'},t('lobby.host.slots.count',{n:LS.hostSlots.length})));
      slotHdr.appendChild(gbtn(t('lobby.host.slots.remove'),'#555',()=>{if(LS.hostSlots.length>2){LS.hostSlots=LS.hostSlots.slice(0,-1);renderLobby({});}},'font-size:11px;padding:4px 10px'));
      slotHdr.appendChild(gbtn(t('lobby.host.slots.add'),'#5a9fd4',()=>{if(LS.hostSlots.length<7){const i=LS.hostSlots.length;LS.hostSlots.push({slot:i,name:AI_NAMES[i-1]||'AI '+(i+1),ai:true});renderLobby({});}},'font-size:11px;padding:4px 10px'));
      box.appendChild(slotHdr);
      const slotList=el('div',{class:'lobby-slot-list'});
      let hostNameEl=null;
      LS.hostSlots.forEach((sl,i)=>{
        const row=el('div',{class:'lobby-slot-row'});
        row.appendChild(el('span',{class:'lobby-slot-icon'},sl.locked?LS.myAvatar:sl.ai?'🤖':'👥'));
        if(sl.locked){
          const nameEl=el('span',{class:'lobby-slot-name'});
          nameEl.textContent=LS.hostSlots[0].name||'Host';
          hostNameEl=nameEl;
          row.appendChild(nameEl);
          row.appendChild(el('span',{class:'lobby-slot-tag'},t('lobby.host.slot.you')));
        }else if(sl.ai){
          const ni=document.createElement('input');
          ni.value=sl.name;ni.placeholder='AI name';
          ni.className='lobby-ai-input';
          ni.oninput=()=>{LS.hostSlots[i].name=ni.value;};
          row.appendChild(ni);
          const tb=gbtn('🤖 AI','#6a5a8a',()=>{LS.hostSlots[i].ai=false;renderLobby({});},'min-width:70px;text-align:center;font-size:11px');  // AI label kept short intentionally
          row.appendChild(tb);
        }else{
          const nameEl=el('span',{class:'lobby-slot-name-wait'},t('lobby.players.slot_waiting'));
          row.appendChild(nameEl);
          const tb=gbtn('👥 Human','#4db87a',()=>{LS.hostSlots[i].ai=true;LS.hostSlots[i].name=['Lady Mira','Duke Arven','Baron Selt','Countess Vael','Lord Draven','Dame Isolde'][i-1]||'AI '+(i+1);renderLobby({});},'min-width:70px;text-align:center;font-size:11px');
          row.appendChild(tb);
        }
        slotList.appendChild(row);
      });
      hnIn.oninput=()=>{
        LS.hostName=hnIn.value;
        LS.hostSlots[0].name=hnIn.value.trim()||'Host';
        if(hostNameEl)hostNameEl.textContent=LS.hostSlots[0].name;
      };
      box.appendChild(slotList);
      const br=el('div',{class:'lobby-btn-row-sm'});
      br.appendChild(gbtn(t('lobby.host.back'),'#555',()=>{LS.screen='home';LS.hostSlots=null;LS.hostStep=1;renderLobby({});}));
      br.appendChild(gbtn(t('lobby.host.chars_nav'),'#d4a843',()=>{LS.hostStep=2;renderLobby({});},'flex:1;padding:10px;font-family:Cinzel,serif;font-size:13px;text-align:center'));
      box.appendChild(br);
    }else{
      // Step 2: Characters
      box.appendChild(el('div',{class:'lobby-section-title'},t('lobby.host.chars.title')));
      box.appendChild(renderCharSelect('host'));
      const br=el('div',{class:'lobby-btn-row-sm'});
      br.appendChild(gbtn(t('lobby.host.chars.back'),'#555',()=>{LS.hostStep=1;renderLobby({});}));
      br.appendChild(gbtn(t('lobby.host.chars.create'),'#d4a843',()=>{
        const slots=LS.hostSlots.map(sl=>({...sl,name:sl.slot===0?(LS.hostName.trim()||'Host'):sl.name}));
        const allAI=slots.every(sl=>sl.ai||sl.slot===0);
        if(allAI){
          PLAYER_AVATARS={};PLAYER_AVATARS[0]=LS.myAvatar||'🦊';
          NET.mode='solo';
          S=runAIDraft(buildGameFromConfig(slots,LS.hostCharSet));assignAvatars(S.players);
          render();
        }else{
          hostRoom(slots);
        }
      },'flex:1;padding:10px;font-family:Cinzel,serif;font-size:13px;text-align:center'));
      box.appendChild(br);
    }
  }

  else if(LS.screen==='hosting'){
    box.appendChild(el('div',{class:'lobby-section-title'},t('lobby.hosting.title')));

    const cCard=el('div',{class:'lobby-code-card'});
    cCard.appendChild(el('div',{class:'lobby-code-lbl'},t('lobby.hosting.code_label')));
    cCard.appendChild(el('div',{class:'lobby-code-val'},NET.roomId));

    const shareBox=el('div',{class:'lobby-share-box'});
    shareBox.innerHTML=`<span class="lobby-share-key">${t('lobby.hosting.how_friends')}</span><br>`
      +'1. Open the game at the same URL in their browser<br>'
      +'2. Click <strong>Join Room</strong><br>'
      +`3. Type the code <strong class="lobby-share-code">${NET.roomId}</strong> and their name`;
    cCard.appendChild(shareBox);

    const copyBtn=gbtn(t('lobby.hosting.copy'),'#5a9fd4',()=>{
      const url=window.location.href.split('?')[0];
      const txt=`Join my Citadels game!\n1. Open ${url} in your browser\n2. Click "Join Room"\n3. Enter code: ${NET.roomId}\n4. Enter your name and join!`;
      navigator.clipboard.writeText(txt).then(()=>{copyBtn.textContent=t('lobby.hosting.copied');setTimeout(()=>copyBtn.textContent=t('lobby.hosting.copy'),2000);}).catch(()=>{copyBtn.textContent=t('lobby.hosting.copy_fail');});
    },'width:100%;margin-top:10px;padding:8px;font-size:11px;text-align:center');
    cCard.appendChild(copyBtn);
    box.appendChild(cCard);

    box.appendChild(el('div',{class:'lobby-order-label'},t('lobby.hosting.order_label')));
    box.appendChild(el('div',{class:'lobby-order-hint'},t('lobby.hosting.order_hint')));
    const sl2=el('div',{class:'lobby-order-list'});
    NET.slots.forEach((sl,i)=>{
      const isHost=sl.slot===0;
      const isConnectedPeer=!!sl.peerId;
      const icon=isHost?'👤':isConnectedPeer?'🟢':sl.ai?'🤖':'⏳';
      const isActive=isHost||isConnectedPeer;
      const statusText=isHost?t('lobby.hosting.status.host'):isConnectedPeer?t('lobby.hosting.status.connected'):sl.ai?t('lobby.hosting.status.ai'):t('lobby.hosting.status.waiting');
      const displayName=isHost?sl.name:isConnectedPeer?sl.name:sl.ai?sl.name:'(open slot)';
      const statusColor=isActive?'var(--c-green-txt)':sl.ai?'var(--text-muted)':'var(--text-muted)';
      const borderCls=isActive?'border-color:var(--c-green-bdr)':'';

      const row=el('div',{class:`lobby-order-row${isActive?' active':''}` });
      row.appendChild(el('span',{class:'lobby-order-num'},`${i+1}.`));
      row.appendChild(el('span',{class:'lobby-order-icon'},icon));
      const nameSpan=el('span',{class:'lobby-slot-name flex-1'});
      nameSpan.textContent=displayName;
      row.appendChild(nameSpan);
      row.appendChild(el('span',{style:`font-size:10px;color:${statusColor}`},statusText));
      const upBtn=el('button',{class:'lobby-order-updown'},'↑');
      const dnBtn=el('button',{class:'lobby-order-updown'},'↓');
      upBtn.disabled=i===0;dnBtn.disabled=i===NET.slots.length-1;
      upBtn.style.opacity=i===0?'0.3':'1';dnBtn.style.opacity=i===NET.slots.length-1?'0.3':'1';
      upBtn.onclick=()=>{
        const tmp=NET.slots[i];NET.slots[i]=NET.slots[i-1];NET.slots[i-1]=tmp;
        broadcastAll({type:'slots',slots:NET.slots});renderLobby({screen:'hosting'});
      };
      dnBtn.onclick=()=>{
        const tmp=NET.slots[i];NET.slots[i]=NET.slots[i+1];NET.slots[i+1]=tmp;
        broadcastAll({type:'slots',slots:NET.slots});renderLobby({screen:'hosting'});
      };
      row.append(upBtn,dnBtn);
      sl2.appendChild(row);
    });
    box.appendChild(sl2);

    const br=el('div',{class:'lobby-btn-row-sm'});
    br.appendChild(gbtn(t('lobby.hosting.cancel'),'#555',()=>{try{NET.peer?.destroy();}catch(e){}NET.peer=null;NET.mode='solo';LS.screen='home';LS.hostSlots=null;renderLobby({});}));
    br.appendChild(gbtn(t('lobby.hosting.start'),'#4db87a',()=>{
      NET.slots.forEach(sl=>{if(!sl.ai&&sl.slot!==0&&!sl.peerId){sl.ai=true;}});
      S=buildGameFromConfig(NET.slots,LS.hostCharSet);S=runAIDraft(S);broadcastState();render();
      if(NET.mode==='host')broadcastState();
    },'flex:1;padding:11px;font-family:Cinzel,serif;font-size:14px;text-align:center'));
    box.appendChild(br);
    box.appendChild(el('div',{class:'lobby-hint-sm'},t('lobby.hosting.unfilled')));
  }

  else if(LS.screen==='join'){
    box.appendChild(el('div',{class:'lobby-section-title'},t('lobby.join.title')));
    box.appendChild(renderAvatarPicker());
    const nRow=el('div',{class:'mb-md'});
    nRow.appendChild(el('div',{class:'lobby-label-sm'},t('lobby.join.name_label')));
    const nIn=document.createElement('input');nIn.value=LS.joinName;nIn.placeholder='Your display name';
    nIn.className='lobby-input';
    nIn.oninput=()=>LS.joinName=nIn.value;nRow.appendChild(nIn);box.appendChild(nRow);
    const cRow=el('div',{class:'mb-xl'});
    cRow.appendChild(el('div',{class:'lobby-label-sm'},t('lobby.join.code_label')));
    const cIn=document.createElement('input');cIn.value=LS.joinCode;cIn.placeholder='XXXXXX';cIn.maxLength=6;
    cIn.className='lobby-input-code';
    cIn.oninput=()=>LS.joinCode=cIn.value.toUpperCase();cRow.appendChild(cIn);box.appendChild(cRow);
    const br=el('div',{class:'lobby-btn-row-sm'});
    br.appendChild(gbtn(t('lobby.join.back'),'#555',()=>{LS.screen='home';renderLobby({});}));
    br.appendChild(gbtn(t('lobby.join.join'),'#4db87a',()=>{
      const name=(LS.joinName||'').trim()||'Guest';
      const code=(LS.joinCode||'').trim();
      if(code.length<4){LS.error=t('lobby.join.invalid_code');renderLobby({});return;}
      joinRoom(code,name);
    },'flex:1;padding:10px;font-family:Cinzel,serif;font-size:13px;text-align:center'));
    box.appendChild(br);
  }

  else if(LS.screen==='connecting'||LS.screen==='waiting'){
    box.appendChild(el('div',{class:'lobby-connect-icon'},'⏳'));
    box.appendChild(el('div',{class:'lobby-connect-title'},
      LS.screen==='connecting'?t('lobby.connect.connecting'):t('lobby.connect.waiting')));
    box.appendChild(el('div',{class:'lobby-connect-desc'},
      LS.screen==='connecting'?t('lobby.connect.joining_room',{code:NET.roomId}):t('lobby.connect.in_room')));
    if(NET.slots&&NET.slots.length){
      box.appendChild(el('div',{class:'lobby-players-label'},t('lobby.connect.players_label')));
      const slList=el('div',{class:'lobby-players-list'});
      NET.slots.forEach(sl=>{
        const isMe=NET.peer&&sl.peerId===NET.peer.id;
        const row=el('div',{class:'lobby-peer-row'+(isMe?' me':'')});
        const icon=sl.slot===0?'👤':sl.peerId?'🟢':sl.ai?'🤖':'⏳';
        row.appendChild(el('span',{class:'lobby-peer-icon'},icon));
        const nameEl=el('span',{class:'lobby-peer-name'+(isMe?' me-name':'')});
        nameEl.textContent=(sl.peerId||sl.slot===0)?sl.name:sl.ai?sl.name:t('lobby.connect.waiting');
        row.appendChild(nameEl);
        if(isMe)row.appendChild(el('span',{class:'lobby-peer-tag me-tag'},t('lobby.host.slot.you')));
        else if(sl.slot===0)row.appendChild(el('span',{class:'lobby-peer-tag'},t('lobby.players.peer_tag')));
        slList.appendChild(row);
      });
      box.appendChild(slList);
    }
    const lb=gbtn(t('lobby.connect.leave'),'#555',()=>{try{NET.peer?.destroy();}catch(e){}NET.peer=null;NET.mode='solo';LS.screen='home';renderLobby({});});
    lb.style.display='block';lb.style.margin='0 auto';box.appendChild(lb);
  }

  inner.appendChild(box);page.appendChild(inner);app.appendChild(page);
}
