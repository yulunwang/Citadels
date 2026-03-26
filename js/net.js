// ═══════════════════════════════════════════════════════════════════════════════
// MULTIPLAYER — PeerJS peer-to-peer, free hosted signaling at peerjs.com
//
// Architecture:
//   Host  — creates room, holds authoritative state, runs all AI, pushes full
//            state JSON to all connected peers after every change.
//   Peer  — receives state from host, renders it, sends action messages back.
//           Never mutates state locally.
//   Solo  — original single-player mode, no network at all.
// ═══════════════════════════════════════════════════════════════════════════════

const NET={
  mode:'solo', peer:null, roomId:null, mySlot:0,
  conns:{}, hostConn:null, slots:[], loaded:false,
};

// Wire the round-end hook in engine.js so the host broadcasts after round transitions
_onRoundEnd=()=>{if(NET.mode==='host')broadcastState();};

function loadPeerJS(cb){
  if(NET.loaded){cb();return;}
  const s=document.createElement('script');
  s.src='https://cdnjs.cloudflare.com/ajax/libs/peerjs/1.5.2/peerjs.min.js';
  s.onload=()=>{NET.loaded=true;cb();};
  s.onerror=()=>lobbyError('Could not load networking library. Check your internet connection.');
  document.head.appendChild(s);
}
function mkRoomId(){const c='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let id='';for(let i=0;i<6;i++)id+=c[0|Math.random()*c.length];return id;}

// ── HOST ──────────────────────────────────────────────────────────────────────
function hostRoom(slots){
  loadPeerJS(()=>{
    NET.roomId=mkRoomId();NET.mode='host';NET.mySlot=0;NET.slots=slots;
    NET.peer=new Peer('citadels-host-'+NET.roomId,{debug:0});
    NET.peer.on('open',()=>{
      S=null;
      renderLobby({screen:'hosting'});
    });
    NET.peer.on('connection',conn=>{
      conn.on('open',()=>{
        NET.conns[conn.peer]=conn;
        conn.on('data',msg=>onPeerMsg(conn.peer,msg));
        conn.on('close',()=>{
          delete NET.conns[conn.peer];
          const sl=NET.slots.find(s=>s.peerId===conn.peer);
          if(sl){sl.peerId=null;sl.ai=true;sl.name=['Lady Mira','Duke Arven','Baron Selt'][sl.slot-1]||'AI '+(sl.slot);}
          broadcastAll({type:'slots',slots:NET.slots});
          if(!S)renderLobby({screen:'hosting'});
        });
        conn.send({type:'hello',slots:NET.slots,state:null});
      });
    });
    NET.peer.on('error',e=>lobbyError(e.message));
  });
}
function onPeerMsg(peerId,msg){
  if(msg.type==='join'){
    const open=NET.slots.find(sl=>sl.ai&&sl.slot!==0&&!sl.peerId);
    if(open){open.name=msg.name||'Guest';open.ai=false;open.peerId=peerId;}
    broadcastAll({type:'slots',slots:NET.slots});broadcastState();renderLobby({screen:'hosting'});return;
  }
  if(msg.type==='action'){
    const sl=NET.slots.find(s=>s.peerId===peerId);if(!sl)return;
    if(msg.action==='heraldAck'){applyAction(sl.slot,'heraldAck',{});return;}
    if(!isTurn(sl.slot)&&!(msg.action==='draft'&&isDraftTurn(sl.slot)))return;
    applyAction(sl.slot,msg.action,msg.data);return;
  }
}
function broadcastState(){if(NET.mode!=='host')return;const m={type:'state',slots:NET.slots,state:S};Object.values(NET.conns).forEach(c=>{try{c.send(m);}catch(e){}});}
function broadcastAll(m){Object.values(NET.conns).forEach(c=>{try{c.send(m);}catch(e){}});}

// ── PEER ──────────────────────────────────────────────────────────────────────
function joinRoom(roomId,myName){
  loadPeerJS(()=>{
    NET.mode='peer';NET.roomId=roomId.toUpperCase().trim();
    const pid='citadels-p-'+Date.now().toString(36);
    NET.peer=new Peer(pid,{debug:0});
    NET.peer.on('open',()=>{
      const conn=NET.peer.connect('citadels-host-'+NET.roomId,{reliable:true});
      NET.hostConn=conn;
      conn.on('open',()=>conn.send({type:'join',name:myName}));
      conn.on('data',msg=>onHostMsg(msg));
      conn.on('error',e=>lobbyError('Connection error: '+e.message));
      conn.on('close',()=>lobbyError('Disconnected from host.'));
    });
    NET.peer.on('error',e=>{
      if(e.type==='peer-unavailable')lobbyError('Room "'+NET.roomId+'" not found. Check the code.');
      else lobbyError(e.message);
    });
    renderLobby({screen:'connecting'});
  });
}
function onHostMsg(msg){
  if(msg.type==='hello'||msg.type==='state'){
    if(msg.slots)NET.slots=msg.slots;
    const me=NET.slots.find(sl=>NET.peer&&sl.peerId===NET.peer.id);
    if(me){NET.mySlot=me.slot;}
    if(msg.state){
      if(!S)_patchActionsForPeer();
      S=msg.state;render();
    }
    else renderLobby({screen:'waiting'});
    return;
  }
  if(msg.type==='slots'){
    NET.slots=msg.slots;
    const me=NET.slots.find(sl=>NET.peer&&sl.peerId===NET.peer.id);
    if(me)NET.mySlot=me.slot;
    if(!S)renderLobby({screen:'waiting'});
    return;
  }
}
function peerSend(action,data){if(NET.mode==='peer'&&NET.hostConn)try{NET.hostConn.send({type:'action',action,data});}catch(e){}}

// ── DISPATCH ─────────────────────────────────────────────────────────────────
function isTurn(pid){
  if(S.phase!=='action')return false;
  const p=S.players[pid];
  return !!(p&&!p.dead&&charRank(p.char)===S.callIdx);
}
function isDraftTurn(pid){
  return S.phase==='draft'&&S.draftOrder[S.draftIdx]===pid;
}

function applyAction(pid,action,data){
  if(action==='heraldAck'){
    const out=heraldAck(S,pid);
    if(out){S=out;broadcastState();render();}
    _applyLocalSlot=0;return;
  }
  let ns=pid!==0?swapSlots(S,0,pid):S;
  _applyLocalSlot=pid;
  let out;
  if(action==='collectGold')out=humanCollectGold(ns);
  else if(action==='collectCards')out=humanCollectCards(ns);
  else if(action==='keepCard')out=humanKeepCard(ns,data.uid);
  else if(action==='build')out=humanBuild(ns,data.uid);
  else if(action==='useSmithy')out=humanUseSmithy(ns);
  else if(action==='endTurn')out=humanEndTurn(ns);
  else if(action==='kill')out=humanKill(ns,data.tc);
  else if(action==='steal')out=humanSteal(ns,data.tc);
  else if(action==='magSwap')out=humanMagSwap(ns,data.tid);
  else if(action==='magDiscard')out=humanMagDiscard(ns,data.uids);
  else if(action==='warlord')out=humanWarlord(ns,data.tpid,data.duid);
  else if(action==='navigator')out=humanNavigator(ns,data.choice);
  else if(action==='seer')out=humanSeer(ns);
  else if(action==='wizardTarget')out=humanWizardTarget(ns,data.targetId);
  else if(action==='wizardTake')out=humanWizardTake(ns,data.uid,data.doBuild);
  else if(action==='draft')out=humanDraft(ns,data.charId);
  else if(action==='setSub')out={...ns,sub:data.sub,selCards:data.selCards||[]};
  else{_applyLocalSlot=0;return;}
  _applyLocalSlot=0;
  if(pid!==0)out=swapSlots(out,0,pid);
  S=out;broadcastState();render();
}

function swapSlots(state,a,b){
  const players=[...state.players];
  const pa={...players[a]};const pb={...players[b]};
  players[a]={...pb,id:a};players[b]={...pa,id:b};
  let crown=state.crown;if(crown===a)crown=b;else if(crown===b)crown=a;
  let fc=state.firstCompleter;if(fc===a)fc=b;else if(fc===b)fc=a;
  const draftOrder=state.draftOrder.map(id=>id===a?b:id===b?a:id);
  return{...state,players,crown,firstCompleter:fc,draftOrder};
}

function buildGameFromConfig(slots,charPool){
  charPool=charPool||[1,2,3,4,5,6,7,8];
  const deck=shuffle(mkDeck());const n=slots.length;
  const crown=slots[0].slot;
  const players=slots.map(sl=>({id:sl.slot,name:sl.name,ai:sl.ai,gold:2,hand:[],city:[],char:null,dead:false,stolenTarget:null,smithyUsed:false,seerUsed:false,pendingKill:null}));
  players.sort((a,b)=>a.id-b.id);
  const d=[...deck];players.forEach(p=>{p.hand=d.splice(0,4);});
  const draftOrder=slots.map(sl=>sl.slot);
  const dealt=dealDraft(charPool,n);
  return{phase:'draft',sub:'idle',round:1,deck:d,trash:[],players,crown,
    charPool:[...charPool],
    draftOrder,draftIdx:0,
    avail:dealt.avail,faceDown:dealt.faceDown,faceUp:dealt.faceUp,heraldQueue:[],heraldIdx:0,heraldAfter:'action',heraldAcks:[],callIdx:1,
    log:['The game begins!'],firstCompleter:null,collected:false,builtCount:0,noBuild:false,drawOpts:[],selCards:[],pendingDestroy:null,_confirmEnd:false,
    wizardTargetId:null};
}

// ── RENDER ROUTING ────────────────────────────────────────────────────────────
// Capture the base render() from ui.js, then override window.render with the
// multiplayer-aware wrapper. All action callbacks call render() through this.
const _origRender=render;

window.render=function renderGame(){
  if(NET.mode==='peer'){
    _renderWithPeerActions();
  }else if(NET.mode==='host'){
    _origRender();
    broadcastState();
  }else{
    _origRender();
  }
};

// Called ONCE when peer enters a game — permanently replaces all human action
// functions so they send to the host instead of mutating local state.
function _patchActionsForPeer(){
  humanCollectGold=()=>{peerSend('collectGold',{});};
  humanCollectCards=()=>{peerSend('collectCards',{});};
  humanKeepCard=(_s,uid)=>{peerSend('keepCard',{uid});};
  humanBuild=(_s,uid)=>{peerSend('build',{uid});};
  humanUseSmithy=()=>{peerSend('useSmithy',{});};
  humanEndTurn=()=>{peerSend('endTurn',{});};
  humanKill=(_s,tc)=>{peerSend('kill',{tc});};
  humanSteal=(_s,tc)=>{peerSend('steal',{tc});};
  humanMagSwap=(_s,tid)=>{peerSend('magSwap',{tid});};
  humanMagDiscard=(_s,uids)=>{peerSend('magDiscard',{uids});};
  humanWarlord=(_s,tpid,duid)=>{peerSend('warlord',{tpid,duid});};
  humanNavigator=(_s,choice)=>{peerSend('navigator',{choice});};
  humanSeer=()=>{peerSend('seer',{});};
  humanWizardTarget=(_s,targetId)=>{peerSend('wizardTarget',{targetId});};
  humanWizardTake=(_s,uid,doBuild)=>{peerSend('wizardTake',{uid,doBuild});};
  humanDraft=(_s,charId)=>{peerSend('draft',{charId});};
  heraldNext=(_s)=>{peerSend('heraldAck',{});};
}

function _renderWithPeerActions(){
  const view=NET.mySlot===0?S:swapSlots(S,0,NET.mySlot);
  const me=view.players[0];
  const isMyActionTurn=view.phase==='action'&&me&&charRank(me.char)===view.callIdx&&!me.dead;
  const isMyDraftTurn=view.phase==='draft'&&view.draftOrder[view.draftIdx]===0;
  if(view.sub==='idle'&&(isMyActionTurn||isMyDraftTurn)){
    view.sub='choose';
  }
  const saved=S;S=view;
  _origRender();
  S=saved;
}
