// ─── Card Types ───────────────────────────────────────────────────────────────
const CardType = {
  PRIMARY_INDUSTRY: 'PRIMARY_INDUSTRY',
  SECONDARY_INDUSTRY: 'SECONDARY_INDUSTRY',
  RESTAURANT: 'RESTAURANT',
  MAJOR_ESTABLISHMENT: 'MAJOR_ESTABLISHMENT',
};

const EffectType = {
  GET_COINS: 'GET_COINS',
  GET_COINS_PER_CARD: 'GET_COINS_PER_CARD',
  TAKE_COINS: 'TAKE_COINS',
  TAKE_ALL_COINS: 'TAKE_ALL_COINS',
  STEAL_COINS: 'STEAL_COINS',
  SWAP_ESTABLISHMENT: 'SWAP_ESTABLISHMENT',
  GET_COINS_PER_LANDMARK: 'GET_COINS_PER_LANDMARK',
  GET_COINS_IF_HARBOR: 'GET_COINS_IF_HARBOR',
  TAKE_COINS_PER_CARD: 'TAKE_COINS_PER_CARD',
  REDISTRIBUTE: 'REDISTRIBUTE',
  GET_COINS_PER_TYPE: 'GET_COINS_PER_TYPE',
};

const Expansion = { BASE: 'BASE', HARBOR: 'HARBOR', MILLIONAIRES_ROW: 'MILLIONAIRES_ROW' };

// ─── Landmarks (Orange) ───────────────────────────────────────────────────────
const LANDMARKS = {
  TRAIN_STATION:   { id: 'TRAIN_STATION',   name: 'Train Station',   cost: 4,  expansion: Expansion.BASE,   description: 'You may roll 1 or 2 dice.',                              ability: 'ROLL_TWO_DICE' },
  SHOPPING_MALL:   { id: 'SHOPPING_MALL',   name: 'Shopping Mall',   cost: 10, expansion: Expansion.BASE,   description: 'Each of your ☕ and 🍞 establishments earn +1 coin.',      ability: 'SHOPPING_MALL_BONUS' },
  AMUSEMENT_PARK:  { id: 'AMUSEMENT_PARK',  name: 'Amusement Park',  cost: 16, expansion: Expansion.BASE,   description: 'If you roll doubles, take another turn.',                 ability: 'EXTRA_TURN_ON_DOUBLES' },
  RADIO_TOWER:     { id: 'RADIO_TOWER',     name: 'Radio Tower',     cost: 22, expansion: Expansion.BASE,   description: 'Once per turn, you may reroll your dice.',                ability: 'REROLL_ONCE' },
  CITY_HALL:       { id: 'CITY_HALL',       name: 'City Hall',       cost: 0,  expansion: Expansion.HARBOR, description: 'Before buying, if you have 0 coins, bank gives you 1.',   ability: 'CITY_HALL', startBuilt: true },
  HARBOR:          { id: 'HARBOR',          name: 'Harbor',          cost: 2,  expansion: Expansion.HARBOR, description: 'If dice sum is 10+, you may add 2 to your roll.',         ability: 'HARBOR_BONUS' },
  AIRPORT:         { id: 'AIRPORT',         name: 'Airport',         cost: 30, expansion: Expansion.HARBOR, description: 'If you buy nothing on your turn, bank gives you 10 coins.', ability: 'AIRPORT_BONUS' },
};

const ALL_LANDMARK_IDS = ['TRAIN_STATION', 'SHOPPING_MALL', 'AMUSEMENT_PARK', 'RADIO_TOWER', 'CITY_HALL', 'HARBOR', 'AIRPORT'];

