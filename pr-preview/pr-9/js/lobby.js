// ═══════════════════════════════════════════════════════════════════════════════
// LOBBY — Home screen, room creation, join flow
// ═══════════════════════════════════════════════════════════════════════════════

var LS={screen:'home',hostSlots:null,hostName:'',joinName:'',joinCode:'',error:null,
  soloNumAI:3,soloCharPreset:'standard',soloCharSet:[1,2,3,4,5,6,7,8],
  hostCharPreset:'standard',hostCharSet:[1,2,3,4,5,6,7,8]};

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
  nm.className='char-tooltip-name';nm.style.color=ch.clr;nm.textContent=ch.name;
  var rankEl=document.createElement('div');
  rankEl.className='char-tooltip-rank';
  rankEl.textContent=`RANK ${ch.rank}`;
  nameBlock.append(nm,rankEl);hdr.append(emo,nameBlock);tip.appendChild(hdr);

  // Ability text
  var ab=document.createElement('div');
  ab.className='char-tooltip-ability';ab.textContent=ch.ability;tip.appendChild(ab);

  // Alternatives note (other chars at same rank)
  var alts=CHARS.filter(q=>q.rank===ch.rank&&q.id!==ch.id);
  if(alts.length){
    var altRow=document.createElement('div');
    altRow.className='char-tooltip-alts';
    altRow.textContent='Replaces: '+alts.map(q=>`${q.emoji} ${q.name}`).join(', ')+' at this rank';
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
function renderCharSelect(mode){
  const wrap=el('div',null);
  const charSet=mode==='solo'?LS.soloCharSet:LS.hostCharSet;
  const setCharSet=(newSet)=>{
    if(mode==='solo'){LS.soloCharSet=newSet;LS.soloCharPreset='custom';}
    else{LS.hostCharSet=newSet;LS.hostCharPreset='custom';}
    renderLobby({});
  };

  wrap.appendChild(el('div',{class:'charsel-label'},'CHARACTERS (one per rank)'));

  // Quick preset buttons
  const presetRow=el('div',{class:'charsel-preset-row'});
  [
    {label:'Standard',chars:[1,2,3,4,5,6,7,8]},
    {label:'+ Queen',  chars:[1,2,3,4,5,6,7,8,9]},
    {label:'Expanded', chars:[1,2,11,12,13,6,14,8,9]},
    {label:'Full Mix', chars:[1,2,15,12,13,16,10,8,9]},
  ].forEach(opt=>{
    const active=JSON.stringify(charSet.slice().sort((a,b)=>a-b))===JSON.stringify(opt.chars.slice().sort((a,b)=>a-b));
    presetRow.appendChild(gbtn(opt.label,active?'#d4a843':'#555',()=>{
      if(mode==='solo'){LS.soloCharSet=[...opt.chars];LS.soloCharPreset=opt.label;}
      else{LS.hostCharSet=[...opt.chars];LS.hostCharPreset=opt.label;}
      renderLobby({});
    },'font-size:11px;padding:5px 10px'));
  });
  wrap.appendChild(presetRow);

  // Per-rank radio groups (ranks 1-8)
  const ranks=[1,2,3,4,5,6,7,8];
  ranks.forEach(r=>{
    const charsAtRank=CHARS.filter(c=>c.rank===r);
    const selected=charSet.find(id=>CHARS.find(c=>c.id===id)?.rank===r);
    const row=el('div',{class:'charsel-rank-row'});
    row.appendChild(el('span',{class:'charsel-rank-lbl'},`Rank ${r}`));
    charsAtRank.forEach(ch=>{
      const active=selected===ch.id;
      const btn=el('button',{class:`charsel-btn${active?' active':''}`,style:`--char-clr:${ch.clr}`},`${ch.emoji} ${ch.name}${ch.id>=9?' ✦':''}`);
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
    wrap.appendChild(row);
  });

  // Rank 9 toggle (optional)
  const has9=charSet.some(id=>CHARS.find(c=>c.id===id)?.rank===9);
  const rank9chars=CHARS.filter(c=>c.rank===9);
  const r9row=el('div',{class:'charsel-rank-row'});
  r9row.appendChild(el('span',{class:'charsel-rank-lbl'},'Rank 9'));
  const noBtn=el('button',{class:`charsel-btn${!has9?' active':''}`,style:'--char-clr:var(--text-muted)'},'None');
  noBtn.onclick=()=>setCharSet(charSet.filter(id=>CHARS.find(c=>c.id===id)?.rank!==9));
  r9row.appendChild(noBtn);
  rank9chars.forEach(ch=>{
    const active=has9&&charSet.includes(ch.id);
    const btn=el('button',{class:`charsel-btn${active?' active':''}`,style:`--char-clr:${ch.clr}`},`${ch.emoji} ${ch.name} ✦`);
    btn.onclick=()=>{
      const newSet=charSet.filter(id=>CHARS.find(c=>c.id===id)?.rank!==9);
      setCharSet([...newSet,ch.id]);
    };
    btn.onmouseenter=()=>showCharTooltip(ch,btn);
    btn.onmouseleave=()=>hideCharTooltip();
    r9row.appendChild(btn);
  });
  wrap.appendChild(r9row);

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

  box.appendChild(el('div',{class:'lobby-title'},'⚜ Citadels'));
  box.appendChild(el('div',{class:'lobby-subtitle'},'The medieval city-building card game'));

  if(LS.error){
    box.appendChild(el('div',{class:'lobby-error'},'⚠ '+LS.error));
    const clrBtn=gbtn('✕ Dismiss','#886',()=>{LS.error=null;renderLobby({});});
    clrBtn.style.display='block';clrBtn.style.margin='0 auto 8px';box.appendChild(clrBtn);
  }

  if(LS.screen==='home'){
    box.appendChild(el('div',{class:'lobby-section-title-sm'},'How would you like to play?'));
    const grid=el('div',{class:'lobby-mode-grid'});
    [
      {icon:'🤖',title:'Solo',desc:'Configure your opponents and characters',fn:()=>{LS.screen='solo_config';renderLobby({});}},
      {icon:'🏠',title:'Host Room',desc:'Create a room and share the code with friends',fn:()=>{LS.screen='host_config';renderLobby({});}},
      {icon:'🚪',title:'Join Room',desc:"Enter a friend's room code to play together",fn:()=>{LS.screen='join';renderLobby({});}},
    ].forEach(m=>{
      const c=el('div',{class:'lobby-mode-card'});
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
    box.appendChild(el('div',{class:'lobby-section-title'},'🤖 Solo Game Setup'));
    box.appendChild(el('div',{class:'lobby-label'},'NUMBER OF OPPONENTS'));
    const cntRow=el('div',{class:'lobby-cnt-row'});
    const decBtn=gbtn('−','#555',()=>{if(LS.soloNumAI>1){LS.soloNumAI--;const p=autoPreset(1+LS.soloNumAI);LS.soloCharPreset=p;LS.soloCharSet=[...(CHAR_PRESETS[1+LS.soloNumAI]||[1,2,3,4,5,6,7,8])];renderLobby({});}},'width:36px;height:36px;text-align:center;padding:0;font-size:18px;border-radius:50%');
    const cntLabel=el('div',{class:'lobby-cnt-label'},`${LS.soloNumAI} AI opponent${LS.soloNumAI>1?'s':''}`);
    const incBtn=gbtn('+','#555',()=>{if(LS.soloNumAI<6){LS.soloNumAI++;const p=autoPreset(1+LS.soloNumAI);LS.soloCharPreset=p;LS.soloCharSet=[...(CHAR_PRESETS[1+LS.soloNumAI]||[1,2,3,4,5,6,7,8])];renderLobby({});}},'width:36px;height:36px;text-align:center;padding:0;font-size:18px;border-radius:50%');
    cntRow.append(decBtn,cntLabel,incBtn);box.appendChild(cntRow);
    box.appendChild(renderCharSelect('solo'));
    const br=el('div',{class:'lobby-btn-row'});
    br.appendChild(gbtn('← Back','#555',()=>{LS.screen='home';renderLobby({});}));
    br.appendChild(gbtn('▶ Start Game','#4db87a',()=>{
      NET.mode='solo';S=runAIDraft(newGame({numAI:LS.soloNumAI,charPool:LS.soloCharSet}));render();
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
    box.appendChild(el('div',{class:'lobby-section-title'},'🏠 Configure Room'));

    const hnRow=el('div',{style:'margin-bottom:16px'});
    hnRow.appendChild(el('div',{class:'lobby-label-sm'},'YOUR NAME'));
    const hnIn=document.createElement('input');
    hnIn.value=LS.hostName||'';hnIn.placeholder='Your display name (e.g. Alex)';
    hnIn.className='lobby-input';
    hnRow.appendChild(hnIn);box.appendChild(hnRow);

    box.appendChild(el('div',{class:'lobby-label'},'PLAYER SLOTS'));
    box.appendChild(el('div',{class:'lobby-hint'},'Set each slot to AI or Human. Human players join with the room code and choose their own name when they connect.'));
    const AI_NAMES=['Lady Mira','Duke Arven','Baron Selt','Countess Vael','Lord Draven','Dame Isolde'];
    const slotHdr=el('div',{class:'lobby-slot-hdr'});
    slotHdr.appendChild(el('span',{class:'lobby-slot-count'},`${LS.hostSlots.length} players`));
    slotHdr.appendChild(gbtn('− Remove','#555',()=>{if(LS.hostSlots.length>2){LS.hostSlots=LS.hostSlots.slice(0,-1);renderLobby({});}},'font-size:11px;padding:4px 10px'));
    slotHdr.appendChild(gbtn('+ Add Player','#5a9fd4',()=>{if(LS.hostSlots.length<7){const i=LS.hostSlots.length;LS.hostSlots.push({slot:i,name:AI_NAMES[i-1]||'AI '+(i+1),ai:true});renderLobby({});}},'font-size:11px;padding:4px 10px'));
    box.appendChild(slotHdr);
    const slotList=el('div',{class:'lobby-slot-list'});
    let hostNameEl=null;
    LS.hostSlots.forEach((sl,i)=>{
      const row=el('div',{class:'lobby-slot-row'});
      row.appendChild(el('span',{class:'lobby-slot-icon'},sl.locked?'👤':sl.ai?'🤖':'👥'));
      if(sl.locked){
        const nameEl=el('span',{class:'lobby-slot-name'});
        nameEl.textContent=LS.hostSlots[0].name||'Host';
        hostNameEl=nameEl;
        row.appendChild(nameEl);
        row.appendChild(el('span',{class:'lobby-slot-tag'},'You (Host)'));
      }else if(sl.ai){
        const ni=document.createElement('input');
        ni.value=sl.name;ni.placeholder='AI name';
        ni.className='lobby-ai-input';
        ni.oninput=()=>{LS.hostSlots[i].name=ni.value;};
        row.appendChild(ni);
        const tb=gbtn('🤖 AI','#6a5a8a',()=>{LS.hostSlots[i].ai=false;renderLobby({});},'min-width:90px;text-align:center');
        row.appendChild(tb);
      }else{
        const nameEl=el('span',{class:'lobby-slot-name-wait'},'(waits for player to join)');
        row.appendChild(nameEl);
        const tb=gbtn('👥 Human','#4db87a',()=>{LS.hostSlots[i].ai=true;LS.hostSlots[i].name=['Lady Mira','Duke Arven','Baron Selt','Countess Vael','Lord Draven','Dame Isolde'][i-1]||'AI '+(i+1);renderLobby({});},'min-width:90px;text-align:center');
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
    box.appendChild(renderCharSelect('host'));
    const br=el('div',{class:'lobby-btn-row-sm'});
    br.appendChild(gbtn('← Back','#555',()=>{LS.screen='home';LS.hostSlots=null;renderLobby({});}));
    br.appendChild(gbtn('Create Room →','#d4a843',()=>{
      const slots=LS.hostSlots.map(sl=>({...sl,name:sl.slot===0?(LS.hostName.trim()||'Host'):sl.name}));
      const allAI=slots.every(sl=>sl.ai||sl.slot===0);
      if(allAI){
        NET.mode='solo';
        S=runAIDraft(buildGameFromConfig(slots,LS.hostCharSet));
        render();
      }else{
        hostRoom(slots);
      }
    },'flex:1;padding:10px;font-family:Cinzel,serif;font-size:13px;text-align:center'));
    box.appendChild(br);
  }

  else if(LS.screen==='hosting'){
    box.appendChild(el('div',{class:'lobby-section-title'},'🏠 Room Ready — Waiting for Players'));

    const cCard=el('div',{class:'lobby-code-card'});
    cCard.appendChild(el('div',{class:'lobby-code-lbl'},'ROOM CODE'));
    cCard.appendChild(el('div',{class:'lobby-code-val'},NET.roomId));

    const shareBox=el('div',{class:'lobby-share-box'});
    shareBox.innerHTML=`<span class="lobby-share-key">How friends join:</span><br>`
      +'1. Open the game at the same URL in their browser<br>'
      +'2. Click <strong>Join Room</strong><br>'
      +`3. Type the code <strong class="lobby-share-code">${NET.roomId}</strong> and their name`;
    cCard.appendChild(shareBox);

    const copyBtn=gbtn('📋 Copy Invite Instructions','#5a9fd4',()=>{
      const url=window.location.href.split('?')[0];
      const txt=`Join my Citadels game!\n1. Open ${url} in your browser\n2. Click "Join Room"\n3. Enter code: ${NET.roomId}\n4. Enter your name and join!`;
      navigator.clipboard.writeText(txt).then(()=>{copyBtn.textContent='✓ Copied!';setTimeout(()=>copyBtn.textContent='📋 Copy Invite Instructions',2000);}).catch(()=>{copyBtn.textContent='(Copy failed — share manually)';});
    },'width:100%;margin-top:10px;padding:8px;font-size:11px;text-align:center');
    cCard.appendChild(copyBtn);
    box.appendChild(cCard);

    box.appendChild(el('div',{class:'lobby-order-label'},'PLAYERS & TURN ORDER'));
    box.appendChild(el('div',{class:'lobby-order-hint'},'Use ↑↓ to set the order players choose characters each round.'));
    const sl2=el('div',{class:'lobby-order-list'});
    NET.slots.forEach((sl,i)=>{
      const isHost=sl.slot===0;
      const isConnectedPeer=!!sl.peerId;
      const icon=isHost?'👤':isConnectedPeer?'🟢':sl.ai?'🤖':'⏳';
      const isActive=isHost||isConnectedPeer;
      const statusText=isHost?'Host (You)':isConnectedPeer?'Connected ✓':sl.ai?'AI Bot':'Waiting for player…';
      const displayName=isHost?sl.name:isConnectedPeer?sl.name:sl.ai?sl.name:'(open slot)';
      const statusColor=isActive?'var(--c-green-txt)':sl.ai?'var(--text-muted)':'var(--text-muted)';
      const borderCls=isActive?'border-color:var(--c-green-bdr)':'';

      const row=el('div',{class:'lobby-order-row',style:isActive?'border:1px solid var(--c-green-bdr)':'border:1px solid var(--border-subtle)'});
      row.appendChild(el('span',{class:'lobby-order-num'},`${i+1}.`));
      row.appendChild(el('span',{class:'lobby-order-icon'},icon));
      const nameSpan=el('span',{class:'lobby-slot-name',style:'flex:1'});
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
    br.appendChild(gbtn('← Cancel','#555',()=>{try{NET.peer?.destroy();}catch(e){}NET.peer=null;NET.mode='solo';LS.screen='home';LS.hostSlots=null;renderLobby({});}));
    br.appendChild(gbtn('▶ Start Game','#4db87a',()=>{
      NET.slots.forEach(sl=>{if(!sl.ai&&sl.slot!==0&&!sl.peerId){sl.ai=true;}});
      S=buildGameFromConfig(NET.slots,LS.hostCharSet);S=runAIDraft(S);broadcastState();render();
      if(NET.mode==='host')broadcastState();
    },'flex:1;padding:11px;font-family:Cinzel,serif;font-size:14px;text-align:center'));
    box.appendChild(br);
    box.appendChild(el('div',{class:'lobby-hint-sm'},'Unfilled human slots become AI when you start.'));
  }

  else if(LS.screen==='join'){
    box.appendChild(el('div',{class:'lobby-section-title'},'🚪 Join a Room'));
    const nRow=el('div',{style:'margin-bottom:12px'});
    nRow.appendChild(el('div',{class:'lobby-label-sm'},'YOUR NAME'));
    const nIn=document.createElement('input');nIn.value=LS.joinName;nIn.placeholder='Your display name';
    nIn.className='lobby-input';
    nIn.oninput=()=>LS.joinName=nIn.value;nRow.appendChild(nIn);box.appendChild(nRow);
    const cRow=el('div',{style:'margin-bottom:20px'});
    cRow.appendChild(el('div',{class:'lobby-label-sm'},'ROOM CODE'));
    const cIn=document.createElement('input');cIn.value=LS.joinCode;cIn.placeholder='XXXXXX';cIn.maxLength=6;
    cIn.className='lobby-input-code';
    cIn.oninput=()=>LS.joinCode=cIn.value.toUpperCase();cRow.appendChild(cIn);box.appendChild(cRow);
    const br=el('div',{class:'lobby-btn-row-sm'});
    br.appendChild(gbtn('← Back','#555',()=>{LS.screen='home';renderLobby({});}));
    br.appendChild(gbtn('Join ▶','#4db87a',()=>{
      const name=(LS.joinName||'').trim()||'Guest';
      const code=(LS.joinCode||'').trim();
      if(code.length<4){LS.error='Please enter a valid room code.';renderLobby({});return;}
      joinRoom(code,name);
    },'flex:1;padding:10px;font-family:Cinzel,serif;font-size:13px;text-align:center'));
    box.appendChild(br);
  }

  else if(LS.screen==='connecting'||LS.screen==='waiting'){
    box.appendChild(el('div',{class:'lobby-connect-icon'},'⏳'));
    box.appendChild(el('div',{class:'lobby-connect-title'},
      LS.screen==='connecting'?'Connecting…':'Waiting for host to start…'));
    box.appendChild(el('div',{class:'lobby-connect-desc'},
      LS.screen==='connecting'?'Joining room '+NET.roomId+'…':"You're in! The host will start the game shortly."));
    if(NET.slots&&NET.slots.length){
      box.appendChild(el('div',{class:'lobby-players-label'},'PLAYERS IN ROOM'));
      const slList=el('div',{class:'lobby-players-list'});
      NET.slots.forEach(sl=>{
        const isMe=NET.peer&&sl.peerId===NET.peer.id;
        const row=el('div',{class:'lobby-peer-row'+(isMe?' me':''),style:isMe?'border:1px solid var(--c-green-bdr)':'border:1px solid var(--border-subtle)'});
        const icon=sl.slot===0?'👤':sl.peerId?'🟢':sl.ai?'🤖':'⏳';
        row.appendChild(el('span',{class:'lobby-peer-icon'},icon));
        const nameEl=el('span',{class:'lobby-peer-name'+(isMe?' me-name':'')});
        nameEl.textContent=(sl.peerId||sl.slot===0)?sl.name:sl.ai?sl.name:'Waiting…';
        row.appendChild(nameEl);
        if(isMe)row.appendChild(el('span',{class:'lobby-peer-tag me-tag'},'(You)'));
        else if(sl.slot===0)row.appendChild(el('span',{class:'lobby-peer-tag'},'Host'));
        slList.appendChild(row);
      });
      box.appendChild(slList);
    }
    const lb=gbtn('← Leave','#555',()=>{try{NET.peer?.destroy();}catch(e){}NET.peer=null;NET.mode='solo';LS.screen='home';renderLobby({});});
    lb.style.display='block';lb.style.margin='0 auto';box.appendChild(lb);
  }

  inner.appendChild(box);page.appendChild(inner);app.appendChild(page);
}
