// English + Chinese live in the table below; other languages are one file each in ./lang/ (missing keys
// fall back to English). t('key', {vars}) — '{name}' placeholders.
import { CHAR } from './data.js';
import ja from './lang/ja.js';
import ko from './lang/ko.js';
import es from './lang/es.js';
import fr from './lang/fr.js';
import zhTW from './lang/zh-TW.js';
import de from './lang/de.js';
import pt from './lang/pt.js';
import ru from './lang/ru.js';
import it from './lang/it.js';

export const EXTRA = { 'zh-TW': zhTW, ja, ko, es, fr, de, pt, ru, it };
export const LANGS = {
  en: 'English', zh: '简体中文', 'zh-TW': '繁體中文', ja: '日本語', ko: '한국어',
  es: 'Español', fr: 'Français', de: 'Deutsch', pt: 'Português', ru: 'Русский', it: 'Italiano',
};
const HTML_LANG = { zh: 'zh-CN', pt: 'pt-BR' };

// Browser language → ours: zh-TW / zh-HK / zh-Hant → Traditional, other zh → Simplified, else the 2-letter code.
export function pickLang(nav = 'en') {
  if (/^zh-(tw|hk|mo)|^zh-hant/i.test(nav)) return 'zh-TW';
  const two = nav.slice(0, 2).toLowerCase();
  return LANGS[two] ? two : 'en';
}
let lang = (() => {
  try {
    const saved = localStorage.getItem('c3d.lang');
    return LANGS[saved] ? saved : pickLang(navigator.language);
  } catch { return 'en'; }
})();
export const getLang = () => lang;
export function setLang(l) {
  lang = LANGS[l] ? l : 'en';
  try { localStorage.setItem('c3d.lang', lang); } catch {}
  document.documentElement.lang = HTML_LANG[lang] || lang;
}
// A native <select>: touch, keyboard and screen readers work for free.
export const langSelect = () => `<select class="lang-sel" data-a="lang" aria-label="${t('lb.lang')}">${
  Object.entries(LANGS).map(([k, name]) => `<option value="${k}"${k === lang ? ' selected' : ''}>${name}</option>`).join('')}</select>`;

