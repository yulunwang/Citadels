// ═══════════════════════════════════════════════════════════════════════════════
// ENGINE — Core game logic: state factory, AI, draft, action phase, human actions
//
// All humanXxx functions are declared as `let` so net.js can reassign them
// via _patchActionsForPeer() for peer-mode players without a build step.
// ═══════════════════════════════════════════════════════════════════════════════

// Callback set by net.js after load; called after a round ends so the host can
// broadcast the new state. Keeps engine.js free of networking concerns.
var _onRoundEnd = null;

function calcScore(player,isFirst){
  let s=player.city.reduce((t,d)=>t+d.cost,0);
  if(isFirst)s+=4;else if(player.city.length>=8)s+=2;
  const base=new Set(player.city.filter(d=>d.special!=='flex_color').map(d=>d.color));
  if(player.city.some(d=>d.special==='flex_color')&&base.size===4)
    ['yellow','blue','green','red','purple'].forEach(c=>{if(!base.has(c))base.add(c);});
  if(['yellow','blue','green','red','purple'].every(c=>base.has(c)))s+=3;
  player.city.forEach(d=>{
    if(d.special==='bonus2')s+=2;
    if(d.special==='wishing_well')s+=player.city.filter(x=>x.special&&x.uid!==d.uid&&x.color==='purple').length;
    if(d.special==='map_room')s+=player.hand.length;
  });
  // Extension score hooks
  EXT._scoreHooks.forEach(fn=>{s+=fn(player,isFirst,s);});
  return s;
}

// ── STATE ──────────────────────────────────────────────────────────────────────
function newGame(){
  const deck=shuffle(mkDeck());
  const crown=0|Math.random()*4;
  const players=[
    {id:0,name:'You',       ai:false,gold:2,hand:[],city:[],char:null,dead:false,stolenTarget:null,smithyUsed:false,pendingKill:null},
    {id:1,name:'Lady Mira', ai:true, gold:2,hand:[],city:[],char:null,dead:false,stolenTarget:null,smithyUsed:false,pendingKill:null},
    {id:2,name:'Duke Arven',ai:true, gold:2,hand:[],city:[],char:null,dead:false,stolenTarget:null,smithyUsed:false,pendingKill:null},
    {id:3,name:'Baron Selt',ai:true, gold:2,hand:[],city:[],char:null,dead:false,stolenTarget:null,smithyUsed:false,pendingKill:null},
  ];
  const d=[...deck];players.forEach(p=>{p.hand=d.splice(0,4);});
  return{phase:'draft',sub:'idle',round:1,deck:d,trash:[],players,crown,
    draftOrder:draftSeq(crown,4),draftIdx:0,avail:[1,2,3,4,5,6,7,8],
    heraldQueue:[],heraldIdx:0,heraldAfter:'action',heraldAcks:[],
    callIdx:1,log:['The game begins!'],firstCompleter:null,
    collected:false,builtCount:0,drawOpts:[],selCards:[],pendingDestroy:null,_confirmEnd:false};
}
function draftSeq(crown,n){return Array.from({length:n},(_,i)=>(crown+i)%n);}

function buildCost(player,district){
  if(district.color==='purple'&&district.special!=='factory'&&player.city.some(d=>d.id==='factory'))
    return Math.max(1,district.cost-1);
  return district.cost;
}

// ── AI ─────────────────────────────────────────────────────────────────────────
function aiPickChar(p,avail,state){
  const humanMax=Math.max(0,...state.players.filter(q=>!q.ai).map(q=>q.city.length));
  const pref=[];
  if(humanMax>=6&&avail.includes(8))pref.push(8);
  if(p.gold>=6&&avail.includes(7))pref.push(7);
  if(p.city.filter(d=>d.color==='blue').length>=2&&avail.includes(5))pref.push(5);
  if(p.city.filter(d=>d.color==='green').length>=2&&avail.includes(6))pref.push(6);
  if(p.city.filter(d=>d.color==='yellow').length>=2&&avail.includes(4))pref.push(4);
  for(const c of [...pref,6,4,5,3,2,1,8,7])if(avail.includes(c))return c;
  return avail[0|Math.random()*avail.length];
}
function aiBestBuild(p){
  const can=p.hand.filter(d=>{const cost=buildCost(p,d);return cost<=p.gold&&!p.city.some(c=>c.id===d.id);});
  return can.length?can.sort((a,b)=>buildCost(p,a)-buildCost(p,b))[0]:null;
}
function addLog(s,msg){return{...s,log:[...s.log,msg]};}