// ─── Establishments ───────────────────────────────────────────────────────────
const CARDS = {

  // ══ PRIMARY INDUSTRY (Blue) ═══════════════════════════════════════════════
  WHEAT_FIELD: {
    id: 'WHEAT_FIELD', name: 'Wheat Field', type: CardType.PRIMARY_INDUSTRY, icon: '🌾',
    activation: [1], cost: 1, expansion: Expansion.BASE, maxPerPlayer: null,
    effect: { type: EffectType.GET_COINS, amount: 1 },
    description: 'Get 1 coin from the bank, anyone\'s turn.',
  },
  RANCH: {
    id: 'RANCH', name: 'Ranch', type: CardType.PRIMARY_INDUSTRY, icon: '🐄',
    activation: [2], cost: 1, expansion: Expansion.BASE, maxPerPlayer: null,
    effect: { type: EffectType.GET_COINS, amount: 1 },
    description: 'Get 1 coin from the bank, anyone\'s turn.',
  },
  FOREST: {
    id: 'FOREST', name: 'Forest', type: CardType.PRIMARY_INDUSTRY, icon: '🌲',
    activation: [5], cost: 3, expansion: Expansion.BASE, maxPerPlayer: null,
    effect: { type: EffectType.GET_COINS, amount: 1 },
    description: 'Get 1 coin from the bank, anyone\'s turn.',
  },
  MINE: {
    id: 'MINE', name: 'Mine', type: CardType.PRIMARY_INDUSTRY, icon: '⛏️',
    activation: [9], cost: 6, expansion: Expansion.BASE, maxPerPlayer: null,
    effect: { type: EffectType.GET_COINS, amount: 5 },
    description: 'Get 5 coins from the bank, anyone\'s turn.',
  },
  APPLE_ORCHARD: {
    id: 'APPLE_ORCHARD', name: 'Apple Orchard', type: CardType.PRIMARY_INDUSTRY, icon: '🍎',
    activation: [10], cost: 3, expansion: Expansion.BASE, maxPerPlayer: null,
    effect: { type: EffectType.GET_COINS, amount: 3 },
    description: 'Get 3 coins from the bank, anyone\'s turn.',
  },
  // Harbor Expansion — Blue
  FLOWER_GARDEN: {
    id: 'FLOWER_GARDEN', name: 'Flower Garden', type: CardType.PRIMARY_INDUSTRY, icon: '💐',
    activation: [4], cost: 2, expansion: Expansion.HARBOR, maxPerPlayer: null,
    effect: { type: EffectType.GET_COINS, amount: 1 },
    description: 'Get 1 coin from the bank, anyone\'s turn.',
  },
  MACKEREL_BOAT: {
    id: 'MACKEREL_BOAT', name: 'Mackerel Boat', type: CardType.PRIMARY_INDUSTRY, icon: '🎣',
    activation: [8], cost: 2, expansion: Expansion.HARBOR, maxPerPlayer: null,
    requiresLandmark: 'HARBOR',
    effect: { type: EffectType.GET_COINS_IF_HARBOR, amount: 3 },
    description: 'If you have the Harbor, get 3 coins from the bank, anyone\'s turn.',
  },
  TUNA_BOAT: {
    id: 'TUNA_BOAT', name: 'Tuna Boat', type: CardType.PRIMARY_INDUSTRY, icon: '🐟',
    activation: [12, 13, 14], cost: 5, expansion: Expansion.HARBOR, maxPerPlayer: null,
    requiresLandmark: 'HARBOR',
    effect: { type: EffectType.GET_COINS_IF_HARBOR, amount: 'DICE_SUM' },
    description: 'If you have the Harbor, receive coins equal to the dice total, anyone\'s turn.',
  },
  // Millionaire's Row — Blue
  CORN_FIELD: {
    id: 'CORN_FIELD', name: 'Corn Field', type: CardType.PRIMARY_INDUSTRY, icon: '🌽',
    activation: [3, 4], cost: 2, expansion: Expansion.MILLIONAIRES_ROW, maxPerPlayer: null,
    effect: { type: EffectType.GET_COINS, amount: 1 },
    description: 'Get 1 coin from the bank, anyone\'s turn.',
  },
  VINEYARD: {
    id: 'VINEYARD', name: 'Vineyard', type: CardType.PRIMARY_INDUSTRY, icon: '🍇',
    activation: [7], cost: 3, expansion: Expansion.MILLIONAIRES_ROW, maxPerPlayer: null,
    effect: { type: EffectType.GET_COINS, amount: 3 },
    description: 'Get 3 coins from the bank, anyone\'s turn.',
  },

  // ══ SECONDARY INDUSTRY (Green) ════════════════════════════════════════════
  BAKERY: {
    id: 'BAKERY', name: 'Bakery', type: CardType.SECONDARY_INDUSTRY, icon: '🍞',
    activation: [2, 3], cost: 1, expansion: Expansion.BASE, maxPerPlayer: null,
    effect: { type: EffectType.GET_COINS, amount: 1 },
    description: 'Get 1 coin from the bank, your turn only.',
    shoppingMallBonus: true,
  },
  CONVENIENCE_STORE: {
    id: 'CONVENIENCE_STORE', name: 'Convenience Store', type: CardType.SECONDARY_INDUSTRY, icon: '🏪',
    activation: [4], cost: 2, expansion: Expansion.BASE, maxPerPlayer: null,
    effect: { type: EffectType.GET_COINS, amount: 3 },
    description: 'Get 3 coins from the bank, your turn only.',
    shoppingMallBonus: true,
  },
  CHEESE_FACTORY: {
    id: 'CHEESE_FACTORY', name: 'Cheese Factory', type: CardType.SECONDARY_INDUSTRY, icon: '🧀',
    activation: [7], cost: 5, expansion: Expansion.BASE, maxPerPlayer: null,
    effect: { type: EffectType.GET_COINS_PER_CARD, amount: 3, cardIds: ['RANCH'] },
    description: 'Get 3 coins per Ranch you own, your turn only.',
  },
  FURNITURE_FACTORY: {
    id: 'FURNITURE_FACTORY', name: 'Furniture Factory', type: CardType.SECONDARY_INDUSTRY, icon: '🪑',
    activation: [8], cost: 3, expansion: Expansion.BASE, maxPerPlayer: null,
    effect: { type: EffectType.GET_COINS_PER_CARD, amount: 3, cardIds: ['FOREST', 'MINE'] },
    description: 'Get 3 coins per Forest or Mine you own, your turn only.',
  },
  FARMERS_MARKET: {
    id: 'FARMERS_MARKET', name: "Fruit & Veg Market", type: CardType.SECONDARY_INDUSTRY, icon: '🥦',
    activation: [11, 12], cost: 2, expansion: Expansion.BASE, maxPerPlayer: null,
    effect: { type: EffectType.GET_COINS_PER_CARD, amount: 2, cardIds: ['WHEAT_FIELD', 'APPLE_ORCHARD', 'CORN_FIELD'] },
    description: 'Get 2 coins per Wheat Field, Apple Orchard, or Corn Field you own, your turn only.',
  },
  // Harbor — Green
  FLOWER_SHOP: {
    id: 'FLOWER_SHOP', name: 'Flower Shop', type: CardType.SECONDARY_INDUSTRY, icon: '🌸',
    activation: [6], cost: 1, expansion: Expansion.HARBOR, maxPerPlayer: null,
    effect: { type: EffectType.GET_COINS_PER_CARD, amount: 1, cardIds: ['FLOWER_GARDEN'] },
    description: 'Get 1 coin per Flower Garden you own, your turn only.',
    shoppingMallBonus: true,
  },
  FOOD_WAREHOUSE: {
    id: 'FOOD_WAREHOUSE', name: 'Food Warehouse', type: CardType.SECONDARY_INDUSTRY, icon: '🏭',
    activation: [12, 13], cost: 2, expansion: Expansion.HARBOR, maxPerPlayer: null,
    effect: { type: EffectType.GET_COINS_PER_CARD, amount: 2, cardType: CardType.RESTAURANT },
    description: 'Get 2 coins per Restaurant you own, your turn only.',
  },
  // Millionaire's Row — Green
  GENERAL_STORE: {
    id: 'GENERAL_STORE', name: 'General Store', type: CardType.SECONDARY_INDUSTRY, icon: '🏬',
    activation: [2], cost: 0, expansion: Expansion.MILLIONAIRES_ROW, maxPerPlayer: null,
    effect: { type: EffectType.GET_COINS, amount: 2 },
    description: 'Get 2 coins from bank on your turn (if you have fewer than 2 landmarks built).',
    condition: 'FEW_LANDMARKS',
    shoppingMallBonus: true,
  },
  MOVING_COMPANY: {
    id: 'MOVING_COMPANY', name: 'Moving Company', type: CardType.SECONDARY_INDUSTRY, icon: '🚚',
    activation: [9, 10], cost: 2, expansion: Expansion.MILLIONAIRES_ROW, maxPerPlayer: null,
    effect: { type: EffectType.GET_COINS, amount: 2 },
    description: 'Get 2 coins from the bank, your turn only.',
  },
  LOAN_OFFICE: {
    id: 'LOAN_OFFICE', name: 'Loan Office', type: CardType.SECONDARY_INDUSTRY, icon: '🏦',
    activation: [5, 6], cost: 0, expansion: Expansion.MILLIONAIRES_ROW, maxPerPlayer: null,
    effect: { type: EffectType.TAKE_COINS, amount: -2 },
    description: 'On your turn (5 or 6): pay 2 coins to the bank.',
    special: 'LOAN_OFFICE',
  },
  WINERY: {
    id: 'WINERY', name: 'Winery', type: CardType.SECONDARY_INDUSTRY, icon: '🍷',
    activation: [9], cost: 3, expansion: Expansion.MILLIONAIRES_ROW, maxPerPlayer: null,
    effect: { type: EffectType.GET_COINS_PER_CARD, amount: 1, cardIds: ['VINEYARD'] },
    description: 'Get 1 coin per Vineyard you own, your turn only.',
  },
  DEMOLITION_COMPANY: {
    id: 'DEMOLITION_COMPANY', name: 'Demolition Company', type: CardType.SECONDARY_INDUSTRY, icon: '🏗️',
    activation: [4], cost: 2, expansion: Expansion.MILLIONAIRES_ROW, maxPerPlayer: null,
    effect: { type: EffectType.GET_COINS, amount: 2 },
    description: 'Get 2 coins from the bank, your turn only.',
  },
  SODA_BOTTLING_PLANT: {
    id: 'SODA_BOTTLING_PLANT', name: 'Soda Bottling Plant', type: CardType.SECONDARY_INDUSTRY, icon: '🥤',
    activation: [11], cost: 5, expansion: Expansion.MILLIONAIRES_ROW, maxPerPlayer: null,
    effect: { type: EffectType.GET_COINS_PER_CARD, amount: 1, cardType: CardType.RESTAURANT },
    description: 'Get 1 coin per Restaurant establishment any player owns, your turn only.',
    special: 'SODA_ALL_PLAYERS',
  },

  // ══ RESTAURANTS (Red) ════════════════════════════════════════════════════
  CAFE: {
    id: 'CAFE', name: 'Café', type: CardType.RESTAURANT, icon: '☕',
    activation: [3], cost: 2, expansion: Expansion.BASE, maxPerPlayer: null,
    effect: { type: EffectType.TAKE_COINS, amount: 1 },
    description: 'Take 1 coin from the active player.',
    shoppingMallBonus: true,
  },
  FAMILY_RESTAURANT: {
    id: 'FAMILY_RESTAURANT', name: 'Family Restaurant', type: CardType.RESTAURANT, icon: '🍽️',
    activation: [9, 10], cost: 3, expansion: Expansion.BASE, maxPerPlayer: null,
    effect: { type: EffectType.TAKE_COINS, amount: 2 },
    description: 'Take 2 coins from the active player.',
    shoppingMallBonus: true,
  },
  // Harbor — Red
  SUSHI_BAR: {
    id: 'SUSHI_BAR', name: 'Sushi Bar', type: CardType.RESTAURANT, icon: '🍣',
    activation: [1, 2], cost: 6, expansion: Expansion.HARBOR, maxPerPlayer: null,
    requiresLandmark: 'HARBOR',
    effect: { type: EffectType.TAKE_COINS, amount: 3 },
    description: 'If you have the Harbor, take 3 coins from the active player.',
    shoppingMallBonus: true,
  },
  PIZZA_JOINT: {
    id: 'PIZZA_JOINT', name: 'Pizza Joint', type: CardType.RESTAURANT, icon: '🍕',
    activation: [7], cost: 1, expansion: Expansion.HARBOR, maxPerPlayer: null,
    effect: { type: EffectType.TAKE_COINS, amount: 1 },
    description: 'Take 1 coin from the active player.',
    shoppingMallBonus: true,
  },
  HAMBURGER_STAND: {
    id: 'HAMBURGER_STAND', name: 'Hamburger Stand', type: CardType.RESTAURANT, icon: '🍔',
    activation: [8], cost: 1, expansion: Expansion.HARBOR, maxPerPlayer: null,
    effect: { type: EffectType.TAKE_COINS, amount: 1 },
    description: 'Take 1 coin from the active player.',
    shoppingMallBonus: true,
  },
  // Millionaire's Row — Red
  FRENCH_RESTAURANT: {
    id: 'FRENCH_RESTAURANT', name: 'French Restaurant', type: CardType.RESTAURANT, icon: '🥐',
    activation: [5], cost: 3, expansion: Expansion.MILLIONAIRES_ROW, maxPerPlayer: null,
    effect: { type: EffectType.TAKE_COINS, amount: 2 },
    description: 'Take 2 coins from the active player.',
    shoppingMallBonus: true,
  },
  MEMBERS_ONLY_CLUB: {
    id: 'MEMBERS_ONLY_CLUB', name: "Member's Only Club", type: CardType.RESTAURANT, icon: '🎩',
    activation: [12, 13, 14], cost: 4, expansion: Expansion.MILLIONAIRES_ROW, maxPerPlayer: null,
    effect: { type: EffectType.TAKE_ALL_COINS, amount: 0, special: 'ALL_COINS' },
    description: 'Take ALL coins from the active player (if they have 0 landmarks built).',
    special: 'MEMBERS_ONLY_CLUB',
  },

  // ══ MAJOR ESTABLISHMENTS (Purple) ════════════════════════════════════════
  STADIUM: {
    id: 'STADIUM', name: 'Stadium', type: CardType.MAJOR_ESTABLISHMENT, icon: '🏟️',
    activation: [6], cost: 6, expansion: Expansion.BASE, maxPerPlayer: 1,
    effect: { type: EffectType.STEAL_COINS, amount: 2 },
    description: 'Take 2 coins from each other player, your turn only.',
  },
  TV_STATION: {
    id: 'TV_STATION', name: 'TV Station', type: CardType.MAJOR_ESTABLISHMENT, icon: '📺',
    activation: [6], cost: 7, expansion: Expansion.BASE, maxPerPlayer: 1,
    effect: { type: EffectType.TAKE_ALL_COINS, amount: 5 },
    description: 'Take 5 coins from any one player, your turn only.',
  },
  BUSINESS_CENTER: {
    id: 'BUSINESS_CENTER', name: 'Business Center', type: CardType.MAJOR_ESTABLISHMENT, icon: '🏢',
    activation: [6], cost: 8, expansion: Expansion.BASE, maxPerPlayer: 1,
    effect: { type: EffectType.SWAP_ESTABLISHMENT, amount: 0 },
    description: 'Trade one non-major establishment with another player, your turn only.',
  },
  // Harbor — Purple
  PUBLISHER: {
    id: 'PUBLISHER', name: 'Publisher', type: CardType.MAJOR_ESTABLISHMENT, icon: '📰',
    activation: [7], cost: 5, expansion: Expansion.HARBOR, maxPerPlayer: 1,
    effect: { type: EffectType.TAKE_COINS_PER_CARD, cardType: [CardType.RESTAURANT, CardType.SECONDARY_INDUSTRY], amount: 1 },
    description: 'Take 1 coin from each player per cup/bread establishment they own, your turn only.',
  },
  TAX_OFFICE: {
    id: 'TAX_OFFICE', name: 'Tax Office', type: CardType.MAJOR_ESTABLISHMENT, icon: '💼',
    activation: [8, 9], cost: 4, expansion: Expansion.HARBOR, maxPerPlayer: 1,
    effect: { type: EffectType.TAKE_ALL_COINS, amount: 0, fraction: 0.5 },
    description: 'If any player has 10+ coins, take half their coins (rounded down), your turn only.',
    special: 'TAX_OFFICE',
  },
  // Millionaire's Row — Purple
  PARK: {
    id: 'PARK', name: 'Park', type: CardType.MAJOR_ESTABLISHMENT, icon: '🌳',
    activation: [11, 12, 13], cost: 3, expansion: Expansion.MILLIONAIRES_ROW, maxPerPlayer: 1,
    effect: { type: EffectType.REDISTRIBUTE, amount: 0 },
    description: 'Redistribute all players\' coins evenly. Remainder goes to the bank.',
    special: 'PARK',
  },
  RENOVATION_COMPANY: {
    id: 'RENOVATION_COMPANY', name: 'Renovation Company', type: CardType.MAJOR_ESTABLISHMENT, icon: '🔨',
    activation: [8], cost: 4, expansion: Expansion.MILLIONAIRES_ROW, maxPerPlayer: 1,
    effect: { type: EffectType.GET_COINS_PER_LANDMARK, amount: 1 },
    description: 'Choose a landmark. All players who have it pay you 3 coins.',
    special: 'RENOVATION_COMPANY',
  },
  TECH_STARTUP: {
    id: 'TECH_STARTUP', name: 'Tech Startup', type: CardType.MAJOR_ESTABLISHMENT, icon: '💻',
    activation: [10], cost: 1, expansion: Expansion.MILLIONAIRES_ROW, maxPerPlayer: 1,
    effect: { type: EffectType.GET_COINS, amount: 0 },
    description: 'Invest coins. On your turn, receive invested amount from each other player.',
    special: 'TECH_STARTUP',
  },
  INTERNATIONAL_EXHIBIT_HALL: {
    id: 'INTERNATIONAL_EXHIBIT_HALL', name: 'Intl. Exhibit Hall', type: CardType.MAJOR_ESTABLISHMENT, icon: '🏛️',
    activation: [10], cost: 7, expansion: Expansion.MILLIONAIRES_ROW, maxPerPlayer: 1,
    effect: { type: EffectType.GET_COINS, amount: 0 },
    description: 'If you have the most (or tied for most) landmarks, take all coins from the bank supply.',
    special: 'INTERNATIONAL_EXHIBIT_HALL',
  },
};