const D = {
  // characters
  'c.assassin': ['Assassin', '刺客'], 'c.thief': ['Thief', '盗贼'], 'c.magician': ['Magician', '魔术师'],
  'c.king': ['King', '国王'], 'c.bishop': ['Bishop', '主教'], 'c.merchant': ['Merchant', '商人'],
  'c.architect': ['Architect', '建筑师'], 'c.warlord': ['Warlord', '军阀'], 'c.queen': ['Queen', '王后'],
  'c.navigator': ['Navigator', '航海家'], 'c.wizard': ['Wizard', '巫师'], 'c.patrician': ['Patrician', '贵族'],
  'c.abbot': ['Abbot', '修道院长'], 'c.scholar': ['Scholar', '学者'], 'c.seer': ['Seer', '先知'], 'c.trader': ['Trader', '贸易商'],
  'a.assassin': ['Name a character. Whoever holds it loses their whole turn.', '指定一个角色，持有者本轮失去整个回合。'],
  'a.thief': ['Name a character (not the Assassin or the slain). When they are called, take all their gold.', '指定一个角色（不能是刺客或被刺杀者），其登场时你拿走他全部金币。'],
  'a.magician': ['Swap your whole hand with another player — or discard any cards and redraw as many.', '与另一位玩家交换全部手牌；或弃掉任意张手牌并摸取等量新牌。'],
  'a.king': ['Take the Crown. +1 gold per noble (yellow) district. Slain? You still inherit the Crown.', '获得王冠。每座贵族（黄）建筑 +1 金。即使被刺杀，回合结束仍继承王冠。'],
  'a.bishop': ['+1 gold per religious (blue) district. The Warlord cannot touch your city unless you are slain.', '每座宗教（蓝）建筑 +1 金。除非你被刺杀，军阀不能摧毁你的建筑。'],
  'a.merchant': ['+1 gold, plus +1 per trade (green) district.', '额外 +1 金，并且每座贸易（绿）建筑 +1 金。'],
  'a.architect': ['Draw 2 extra cards. Build up to 3 districts this turn.', '额外摸 2 张牌。本回合最多建造 3 座建筑。'],
  'a.warlord': ['+1 gold per military (red) district. Destroy one district for its cost − 1 (not in a completed city).', '每座军事（红）建筑 +1 金。支付「造价 − 1」摧毁一座建筑（已完成的城市除外）。'],
  'a.queen': ['+3 gold if you sit right next to the King\'s player.', '若你紧挨着国王的玩家而坐，获得 3 金。'],
  'a.navigator': ['Gain 4 gold or 4 cards. You may not build this turn.', '获得 4 金或 4 张牌。本回合不能建造。'],
  'a.wizard': ['Look at a player\'s hand and take one card: keep it, or build it at once as a bonus build.', '查看一位玩家的手牌并拿走一张：留在手中，或立即额外建造。'],
  'a.patrician': ['Take the Crown. Draw 1 card per noble (yellow) district.', '获得王冠。每座贵族（黄）建筑摸 1 张牌。'],
  'a.abbot': ['+1 gold per religious (blue) district. The richest player gives you 1 gold.', '每座宗教（蓝）建筑 +1 金。最富有的玩家给你 1 金。'],
  'a.scholar': ['Draw 7 cards, keep 1, shuffle the rest back. Build up to 2 districts.', '摸 7 张牌保留 1 张，其余洗回牌堆。本回合最多建造 2 座。'],
  'a.seer': ['Take a random card from every player, then give each of them one card back. Build up to 2.', '从每位玩家手中随机拿 1 张牌，再各还给他们 1 张。最多建造 2 座。'],
  'a.trader': ['+1 gold per trade (green) district. Trade districts don\'t count toward your build limit.', '每座贸易（绿）建筑 +1 金。建造贸易建筑不计入建造次数。'],

  // colours
  'col.yellow': ['Noble', '贵族'], 'col.blue': ['Religious', '宗教'], 'col.green': ['Trade', '贸易'], 'col.red': ['Military', '军事'], 'col.purple': ['Unique', '特殊'],

  // districts
  'd.manor': ['Manor', '庄园'], 'd.castle': ['Castle', '城堡'], 'd.palace': ['Palace', '宫殿'],
  'd.temple': ['Temple', '神殿'], 'd.church': ['Church', '教堂'], 'd.monastery': ['Monastery', '修道院'], 'd.cathedral': ['Cathedral', '大教堂'],
  'd.tavern': ['Tavern', '酒馆'], 'd.market': ['Market', '集市'], 'd.trading_post': ['Trading Post', '贸易站'], 'd.docks': ['Docks', '船坞'],
  'd.harbor': ['Harbor', '港口'], 'd.town_hall': ['Town Hall', '市政厅'],
  'd.watchtower': ['Watchtower', '瞭望塔'], 'd.prison': ['Prison', '监狱'], 'd.battlefield': ['Battlefield', '战场'], 'd.fortress': ['Fortress', '要塞'],
  'd.haunted_city': ['Haunted Quarter', '鬼城'], 'd.factory': ['Factory', '工厂'], 'd.dragon_gate': ['Dragon Gate', '龙门'],
  'd.university': ['University', '大学'], 'd.thieves_den': ['Thieves\' Den', '盗贼巢穴'], 'd.keep': ['Keep', '要塞堡垒'],
  'd.graveyard': ['Graveyard', '墓地'], 'd.observatory': ['Observatory', '天文台'], 'd.smithy': ['Smithy', '铁匠铺'],
  'd.library': ['Library', '图书馆'], 'd.school_of_magic': ['School of Magic', '魔法学院'], 'd.wishing_well': ['Wishing Well', '许愿井'],
  'd.map_room': ['Map Room', '地图室'], 'd.secret_vault': ['Secret Vault', '秘密金库'], 'd.great_wall': ['Great Wall', '城墙'],
  'd.quarry': ['Quarry', '采石场'], 'd.basilica': ['Basilica', '圣殿'], 'd.capitol': ['Capitol', '议会厅'],
  'd.ivory_tower': ['Ivory Tower', '象牙塔'], 'd.laboratory': ['Laboratory', '实验室'],
  'dd.haunted_city': ['Counts as any colour for the five-colour bonus.', '计算五色奖励时可视为任意颜色。'],
  'dd.factory': ['Your other unique districts cost 1 less to build.', '你建造其他特殊建筑时花费 −1。'],
  'dd.dragon_gate': ['+2 points at game end.', '游戏结束时 +2 分。'],
  'dd.university': ['+2 points at game end.', '游戏结束时 +2 分。'],
  'dd.thieves_den': ['Pay its cost with any mix of gold and cards from your hand.', '可用金币与手牌的任意组合支付造价。'],
  'dd.keep': ['The Warlord cannot destroy it.', '军阀无法摧毁。'],
  'dd.graveyard': ['When the Warlord destroys one of your districts, pay 1 gold to take it back into your hand.', '军阀摧毁你的建筑时，支付 1 金将其收回手牌。'],
  'dd.observatory': ['When drawing for income, draw 3 cards instead of 2.', '摸牌收入时改为摸 3 张。'],
  'dd.smithy': ['Once per turn: pay 2 gold to draw 3 cards.', '每回合一次：支付 2 金摸 3 张牌。'],
  'dd.library': ['Keep every card you draw for income.', '摸牌收入时保留所有摸到的牌。'],
  'dd.school_of_magic': ['Counts as any colour — for character income and the five-colour bonus.', '可视为任意颜色——用于角色收入和五色奖励。'],
  'dd.wishing_well': ['+1 point per other unique district at game end.', '游戏结束时每座其他特殊建筑 +1 分。'],
  'dd.map_room': ['+1 point per card in your hand at game end.', '游戏结束时每张手牌 +1 分。'],
  'dd.secret_vault': ['Never reveals its worth: +3 points at game end.', '价值秘而不宣：游戏结束时 +3 分。'],
  'dd.great_wall': ['The Warlord pays 1 more to destroy your other districts.', '军阀摧毁你的其他建筑需多付 1 金。'],
  'dd.quarry': ['You may build districts you already have.', '你可以建造与城中同名的建筑。'],
  'dd.basilica': ['+1 point per odd-cost district in your city.', '城中每座奇数造价建筑 +1 分。'],
  'dd.capitol': ['+3 points if you have 3+ districts of one colour.', '若有 3 座以上同色建筑，+3 分。'],
  'dd.ivory_tower': ['+5 points if it is your only unique district.', '若这是你唯一的特殊建筑，+5 分。'],
  'dd.laboratory': ['Once per turn: discard a card to gain 2 gold.', '每回合一次：弃 1 张牌获得 2 金。'],

  // HUD
  'ui.round': ['Round {n}', '第 {n} 轮'],
  'ui.draft': ['Character selection', '选择角色'],
  'ui.turns': ['Royal court', '宫廷召见'],
  'ui.over': ['Game over', '游戏结束'],
  'ui.you': ['You', '你'],
  'ui.gold': ['Gold', '金币'], 'ui.cards': ['Cards', '手牌'], 'ui.city': ['City', '城市'], 'ui.points': ['Points', '分数'],
  'ui.yourHand': ['Your hand', '你的手牌'],
  'ui.empty': ['No cards in hand', '没有手牌'],
  'ui.takeGold': ['Take 2 gold', '拿 2 金'],
  'ui.drawCards': ['Draw {n}, keep {k}', '摸 {n} 留 {k}'],
  'ui.drawAll': ['Draw {n}, keep all', '摸 {n} 全留'],
  'ui.build': ['Build', '建造'],
  'ui.buildFor': ['Build · {n}', '建造 · {n}'],
  'ui.endTurn': ['End turn', '结束回合'],
  'ui.ability': ['Ability', '技能'],
  'ui.smithy': ['Smithy · 2 → 3 cards', '铁匠铺 · 2金摸3'],
  'ui.lab': ['Laboratory', '实验室'],
  'ui.cancel': ['Cancel', '取消'],
  'ui.confirm': ['Confirm', '确认'],
  'ui.close': ['Close', '关闭'],
  'ui.skip': ['Skip', '跳过'],
  'ui.yourTurn': ['Your turn — {char}', '你的回合 —— {char}'],
  'ui.chooseIncome': ['Choose your income: gold or cards.', '先选择收入：金币或手牌。'],
  'ui.mainHint': ['Build from your hand, use your ability, then end your turn.', '从手牌中建造、使用技能，然后结束回合。'],
  'ui.buildsLeft': ['Builds left: {n}', '剩余建造：{n}'],
  'ui.noBuild': ['You cannot build this turn.', '本回合不能建造。'],
  'ui.waitingFor': ['{name} is thinking…', '{name} 正在思考…'],
  'ui.waitingDraft': ['{name} is choosing a character…', '{name} 正在挑选角色…'],
  'ui.pickChar': ['Choose your character', '选择你的角色'],
  'ui.pickSecond': ['Choose your second character', '选择你的第二个角色'],
  'ui.faceUp': ['Set aside face up', '公开移除'],
  'ui.faceDown': ['{n} hidden', '{n} 张暗置'],
  'ui.lastPickNote': ['As the last to choose, you may also take the hidden card.', '作为最后一位挑选者，你也可以拿走暗置的角色。'],
  'ui.keepTitle': ['Keep {n}', '保留 {n} 张'],
  'ui.keepHint': ['The rest go back under the deck.', '其余放回牌堆底部。'],
  'ui.killTitle': ['Who will you assassinate?', '你要刺杀谁？'],
  'ui.robTitle': ['Who will you rob?', '你要偷窃谁？'],
  'ui.magTitle': ['Magician', '魔术师'],
  'ui.magSwap': ['Swap hands with…', '与他交换手牌…'],
  'ui.magRedraw': ['Discard & redraw', '弃牌重摸'],
  'ui.magRedrawHint': ['Select cards to discard, then confirm.', '选择要弃掉的牌，然后确认。'],
  'ui.warTitle': ['Destroy a district', '摧毁一座建筑'],
  'ui.warHint': ['Tap a highlighted building, or pick from the list.', '点击高亮的建筑，或从列表中选择。'],
  'ui.wizTitle': ['Peer into whose hand?', '查看谁的手牌？'],
  'ui.wizTake': ['Take into hand', '收入手牌'],
  'ui.wizBuild': ['Build now · {n}', '立即建造 · {n}'],
  'ui.seerGive': ['Give back {n} card(s)', '归还 {n} 张牌'],
  'ui.seerGiveHint': ['One card goes to each: {names}', '依次给予：{names}'],
  'ui.navTitle': ['Navigator', '航海家'],
  'ui.nav4gold': ['+4 gold', '+4 金'], 'ui.nav4cards': ['+4 cards', '+4 张牌'],
  'ui.scholarGo': ['Draw 7, keep 1', '摸 7 留 1'],
  'ui.seerGo': ['Take a card from everyone', '从每人手中各拿一张'],
  'ui.denPay': ['Pay with cards', '用手牌支付'],
  'ui.denHint': ['Select {n} card(s) to discard as payment.', '选择 {n} 张手牌作为支付。'],
  'ui.shielded.bishop': ['Protected by the Bishop', '受主教保护'],
  'ui.shielded.complete': ['City complete', '城市已完成'],
  'ui.cost': ['Cost {n}', '造价 {n}'],
  'ui.destroyCost': ['Destroy · {n}', '摧毁 · {n}'],
  'ui.dup': ['Already in your city', '城中已有'],
  'ui.tooPoor': ['Not enough gold', '金币不足'],
  'ui.limit': ['Build limit reached', '已达建造上限'],
  'ui.incomeFirst': ['Take income first', '请先拿收入'],
  'ui.nobody': ['Nobody', '无人'],
  'ui.slain': ['Slain', '被刺杀'],
  'ui.robbedMark': ['Robbed', '被盗'],
  'ui.log': ['Chronicle', '编年史'],
  'ui.rules': ['How to play', '玩法说明'],
  'ui.menu': ['Menu', '菜单'],
  'ui.leave': ['Leave game', '离开游戏'],
  'ui.leaveConfirm': ['Leave this game? Progress is saved for solo games.', '离开当前对局？单人对局会自动保存。'],
  'ui.overview': ['Overview', '全景'],
  'ui.viewCity': ['{name}\'s city', '{name} 的城市'],
  'ui.speed': ['Speed', '速度'],
  'ui.sound': ['Sound', '音效'],
  'ui.winner': ['{name} wins!', '{name} 获胜！'],
  'ui.youWin': ['Victory!', '胜利！'],
  'ui.youLose': ['The city falls to {name}', '{name} 赢得了这座城'],
  'ui.again': ['Play again', '再来一局'],
  'ui.home': ['Main menu', '主菜单'],
  'ui.score.base': ['Districts', '建筑'], 'ui.score.first': ['First complete', '率先完成'], 'ui.score.complete': ['Complete', '完成城市'],
  'ui.score.colors': ['Five colours', '五色齐全'], 'ui.score.extra': ['Unique bonuses', '特殊加分'], 'ui.score.total': ['Total', '总分'],
  'ui.called': ['is called', '登场'],
  'ui.calledNobody': ['No one answers', '无人应答'],
  'ui.calledSlain': ['was assassinated', '已被刺杀'],
  'ui.charLimit': ['Build up to {n}', '最多建造 {n}'],
  'ui.hostLeft': ['Disconnected from the host.', '与主机断开连接。'],
  'ui.aiTook': ['{name} disconnected — an AI takes over.', '{name} 断线了，由 AI 接管。'],

  // log
  'l.start': ['The game begins.', '游戏开始。'],
  'l.round': ['— Round {n} · {name} holds the Crown —', '—— 第 {n} 轮 · {name} 持有王冠 ——'],
  'l.pick': ['{name} chose a character.', '{name} 选好了角色。'],
  'l.discard': ['{name} discarded a character face down.', '{name} 暗置弃掉了一个角色。'],
  'l.call': ['{char}: {name}.', '{char}：{name}。'],
  'l.callNone': ['No one is the {char}.', '没有人是{char}。'],
  'l.callKilled': ['The {char} ({name}) was slain and loses the turn.', '{char}（{name}）已被刺杀，失去回合。'],
  'l.robbed': ['{to} robs {n} gold from {from}.', '{to} 从 {from} 处偷走 {n} 金。'],
  'l.crown': ['{name} takes the Crown.', '{name} 获得王冠。'],
  'l.heir': ['{name} inherits the Crown.', '{name} 继承王冠。'],
  'l.gold': ['{name} +{n} gold.', '{name} +{n} 金。'],
  'l.cards': ['{name} draws {n} card(s).', '{name} 摸了 {n} 张牌。'],
  'l.tithe': ['{from} pays the Abbot 1 gold.', '{from} 向修道院长缴纳 1 金。'],
  'l.draw': ['{name} draws {n} cards to choose from.', '{name} 摸 {n} 张牌挑选。'],
  'l.build': ['{name} builds {dist}.', '{name} 建造了{dist}。'],
  'l.complete': ['{name} completes their city! This is the final round.', '{name} 完成了城市！本轮为最后一轮。'],
  'l.kill': ['The Assassin targets the {char}.', '刺客瞄准了{char}。'],
  'l.rob': ['The Thief targets the {char}.', '盗贼盯上了{char}。'],
  'l.swap': ['{name} swaps hands with {target}.', '{name} 与 {target} 交换了手牌。'],
  'l.redraw': ['{name} discards and redraws {n}.', '{name} 弃掉并重摸了 {n} 张。'],
  'l.destroy': ['{name} destroys {target}\'s {dist}.', '{name} 摧毁了 {target} 的{dist}。'],
  'l.graveyard': ['{name} recovers {dist} from the Graveyard.', '{name} 通过墓地收回了{dist}。'],
  'l.peek': ['{name} peers into {target}\'s hand.', '{name} 查看了 {target} 的手牌。'],
  'l.wizTake': ['{name} takes a card from {target}.', '{name} 从 {target} 手中拿走一张牌。'],
  'l.seer': ['{name} takes a card from {n} player(s).', '{name} 从 {n} 位玩家手中各拿一张牌。'],
  'l.seerGive': ['{name} gives {n} card(s) back.', '{name} 归还了 {n} 张牌。'],
  'l.over': ['{name} wins the game!', '{name} 赢得了游戏！'],

  // lobby
  'lb.title': ['Citadels', '富饶之城'],
  'lb.tag': ['Build the grandest city. Trust no one.', '建造最宏伟的城市。不要相信任何人。'],
  'lb.solo': ['Play vs AI', '单人对战'],
  'lb.host': ['Host online', '创建房间'],
  'lb.join': ['Join room', '加入房间'],
  'lb.continue': ['Continue game', '继续对局'],
  'lb.rules': ['How to play', '玩法说明'],
  'lb.name': ['Your name', '你的名字'],
  'lb.avatar': ['Sigil', '徽记'],
  'lb.opponents': ['Opponents', '对手数量'],
  'lb.chars': ['Characters', '角色配置'],
  'lb.goal': ['City size to finish', '完成城市所需建筑'],
  'lb.speed': ['AI speed', 'AI 速度'],
  'lb.slow': ['Relaxed', '悠闲'], 'lb.normal': ['Normal', '正常'], 'lb.fast': ['Brisk', '快速'],
  'lb.start': ['Begin', '开始'],
  'lb.back': ['Back', '返回'],
  'lb.preset.classic': ['Classic', '经典'], 'lb.preset.queen': ['+ Queen', '+ 王后'],
  'lb.preset.expanded': ['Expanded', '扩展'], 'lb.preset.mixed': ['Full mix', '大混合'], 'lb.preset.custom': ['Custom', '自定义'],
  'lb.rank': ['Rank {n}', '等级 {n}'],
  'lb.needChars': ['{n} players need at least {k} characters (with rank IX).', '{n} 名玩家至少需要 {k} 个角色（加入第 IX 级）。'],
  'lb.roomCode': ['Room code', '房间码'],
  'lb.share': ['Share this code with friends.', '把房间码分享给好友。'],
  'lb.copy': ['Copy', '复制'], 'lb.copied': ['Copied', '已复制'],
  'lb.seats': ['Seats', '座位'],
  'lb.addAI': ['Add AI', '添加 AI'],
  'lb.removeAI': ['Remove', '移除'],
  'lb.waitingPlayers': ['Waiting for players…', '等待玩家加入…'],
  'lb.waitingHost': ['Waiting for the host to begin…', '等待房主开始…'],
  'lb.connecting': ['Connecting…', '连接中…'],
  'lb.code': ['Room code', '房间码'],
  'lb.joinGo': ['Join', '加入'],
  'lb.host.you': ['Host', '房主'],
  'lb.ai': ['AI', 'AI'],
  'lb.human': ['Player', '玩家'],
  'lb.netFail': ['Could not reach the matchmaking server. Check your connection.', '无法连接匹配服务器，请检查网络。'],
  'lb.noRoom': ['Room {code} not found.', '找不到房间 {code}。'],
  'lb.full': ['That room is full.', '房间已满。'],
  'lb.version': ['You and the host run different versions — both of you please refresh.', '你与房主的版本不同——请双方刷新页面。'],
  'lb.minPlayers': ['2–7 seats', '2–7 个座位'],
  'lb.offline': ['Online play needs an internet connection.', '联机需要网络连接。'],
  'lb.loading': ['Carving the city…', '正在雕琢城池…'],
  'lb.lang': ['Language', '语言'],
  'lb.defaultName': ['Wanderer', '旅人'],
  'lb.level': ['AI difficulty', 'AI 难度'],
  'lb.lvl.easy': ['Easy', '简单'], 'lb.lvl.normal': ['Normal', '普通'], 'lb.lvl.hard': ['Cunning', '狡诈'],
  'lb.timer': ['Turn timer', '回合限时'], 'lb.off': ['Off', '关'],
  'lb.stats': ['{w} wins · {g} games played', '{w} 胜 · 共 {g} 局'],
  'lb.music': ['Music', '音乐'],

  'ui.discardTitle': ['Discard one character face down', '暗置弃掉一个角色'],
  'ui.discardHint': ['Your opponent will never see it — bury what they want most.', '对手看不到它——弃掉对方最想要的。'],
  'ui.waitingDiscard': ['{name} is discarding a character…', '{name} 正在弃置角色…'],
  'ui.graveTitle': ['Graveyard', '墓地'],
  'ui.graveAsk': ['The Warlord destroyed your {dist}. Pay 1 gold to take it back into your hand?', '军阀摧毁了你的{dist}。支付 1 金将它收回手牌吗？'],
  'ui.graveYes': ['Pay 1 · take it back', '支付 1 金收回'],
  'ui.graveNo': ['Let it go', '放弃'],
  'ui.waitingGrave': ['{name} is deciding about the Graveyard…', '{name} 正在决定是否使用墓地…'],
  'ui.hint': ['Hint', '提示'],
  'ui.hintSays': ['Advisor: {what}', '谋士建议：{what}'],
  'h.pick': ['take the {char}', '选择{char}'], 'h.discard': ['discard the {char}', '弃掉{char}'],
  'h.gold': ['take 2 gold', '拿 2 金'], 'h.draw': ['draw cards', '摸牌'], 'h.build': ['build {dist}', '建造{dist}'],
  'h.end': ['end your turn', '结束回合'], 'h.kill': ['assassinate the {char}', '刺杀{char}'], 'h.rob': ['rob the {char}', '偷窃{char}'],
  'h.swap': ['swap hands with {name}', '与 {name} 交换手牌'], 'h.redraw': ['redraw {n} card(s)', '重摸 {n} 张牌'],
  'h.destroy': ['destroy {name}\'s {dist}', '摧毁 {name} 的{dist}'], 'h.peek': ['peer into {name}\'s hand', '查看 {name} 的手牌'],
  'h.seer': ['take a card from everyone', '从每人手中拿一张牌'], 'h.navg': ['take 4 gold', '拿 4 金'], 'h.navc': ['take 4 cards', '拿 4 张牌'],
  'h.scholar': ['study: draw 7, keep 1', '研读：摸 7 留 1'], 'h.smithy': ['use the Smithy', '使用铁匠铺'],
  'h.lab': ['discard {dist} at the Laboratory', '在实验室弃掉{dist}'], 'h.keep': ['keep {dist}', '保留{dist}'],
  'h.wizTake': ['take {dist}', '拿走{dist}'], 'h.seerGive': ['give back your weakest cards', '归还最弱的牌'],
  'h.graveYes': ['pay to recover it', '花钱收回'], 'h.graveNo': ['let it go', '放弃'],
  'ui.finalRound': ['Final round', '最后一轮'],
  'ui.finalSub': ['{name} completed a city', '{name} 完成了城市'],
  'ui.order': ['Pick order', '挑选顺序'],
  'ui.timeout': ['{name} ran out of time — the advisor moved for them.', '{name} 超时，由谋士代为行动。'],
  'ui.music': ['Music', '音乐'],
  'ui.quality': ['Graphics', '画质'], 'ui.q.high': ['Cinematic', '电影级'], 'ui.q.low': ['Smooth', '流畅'],
  'ui.qualityLow': ['Switched to smooth graphics for this device.', '已为此设备切换至流畅画质。'],
  'ui.keys': ['Keys — G gold · D draw · B build · A ability · E end · H hint · 1–9 cards', '快捷键 —— G 拿金 · D 摸牌 · B 建造 · A 技能 · E 结束 · H 提示 · 1–9 选牌'],
  'ui.react': ['React', '表情'],
  'ui.camHint': ['Drag to orbit · scroll or pinch to zoom', '拖动旋转视角 · 滚轮或双指缩放'],
  'ui.resetView': ['Reset view', '重置视角'],
  'ui.rejoined': ['{name} is back.', '{name} 回来了。'],
  'ui.error': ['Something went wrong — your game is saved.', '出了点问题——对局已保存。'],
  'ui.projected': ['Projected score', '预计得分'],
  'coach.draft': ['Choose a character in secret. Characters act in rank order (I → IX) and each has a power — hover a card to read it.', '秘密挑选一个角色。角色按等级（I → IX）依次行动，各有技能——悬停可查看说明。'],
  'coach.turn': ['Your turn! First take 2 gold or draw cards, then build a district you can afford. Unsure? Tap Hint.', '轮到你了！先拿 2 金或摸牌，再建造付得起的建筑。拿不准？点「提示」。'],
  'coach.call': ['The court calls characters from I to IX — follow the track at the top.', '宫廷按 I 到 IX 依次召见角色——留意顶部的顺序条。'],
  'coach.cam': ['Drag the table to look around · tap a city to inspect it.', '拖动桌面旋转视角 · 点击城市查看详情。'],
};

