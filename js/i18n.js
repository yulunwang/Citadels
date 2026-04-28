// ═══════════════════════════════════════════════════════════════════════════════
// I18N — Simplified Chinese / English localisation
//
// Load order: after data.js, before engine.js.
// Exposes: LANG, t(), cn(), ca(), dn(), sdesc(), clabel(), _te(), toggleLang()
// ═══════════════════════════════════════════════════════════════════════════════

var LANG = localStorage.getItem('citadels_lang') || 'en';

// ── Character names ────────────────────────────────────────────────────────────
var I18N_CHAR_NAMES_ZH = {
  1:'刺客', 2:'盗贼', 3:'魔法师', 4:'国王', 5:'主教',
  6:'商人', 7:'建筑师', 8:'军阀', 9:'王后', 10:'航海家',
  11:'巫师', 12:'贵族老爷', 13:'修道院长', 14:'学者', 15:'先知', 16:'贸易商'
};

// ── Character abilities ────────────────────────────────────────────────────────
var I18N_CHAR_ABILITIES_ZH = {
  1: '消灭一个角色——他们本轮跳过自己的回合。',
  2: '宣布目标；当目标被召唤时，窃取其所有金币。',
  3: '与某位玩家交换手牌，或弃掉若干手牌并重新摸取等量牌。',
  4: '获得王冠——下轮优先选择角色。每有一座贵族（黄色）地区建筑，获得+1✦。',
  5: '免受军阀攻击。每有一座宗教（蓝色）地区建筑，获得+1✦。',
  6: '获得+1✦奖励。每有一座贸易（绿色）地区建筑，获得+1✦。',
  7: '立即额外摸2张牌。本回合最多可建造3座地区。',
  8: '摧毁一座地区（花费其费用-1金币）。每有一座军事（红色）地区建筑，获得+1✦。',
  9: '若坐在持有国王牌的玩家旁边，获得3✦。',
  10: '获得4✦或摸4张牌作为收入。本回合不能建造地区。',
  11: '查看某玩家的手牌，从中取1张，然后保留或立即建造。',
  12: '获得王冠——下轮优先选择角色。每有一座贵族（黄色）地区建筑，摸+1张牌。',
  13: '每有一座宗教（蓝色）地区建筑，获得+1✦。从最富有的对手那里窃取1✦。',
  14: '从牌堆摸7张牌，保留1张。本回合最多可建造2座地区。',
  15: '特殊：从每位对手手中随机取1张牌。本回合最多可建造2座地区。',
  16: '城市中每有一座贸易（绿色）地区建筑，获得+1✦。本回合最多可建造2座地区。'
};

// ── District names ─────────────────────────────────────────────────────────────
var I18N_DIST_NAMES_ZH = {
  manor:'庄园', castle:'城堡', palace:'宫殿',
  temple:'神庙', church:'教堂', monastery:'修道院', cathedral:'大教堂',
  tavern:'酒馆', market:'集市', trading_post:'贸易站', docks:'船坞', harbor:'港口', town_hall:'市政厅',
  watchtower:'瞭望塔', prison:'监狱', battlefield:'战场', fortress:'要塞',
  haunted_city:'鬼城', factory:'工厂', dragon_gate:'龙之门', university:'大学',
  thieves_den:'盗贼巢穴', keep:'主楼', graveyard:'墓地', observatory:'天文台',
  smithy:'铁匠铺', library:'图书馆', school_of_magic:'魔法学院', wishing_well:'许愿井',
  map_room:'地图室', secret_vault:'秘密金库', great_wall:'长城',
  quarry:'采石场', basilica:'圣殿', capitol:'国会大厦', ivory_tower:'象牙塔', laboratory:'实验室'
};

// ── District color labels ──────────────────────────────────────────────────────
var I18N_COLOR_LABELS_ZH = {
  yellow:'贵族', blue:'宗教', green:'贸易', red:'军事', purple:'独特'
};

// ── SDESC descriptions ─────────────────────────────────────────────────────────
var I18N_SDESC_ZH = {
  flex_color:  '游戏结束时，计算5色多样奖励（+3分）时，可算作任何颜色。',
  bonus2:      '游戏结束时，额外获得+2胜利点。',
  keep:        '无法被军阀摧毁。',
  graveyard:   '当任何地区被摧毁时，支付1✦可将其收入手牌。',
  observatory: '摸牌收入时，摸3张保留1张（代替正常的摸2留1）。',
  smithy:      '每回合一次：支付2✦，摸3张地区牌。',
  library:     '摸牌收入时，保留摸到的两张牌。',
  factory:     '你建造其他紫色独特地区时，费用降低1✦。',
  wishing_well:'游戏结束时，每有一座其他紫色（独特）地区，获得+1分。',
  map_room:    '游戏结束时，手牌中每有一张牌，获得+1分。',
  secret_vault:'在游戏中，其价值对其他玩家保密。游戏结束计3分。',
  great_wall:  '军阀摧毁你的地区时，必须支付完整费用（而非费用-1）。',
  thieves_den: '可以用金币与手牌的任意组合来建造。',
  queen:       '若坐在持有国王牌的玩家旁边（环形座位），每回合开始时获得3✦。',
  navigator:   '收入阶段获得4✦或摸4张牌，本回合不能建造地区。',
  wizard:      '查看某玩家的手牌并取走1张。',
  seer:        '作为特殊行动，从每位对手手中随机取1张牌。本回合最多建造2座地区。',
  trader:      '城市中每有一座贸易（绿色）地区，每轮获得+1✦。每回合最多建造2座地区。',
  basilica:    '游戏结束时，城市中每有一座奇数费用地区，获得+1分。',
  capitol:     '若有3座或以上同色地区，游戏结束时获得+3分。',
  ivory_tower: '若这是你唯一的紫色地区，游戏结束时获得+5分。',
  quarry:      '可以建造重复地区（与城市中已有同名地区相同）。',
  laboratory:  '每回合一次：从手牌丢弃1张牌，获得2✦。'
};

