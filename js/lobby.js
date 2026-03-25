// ═══════════════════════════════════════════════════════════════════════════════
// LOBBY — Home screen, room creation, join flow
// ═══════════════════════════════════════════════════════════════════════════════

var LS={screen:'home',hostSlots:null,hostName:'',joinName:'',joinCode:'',error:null};

function lobbyError(msg){
  NET.mode='solo';try{NET.peer?.destroy();}catch(e){}NET.peer=null;NET.hostConn=null;NET.conns={};
  LS.error=msg;renderLobby(LS);
}

function renderLobby(opts){
  LS={...LS,...opts};
  const app=document.getElementById('app');app.innerHTML='';
  const page=el('div',{style:'min-height:100vh;display:flex;align-items:center;justify-content:center;background:#090c18;padding:20px'});
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
      {icon:'🤖',title:'Solo',desc:'1 human vs 3 AI opponents',fn:()=>{NET.mode="solo";S=runAIDraft(newGame());render();}},
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
        const tb=gbtn('👥 Human','#4db87a',()=>{LS.hostSlots[i].ai=true;LS.hostSlots[i].name=['Lady Mira','Duke Arven','Baron Selt'][i-1]||'AI '+(i+1);renderLobby({});},'min-width:90px;text-align:center');
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
    const br=el('div',{style:'display:flex;gap:10px'});
    br.appendChild(gbtn('← Back','#555',()=>{LS.screen='home';LS.hostSlots=null;renderLobby({});}));
    br.appendChild(gbtn('Create Room →','#d4a843',()=>{
      const slots=LS.hostSlots.map(sl=>({...sl,name:sl.slot===0?(LS.hostName.trim()||'Host'):sl.name}));
      const allAI=slots.every(sl=>sl.ai||sl.slot===0);
      if(allAI){
        NET.mode='solo';
        S=runAIDraft(buildGameFromConfig(slots));
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
      S=buildGameFromConfig(NET.slots);S=runAIDraft(S);broadcastState();render();
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

  page.appendChild(box);app.appendChild(page);
}