// ── DRAFT ──────────────────────────────────────────────────────────────────────
function runAIDraft(state){
  let s={...state,players:state.players.map(p=>({...p})),avail:[...state.avail]};
  while(s.draftIdx<s.players.length){
    const pid=s.draftOrder[s.draftIdx];
    const p=s.players[pid];
    if(!p.ai)break;
    const picked=aiPickChar(p,s.avail,s);
    s.players=s.players.map(q=>q.id===pid?{...q,char:picked}:q);
    s.avail=s.avail.filter(c=>c!==picked);s.draftIdx++;
  }
  if(s.draftIdx>=s.players.length)s=startActionPhase(s);
  return s;
}
function humanDraft(state,charId){
  let s={...state,players:state.players.map(p=>p.id===0?{...p,char:charId}:p),
    avail:state.avail.filter(c=>c!==charId),draftIdx:state.draftIdx+1};
  s=addLog(s,'You secretly choose your character.');
  if(s.draftIdx>=s.players.length)return startActionPhase(s);
  return runAIDraft(s);
}

// ── ACTION PHASE ───────────────────────────────────────────────────────────────
function startActionPhase(state){
  let s={...state,phase:'action',sub:'idle',callIdx:1,
    collected:false,builtCount:0,drawOpts:[],selCards:[],heraldQueue:[],heraldIdx:0,heraldAcks:[],
    players:state.players.map(p=>({...p,smithyUsed:false}))};
  s=addLog(s,`Round ${s.round}: The Herald calls characters...`);
  return advanceCall(s,_applyLocalSlot);
}

function advanceCall(state, localSlot){
  if(localSlot===undefined)localSlot=0;
  let s={...state};
  while(s.callIdx<=8){
    const holder=s.players.find(p=>p.char===s.callIdx);
    if(!holder){s={...s,heraldQueue:[...s.heraldQueue,{charId:s.callIdx,holderName:null,events:[]}],callIdx:s.callIdx+1};continue;}
    if(holder.dead){s={...s,heraldQueue:[...s.heraldQueue,{charId:s.callIdx,holderName:holder.name,events:[
      {icon:'☠️',text:`${holder.name} was assassinated and skips this turn.`,color:'#cc4444'}]}],callIdx:s.callIdx+1};continue;}

    // Remote human peer — stop and wait for their action message
    if(!holder.ai && holder.id!==localSlot){
      const sotR=applyStartOfTurn(s,s.callIdx,holder.id);s=sotR.state;const sotEvents=sotR.events;
      let q=[...s.heraldQueue];
      if(sotEvents.length>0)q=[...q,{charId:s.callIdx,holderName:holder.name+"'s turn begins",events:sotEvents,isStartOnly:true}];
      return{...s,heraldQueue:q.length?q:s.heraldQueue,heraldIdx:0,
        phase:q.length?'herald':'action',
        heraldAfter:'peer_act',
        sub:'idle',collected:false,builtCount:0,drawOpts:[],selCards:[]};
    }

    // Local human — stop for local input
    if(!holder.ai && holder.id===localSlot){
      const sotR=applyStartOfTurn(s,s.callIdx,localSlot);s=sotR.state;const sotEvents=sotR.events;
      // If assassinated during start-of-turn (human pendingKill applied), skip turn like the dead branch
      if(s.players.find(p=>p.id===localSlot).dead){
        s={...s,heraldQueue:[...s.heraldQueue,{charId:s.callIdx,holderName:holder.name,events:sotEvents}],callIdx:s.callIdx+1};
        continue;
      }
      if(s.heraldQueue.length>0||sotEvents.length>0){
        let q=[...s.heraldQueue];
        if(sotEvents.length>0)q=[...q,{charId:s.callIdx,holderName:'Your turn begins',events:sotEvents,isStartOnly:true}];
        return{...s,heraldQueue:q,heraldIdx:0,phase:'herald',heraldAfter:'human_act'};
      }
      return{...s,phase:'action',sub:'choose',collected:false,builtCount:0,drawOpts:[],selCards:[]};
    }

    const {state:ns,events}=doAITurn(s,holder.id,s.callIdx);
    s={...ns,heraldQueue:[...ns.heraldQueue,{charId:s.callIdx,holderName:holder.name,events}],callIdx:ns.callIdx+1};
  }
  if(s.heraldQueue.length>0)return{...s,phase:'herald',heraldIdx:0,heraldAfter:'end_round'};
  return endRound(s);
}