// ── UI strings ─────────────────────────────────────────────────────────────────
var I18N_EN = {
  // Topbar / game header
  'topbar.title': '⚜ Citadels',
  'topbar.round_crown': function(v){return 'Round '+v.n+' · Crown: '+v.name;},
  'topbar.calling': function(v){return v.emoji+' Calling: '+v.name;},
  'topbar.draft': '📜 Draft',
  'topbar.end_game': '✕ End Game',
  'topbar.end_btn_short': '✕',
  'badge.you': 'YOU',
  'badge.hidden': '🎭 Hidden',
  'player.no_city': 'No districts built yet.',
  'player.you': ' (You)',
  'city.label': function(v){return '🏰 YOUR CITY ('+v.n+'/8) · '+v.pts+' pts';},
  'city.desktop': function(v){return 'YOUR CITY ('+v.n+'/8)';},
  'hand.label': 'YOUR HAND',
  'hand.label_mobile': 'HAND',
  'hand.empty': 'No cards in hand',
  'hand.nothing_built': 'Nothing built yet',
  'pts.suffix': 'pts',
  'all_players': 'All Players',
  // Confirm end dialog
  'confirm.end.title': 'End the Game?',
  'confirm.end.body': 'This will immediately end the current game and return to the home screen. All progress will be lost.',
  'confirm.end.cancel': 'Keep Playing',
  'confirm.end.confirm': 'End Game',
  // Herald
  'herald.char_n_of_m': function(v){return 'Character '+v.n+' of '+v.m;},
  'herald.no_one': 'No one answered this call.',
  'herald.turn_summary': 'Turn Summary',
  'herald.no_actions': 'No actions taken.',
  'herald.ready': function(v){return '✓ Ready ('+v.n+'/'+v.m+' players ready)';},
  'herald.next_multi': function(v){return v.label+' ('+v.n+'/'+v.m+' ready)';},
  'herald.next': 'Next ›',
  'herald.end_round': 'End Round ›',
  'herald.your_turn': 'Your Turn ›',
  // Draft
  'draft.choose': 'Choose your character for this round:',
  'draft.removed_s': function(v){return '🎴 '+v.n+' card removed before drafting';},
  'draft.removed_p': function(v){return '🎴 '+v.n+' cards removed before drafting';},
  'draft.not_in_play': '✕ NOT IN PLAY',
  // Player bar states
  'state.picked': 'Picked',
  'state.choosing': 'Choosing now…',
  'state.waiting': 'Waiting',
  'state.killed': 'Killed',
  'state.active': 'Active',
  'state.waiting_peer': function(v){return '⏳ Waiting for '+v.name+' to choose their character...';},
  'state.waiting_others': '⏳ Others are choosing characters...',
  'state.waiting_player': function(v){return '⏳ Waiting for '+v.name+'...';},
  'state.waiting_dot': '⏳ Waiting...',
  // Char reference panel
  'char_ref.title': 'Characters This Round',
  // Income
  'income.label': 'COLLECT INCOME',
  'income.nav_gold': '⚓ Take 4 Gold',
  'income.nav_cards': '⚓ Draw 4 Cards',
  'income.nav_warning': '⚠ Navigator cannot build a district this turn.',
  'income.take_gold': '💰 Take 2 Gold',
  'income.draw_scholar': '📖 Draw 7, Keep 1 (Scholar)',
  'income.draw_obs': '🔭 Draw 3, Keep 1 (Observatory)',
  'income.draw_library': '📚 Draw 2, Keep BOTH (Library)',
  'income.draw_normal': '🃏 Draw 2, Keep 1',
  'draw_pick.scholar': function(v){return 'Choose one card to keep (Scholar: '+v.n+' shown):';},
  'draw_pick.obs': 'Choose one card to keep (Observatory: 3 shown):',
  'draw_pick.normal': 'Choose one card to keep:',
  // Special abilities
  'special.label': 'SPECIAL ABILITY',
  'active_bldg.label': 'ACTIVE BUILDINGS',
  'smithy.title': 'Smithy',
  'smithy.desc': 'Pay 2✦ to draw 3 district cards (once per turn)',
  'smithy.use': 'Use (−2✦)',
  'lab.title': 'Laboratory',
  'lab.desc': 'Discard 1 card to gain 2✦ (once per turn) — click a hand card below',
  // Build
  'build.label': function(v){return 'BUILD DISTRICT ('+v.n+'/'+v.m+') · 💰 '+v.gold+'✦';},
  'build.no_cards': 'No cards in hand.',
  'build.cannot_afford': 'Cannot afford to build.',
  'build.done': function(v){return '✅ District built this turn ('+v.n+'/'+v.m+')';},
  'build.confirm_for': function(v){return '🏗 Build for '+v.cost+'✦';},
  'build.already_built': 'Already built',
  'build.not_enough_gold': function(v){return 'Not enough gold (need '+v.cost+'✦, have '+v.gold+'✦)';},
  // Thieves' Den payment
  'den.pay': function(v){return 'Pay '+v.cost+'✦ with '+v.gold+'✦ gold + discard cards (need '+v.deficit+' more):';},
  'den.build_btn': function(v){return '🏗 Build ('+v.gold+'✦ + '+v.n+' card'+(v.n!==1?'s':'')+')';},
  'den.build_btn_zero': function(v){return '🏗 Build ('+v.gold+'✦ + 0 cards)';},
  'cost.normally': function(v){return v.cost+'✦ ('+v.orig+'✦ normally)';},
  // End turn / nav
  'nav.note': '⚓ Navigator: income collected. No district may be built this turn.',
  'end_turn': 'End Turn →',
  // Assassin
  'assassin.choose': 'Choose a character to assassinate:',
  'assassin.will': 'Will assassinate:',
  'assassin.btn': '🗡️ Assassinate',
  'assassin.change': 'Change',
  // Thief
  'thief.choose': 'Steal from which character?',
  'thief.will': 'Will steal from:',
  'thief.btn': '🦹 Declare Theft',
  'thief.change': 'Change',
  // Magician
  'mag.used': '🧙 Magician ability used this turn.',
  'mag.swap_btn': '🔄 Swap Hand',
  'mag.discard_btn': '🗑️ Discard & Redraw',
  'mag.swap_with': 'Swap your hand with:',
  'mag.discard_select': 'Select cards to discard & redraw:',
  'mag.discard_confirm': function(v){return 'Discard '+v.n+' → Draw '+v.n;},
  'mag.cancel': 'Cancel',
  // Wizard
  'wizard.used': '🔮 Wizard ability used this turn.',
  'wizard.no_opponents': 'No opponents have cards to take.',
  'wizard.look_prompt': "Look at a player's hand — choose who to target:",
  'wizard.hand_of': function(v){return v.name+"'s hand — choose a card to take:";},
  'wizard.no_cards': 'No cards in their hand.',
  'wizard.take': 'Take',
  'wizard.build': function(v){return 'Build ('+v.cost+'✦)';},
  'wizard.cancel': 'Cancel',
  // Seer
  'seer.used': '🔯 Seer ability used this turn.',
  'seer.no_opponents': 'No opponents have cards to take.',
  'seer.btn': function(v){return '🔯 Take from All ('+v.n+' opponent'+(v.n!==1?'s':'')+')';},
  'seer.note': function(v){return 'Takes 1 random card from each of '+v.n+' opponent'+(v.n!==1?'s':'')+'.';},
  // Warlord
  'warlord.choose': 'Destroy which district?',
  'warlord.no_targets': 'No valid targets.',
  'warlord.destroyed': 'Destroyed:',
  'warlord.btn': '⚔️ Destroy a District',
  'warlord.undo': 'Undo ↩',
  // Character-specific notes in action panel
  'note.king_no_noble': '👑 Crown taken — you pick roles first next round. Build Noble (yellow) districts to earn gold each round as King.',
  'note.king_with_noble': function(v){return '👑 Crown taken — you pick roles first next round. +'+v.n+'✦ from '+v.m+' Noble district'+(v.m!==1?'s':'')+' added.';},
  'note.patrician_no_noble': '🏅 Crown taken — you pick roles first next round. Build Noble (yellow) districts to draw cards each round as Patrician.',
  'note.patrician_with_noble': function(v){return '🏅 Crown taken — you pick roles first next round. Drew '+v.m+' card'+(v.m!==1?'s':'')+' from Noble districts.';},
  'note.bishop': function(v){return '⛪ Protected from Warlord. +'+v.n+'✦ from Religious applied.';},
  'note.abbot': function(v){return '🧎 +'+v.n+'✦ from Religious applied. Took 1✦ from richest opponent if any.';},
  'note.merchant': '💰 +1✦ Merchant bonus + Trade income applied.',
  'note.architect': '🏗️ +2 cards drawn. Build up to 3 districts this turn.',
  'note.scholar': '📖 Drew 7 cards, kept 1. Build up to 2 districts this turn.',
  'note.queen': '🫅 Queen bonus applied at start of turn if seated beside the King.',
  'note.navigator': '⚓ Income collected above. No district may be built this turn.',
  'note.trader_no_green': '🏦 Build Trade (green) districts to earn gold each round as Trader. Build up to 2 districts this turn.',
  'note.trader_with_green': function(v){return '🏦 Earned '+v.n+'✦ from '+v.m+' Trade district'+(v.m!==1?'s':'')+'. Build up to 2 districts this turn.';},
  'note.arch_hand': function(v){return '✓ +2 cards drawn already ('+v.n+' in hand). Build up to 3 districts.';},
  'note.scholar_action': '✓ Scholar: draw 7, keep 1 for income. Build up to 2 districts.',
  'note.seer_action': '✓ Seer: use special to take 1 card from each opponent. Build up to 2 districts.',
  'note.trader_action': function(v){return '✓ Trader: +'+v.n+'✦ from Trade districts applied. Build up to 2 districts.';},
  // Game over
  'gameover.title': '🏆 Game Over',
  'gameover.subtitle': function(v){return 'Round '+v.n+' complete';},
  'gameover.districts': function(v){return v.n+' districts built';},
  'gameover.play_again': '🎲 Play Again',
  // Lobby
  'lobby.title': '⚜ Citadels',
  'lobby.subtitle': 'The medieval city-building card game',
  'lobby.error.dismiss': '✕ Dismiss',
  'lobby.how_to_play': 'How would you like to play?',
  'lobby.mode.solo.title': 'Solo',
  'lobby.mode.solo.desc': 'Configure your opponents and characters',
  'lobby.mode.host.title': 'Host Room',
  'lobby.mode.host.desc': 'Create a room and share the code with friends',
  'lobby.mode.join.title': 'Join Room',
  'lobby.mode.join.desc': "Enter a friend's room code to play together",
  'lobby.solo.title': '🤖 Solo Game Setup',
  'lobby.solo.ai_count': 'NUMBER OF OPPONENTS',
  'lobby.solo.ai_label': function(v){return v.n+' AI opponent'+(v.n!==1?'s':'');},
  'lobby.solo.back': '← Back',
  'lobby.solo.start': '▶ Start Game',
  'lobby.avatar.label': 'YOUR AVATAR',
  'lobby.chars.label': 'CHARACTERS',
  'lobby.char.rank': function(v){return 'RANK '+v.n;},
  'lobby.char.rank_lbl': function(v){return 'Rank '+v.n;},
  'lobby.char.replaces': function(v){return 'Replaces: '+v.names+' at this rank';},
  'lobby.charsel.less': '▴ Less',
  'lobby.charsel.customize': '▾ Customize',
  'lobby.host.players.title': '🏠 Room — Players',
  'lobby.host.name_label': 'YOUR NAME',
  'lobby.host.slots.label': 'PLAYER SLOTS',
  'lobby.host.slots.hint': 'Set each slot to AI or Human.',
  'lobby.host.slots.count': function(v){return v.n+' players';},
  'lobby.host.slots.remove': '− Remove',
  'lobby.host.slots.add': '+ Add',
  'lobby.host.slot.you': 'You',
  'lobby.host.chars.title': '🏠 Room — Characters',
  'lobby.host.chars.back': '← Players',
  'lobby.host.chars.create': 'Create Room →',
  'lobby.host.back': '← Back',
  'lobby.host.chars_nav': 'Characters →',
  'lobby.hosting.title': '🏠 Room Ready — Waiting for Players',
  'lobby.hosting.code_label': 'ROOM CODE',
  'lobby.hosting.how_friends': 'How friends join:',
  'lobby.hosting.copy': '📋 Copy Invite Instructions',
  'lobby.hosting.copied': '✓ Copied!',
  'lobby.hosting.copy_fail': '(Copy failed — share manually)',
  'lobby.hosting.order_label': 'PLAYERS & TURN ORDER',
  'lobby.hosting.order_hint': 'Use ↑↓ to set the order players choose characters each round.',
  'lobby.hosting.status.host': 'Host (You)',
  'lobby.hosting.status.connected': 'Connected ✓',
  'lobby.hosting.status.ai': 'AI Bot',
  'lobby.hosting.status.waiting': 'Waiting for player…',
  'lobby.hosting.cancel': '← Cancel',
  'lobby.hosting.start': '▶ Start Game',
  'lobby.hosting.unfilled': 'Unfilled human slots become AI when you start.',
  'lobby.join.title': '🚪 Join a Room',
  'lobby.join.name_label': 'YOUR NAME',
  'lobby.join.code_label': 'ROOM CODE',
  'lobby.join.back': '← Back',
  'lobby.join.join': 'Join ▶',
  'lobby.join.invalid_code': 'Please enter a valid room code.',
  'lobby.connect.connecting': 'Connecting…',
  'lobby.connect.waiting': 'Waiting for host to start…',
  'lobby.connect.joining_room': function(v){return 'Joining room '+v.code+'…';},
  'lobby.connect.in_room': "You're in! The host will start the game shortly.",
  'lobby.connect.players_label': 'PLAYERS IN ROOM',
  'lobby.connect.leave': '← Leave',
  'lobby.players.slot_waiting': '(waiting for player)',
  'lobby.players.peer_tag': 'Host',
  // Generic buttons
  'btn.cancel': 'Cancel',
  'btn.change': 'Change',
  'btn.undo': 'Undo ↩',
  'btn.back': '← Back',
  'btn.dismiss': '✕ Dismiss',
  'btn.none': 'None',
  // Aliases for keys referenced in ui.js
  'navigator.note': '⚓ Navigator: income collected. No district may be built this turn.',
  'action.end_turn': 'End Turn →',
  'assassin.will_kill': 'Will assassinate:',
  'thief.will_steal': 'Will steal from:',
  'magician.used': '🧙 Magician ability used this turn.',
  'magician.swap_btn': '🔄 Swap Hand',
  'magician.discard_btn': '🗑️ Discard & Redraw',
  'king.note_with_gold': function(v){return '👑 Crown taken — you pick roles first next round. +'+v.n+'✦ from '+v.n+' Noble district'+(v.n!==1?'s':'')+' added.';},
  'king.note_no_gold': '👑 Crown taken — you pick roles first next round. Build Noble (yellow) districts to earn gold each round as King.',
  'patrician.note_with_cards': function(v){return '🏅 Crown taken — you pick roles first next round. Drew '+v.n+' card'+(v.n!==1?'s':'')+' from Noble districts.';},
  'patrician.note_no_cards': '🏅 Crown taken — you pick roles first next round. Build Noble (yellow) districts to draw cards each round as Patrician.',
  'bishop.note': function(v){return '⛪ Protected from Warlord. +'+v.n+'✦ from Religious applied.';},
  'abbot.note': function(v){return '🧎 +'+v.n+'✦ from Religious applied. Took 1✦ from richest opponent if any.';},
  'merchant.note': '💰 +1✦ Merchant bonus + Trade income applied.',
  'architect.note': '🏗️ +2 cards drawn. Build up to 3 districts this turn.',
  'scholar.note': '📖 Drew 7 cards, kept 1. Build up to 2 districts this turn.',
  'queen.note': '🫅 Queen bonus applied at start of turn if seated beside the King.',
  'navigator.note_short': '⚓ Income collected above. No district may be built this turn.',
  'wizard.choose_target': "Look at a player's hand — choose who to target:",
  'wizard.player_cards': function(v){return v.name+' ('+v.n+' card'+(v.n!==1?'s':'')+')';},
  'trader.note_with_gold': function(v){return '🏦 Earned '+v.n+'✦ from '+v.n+' Trade district'+(v.n!==1?'s':'')+'. Build up to 2 districts this turn.';},
  'trader.note_no_gold': '🏦 Build Trade (green) districts to earn gold each round as Trader. Build up to 2 districts this turn.',
  'warlord.destroyed_detail': function(v){return v.pname+"'s "+v.dname+' (−'+v.cost+'✦)';},
  // Lang toggle label (shows what clicking will switch TO)
  'lang.switch_to': '中文'
};

