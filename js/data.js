// ═══════════════════════════════════════════════════════════════════════════════
// DATA — Base game definitions: characters, color palette, district emojis,
//        special-ability descriptions, and the deck factory.
//
// Extensions may push into CHARS, SDESC, and EXT._extraDistricts via EXT.register().
// ═══════════════════════════════════════════════════════════════════════════════

const CHARS=[
  {id:1, rank:1,name:'Assassin', clr:'#cc7777',emoji:'🥷',ability:'Kill a character — they skip their turn this round.'},
  {id:2, rank:2,name:'Thief',    clr:'#b0b0b0',emoji:'🕵️',ability:'Declare a target; steal all their gold when they are called.'},
  {id:3, rank:3,name:'Magician', clr:'#9b6fff',emoji:'🧙',ability:'Swap hands with a player, OR discard cards and redraw the same number.'},
  {id:4, rank:4,name:'King',     clr:'#d4a843',emoji:'🤴',ability:'Take the Crown — pick roles first next round. Gain +1✦ per Noble (yellow) district in your city.'},
  {id:5, rank:5,name:'Bishop',   clr:'#5a9fd4',emoji:'⛪',ability:'Protected from Warlord. Gain +1✦ per Religious (blue) district built.'},
  {id:6, rank:6,name:'Merchant', clr:'#4db87a',emoji:'🧑‍💼',ability:'Gain +1✦ bonus. Gain +1✦ per Trade (green) district built.'},
  {id:7, rank:7,name:'Architect',clr:'#e0975c',emoji:'👷',ability:'Draw +2 cards immediately. May build up to 3 districts this turn.'},
  {id:8, rank:8,name:'Warlord',  clr:'#d45a5a',emoji:'🤺',ability:'Destroy a district (pay cost−1 gold). Gain +1✦ per Military (red) district built.'},
  {id:9, rank:9,name:'Queen',    clr:'#d4a843',emoji:'🫅',ability:'Gain 3✦ if you are seated directly beside the player holding the King.'},
  {id:10,rank:7,name:'Navigator',clr:'#4a90d9',emoji:'⚓',ability:'Take 4✦ OR draw 4 cards for income. You may not build a district this turn.'},
  {id:11,rank:3,name:'Wizard',   clr:'#9b6fff',emoji:'🔮',ability:"Look at one player's hand. Take 1 card from it, then keep it or build it immediately."},
  {id:12,rank:4,name:'Patrician',clr:'#d4a843',emoji:'🏅',ability:'Take the Crown — pick roles first next round. Gain +1 card per Noble (yellow) district in your city.'},
  {id:13,rank:5,name:'Abbot',    clr:'#5a9fd4',emoji:'🧎',ability:'Gain +1✦ per Religious (blue) district. Take 1✦ from the richest opponent.'},
  {id:14,rank:7,name:'Scholar',  clr:'#e0975c',emoji:'📖',ability:'Draw 7 cards from the deck, keep 1. May build up to 2 districts this turn.'},
  {id:15,rank:3,name:'Seer',     clr:'#9b6fff',emoji:'🔯',ability:"Special: take 1 card at random from each opponent's hand. Build up to 2 districts this turn."},
  {id:16,rank:6,name:'Trader',   clr:'#4db87a',emoji:'🏦',ability:'Gain +1✦ per Trade (green) district in your city. Build up to 2 districts this turn.'},
];

const CS={
  yellow:{bg:'#1c1608',bdr:'#6a4e10',txt:'#d4a843',bar:'#d4a843',label:'Noble'},
  blue:  {bg:'#08121e',bdr:'#1e3f63',txt:'#5a9fd4',bar:'#5a9fd4',label:'Religious'},
  green: {bg:'#081408',bdr:'#1a4a20',txt:'#4db87a',bar:'#4db87a',label:'Trade'},
  red:   {bg:'#1a0808',bdr:'#631e1e',txt:'#d45a5a',bar:'#d45a5a',label:'Military'},
  purple:{bg:'#110820',bdr:'#4a1a7a',txt:'#c084fc',bar:'#c084fc',label:'Unique'},
};

// Emoji per district id
const DEMOJI={
  manor:'🏡',castle:'🏰',palace:'🏛️',
  temple:'⛩️',church:'⛪',monastery:'🛕',cathedral:'🕍',
  tavern:'🍺',market:'⚖️',trading_post:'🏪',docks:'⚓',harbor:'🚢',town_hall:'🏢',
  watchtower:'🗼',prison:'🔒',battlefield:'🛡️',fortress:'🏯',
  haunted_city:'👻',factory:'⚙️',dragon_gate:'🐉',university:'🎓',
  thieves_den:'🗝️',keep:'🛡️',graveyard:'⚰️',observatory:'🔭',
  smithy:'⚒️',library:'📚',school_of_magic:'✨',wishing_well:'🪄',
  map_room:'🗺️',secret_vault:'🤫',great_wall:'🧱',
  quarry:'⛏️',basilica:'🕌',capitol:'🏤',ivory_tower:'🗽',
};