function applyStartOfTurn(state,charId,pid){
  let s={...state};const p=()=>s.players.find(q=>q.id===pid);const events=[];

  // Apply pending assassination
  if(charId!==1){
    s.players.filter(q=>!q.ai&&q.pendingKill===charId).forEach(assassin=>{
      const victim=s.players.find(q=>q.char===charId&&q.id!==assassin.id);
      if(victim){
        s={...s,players:s.players.map(q=>
          q.id===victim.id?{...q,dead:true}:
          q.id===assassin.id?{...q,pendingKill:null}:q
        )};
        events.push({icon:'☠️',text:`${assassin.name} (Assassin) eliminates the ${CHARS[charId-1].name}!`,color:'#cc7777'});
      }
    });
  }

  // Apply thief steal (only if target was not assassinated this same turn)
  if(charId!==1&&charId!==2){
    const thief=s.players.find(q=>q.char===2&&!q.dead&&q.stolenTarget===charId);
    if(thief&&!p().dead){const stolen=p().gold;if(stolen>0){
      events.push({icon:'💰',text:`${thief.name} (Thief) steals ${stolen}✦ from ${p().name}!`,color:'#b0b0b0'});
      s={...s,players:s.players.map(q=>{if(q.id===thief.id)return{...q,gold:q.gold+stolen};if(q.id===pid)return{...q,gold:0};return q;})};}}
  }
  let bonus=0,newCrown=s.crown;
  if(charId===4){
    newCrown=pid;
    bonus=p().city.filter(d=>d.color==='yellow').length;
    events.push({icon:'👑',text:bonus>0?`${p().name} takes the Crown and earns ${bonus}✦ from Noble districts!`:`${p().name} takes the Crown!`,color:'#d4a843'});
    s={...s,crown:newCrown};
    if(bonus>0)s={...s,players:s.players.map(q=>q.id===pid?{...q,gold:q.gold+bonus}:q)};
  }else if(charId===5){
    bonus=p().city.filter(d=>d.color==='blue').length;
    if(bonus>0){events.push({icon:'⛪',text:`${p().name} earns ${bonus}✦ from Religious districts.`,color:'#5a9fd4'});
      s={...s,players:s.players.map(q=>q.id===pid?{...q,gold:q.gold+bonus}:q)};}
  }else if(charId===6){
    bonus=1+p().city.filter(d=>d.color==='green').length;
    events.push({icon:'💰',text:`${p().name} earns ${bonus}✦ (Merchant bonus + Trade income).`,color:'#4db87a'});
    s={...s,players:s.players.map(q=>q.id===pid?{...q,gold:q.gold+bonus}:q)};
  }else if(charId===8){
    bonus=p().city.filter(d=>d.color==='red').length;
    if(bonus>0){events.push({icon:'⚔️',text:`${p().name} earns ${bonus}✦ from Military districts.`,color:'#d45a5a'});
      s={...s,players:s.players.map(q=>q.id===pid?{...q,gold:q.gold+bonus}:q)};}
  }
  if(charId===7){
    const drawn=s.deck.slice(0,Math.min(2,s.deck.length));
    if(drawn.length>0){s={...s,deck:s.deck.slice(drawn.length),players:s.players.map(q=>q.id===pid?{...q,hand:[...q.hand,...drawn]}:q)};
      events.push({icon:'🃏',text:`${p().name} draws ${drawn.length} extra card${drawn.length>1?'s':''} as the Architect.`,color:'#e0975c'});}
  }
  // Extension start-of-turn hooks (for expansion characters)
  EXT._sotHooks.forEach(fn=>{
    const r=fn(s,charId,pid);
    if(r){s=r.state||s;if(r.events)events.push(...r.events);}
  });
  return{state:s,events};
}