var I18N_ZH = {
  'topbar.title': '⚜ 城堡骑士',
  'topbar.round_crown': function(v){return '第'+v.n+'轮 · 王冠：'+v.name;},
  'topbar.calling': function(v){return v.emoji+' 召唤：'+v.name;},
  'topbar.draft': '📜 选角',
  'topbar.end_game': '✕ 结束游戏',
  'topbar.end_btn_short': '✕',
  'badge.you': '我',
  'badge.hidden': '🎭 隐藏',
  'player.no_city': '尚未建造地区。',
  'player.you': '（我）',
  'city.label': function(v){return '🏰 我的城市（'+v.n+'/8）· '+v.pts+'分';},
  'city.desktop': function(v){return '我的城市（'+v.n+'/8）';},
  'hand.label': '我的手牌',
  'hand.label_mobile': '手牌',
  'hand.empty': '手牌为空',
  'hand.nothing_built': '尚未建造',
  'pts.suffix': '分',
  'all_players': '所有玩家',
  'confirm.end.title': '确认结束游戏？',
  'confirm.end.body': '游戏将立即结束并返回主界面，所有进度将丢失。',
  'confirm.end.cancel': '继续游戏',
  'confirm.end.confirm': '结束游戏',
  'herald.char_n_of_m': function(v){return '角色 '+v.n+'/'+v.m;},
  'herald.no_one': '本次召唤无人响应。',
  'herald.turn_summary': '回合总结',
  'herald.no_actions': '本轮无行动。',
  'herald.ready': function(v){return '✓ 已准备（'+v.n+'/'+v.m+'名玩家已准备）';},
  'herald.next_multi': function(v){return v.label+'（'+v.n+'/'+v.m+'准备完毕）';},
  'herald.next': '下一个 ›',
  'herald.end_round': '结束本轮 ›',
  'herald.your_turn': '你的回合 ›',
  'draft.choose': '请选择本轮角色：',
  'draft.removed_s': function(v){return '🎴 选角前已移除'+v.n+'张牌';},
  'draft.removed_p': function(v){return '🎴 选角前已移除'+v.n+'张牌';},
  'draft.not_in_play': '✕ 不在本局',
  'state.picked': '已选',
  'state.choosing': '选择中…',
  'state.waiting': '等待中',
  'state.killed': '已被刺杀',
  'state.active': '行动中',
  'state.waiting_peer': function(v){return '⏳ 等待'+v.name+'选择角色...';},
  'state.waiting_others': '⏳ 其他玩家正在选择角色...',
  'state.waiting_player': function(v){return '⏳ 等待'+v.name+'...';},
  'state.waiting_dot': '⏳ 等待中...',
  'char_ref.title': '本轮角色',
  'income.label': '收取收入',
  'income.nav_gold': '⚓ 取4金币',
  'income.nav_cards': '⚓ 摸4张牌',
  'income.nav_warning': '⚠ 航海家本回合不能建造地区。',
  'income.take_gold': '💰 取2金币',
  'income.draw_scholar': '📖 摸7张，保留1张（学者）',
  'income.draw_obs': '🔭 摸3张，保留1张（天文台）',
  'income.draw_library': '📚 摸2张，全部保留（图书馆）',
  'income.draw_normal': '🃏 摸2张，保留1张',
  'draw_pick.scholar': function(v){return '选择保留的牌（学者：展示'+v.n+'张）：';},
  'draw_pick.obs': '选择保留的牌（天文台：展示3张）：',
  'draw_pick.normal': '选择保留的牌：',
  'special.label': '特殊能力',
  'active_bldg.label': '建筑特效',
  'smithy.title': '铁匠铺',
  'smithy.desc': '支付2✦摸3张地区牌（每回合一次）',
  'smithy.use': '使用（-2✦）',
  'lab.title': '实验室',
  'lab.desc': '弃1张牌获得2✦（每回合一次）——点击下方手牌',
  'build.label': function(v){return '建造地区（'+v.n+'/'+v.m+'）· 💰 '+v.gold+'✦';},
  'build.no_cards': '手牌为空。',
  'build.cannot_afford': '金币不足，无法建造。',
  'build.done': function(v){return '✅ 本回合已建造地区（'+v.n+'/'+v.m+'）';},
  'build.confirm_for': function(v){return '🏗 花费'+v.cost+'✦建造';},
  'build.already_built': '已建造过',
  'build.not_enough_gold': function(v){return '金币不足（需要'+v.cost+'✦，拥有'+v.gold+'✦）';},
  'den.pay': function(v){return '支付'+v.cost+'✦（'+v.gold+'✦金币 + 弃牌，还需'+v.deficit+'张）：';},
  'den.build_btn': function(v){return '🏗 建造（'+v.gold+'✦ + '+v.n+'张牌）';},
  'den.build_btn_zero': function(v){return '🏗 建造（'+v.gold+'✦ + 0张牌）';},
  'cost.normally': function(v){return v.cost+'✦（正常'+v.orig+'✦）';},
  'nav.note': '⚓ 航海家：已收取收入。本回合不能建造地区。',
  'end_turn': '结束回合 →',
  'assassin.choose': '选择要刺杀的角色：',
  'assassin.will': '将要刺杀：',
  'assassin.btn': '🗡️ 刺杀',
  'assassin.change': '更改',
  'thief.choose': '选择要偷盗的角色？',
  'thief.will': '将要偷盗：',
  'thief.btn': '🦹 宣布盗窃',
  'thief.change': '更改',
  'mag.used': '🧙 魔法师能力本回合已使用。',
  'mag.swap_btn': '🔄 交换手牌',
  'mag.discard_btn': '🗑️ 弃牌并重摸',
  'mag.swap_with': '与以下玩家交换手牌：',
  'mag.discard_select': '选择要弃掉并重新摸取的牌：',
  'mag.discard_confirm': function(v){return '弃'+v.n+'张 → 摸'+v.n+'张';},
  'mag.cancel': '取消',
  'wizard.used': '🔮 巫师能力本回合已使用。',
  'wizard.no_opponents': '无对手有手牌可取。',
  'wizard.look_prompt': '查看某玩家的手牌——选择目标：',
  'wizard.hand_of': function(v){return '查看'+v.name+'的手牌——选择要取走的牌：';},
  'wizard.no_cards': '对方手牌为空。',
  'wizard.take': '取走',
  'wizard.build': function(v){return '建造（'+v.cost+'✦）';},
  'wizard.cancel': '取消',
  'seer.used': '🔯 先知能力本回合已使用。',
  'seer.no_opponents': '无对手有手牌可取。',
  'seer.btn': function(v){return '🔯 从所有对手取牌（'+v.n+'位对手）';},
  'seer.note': function(v){return '从'+v.n+'位对手各随机取1张牌。';},
  'warlord.choose': '选择要摧毁的地区？',
  'warlord.no_targets': '无有效目标。',
  'warlord.destroyed': '已摧毁：',
  'warlord.btn': '⚔️ 摧毁地区',
  'warlord.undo': '撤销 ↩',
  'note.king_no_noble': '👑 已获得王冠——下轮优先选择角色。建造贵族（黄色）地区，每轮以国王身份获取金币。',
  'note.king_with_noble': function(v){return '👑 已获得王冠——下轮优先选择角色。'+v.m+'座贵族地区带来+'+v.n+'✦。';},
  'note.patrician_no_noble': '🏅 已获得王冠——下轮优先选择角色。建造贵族（黄色）地区，每轮以贵族老爷身份摸牌。',
  'note.patrician_with_noble': function(v){return '🏅 已获得王冠——下轮优先选择角色。从'+v.m+'座贵族地区摸了'+v.m+'张牌。';},
  'note.bishop': function(v){return '⛪ 受到军阀保护。已结算+'+v.n+'✦宗教收入。';},
  'note.abbot': function(v){return '🧎 已结算+'+v.n+'✦宗教收入。若有对手则已从最富者窃取1✦。';},
  'note.merchant': '💰 已结算商人奖励+1✦及贸易收入。',
  'note.architect': '🏗️ 已额外摸2张牌。本回合最多建造3座地区。',
  'note.scholar': '📖 已摸7张牌，保留1张。本回合最多建造2座地区。',
  'note.queen': '🫅 若坐于国王旁边，已在回合开始时获得王后奖励。',
  'note.navigator': '⚓ 已在上方收取收入。本回合不能建造地区。',
  'note.trader_no_green': '🏦 建造贸易（绿色）地区，每轮以贸易商身份获取金币。本回合最多建造2座地区。',
  'note.trader_with_green': function(v){return '🏦 从'+v.m+'座贸易地区获得'+v.n+'✦。本回合最多建造2座地区。';},
  'note.arch_hand': function(v){return '✓ 已额外摸2张牌（手牌共'+v.n+'张）。本回合最多建造3座地区。';},
  'note.scholar_action': '✓ 学者：摸7张牌，保留1张。本回合最多建造2座地区。',
  'note.seer_action': '✓ 先知：使用特殊能力从每位对手处取1张牌。本回合最多建造2座地区。',
  'note.trader_action': function(v){return '✓ 贸易商：贸易地区收入+'+v.n+'✦已结算。本回合最多建造2座地区。';},
  'gameover.title': '🏆 游戏结束',
  'gameover.subtitle': function(v){return '第'+v.n+'轮结束';},
  'gameover.districts': function(v){return '已建造'+v.n+'座地区';},
  'gameover.play_again': '🎲 再玩一局',
  'lobby.title': '⚜ 城堡骑士',
  'lobby.subtitle': '中世纪城市建设卡牌游戏',
  'lobby.error.dismiss': '✕ 关闭',
  'lobby.how_to_play': '选择游戏模式：',
  'lobby.mode.solo.title': '单人',
  'lobby.mode.solo.desc': '配置对手和角色',
  'lobby.mode.host.title': '创建房间',
  'lobby.mode.host.desc': '创建房间并将房间码分享给朋友',
  'lobby.mode.join.title': '加入房间',
  'lobby.mode.join.desc': '输入朋友的房间码一起游戏',
  'lobby.solo.title': '🤖 单人游戏设置',
  'lobby.solo.ai_count': '对手数量',
  'lobby.solo.ai_label': function(v){return v.n+'位AI对手';},
  'lobby.solo.back': '← 返回',
  'lobby.solo.start': '▶ 开始游戏',
  'lobby.avatar.label': '你的头像',
  'lobby.chars.label': '角色配置',
  'lobby.char.rank': function(v){return '等级'+v.n;},
  'lobby.char.rank_lbl': function(v){return '等级'+v.n;},
  'lobby.char.replaces': function(v){return '替换：本等级的'+v.names;},
  'lobby.charsel.less': '▴ 收起',
  'lobby.charsel.customize': '▾ 自定义',
  'lobby.host.players.title': '🏠 房间——玩家',
  'lobby.host.name_label': '你的名字',
  'lobby.host.slots.label': '玩家位置',
  'lobby.host.slots.hint': '将每个位置设为AI或人类。',
  'lobby.host.slots.count': function(v){return v.n+'位玩家';},
  'lobby.host.slots.remove': '− 减少',
  'lobby.host.slots.add': '+ 增加',
  'lobby.host.slot.you': '我',
  'lobby.host.chars.title': '🏠 房间——角色',
  'lobby.host.chars.back': '← 玩家',
  'lobby.host.chars.create': '创建房间 →',
  'lobby.host.back': '← 返回',
  'lobby.host.chars_nav': '角色 →',
  'lobby.hosting.title': '🏠 房间已准备——等待玩家',
  'lobby.hosting.code_label': '房间码',
  'lobby.hosting.how_friends': '朋友如何加入：',
  'lobby.hosting.copy': '📋 复制邀请说明',
  'lobby.hosting.copied': '✓ 已复制！',
  'lobby.hosting.copy_fail': '（复制失败——请手动分享）',
  'lobby.hosting.order_label': '玩家与回合顺序',
  'lobby.hosting.order_hint': '使用↑↓设置每轮玩家选择角色的顺序。',
  'lobby.hosting.status.host': '房主（你）',
  'lobby.hosting.status.connected': '已连接 ✓',
  'lobby.hosting.status.ai': 'AI机器人',
  'lobby.hosting.status.waiting': '等待玩家中…',
  'lobby.hosting.cancel': '← 取消',
  'lobby.hosting.start': '▶ 开始游戏',
  'lobby.hosting.unfilled': '未填充的人类位置开局时将变为AI。',
  'lobby.join.title': '🚪 加入房间',
  'lobby.join.name_label': '你的名字',
  'lobby.join.code_label': '房间码',
  'lobby.join.back': '← 返回',
  'lobby.join.join': '加入 ▶',
  'lobby.join.invalid_code': '请输入有效的房间码。',
  'lobby.connect.connecting': '连接中…',
  'lobby.connect.waiting': '等待房主开始游戏…',
  'lobby.connect.joining_room': function(v){return '正在加入房间'+v.code+'…';},
  'lobby.connect.in_room': '已加入！房主即将开始游戏。',
  'lobby.connect.players_label': '房间玩家',
  'lobby.connect.leave': '← 离开',
  'lobby.players.slot_waiting': '（等待玩家中）',
  'lobby.players.peer_tag': '房主',
  // Generic buttons
  'btn.cancel': '取消',
  'btn.change': '更改',
  'btn.undo': '撤销 ↩',
  'btn.back': '← 返回',
  'btn.dismiss': '✕ 关闭',
  'btn.none': '无',
  // Aliases for keys referenced in ui.js
  'navigator.note': '⚓ 航海家：已收取收入。本回合不能建造地区。',
  'action.end_turn': '结束回合 →',
  'assassin.will_kill': '将要刺杀：',
  'thief.will_steal': '将要偷盗：',
  'magician.used': '🧙 魔法师能力本回合已使用。',
  'magician.swap_btn': '🔄 交换手牌',
  'magician.discard_btn': '🗑️ 弃牌并重摸',
  'king.note_with_gold': function(v){return '👑 已获得王冠——下轮优先选择角色。'+v.n+'座贵族地区带来+'+v.n+'✦。';},
  'king.note_no_gold': '👑 已获得王冠——下轮优先选择角色。建造贵族（黄色）地区，每轮以国王身份获取金币。',
  'patrician.note_with_cards': function(v){return '🏅 已获得王冠——下轮优先选择角色。从'+v.n+'座贵族地区摸了'+v.n+'张牌。';},
  'patrician.note_no_cards': '🏅 已获得王冠——下轮优先选择角色。建造贵族（黄色）地区，每轮以贵族老爷身份摸牌。',
  'bishop.note': function(v){return '⛪ 受到军阀保护。已结算+'+v.n+'✦宗教收入。';},
  'abbot.note': function(v){return '🧎 已结算+'+v.n+'✦宗教收入。若有对手则已从最富者窃取1✦。';},
  'merchant.note': '💰 已结算商人奖励+1✦及贸易收入。',
  'architect.note': '🏗️ 已额外摸2张牌。本回合最多建造3座地区。',
  'scholar.note': '📖 已摸7张牌，保留1张。本回合最多建造2座地区。',
  'queen.note': '🫅 若坐于国王旁边，已在回合开始时获得王后奖励。',
  'navigator.note_short': '⚓ 已在上方收取收入。本回合不能建造地区。',
  'wizard.choose_target': '查看某玩家的手牌——选择目标：',
  'wizard.player_cards': function(v){return v.name+'（'+v.n+'张牌）';},
  'trader.note_with_gold': function(v){return '🏦 从'+v.n+'座贸易地区获得'+v.n+'✦。本回合最多建造2座地区。';},
  'trader.note_no_gold': '🏦 建造贸易（绿色）地区，每轮以贸易商身份获取金币。本回合最多建造2座地区。',
  'warlord.destroyed_detail': function(v){return v.pname+'的'+v.dname+'（−'+v.cost+'✦）';},
  'lang.switch_to': 'English'
};