// ─── Supply Counts ─────────────────────────────────────────────────────────────
const SUPPLY_COUNTS = {
  // Base — Blue
  WHEAT_FIELD: 6, RANCH: 6, FOREST: 6, MINE: 6, APPLE_ORCHARD: 6,
  // Base — Green
  BAKERY: 6, CONVENIENCE_STORE: 6, CHEESE_FACTORY: 6, FURNITURE_FACTORY: 6, FARMERS_MARKET: 6,
  // Base — Red
  CAFE: 6, FAMILY_RESTAURANT: 6,
  // Base — Purple
  STADIUM: 4, TV_STATION: 4, BUSINESS_CENTER: 4,
  // Harbor — Blue
  FLOWER_GARDEN: 6, MACKEREL_BOAT: 6, TUNA_BOAT: 6,
  // Harbor — Green
  FLOWER_SHOP: 6, FOOD_WAREHOUSE: 6,
  // Harbor — Red
  SUSHI_BAR: 6, PIZZA_JOINT: 6, HAMBURGER_STAND: 6,
  // Harbor — Purple
  PUBLISHER: 4, TAX_OFFICE: 4,
  // Millionaire's Row — Blue
  CORN_FIELD: 6, VINEYARD: 6,
  // Millionaire's Row — Green
  GENERAL_STORE: 6, MOVING_COMPANY: 6, LOAN_OFFICE: 4, WINERY: 6,
  DEMOLITION_COMPANY: 6, SODA_BOTTLING_PLANT: 4,
  // Millionaire's Row — Red
  FRENCH_RESTAURANT: 6, MEMBERS_ONLY_CLUB: 4,
  // Millionaire's Row — Purple
  PARK: 4, RENOVATION_COMPANY: 4, TECH_STARTUP: 4, INTERNATIONAL_EXHIBIT_HALL: 4,
};

const CARD_TYPE_COLORS = {
  [CardType.PRIMARY_INDUSTRY]:   '#2e6fa8',
  [CardType.SECONDARY_INDUSTRY]: '#2a7a44',
  [CardType.RESTAURANT]:         '#b83232',
  [CardType.MAJOR_ESTABLISHMENT]:'#6b3fa0',
};

const CARD_TYPE_LABELS = {
  [CardType.PRIMARY_INDUSTRY]:   'Primary Industry',
  [CardType.SECONDARY_INDUSTRY]: 'Secondary Industry',
  [CardType.RESTAURANT]:         'Restaurant',
  [CardType.MAJOR_ESTABLISHMENT]:'Major Establishment',
};

// Node.js export
if (typeof module !== 'undefined') {
  module.exports = { CardType, EffectType, Expansion, LANDMARKS, CARDS, SUPPLY_COUNTS, ALL_LANDMARK_IDS, CARD_TYPE_COLORS, CARD_TYPE_LABELS };
}