function doAITurn(state,pid,charId){
  let s={...state};const events=[];
  const sotR=applyStartOfTurn(s,charId,pid);s=sotR.state;events.push(...sotR.events);
  const p=()=>s.players.find(q=>q.id===pid);
  // If this player was assassinated during start-of-turn (via human pendingKill), skip their turn
  if(p().dead){return{state:s,events};}
  // Income
  const hasLib=p().city.some(d=>d.id==='library');
  if(p().hand.length<3&&s.deck.length>0){
    const cnt=hasLib?Math.min(2,s.deck.length):1;
    const drawn=s.deck.slice(0,cnt);
    s={...s,deck:s.deck.slice(cnt),players:s.players.map(q=>q.id===pid?{...q,hand:[...q.hand,...drawn]}:q)};
    events.push({icon:'🃏',text:`${p().name} draws ${cnt} card${cnt>1?'s':''} for income.`,color:'#888'});
  }else{
    s={...s,players:s.players.map(q=>q.id===pid?{...q,gold:q.gold+2}:q)};
    events.push({icon:'✦',text:`${p().name} collects 2✦ gold.`,color:'#d4a843'});
  }
  // Specials
  if(charId===1){
    const humanPlayers=s.players.filter(q=>!q.ai&&q.id!==pid);
    const mainTarget=humanPlayers.sort((a,b)=>b.city.length-a.city.length)[0];
    const humanChar=mainTarget?.char;
    const validT=CHARS.filter(c=>c.id!==1).map(c=>c.id);
    const target=humanChar&&humanChar!==1?humanChar:validT[0|Math.random()*validT.length];
    const victim=s.players.find(q=>q.char===target);
    if(victim&&victim.id!==pid){s={...s,players:s.players.map(q=>q.id===victim.id?{...q,dead:true}:q)};
      events.push({icon:'🗡️',text:`${p().name} assassinates the ${CHARS[target-1].name}!`,color:'#cc7777'});}
  }else if(charId===2){
    const others=s.players.filter(q=>q.id!==pid&&q.char&&q.char!==1&&q.char!==2);
    if(others.length){const richest=others.sort((a,b)=>b.gold-a.gold)[0];
      s={...s,players:s.players.map(q=>q.id===pid?{...q,stolenTarget:richest.char}:q)};
      events.push({icon:'🦹',text:`${p().name} declares theft on the ${CHARS[richest.char-1].name}.`,color:'#b0b0b0'});}
  }else if(charId===3){
    const others=s.players.filter(q=>q.id!==pid);const most=others.sort((a,b)=>b.hand.length-a.hand.length)[0];
    if(most&&most.hand.length>p().hand.length){
      const myH=[...p().hand],thH=[...most.hand];
      s={...s,players:s.players.map(q=>{if(q.id===pid)return{...q,hand:thH};if(q.id===most.id)return{...q,hand:myH};return q;})};
      events.push({icon:'🔄',text:`${p().name} swaps hands with ${most.name}!`,color:'#9b6fff'});
    }else events.push({icon:'🧙',text:`${p().name} (Magician) keeps their hand.`,color:'#9b6fff'});
  }else if(charId===8){
    const humanTargets=s.players.filter(q=>q.id!==pid&&!q.ai&&!(q.char===5&&!q.dead)&&q.city.length>0);
    const target=humanTargets.sort((a,b)=>b.city.length-a.city.length)[0]||null;
    if(target){
      const wallBonus=target.city.some(d=>d.id==='great_wall');
      const destructible=target.city.filter(d=>{if(d.id==='keep')return false;const c1=wallBonus?d.cost:Math.max(0,d.cost-1);return c1<=p().gold;});
      if(destructible.length){const t=destructible.sort((a,b)=>b.cost-a.cost)[0];
        const c1=wallBonus?t.cost:Math.max(0,t.cost-1);
        s={...s,players:s.players.map(q=>{if(q.id===pid)return{...q,gold:q.gold-c1};if(q.id===target.id)return{...q,city:q.city.filter(d=>d.uid!==t.uid)};return q;})};
        events.push({icon:'💥',text:`${p().name} destroys ${target.name}'s ${t.name}! (paid ${c1}✦)`,color:'#d45a5a'});}
    }
  }else if(EXT._aiHooks[charId]){
    // Extension AI hook for expansion characters
    const r=EXT._aiHooks[charId](s,pid);
    if(r){s=r.state||s;if(r.events)events.push(...r.events);}
  }
  // Smithy
  if(p().city.some(d=>d.id==='smithy')&&!p().smithyUsed&&p().gold>=2&&s.deck.length>=1){
    const drawn=s.deck.slice(0,Math.min(3,s.deck.length));
    s={...s,deck:s.deck.slice(drawn.length),players:s.players.map(q=>q.id===pid?{...q,gold:q.gold-2,hand:[...q.hand,...drawn],smithyUsed:true}:q)};
    events.push({icon:'⚒️',text:`${p().name} uses the Smithy: pay 2✦, draw ${drawn.length} cards.`,color:'#c084fc'});
  }
  // Build
  const maxB=charId===7?3:1;let built=0;
  for(let i=0;i<maxB;i++){
    const dist=aiBestBuild(p());if(!dist)break;built++;
    const cost=buildCost(p(),dist);
    s={...s,players:s.players.map(q=>q.id===pid?{...q,gold:q.gold-cost,hand:q.hand.filter(c=>c.uid!==dist.uid),city:[...q.city,dist]}:q)};
    events.push({icon:DEMOJI[dist.id]||'🏛️',text:`${p().name} builds ${dist.name} (${cost}✦ — ${CS[dist.color].label}).`,color:CS[dist.color].txt});
    s=addLog(s,`${p().name} builds ${dist.name}.`);
    if(p().city.length>=8&&s.firstCompleter===null){s={...s,firstCompleter:pid};
      events.push({icon:'🏆',text:`${p().name} completes 8 districts! Final round!`,color:'#d4a843'});
      s=addLog(s,`🏰 ${p().name} completes 8 districts!`);}
  }
  if(!built)events.push({icon:'—',text:`${p().name} cannot afford to build.`,color:'#4a3e2a'});
  return{state:s,events};
}