// ── Event message templates ────────────────────────────────────────────────────
var I18N_EVT_EN = {
  'sot.assassin_kills': function(v){return v.killer+' (Assassin) eliminates the '+v.char+'!';},
  'sot.thief_steals': function(v){return v.thief+' (Thief) steals '+v.amt+'✦ from '+v.target+'!';},
  'sot.king_crown': function(v){return v.name+' takes the Crown!';},
  'sot.king_crown_noble': function(v){return v.name+' takes the Crown and earns '+v.n+'✦ from Noble districts!';},
  'sot.patrician_crown': function(v){return v.name+' takes the Crown!';},
  'sot.patrician_crown_noble': function(v){return v.name+' takes the Crown and draws '+v.n+' card'+(v.n!==1?'s':'')+' from Noble districts!';},
  'sot.bishop_income': function(v){return v.name+' earns '+v.n+'✦ from Religious districts.';},
  'sot.abbot_income': function(v){
    var m=v.n>0?v.name+' (Abbot) earns '+v.n+'✦ from Religious districts':'';
    if(v.richest)m+=(m?', ':'')+'takes 1✦ from '+v.richest;
    return m+'.';
  },
  'sot.merchant_income': function(v){return v.name+' earns '+v.n+'✦ (Merchant bonus + Trade income).';},
  'sot.trader_income': function(v){return v.name+' earns '+v.n+'✦ from Trade districts (Trader).';},
  'sot.warlord_income': function(v){return v.name+' earns '+v.n+'✦ from Military districts.';},
  'sot.queen_beside': function(v){return v.name+' is seated beside the King and earns 3✦!';},
  'sot.queen_not_beside': function(v){return v.name+' (Queen) is not seated beside the King this round.';},
  'sot.arch_draw': function(v){return v.name+' draws '+v.n+' extra card'+(v.n!==1?'s':'')+' as the Architect.';},
  'ai.nav_draw': function(v){return v.name+' (Navigator) draws '+v.n+' cards.';},
  'ai.nav_gold': function(v){return v.name+' (Navigator) takes 4✦.';},
  'ai.scholar_draw': function(v){return v.name+' (Scholar) draws '+v.n+', keeps '+v.card+'.';},
  'ai.scholar_gold': function(v){return v.name+' (Scholar) collects 2✦.';},
  'ai.draw_obs': function(v){return v.name+' draws '+v.n+', keeps '+v.card+' (Observatory).';},
  'ai.draw_cards': function(v){return v.name+' draws '+v.n+' card'+(v.n!==1?'s':'')+' for income'+(v.lib?' (Library)':'')+'.';},
  'ai.collect_gold': function(v){return v.name+' collects 2✦ gold.';},
  'ai.assassin_kill': function(v){return v.name+' assassinates the '+v.char+'!';},
  'ai.thief_declare': function(v){return v.name+' declares theft on the '+v.char+'.';},
  'ai.mag_swap': function(v){return v.name+' swaps hands with '+v.target+'!';},
  'ai.mag_discard': function(v){return v.name+' (Magician) discards '+v.n+' and redraws.';},
  'ai.mag_keep': function(v){return v.name+' (Magician) keeps their hand.';},
  'ai.wizard_take_build': function(v){return v.name+' (Wizard) takes and builds '+v.card+' from '+v.target+'! ('+v.cost+'✦)';},
  'ai.wizard_take': function(v){return v.name+' (Wizard) takes '+v.card+' from '+v.target+"'s hand.";},
  'ai.wizard_no_target': function(v){return v.name+' (Wizard): no targets with cards.';},
  'ai.seer_take': function(v){return v.name+' (Seer) takes '+v.n+' card'+(v.n!==1?'s':'')+' from opponents.';},
  'ai.seer_no_cards': function(v){return v.name+' (Seer): no opponents had cards.';},
  'ai.warlord_destroy': function(v){return v.name+' destroys '+v.target+"'s "+v.dist+'! (paid '+v.cost+'✦)';},
  'ai.graveyard_recover': function(v){return v.target+"'s Graveyard recovers "+v.card+'! (−1✦)';},
  'ai.smithy': function(v){return v.name+' uses the Smithy: pay 2✦, draw '+v.n+' cards.';},
  'ai.lab': function(v){return v.name+' uses the Laboratory: discard '+v.card+', gain 2✦.';},
  'ai.build': function(v){return v.name+' builds '+v.dist+' ('+v.pay+' — '+v.clr+').';},
  'ai.complete8': function(v){return v.name+' completes 8 districts! Final round!';},
  'ai.cannot_build': function(v){return v.name+' cannot afford to build.';},
  'human.income_collected': 'Collected income.',
  'human.smithy_used': 'Used the Smithy.',
  'human.lab_used': 'Used the Laboratory.',
  'human.demolish': function(v){return 'Demolished '+v.target+"'s "+v.dist+' (−'+v.cost+'✦).';},
  'human.built': function(v){return 'Built '+v.dist+' ('+v.cost+'✦).';},
  'human.not_build': 'Did not build.',
  'human.graveyard_recover': function(v){return v.target+"'s Graveyard recovers "+v.card+'! (−1✦)';},
  'log.collect_gold': 'You collect 2✦.',
  'log.library_both': function(v){return 'Library: you keep both cards ('+v.cards+').';},
  'log.keep_card': function(v){return 'You keep '+v.card+'.';},
  'log.build': function(v){return 'You build '+v.dist+' ('+v.cost+'✦'+(v.disc?' — Factory discount':'')+').';},
  'log.build_den': function(v){return 'You build '+v.dist+' ('+v.gold+'✦ + '+v.n+' card'+(v.n!==1?'s':'')+').';},
  'log.complete8_self': '🏰 You complete 8 districts! Final round!',
  'log.smithy': function(v){return 'Smithy: pay 2✦, draw '+v.n+' cards.';},
  'log.lab': function(v){return 'Laboratory: discard '+v.card+', gain 2✦.';},
  'log.seer_take': function(v){return 'You (Seer) take '+v.n+' card'+(v.n!==1?'s':'')+' from opponents.';},
  'log.seer_no_cards': 'You (Seer): no opponents had cards to take.',
  'log.nav_gold': 'You (Navigator) take 4✦ gold.',
  'log.nav_gold_no_cards': 'You (Navigator) take 4✦ gold (no cards left).',
  'log.nav_draw': function(v){return 'You (Navigator) draw '+v.n+' cards.';},
  'log.wizard_take_build': function(v){return 'You (Wizard) take and build '+v.card+" from "+v.target+"'s hand ("+v.cost+'✦).';},
  'log.wizard_take': function(v){return 'You (Wizard) take '+v.card+" from "+v.target+"'s hand.";},
  'log.complete8_self2': '🏰 You complete 8 districts! Final round!',
  'log.assassin_target': function(v){return 'You (Assassin) target the '+v.char+'.';},
  'log.thief_target': function(v){return 'You target the '+v.char+' for theft.';},
  'log.mag_swap': function(v){return 'You swap hands with '+v.target+'!';},
  'log.mag_discard': function(v){return 'You discard '+v.n+', draw '+v.m+'.';},
  'log.warlord_destroy': function(v){return 'You destroy '+v.target+"'s "+v.dist+' for '+v.cost+'✦!';},
  'log.choose_char': 'You secretly choose your character.',
  'log.round_herald': function(v){return 'Round '+v.n+': The Herald calls characters...';},
  'log.round_begins': function(v){return 'Round '+v.n+' begins. Crown: '+v.crown;},
  'log.ai_complete8': function(v){return '🏰 '+v.name+' completes 8 districts!';},
  'log.ai_build': function(v){return v.name+' builds '+v.dist+'.';},
  'log.your_turn_begins': "Your turn begins",
  'sot.assassinated_skip': function(v){return v.name+' was assassinated and skips this turn.';}
};