// Special-ability tooltip descriptions (extensions may add keys via ext.sdesc)
const SDESC={
  flex_color:  'Counts as any color for the 5-color diversity bonus (+3 pts) at game end.',
  bonus2:      'Worth +2 extra victory points at game end.',
  keep:        'Cannot be destroyed by the Warlord.',
  graveyard:   'When any district is destroyed, pay 1✦ to recover it into your hand.',
  observatory: 'Draw 3 cards for income, keep 1 (instead of draw 2 keep 1).',
  smithy:      'Once per turn: pay 2✦ to draw 3 district cards.',
  library:     'When you take cards for income, keep BOTH drawn cards.',
  factory:     'All other purple unique districts cost 1✦ less for you to build.',
  wishing_well:'+1 pt per other unique (purple) district in your city at game end.',
  map_room:    '+1 pt per card remaining in your hand at game end.',
  secret_vault:'Worth points never revealed to others during the game.',
  great_wall:  'Warlord must pay full cost (not cost−1) to destroy your districts.',
  thieves_den: 'May be built by paying any mix of gold and cards from hand.',
  queen:       'Gain 3✦ at start of turn if seated directly beside the King player (wrap-around table seating).',
  navigator:   'Take 4✦ or draw 4 cards for income. Cannot build a district this turn.',
  wizard:      "View a chosen player's hand and take 1 card from it.",
  seer:        "Take 1 card at random from each opponent's hand as a special action. Build up to 2 districts.",
  trader:      'Gain +1✦ per Trade (green) district in your city each round. Build up to 2 districts per turn.',
  basilica:    'Worth +1 VP per odd-cost district in your city at game end.',
  capitol:     'Worth +3 VP at game end if you have 3 or more districts of the same color.',
  ivory_tower: 'Worth +5 VP at game end if this is your only purple district.',
  quarry:      'You may build duplicate districts (same-name districts already in your city).',
};

const CHAR_PRESETS={
  2:[1,2,3,4,5,6,7,8],
  3:[1,2,3,4,5,6,7,8],
  4:[1,2,3,4,5,6,7,8],
  5:[1,2,3,4,5,6,7,8,9],
  6:[1,2,3,4,5,6,7,8,9],
  7:[1,2,3,4,5,6,7,8,9],
};

let UID=0;
function mkDeck(){
  const D=[];
  function add(id,name,cost,color,special){D.push({uid:'d'+(UID++),id,name,cost,color,special:special||null});}
  for(let i=0;i<3;i++)add('manor','Manor',3,'yellow');
  for(let i=0;i<3;i++)add('castle','Castle',4,'yellow');
  for(let i=0;i<2;i++)add('palace','Palace',5,'yellow');
  for(let i=0;i<3;i++)add('temple','Temple',1,'blue');
  for(let i=0;i<3;i++)add('church','Church',2,'blue');
  for(let i=0;i<3;i++)add('monastery','Monastery',3,'blue');
  for(let i=0;i<2;i++)add('cathedral','Cathedral',5,'blue');
  for(let i=0;i<3;i++)add('tavern','Tavern',1,'green');
  for(let i=0;i<3;i++)add('market','Market',2,'green');
  for(let i=0;i<2;i++)add('trading_post','Trading Post',2,'green');
  for(let i=0;i<2;i++)add('docks','Docks',3,'green');
  for(let i=0;i<2;i++)add('harbor','Harbor',4,'green');
  for(let i=0;i<2;i++)add('town_hall','Town Hall',5,'green');
  for(let i=0;i<3;i++)add('watchtower','Watchtower',1,'red');
  for(let i=0;i<3;i++)add('prison','Prison',2,'red');
  for(let i=0;i<2;i++)add('battlefield','Battlefield',3,'red');
  for(let i=0;i<2;i++)add('fortress','Fortress',5,'red');
  add('haunted_city','Haunted City',2,'purple','flex_color');
  add('factory','Factory',5,'purple','factory');
  add('dragon_gate','Dragon Gate',6,'purple','bonus2');
  add('university','University',6,'purple','bonus2');
  add('thieves_den',"Thieves' Den",6,'purple','thieves_den');
  add('keep','Keep',3,'purple','keep');
  add('graveyard','Graveyard',1,'purple','graveyard');
  add('observatory','Observatory',5,'purple','observatory');
  add('smithy','Smithy',5,'purple','smithy');
  add('library','Library',6,'purple','library');
  add('school_of_magic','School of Magic',6,'purple','flex_color');
  add('wishing_well','Wishing Well',5,'purple','wishing_well');
  add('map_room','Map Room',5,'purple','map_room');
  add('secret_vault','Secret Vault',3,'purple','secret_vault');
  add('great_wall','Great Wall',6,'purple','great_wall');
  add('quarry','Quarry',5,'purple','quarry');
  add('basilica','Basilica',6,'purple','basilica');
  add('capitol','Capitol',5,'purple','capitol');
  add('ivory_tower','Ivory Tower',3,'purple','ivory_tower');
  // Extension districts registered via EXT.register({ districts: [...] })
  EXT._extraDistricts.forEach(d=>D.push({...d,uid:'d'+(UID++)}));
  return D;
}

function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=0|Math.random()*(i+1);[b[i],b[j]]=[b[j],b[i]];}return b;}