function endRound(state){
  let s={...state};if(s.firstCompleter!==null)return{...s,phase:'gameover'};
  const crownIdx=s.draftOrder.indexOf(s.crown);
  const newDraftOrder=crownIdx>=0
    ?[...s.draftOrder.slice(crownIdx),...s.draftOrder.slice(0,crownIdx)]
    :s.draftOrder;
  s={...s,round:s.round+1,phase:'draft',sub:'idle',draftIdx:0,callIdx:1,heraldQueue:[],heraldIdx:0,heraldAcks:[],
    draftOrder:newDraftOrder,avail:[1,2,3,4,5,6,7,8],
    players:s.players.map(p=>({...p,char:null,dead:false,stolenTarget:null,pendingKill:null}))};
  s={...s,pendingDestroy:null};
  s=addLog(s,`Round ${s.round} begins. Crown: ${s.players[s.crown].name}`);
  return runAIDraft(s);
}

function humanSlots(state){return state.players.filter(p=>!p.ai).map(p=>p.id);}

function heraldNext(state){return heraldAck(state,0);}

function heraldAck(state,slotId){
  const acks=[...new Set([...(state.heraldAcks||[]),slotId])];
  const humans=humanSlots(state);
  const allAcked=humans.every(id=>acks.includes(id));
  if(!allAcked)return{...state,heraldAcks:acks};
  const next=state.heraldIdx+1;
  if(next<state.heraldQueue.length)return{...state,heraldIdx:next,heraldAcks:[]};
  const cleared={...state,heraldQueue:[],heraldIdx:0,heraldAcks:[]};
  if(cleared.heraldAfter==='end_round'){
    const newState=endRound(cleared);
    // Notify net.js that a round ended so the host can broadcast
    if(_onRoundEnd)setTimeout(()=>_onRoundEnd(),50);
    return newState;
  }
  if(cleared.heraldAfter==='peer_act')return{...cleared,phase:'action',sub:'idle'};
  return{...cleared,phase:'action',sub:'choose',collected:false,builtCount:0,drawOpts:[],selCards:[]};
}