var I18N_EVT_ZH = {
  'sot.assassin_kills': function(v){return v.killer+'（刺客）刺杀了'+v.char+'！';},
  'sot.thief_steals': function(v){return v.thief+'（盗贼）从'+v.target+'夺取了'+v.amt+'✦！';},
  'sot.king_crown': function(v){return v.name+'获得了王冠！';},
  'sot.king_crown_noble': function(v){return v.name+'获得王冠，并从贵族地区获得'+v.n+'✦！';},
  'sot.patrician_crown': function(v){return v.name+'获得了王冠！';},
  'sot.patrician_crown_noble': function(v){return v.name+'获得王冠，并从贵族地区摸了'+v.n+'张牌！';},
  'sot.bishop_income': function(v){return v.name+'从宗教地区获得'+v.n+'✦。';},
  'sot.abbot_income': function(v){
    var m=v.n>0?v.name+'（修道院长）从宗教地区获得'+v.n+'✦':'';
    if(v.richest)m+=(m?'，':'')+'并从'+v.richest+'处夺取1✦';
    return m+'。';
  },
  'sot.merchant_income': function(v){return v.name+'获得'+v.n+'✦（商人奖励+贸易收入）。';},
  'sot.trader_income': function(v){return v.name+'（贸易商）从贸易地区获得'+v.n+'✦。';},
  'sot.warlord_income': function(v){return v.name+'从军事地区获得'+v.n+'✦。';},
  'sot.queen_beside': function(v){return v.name+'坐于国王旁边，获得3✦！';},
  'sot.queen_not_beside': function(v){return v.name+'（王后）本轮未坐于国王旁边。';},
  'sot.arch_draw': function(v){return v.name+'作为建筑师额外摸了'+v.n+'张牌。';},
  'ai.nav_draw': function(v){return v.name+'（航海家）摸了'+v.n+'张牌。';},
  'ai.nav_gold': function(v){return v.name+'（航海家）取了4✦。';},
  'ai.scholar_draw': function(v){return v.name+'（学者）摸了'+v.n+'张，保留了'+v.card+'。';},
  'ai.scholar_gold': function(v){return v.name+'（学者）收取了2✦。';},
  'ai.draw_obs': function(v){return v.name+'摸了'+v.n+'张，保留了'+v.card+'（天文台）。';},
  'ai.draw_cards': function(v){return v.name+'摸了'+v.n+'张牌作为收入'+(v.lib?'（图书馆）':'')+'.';},
  'ai.collect_gold': function(v){return v.name+'收取了2✦金币。';},
  'ai.assassin_kill': function(v){return v.name+'刺杀了'+v.char+'！';},
  'ai.thief_declare': function(v){return v.name+'宣布对'+v.char+'盗窃。';},
  'ai.mag_swap': function(v){return v.name+'与'+v.target+'交换了手牌！';},
  'ai.mag_discard': function(v){return v.name+'（魔法师）弃了'+v.n+'张牌并重摸。';},
  'ai.mag_keep': function(v){return v.name+'（魔法师）保留了手牌。';},
  'ai.wizard_take_build': function(v){return v.name+'（巫师）从'+v.target+'处取走并建造了'+v.card+'！（'+v.cost+'✦）';},
  'ai.wizard_take': function(v){return v.name+'（巫师）从'+v.target+'手牌中取走了'+v.card+'。';},
  'ai.wizard_no_target': function(v){return v.name+'（巫师）：无对手有手牌。';},
  'ai.seer_take': function(v){return v.name+'（先知）从对手处取了'+v.n+'张牌。';},
  'ai.seer_no_cards': function(v){return v.name+'（先知）：对手无手牌。';},
  'ai.warlord_destroy': function(v){return v.name+'摧毁了'+v.target+'的'+v.dist+'！（花费'+v.cost+'✦）';},
  'ai.graveyard_recover': function(v){return v.target+'的墓地回收了'+v.card+'！（-1✦）';},
  'ai.smithy': function(v){return v.name+'使用了铁匠铺：支付2✦，摸了'+v.n+'张牌。';},
  'ai.lab': function(v){return v.name+'使用了实验室：弃掉'+v.card+'，获得2✦。';},
  'ai.build': function(v){return v.name+'建造了'+v.dist+'（'+v.pay+' — '+v.clr+'）。';},
  'ai.complete8': function(v){return v.name+'完成了8座地区！最终回合！';},
  'ai.cannot_build': function(v){return v.name+'金币不足，无法建造。';},
  'human.income_collected': '已收取收入。',
  'human.smithy_used': '已使用铁匠铺。',
  'human.lab_used': '已使用实验室。',
  'human.demolish': function(v){return '摧毁了'+v.target+'的'+v.dist+'（-'+v.cost+'✦）。';},
  'human.built': function(v){return '建造了'+v.dist+'（'+v.cost+'✦）。';},
  'human.not_build': '本回合未建造。',
  'human.graveyard_recover': function(v){return v.target+'的墓地回收了'+v.card+'！（-1✦）';},
  'log.collect_gold': '你收取了2✦。',
  'log.library_both': function(v){return '图书馆：你保留了两张牌（'+v.cards+'）。';},
  'log.keep_card': function(v){return '你保留了'+v.card+'。';},
  'log.build': function(v){return '你建造了'+v.dist+'（'+v.cost+'✦'+(v.disc?'——工厂折扣':'')+')。';},
  'log.build_den': function(v){return '你建造了'+v.dist+'（'+v.gold+'✦ + '+v.n+'张牌）。';},
  'log.complete8_self': '🏰 你完成了8座地区！最终回合！',
  'log.smithy': function(v){return '铁匠铺：支付2✦，摸了'+v.n+'张牌。';},
  'log.lab': function(v){return '实验室：弃掉'+v.card+'，获得2✦。';},
  'log.seer_take': function(v){return '你（先知）从对手处取了'+v.n+'张牌。';},
  'log.seer_no_cards': '你（先知）：对手无手牌可取。',
  'log.nav_gold': '你（航海家）取了4✦金币。',
  'log.nav_gold_no_cards': '你（航海家）取了4✦金币（牌堆已空）。',
  'log.nav_draw': function(v){return '你（航海家）摸了'+v.n+'张牌。';},
  'log.wizard_take_build': function(v){return '你（巫师）从'+v.target+'手牌中取走并建造了'+v.card+'（'+v.cost+'✦）。';},
  'log.wizard_take': function(v){return '你（巫师）从'+v.target+'手牌中取走了'+v.card+'。';},
  'log.complete8_self2': '🏰 你完成了8座地区！最终回合！',
  'log.assassin_target': function(v){return '你（刺客）锁定了'+v.char+'。';},
  'log.thief_target': function(v){return '你锁定了'+v.char+'作为盗窃目标。';},
  'log.mag_swap': function(v){return '你与'+v.target+'交换了手牌！';},
  'log.mag_discard': function(v){return '你弃了'+v.n+'张，摸了'+v.m+'张。';},
  'log.warlord_destroy': function(v){return '你花费'+v.cost+'✦摧毁了'+v.target+'的'+v.dist+'！';},
  'log.choose_char': '你秘密选择了角色。',
  'log.round_herald': function(v){return '第'+v.n+'轮：传令官召唤角色...';},
  'log.round_begins': function(v){return '第'+v.n+'轮开始。王冠：'+v.crown;},
  'log.ai_complete8': function(v){return '🏰 '+v.name+'完成了8座地区！';},
  'log.ai_build': function(v){return v.name+'建造了'+v.dist+'。';},
  'log.your_turn_begins': '你的回合开始',
  'sot.assassinated_skip': function(v){return v.name+'遭刺杀，本轮跳过。';}
};

