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
  let tip=document.getElementById('char-tooltip');
  if(!tip){
    tip=document.createElement('div');
    tip.id='char-tooltip';
    tip.style.cssText='position:fixed;z-index:9999;pointer-events:none;display:none;max-width:270px;max-width:calc(100vw - 20px);'+
      'background:#0e1228;border:1px solid #3a2f6a;border-radius:10px;padding:13px 15px;'+
      'box-shadow:0 8px 32px #000c;font-family:Georgia,serif';
    document.body.appendChild(tip);
  }
  return tip;
}
function showCharTooltip(ch,triggerEl){
  const tip=_ensureCharTooltip();
  tip.innerHTML='';

  // Header row: emoji + name + rank
  const hdr=document.createElement('div');
  hdr.style.cssText=`display:flex;align-items:center;gap:9px;margin-bottom:9px;padding-bottom:9px;border-bottom:1px solid ${ch.clr}44`;
  const emo=document.createElement('span');
  emo.style.cssText='font-size:30px;line-height:1;flex-shrink:0';emo.textContent=ch.emoji;
  const nameBlock=document.createElement('div');
  const nm=document.createElement('div');
  nm.style.cssText=`font-family:Cinzel,serif;font-size:14px;font-weight:700;color:${ch.clr}`;nm.textContent=ch.name;
  const rankEl=document.createElement('div');
  rankEl.style.cssText='font-size:10px;color:#6a6080;margin-top:3px;font-family:Cinzel,serif;letter-spacing:.5px';
  rankEl.textContent=`RANK ${ch.rank}`;
  nameBlock.append(nm,rankEl);hdr.append(emo,nameBlock);tip.appendChild(hdr);

  // Ability text
  const ab=document.createElement('div');
  ab.style.cssText='font-size:12px;color:#c8bfa8;line-height:1.65';ab.textContent=ch.ability;tip.appendChild(ab);

  // Alternatives note (other chars at same rank)
  const alts=CHARS.filter(q=>q.rank===ch.rank&&q.id!==ch.id);
  if(alts.length){
    const altRow=document.createElement('div');
    altRow.style.cssText='margin-top:9px;padding-top:8px;border-top:1px solid #2a2450;font-size:10px;color:#5a5070';
    altRow.textContent='Replaces: '+alts.map(q=>`${q.emoji} ${q.name}`).join(', ')+' at this rank';
    tip.appendChild(altRow);
  }

  // Position: below button, clamped to viewport
  tip.style.display='block';
  const rect=triggerEl.getBoundingClientRect();
  const tw=tip.offsetWidth||270;const th=tip.offsetHeight||130;
  const vw=window.innerWidth;const vh=window.innerHeight;
  let left=rect.left;let top=rect.bottom+8;
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

  wrap.appendChild(el('div',{style:'font-size:11px;color:#5a4e3a;margin-bottom:8px;letter-spacing:.5px'},'CHARACTERS (one per rank)'));

  // Quick preset buttons
  const presetRow=el('div',{style:'display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px'});
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
    const row=el('div',{style:'display:flex;align-items:center;gap:8px;margin-bottom:5px;padding:5px 8px;background:#0a0d1e;border-radius:6px'});
    row.appendChild(el('span',{style:'font-size:10px;color:#3a3060;min-width:48px;font-family:Cinzel,serif'},`Rank ${r}`));
    charsAtRank.forEach(ch=>{
      const active=selected===ch.id;
      const btn=el('button',{style:`background:${active?ch.clr+'33':'transparent'};border:1px solid ${active?ch.clr+'88':'#2a2f55'};border-radius:5px;padding:4px 10px;cursor:pointer;color:${active?ch.clr:'#5a4e3a'};font-family:Cinzel,serif;font-size:11px;transition:all .15s;position:relative`},`${ch.emoji} ${ch.name}${ch.id>=9?' ✦':''}`);
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
  const r9row=el('div',{style:'display:flex;align-items:center;gap:8px;margin-bottom:5px;padding:5px 8px;background:#0a0d1e;border-radius:6px'});
  r9row.appendChild(el('span',{style:'font-size:10px;color:#3a3060;min-width:48px;font-family:Cinzel,serif'},'Rank 9'));
  const noBtn=el('button',{style:`background:${!has9?'#33303033':'transparent'};border:1px solid ${!has9?'#4a4a4a':'#2a2f55'};border-radius:5px;padding:4px 10px;cursor:pointer;color:${!has9?'#7a7a7a':'#3a3060'};font-family:Cinzel,serif;font-size:11px`},'None');
  noBtn.onclick=()=>setCharSet(charSet.filter(id=>CHARS.find(c=>c.id===id)?.rank!==9));
  r9row.appendChild(noBtn);
  rank9chars.forEach(ch=>{
    const active=has9&&charSet.includes(ch.id);
    const btn=el('button',{style:`background:${active?ch.clr+'33':'transparent'};border:1px solid ${active?ch.clr+'88':'#2a2f55'};border-radius:5px;padding:4px 10px;cursor:pointer;color:${active?ch.clr:'#5a4e3a'};font-family:Cinzel,serif;font-size:11px;transition:all .15s`},`${ch.emoji} ${ch.name} ✦`);
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
  const page=el('div',{style:'height:100vh;overflow-y:auto;background:#090c18'});
  const inner=el('div',{style:'min-height:100%;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box'});
  const box=el('div',{style:'background:#111530;border:1px solid #2a2f55;border-radius:16px;padding:28px 32px;max-width:600px;width:100%'});

  box.appendChild(el('div',{style:'font-family:Cinzel,serif;font-size:26px;color:#d4a843;text-align:center;margin-bottom:4px'},'⚜ Citadels'));
  box.appendChild(el('div',{style:'font-size:12px;color:#4a3e2a;text-align:center;margin-bottom:22px'},'The medieval city-building card game'));

  if(LS.error){
    box.appendChild(el('div',{style:'background:#2a0808;border:1px solid #6a2020;border-radius:7px;padding:10px 14px;color:#e07070;font-size:13px;margin-bottom:14px;text-align:center'},'⚠ '+LS.error));
    const clrBtn=gbtn('✕ Dismiss','#886',()=>{LS.error=null;renderLobby({});});
    clrBtn.style.display='block';clrBtn.style.margin='0 auto 8px';box.appendChild(clrBtn);
  }

  if(LS.screen==='home'){
    box.appendChild(el('div',{style:'font-family:Cinzel,serif;font-size:13px;color:#5a4e38;text-align:center;margin-bottom:18px'},'How would you like to play?'));
    const grid=el('div',{style:'display:grid;grid-template-columns:repeat(3,1fr);gap:12px'});
    [
      {icon:'🤖',title:'Solo',desc:'Configure your opponents and characters',fn:()=>{LS.screen='solo_config';renderLobby({});}},
      {icon:'🏠',title:'Host Room',desc:'Create a room and share the code with friends',fn:()=>{LS.screen='host_config';renderLobby({});}},
      {icon:'🚪',title:'Join Room',desc:"Enter a friend's room code to play together",fn:()=>{LS.screen='join';renderLobby({});}},
    ].forEach(m=>{
      const c=el('div',{style:'background:#0d1128;border:1px solid #2a2f55;border-radius:10px;padding:16px;text-align:center;cursor:pointer;transition:all .15s'});
      c.appendChild(el('div',{style:'font-size:30px;margin-bottom:8px'},m.icon));
      c.appendChild(el('div',{style:'font-family:Cinzel,serif;font-size:13px;color:#d4a843;margin-bottom:5px'},m.title));
      c.appendChild(el('div',{style:'font-size:11px;color:#4a3e2a;line-height:1.45'},m.desc));
      c.onmouseenter=()=>c.style.background='#1a2040';c.onmouseleave=()=>c.style.background='#0d1128';
      c.onclick=m.fn;grid.appendChild(c);
    });
    box.appendChild(grid);
  }

  else if(LS.screen==='solo_config'){
    box.appendChild(el('div',{style:'font-family:Cinzel,serif;font-size:15px;color:#d4a843;margin-bottom:14px'},'🤖 Solo Game Setup'));
    box.appendChild(el('div',{style:'font-size:11px;color:#5a4e3a;margin-bottom:8px;letter-spacing:.5px'},'NUMBER OF OPPONENTS'));
    const cntRow=el('div',{style:'display:flex;align-items:center;gap:12px;margin-bottom:16px'});
    const decBtn=gbtn('−','#555',()=>{if(LS.soloNumAI>1){LS.soloNumAI--;const p=autoPreset(1+LS.soloNumAI);LS.soloCharPreset=p;LS.soloCharSet=[...(CHAR_PRESETS[1+LS.soloNumAI]||[1,2,3,4,5,6,7,8])];renderLobby({});}},'width:36px;height:36px;text-align:center;padding:0;font-size:18px;border-radius:50%');
    const cntLabel=el('div',{style:'font-family:Cinzel,serif;font-size:15px;color:#e8dfc8;flex:1;text-align:center'},`${LS.soloNumAI} AI opponent${LS.soloNumAI>1?'s':''}`);
    const incBtn=gbtn('+','#555',()=>{if(LS.soloNumAI<6){LS.soloNumAI++;const p=autoPreset(1+LS.soloNumAI);LS.soloCharPreset=p;LS.soloCharSet=[...(CHAR_PRESETS[1+LS.soloNumAI]||[1,2,3,4,5,6,7,8])];renderLobby({});}},'width:36px;height:36px;text-align:center;padding:0;font-size:18px;border-radius:50%');
    cntRow.append(decBtn,cntLabel,incBtn);box.appendChild(cntRow);
    box.appendChild(renderCharSelect('solo'));
    const br=el('div',{style:'display:flex;gap:10px;margin-top:16px'});
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
    box.appendChild(el('div',{style:'font-family:Cinzel,serif;font-size:15px;color:#d4a843;margin-bottom:8px'},'🏠 Configure Room'));

    const hnRow=el('div',{style:'margin-bottom:16px'});
    hnRow.appendChild(el('div',{style:'font-size:11px;color:#5a4e3a;margin-bottom:5px;letter-spacing:.5px'},'YOUR NAME'));
    const hnIn=document.createElement('input');
    hnIn.value=LS.hostName||'';hnIn.placeholder='Your display name (e.g. Alex)';
    hnIn.style.cssText='width:100%;background:#0d1128;border:1px solid #2a2f55;border-radius:7px;padding:9px 13px;color:#e8dfc8;font-size:14px;font-family:Cinzel,serif;outline:none';
    hnRow.appendChild(hnIn);box.appendChild(hnRow);

    box.appendChild(el('div',{style:'font-size:11px;color:#5a4e3a;margin-bottom:8px;letter-spacing:.5px'},'PLAYER SLOTS'));
    box.appendChild(el('div',{style:'font-size:11px;color:#4a3e2a;margin-bottom:10px;line-height:1.5'},'Set each slot to AI or Human. Human players join with the room code and choose their own name when they connect.'));
    const AI_NAMES=['Lady Mira','Duke Arven','Baron Selt','Countess Vael','Lord Draven','Dame Isolde'];
    const slotHdr=el('div',{style:'display:flex;align-items:center;gap:8px;margin-bottom:8px'});
    slotHdr.appendChild(el('span',{style:'font-family:Cinzel,serif;font-size:12px;color:#7a6848;flex:1'},`${LS.hostSlots.length} players`));
    slotHdr.appendChild(gbtn('− Remove','#555',()=>{if(LS.hostSlots.length>2){LS.hostSlots=LS.hostSlots.slice(0,-1);renderLobby({});}},'font-size:11px;padding:4px 10px'));
    slotHdr.appendChild(gbtn('+ Add Player','#5a9fd4',()=>{if(LS.hostSlots.length<7){const i=LS.hostSlots.length;LS.hostSlots.push({slot:i,name:AI_NAMES[i-1]||'AI '+(i+1),ai:true});renderLobby({});}},'font-size:11px;padding:4px 10px'));
    box.appendChild(slotHdr);
    const slotList=el('div',{style:'display:flex;flex-direction:column;gap:7px;margin-bottom:18px'});
    let hostNameEl=null;
    LS.hostSlots.forEach((sl,i)=>{
      const row=el('div',{style:'display:flex;align-items:center;gap:12px;background:#0d1128;border:1px solid #1e2245;border-radius:8px;padding:10px 14px'});
      row.appendChild(el('span',{style:'font-size:20px'},sl.locked?'👤':sl.ai?'🤖':'👥'));
      if(sl.locked){
        const nameEl=el('span',{style:'flex:1;font-family:Cinzel,serif;font-size:13px;color:#d4a843'});
        nameEl.textContent=LS.hostSlots[0].name||'Host';
        hostNameEl=nameEl;
        row.appendChild(nameEl);
        row.appendChild(el('span',{style:'font-size:11px;color:#4a3e2a;padding:4px 8px'},'You (Host)'));
      }else if(sl.ai){
        const ni=document.createElement('input');
        ni.value=sl.name;ni.placeholder='AI name';
        ni.style.cssText='flex:1;background:#1a1e35;border:1px solid #2a2f55;border-radius:5px;padding:6px 10px;color:#e8dfc8;font-size:13px;font-family:Georgia,serif;outline:none';
        ni.oninput=()=>{LS.hostSlots[i].name=ni.value;};
        row.appendChild(ni);
        const tb=gbtn('🤖 AI','#6a5a8a',()=>{LS.hostSlots[i].ai=false;renderLobby({});},'min-width:90px;text-align:center');
        row.appendChild(tb);
      }else{
        const nameEl=el('span',{style:'flex:1;font-family:Cinzel,serif;font-size:13px;color:#4db87a'},'(waits for player to join)');
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
    const br=el('div',{style:'display:flex;gap:10px'});
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
    box.appendChild(el('div',{style:'font-family:Cinzel,serif;font-size:15px;color:#d4a843;margin-bottom:12px'},'🏠 Room Ready — Waiting for Players'));

    const cCard=el('div',{style:'background:#0d1128;border:2px solid #d4a843;border-radius:12px;padding:16px 20px;margin-bottom:14px'});
    cCard.appendChild(el('div',{style:'font-size:10px;color:#5a4e3a;letter-spacing:2px;margin-bottom:6px;text-align:center'},'ROOM CODE'));
    cCard.appendChild(el('div',{style:'font-family:Cinzel,serif;font-size:44px;color:#d4a843;letter-spacing:10px;font-weight:700;text-align:center'},NET.roomId));

    const shareBox=el('div',{style:'background:#0a0c1a;border-radius:8px;padding:10px 12px;margin-top:10px;font-size:11px;color:#5a4e3a;line-height:1.7'});
    shareBox.innerHTML='<span style="color:#7a6848">How friends join:</span><br>'
      +'1. Open the game at the same URL in their browser<br>'
      +'2. Click <strong style="color:#c8b080">Join Room</strong><br>'
      +`3. Type the code <strong style="color:#d4a843;letter-spacing:3px">${NET.roomId}</strong> and their name`;
    cCard.appendChild(shareBox);

    const copyBtn=gbtn('📋 Copy Invite Instructions','#5a9fd4',()=>{
      const url=window.location.href.split('?')[0];
      const txt=`Join my Citadels game!\n1. Open ${url} in your browser\n2. Click "Join Room"\n3. Enter code: ${NET.roomId}\n4. Enter your name and join!`;
      navigator.clipboard.writeText(txt).then(()=>{copyBtn.textContent='✓ Copied!';setTimeout(()=>copyBtn.textContent='📋 Copy Invite Instructions',2000);}).catch(()=>{copyBtn.textContent='(Copy failed — share manually)';});
    },'width:100%;margin-top:10px;padding:8px;font-size:11px;text-align:center');
    cCard.appendChild(copyBtn);
    box.appendChild(cCard);

    box.appendChild(el('div',{style:'font-size:11px;color:#5a4e3a;letter-spacing:.5px;margin-bottom:4px'},'PLAYERS & TURN ORDER'));
    box.appendChild(el('div',{style:'font-size:11px;color:#4a3e2a;margin-bottom:8px'},'Use ↑↓ to set the order players choose characters each round.'));
    const sl2=el('div',{style:'display:flex;flex-direction:column;gap:6px;margin-bottom:16px'});
    NET.slots.forEach((sl,i)=>{
      const isHost=sl.slot===0;
      const isConnectedPeer=!!sl.peerId;
      const icon=isHost?'👤':isConnectedPeer?'🟢':sl.ai?'🤖':'⏳';
      const nameColor=isHost?'#d4a843':isConnectedPeer?'#d4a843':sl.ai?'#8878a8':'#5a5a9a';
      const statusColor=isHost?'#4db87a':isConnectedPeer?'#4db87a':sl.ai?'#5a4878':'#4a4a7a';
      const statusText=isHost?'Host (You)':isConnectedPeer?'Connected ✓':sl.ai?'AI Bot':'Waiting for player…';
      const displayName=isHost?sl.name:isConnectedPeer?sl.name:sl.ai?sl.name:'(open slot)';
      const borderColor=isHost?'#2a5a2a':isConnectedPeer?'#2a5a2a':sl.ai?'#1e2245':'#2a2a5a';

      const row=el('div',{style:`display:flex;align-items:center;gap:8px;background:#0d1128;border:1px solid ${borderColor};border-radius:7px;padding:8px 12px`});
      row.appendChild(el('span',{style:'font-family:Cinzel,serif;font-size:12px;color:#4a3e2a;min-width:18px;text-align:center'},`${i+1}.`));
      row.appendChild(el('span',{style:'font-size:16px'},icon));
      const nameSpan=el('span',{style:`font-family:Cinzel,serif;font-size:13px;flex:1;color:${nameColor}`});
      nameSpan.textContent=displayName;
      row.appendChild(nameSpan);
      row.appendChild(el('span',{style:`font-size:10px;color:${statusColor}`},statusText));
      const upBtn=el('button',{style:'background:#1a1e35;border:1px solid #2a2f55;color:#7a6848;border-radius:4px;padding:2px 7px;cursor:pointer;font-size:12px'},'↑');
      const dnBtn=el('button',{style:'background:#1a1e35;border:1px solid #2a2f55;color:#7a6848;border-radius:4px;padding:2px 7px;cursor:pointer;font-size:12px'},'↓');
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

    const br=el('div',{style:'display:flex;gap:10px'});
    br.appendChild(gbtn('← Cancel','#555',()=>{try{NET.peer?.destroy();}catch(e){}NET.peer=null;NET.mode='solo';LS.screen='home';LS.hostSlots=null;renderLobby({});}));
    br.appendChild(gbtn('▶ Start Game','#4db87a',()=>{
      NET.slots.forEach(sl=>{if(!sl.ai&&sl.slot!==0&&!sl.peerId){sl.ai=true;}});
      S=buildGameFromConfig(NET.slots,LS.hostCharSet);S=runAIDraft(S);broadcastState();render();
      if(NET.mode==='host')broadcastState();
    },'flex:1;padding:11px;font-family:Cinzel,serif;font-size:14px;text-align:center'));
    box.appendChild(br);
    box.appendChild(el('div',{style:'font-size:11px;color:#4a3e2a;text-align:center;margin-top:8px'},'Unfilled human slots become AI when you start.'));
  }

  else if(LS.screen==='join'){
    box.appendChild(el('div',{style:'font-family:Cinzel,serif;font-size:15px;color:#d4a843;margin-bottom:10px'},'🚪 Join a Room'));
    const nRow=el('div',{style:'margin-bottom:12px'});
    nRow.appendChild(el('div',{style:'font-size:11px;color:#5a4e3a;margin-bottom:5px'},'YOUR NAME'));
    const nIn=document.createElement('input');nIn.value=LS.joinName;nIn.placeholder='Your display name';
    nIn.style.cssText='width:100%;background:#0d1128;border:1px solid #2a2f55;border-radius:7px;padding:9px 13px;color:#e8dfc8;font-size:14px;font-family:Georgia,serif;outline:none';
    nIn.oninput=()=>LS.joinName=nIn.value;nRow.appendChild(nIn);box.appendChild(nRow);
    const cRow=el('div',{style:'margin-bottom:20px'});
    cRow.appendChild(el('div',{style:'font-size:11px;color:#5a4e3a;margin-bottom:5px'},'ROOM CODE'));
    const cIn=document.createElement('input');cIn.value=LS.joinCode;cIn.placeholder='XXXXXX';cIn.maxLength=6;
    cIn.style.cssText='width:100%;background:#0d1128;border:1px solid #2a2f55;border-radius:7px;padding:12px;color:#d4a843;font-size:28px;font-family:Cinzel,serif;letter-spacing:8px;text-align:center;outline:none;text-transform:uppercase';
    cIn.oninput=()=>LS.joinCode=cIn.value.toUpperCase();cRow.appendChild(cIn);box.appendChild(cRow);
    const br=el('div',{style:'display:flex;gap:10px'});
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
    box.appendChild(el('div',{style:'font-size:42px;text-align:center;margin-bottom:10px'},'⏳'));
    box.appendChild(el('div',{style:'font-family:Cinzel,serif;font-size:16px;color:#d4a843;text-align:center;margin-bottom:6px'},
      LS.screen==='connecting'?'Connecting…':'Waiting for host to start…'));
    box.appendChild(el('div',{style:'font-size:12px;color:#4a3e2a;text-align:center;margin-bottom:16px'},
      LS.screen==='connecting'?'Joining room '+NET.roomId+'…':"You're in! The host will start the game shortly."));
    if(NET.slots&&NET.slots.length){
      box.appendChild(el('div',{style:'font-size:11px;color:#5a4e3a;letter-spacing:.5px;margin-bottom:8px'},'PLAYERS IN ROOM'));
      const slList=el('div',{style:'display:flex;flex-direction:column;gap:5px;margin-bottom:16px'});
      NET.slots.forEach(sl=>{
        const isMe=NET.peer&&sl.peerId===NET.peer.id;
        const row=el('div',{style:`display:flex;align-items:center;gap:10px;background:#0d1128;border:1px solid ${isMe?'#2a5a2a':'#1e2245'};border-radius:6px;padding:8px 12px`});
        const icon=sl.slot===0?'👤':sl.peerId?'🟢':sl.ai?'🤖':'⏳';
        row.appendChild(el('span',{style:'font-size:16px'},icon));
        const nameEl=el('span',{style:`font-family:Cinzel,serif;font-size:13px;flex:1;color:${isMe?'#4db87a':'#d4a843'}`});
        nameEl.textContent=(sl.peerId||sl.slot===0)?sl.name:sl.ai?sl.name:'Waiting…';
        row.appendChild(nameEl);
        if(isMe)row.appendChild(el('span',{style:'font-size:10px;color:#4db87a;font-family:Cinzel,serif'},'(You)'));
        else if(sl.slot===0)row.appendChild(el('span',{style:'font-size:10px;color:#4a3e2a'},'Host'));
        slList.appendChild(row);
      });
      box.appendChild(slList);
    }
    const lb=gbtn('← Leave','#555',()=>{try{NET.peer?.destroy();}catch(e){}NET.peer=null;NET.mode='solo';LS.screen='home';renderLobby({});});
    lb.style.display='block';lb.style.margin='0 auto';box.appendChild(lb);
  }

  inner.appendChild(box);page.appendChild(inner);app.appendChild(page);
}