// ── HUMAN ACTIONS ──────────────────────────────────────────────────────────────
// These are regular function declarations so net.js can reassign them for peer-mode
// play via _patchActionsForPeer(). Function declarations at the top level of
// non-module scripts create window-level bindings that are patchable across files.

function humanCollectGold(state){return addLog({...state,collected:true,players:state.players.map(p=>p.id===0?{...p,gold:p.gold+2}:p)},'You collect 2✦.');}

function humanCollectCards(state){
  if(!state.deck.length&&!state.trash.length)return state;
  let deck=[...state.deck];let trash=[...state.trash];
  if(!deck.length){deck=shuffle(trash);trash=[];}
  const me=state.players[0];
  const hasObs=me.city.some(d=>d.id==='observatory');
  const cnt=hasObs?Math.min(3,deck.length):Math.min(2,deck.length);
  const drawn=deck.slice(0,cnt);const newDeck=deck.slice(cnt);
  if(me.city.some(d=>d.id==='library')&&cnt===2)
    return addLog({...state,collected:true,deck:newDeck,trash,players:state.players.map(p=>p.id===0?{...p,hand:[...p.hand,...drawn]}:p)},`Library: you keep both cards (${drawn.map(d=>d.name).join(', ')}).`);
  return{...state,deck:newDeck,trash,sub:'draw_pick',drawOpts:drawn};
}

function humanKeepCard(state,uid){
  const kept=state.drawOpts.find(d=>d.uid===uid);const disc=state.drawOpts.filter(d=>d.uid!==uid);
  return addLog({...state,sub:'choose',collected:true,drawOpts:[],trash:[...state.trash,...disc],
    players:state.players.map(p=>p.id===0?{...p,hand:[...p.hand,kept]}:p)},`You keep ${kept.name}.`);
}

function humanBuild(state,uid){
  const p=state.players[0];const maxB=p.char===7?3:1;if(state.builtCount>=maxB)return state;
  const card=p.hand.find(d=>d.uid===uid);if(!card)return state;
  const cost=buildCost(p,card);if(cost>p.gold||p.city.some(c=>c.id===card.id))return state;
  let s={...state,builtCount:state.builtCount+1,
    players:state.players.map(q=>q.id===0?{...q,gold:q.gold-cost,hand:q.hand.filter(d=>d.uid!==uid),city:[...q.city,card]}:q)};
  s=addLog(s,`You build ${card.name} (${cost}✦${card.cost>cost?' — Factory discount':''}).`);
  if(s.players[0].city.length>=8&&s.firstCompleter===null){
    s={...s,firstCompleter:s.players[0].id};
    s=addLog(s,`🏰 ${s.players[0].name} completes 8 districts! Final round!`);
  }
  return s;
}

function humanUseSmithy(state){
  const me=state.players[0];
  if(!me.city.some(d=>d.id==='smithy')||me.smithyUsed||me.gold<2||!state.deck.length)return state;
  const drawn=state.deck.slice(0,Math.min(3,state.deck.length));
  return addLog({...state,deck:state.deck.slice(drawn.length),
    players:state.players.map(p=>p.id===0?{...p,gold:p.gold-2,hand:[...p.hand,...drawn],smithyUsed:true}:p)},`Smithy: pay 2✦, draw ${drawn.length} cards.`);
}