// ── Helper functions ───────────────────────────────────────────────────────────

// Translate a UI string key (with optional vars object for dynamic strings)
function t(key, vars) {
  var dict = LANG === 'zh' ? I18N_ZH : I18N_EN;
  var val = dict[key];
  if (val === undefined) val = I18N_EN[key];
  if (val === undefined) return key;
  if (typeof val === 'function') return val(vars || {});
  return val;
}

// Translate an event/log message
function _te(key, vars) {
  var dict = LANG === 'zh' ? I18N_EVT_ZH : I18N_EVT_EN;
  var val = dict[key];
  if (val === undefined) val = I18N_EVT_EN[key];
  if (val === undefined) return key;
  if (typeof val === 'function') return val(vars || {});
  return val;
}

// Character display name (translated)
function cn(charId) {
  if (LANG === 'zh') {
    var zh = I18N_CHAR_NAMES_ZH[charId];
    if (zh) return zh;
  }
  var c = CHARS.find(function(q){return q.id===charId;});
  return c ? c.name : '?';
}

// Character ability text (translated)
function ca(charId) {
  if (LANG === 'zh') {
    var zh = I18N_CHAR_ABILITIES_ZH[charId];
    if (zh) return zh;
  }
  var c = CHARS.find(function(q){return q.id===charId;});
  return c ? c.ability : '';
}