export const KEYS = () => Object.keys(D); // for the translation completeness test
export function t(key, vars) {
  const e = D[key];
  let s = !e ? key : lang === 'zh' ? e[1] : EXTRA[lang]?.[key] ?? e[0];
  if (vars) s = s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));
  return s;
}
export const cname = id => t('c.' + CHAR[id].key);
export const cabil = id => t('a.' + CHAR[id].key);
export const dname = card => t('d.' + (card.id || card));
export const ddesc = id => (D['dd.' + id] ? t('dd.' + id) : '');

export const RULES = {
  ...Object.fromEntries(Object.entries(EXTRA).map(([k, L]) => [k, L._rules])),
  en: `<h3>Goal</h3><p>Build the most valuable city. When someone finishes a city of <b>{goal}</b> districts, the round is played out and the highest score wins.</p>
<h3>Each round</h3><ol><li><b>Choose characters.</b> Starting with the Crown, each player secretly takes a character. Some are set aside face up, one face down.</li>
<li><b>Royal court.</b> Characters are called in rank order (I → IX). On your turn: take <b>2 gold</b> or <b>draw 2 cards and keep 1</b>; then build a district by paying its cost; use your character's power at any time.</li></ol>
<h3>Scoring</h3><p>Districts score their cost. +4 for completing first, +2 for completing later, +3 for all five colours, plus bonuses from unique (purple) districts.</p>
<h3>Two or three players</h3><p>Everyone plays <b>two characters</b> each round. With two players, after the first pick each pick is followed by discarding a character face down.</p>
<h3>Tips</h3><p>The Assassin and Thief name <i>characters</i>, not players — notice which characters were missing when the draft reached you. The Warlord can't touch the Bishop or a completed city.</p>`,
  zh: `<h3>目标</h3><p>建造价值最高的城市。当有人建成 <b>{goal}</b> 座建筑时，本轮结束后游戏终止，分数最高者获胜。</p>
<h3>每一轮</h3><ol><li><b>挑选角色。</b>从持有王冠者开始，每人秘密挑选一个角色。部分角色会公开移除，另有一张暗置。</li>
<li><b>宫廷召见。</b>按等级（I → IX）依次召唤角色。轮到你时：拿 <b>2 金</b>，或 <b>摸 2 张留 1 张</b>；然后支付造价建造建筑；角色技能可在回合内任何时候使用。</li></ol>
<h3>计分</h3><p>每座建筑按造价计分。率先完成城市 +4，之后完成 +2，五色齐全 +3，另有特殊（紫色）建筑加分。</p>
<h3>两人或三人</h3><p>每轮每人扮演<b>两个角色</b>。两人局中，第一次挑选之后，每次挑选还要暗置弃掉一个角色。</p>
<h3>提示</h3><p>刺客与盗贼指定的是<i>角色</i>而非玩家——留意轮到你时少了哪些角色。军阀不能摧毁主教或已完成城市的建筑。</p>`,
};