function humanEndTurn(state){
  let s={...state};
  const demolishEvent=[];
  if(s.pendingDestroy){
    const{cost:c1,name:dname,tpName}=s.pendingDestroy;
    demolishEvent.push({icon:'💥',text:`Demolished ${tpName}'s ${dname} (−${c1}✦).`,color:'#d45a5a'});
    s={...s,pendingDestroy:null};
  }
  const me=s.players[0];const charId=me.char;const humanEvents=[];
  if(s.collected)humanEvents.push({icon:'✦',text:'Collected income.',color:'#d4a843'});
  if(me.smithyUsed)humanEvents.push({icon:'⚒️',text:'Used the Smithy.',color:'#c084fc'});
  humanEvents.push(...demolishEvent);
  const built=s.builtCount;
  if(built>0)me.city.slice(-built).forEach(d=>humanEvents.push({icon:DEMOJI[d.id]||'🏛️',text:`Built ${d.name} (${buildCost(me,d)}✦).`,color:CS[d.color].txt}));
  else humanEvents.push({icon:'—',text:'Did not build.',color:'#4a3e2a'});
  s={...s,heraldQueue:[...s.heraldQueue,{charId,holderName:me.name,events:humanEvents,isHuman:true}],callIdx:s.callIdx+1,sub:'idle'};
  return advanceCall(s,_applyLocalSlot);
}

function humanKill(s,tc){
  return addLog({...s,sub:'choose',players:s.players.map(p=>p.id===0?{...p,pendingKill:tc}:p)},
    `You (Assassin) target the ${CHARS[tc-1].name}.`);
}

function humanSteal(s,tc){return addLog({...s,sub:'choose',players:s.players.map(p=>p.id===0?{...p,stolenTarget:tc}:p)},`You target the ${CHARS[tc-1].name} for theft.`);}

function humanMagSwap(s,tid){const o=s.players.find(p=>p.id===tid),me=s.players[0];
  return addLog({...s,sub:'choose',players:s.players.map(p=>{if(p.id===0)return{...p,hand:[...o.hand]};if(p.id===tid)return{...p,hand:[...me.hand]};return p;})},`You swap hands with ${o.name}!`);}

function humanMagDiscard(s,uids){
  if(!uids.length)return{...s,sub:'choose',selCards:[]};
  const disc=s.players[0].hand.filter(d=>uids.includes(d.uid));
  let deck=[...s.deck];let trash=[...s.trash];
  if(deck.length<uids.length&&trash.length>0){deck=[...deck,...shuffle(trash)];trash=[];}
  const drawn=deck.splice(0,Math.min(uids.length,deck.length));
  return addLog({...s,sub:'choose',selCards:[],deck,trash:[...trash,...disc],
    players:s.players.map(p=>p.id===0?{...p,hand:[...p.hand.filter(d=>!uids.includes(d.uid)),...drawn]}:p)},
    `You discard ${uids.length}, draw ${drawn.length}.`);
}

function humanWarlord(s,tpid,duid){
  const me=s.players[0],tp=s.players.find(p=>p.id===tpid);
  if(!tp||(tp.char===5&&!tp.dead))return{...s,sub:'choose'};
  const dist=tp.city.find(d=>d.uid===duid);if(!dist||dist.id==='keep')return{...s,sub:'choose'};
  const wallBonus=tp.city.some(d=>d.id==='great_wall');
  const c1=wallBonus?dist.cost:Math.max(0,dist.cost-1);if(c1>me.gold)return{...s,sub:'choose'};
  let ns={...s,pendingDestroy:{pid:tpid,duid,cost:c1,name:dist.name,tpName:tp.name,distObj:dist},
    players:s.players.map(p=>{
      if(p.id===0)return{...p,gold:p.gold-c1};
      if(p.id===tpid)return{...p,city:p.city.filter(d=>d.uid!==duid)};
      return p;
    })};
  return addLog({...ns,sub:'choose'},`You destroy ${tp.name}'s ${dist.name} for ${c1}✦!`);
}

var _applyLocalSlot=0;