// District display name (translated)
function dn(d) {
  if (LANG === 'zh') {
    var zh = I18N_DIST_NAMES_ZH[d.id];
    if (zh) return zh;
  }
  return d.name;
}

// SDESC description (translated)
function sdesc(key) {
  if (LANG === 'zh') {
    var zh = I18N_SDESC_ZH[key];
    if (zh) return zh;
  }
  return SDESC[key] || '';
}

// Color label (translated)
function clabel(color) {
  if (LANG === 'zh') {
    var zh = I18N_COLOR_LABELS_ZH[color];
    if (zh) return zh;
  }
  return CS[color] ? CS[color].label : color;
}

// Toggle language and re-render current screen
function toggleLang() {
  LANG = LANG === 'zh' ? 'en' : 'zh';
  localStorage.setItem('citadels_lang', LANG);
  if (typeof S !== 'undefined' && S) {
    render();
  } else {
    renderLobby(typeof LS !== 'undefined' ? LS : {screen:'home'});
  }
}

// Build the language toggle button (reusable)
function mkLangToggle(extraClass) {
  var btn = document.createElement('button');
  btn.className = 'lang-toggle' + (extraClass ? ' ' + extraClass : '');
  btn.textContent = t('lang.switch_to');
  btn.title = LANG === 'zh' ? 'Switch to English' : '切换为中文';
  btn.onclick = function(e) { e.stopPropagation(); toggleLang(); };
  return btn;
}
