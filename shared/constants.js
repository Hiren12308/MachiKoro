/**
 * Machi Koro - Shared Constants
 * Card definitions for Base Game, Harbor, and Millionaire's Row expansions
 */

// ─── Card Types ───────────────────────────────────────────────────────────────

export const CardType = {
  PRIMARY_INDUSTRY: 'PRIMARY_INDUSTRY',       // Blue  - activates on anyone's roll
  SECONDARY_INDUSTRY: 'SECONDARY_INDUSTRY',   // Green - activates on owner's roll only
  RESTAURANT: 'RESTAURANT',                   // Red   - activates on others' rolls (they pay you)
  MAJOR_ESTABLISHMENT: 'MAJOR_ESTABLISHMENT', // Purple - activates on owner's roll, unique effects
};

// ─── Effect Types ─────────────────────────────────────────────────────────────

export const EffectType = {
  GET_COINS: 'GET_COINS',               // Gain coins from bank
  GET_COINS_PER_CARD: 'GET_COINS_PER_CARD', // Gain coins × count of a card type you own
  TAKE_COINS: 'TAKE_COINS',            // Take coins from active player
  TAKE_ALL_COINS: 'TAKE_ALL_COINS',    // Take ALL coins from active player
  STEAL_COINS: 'STEAL_COINS',          // Take coins from each other player
  SWAP_ESTABLISHMENT: 'SWAP_ESTABLISHMENT', // Swap an establishment with another player
  REROLL: 'REROLL',                    // Roll again or move dice to target number
  DOUBLE_NEXT: 'DOUBLE_NEXT',          // Double income from next activation
  GET_COINS_PER_LANDMARK: 'GET_COINS_PER_LANDMARK', // Gain coins per completed landmark
  GET_COINS_IF_HARBOR: 'GET_COINS_IF_HARBOR',       // Bonus if Harbor landmark is built
  TAKE_COINS_PER_CARD: 'TAKE_COINS_PER_CARD',       // Take coins × card count from active player
};

// ─── Expansion Tags ───────────────────────────────────────────────────────────

export const Expansion = {
  BASE: 'BASE',
  HARBOR: 'HARBOR',
  MILLIONAIRES_ROW: 'MILLIONAIRES_ROW',
};

// ─── Landmark Definitions ─────────────────────────────────────────────────────

export const LANDMARKS = {
  // Base Game
  CITY_HALL: {
    id: 'CITY_HALL',
    name: 'City Hall',
    cost: 0,
    expansion: Expansion.BASE,
    description: 'Immediately before buying establishments, if you have 0 coins, the bank pays you 1 coin.',
    ability: 'CITY_HALL',
    startBuilt: true, // starts already built in some rule variants
  },
  TRAIN_STATION: {
    id: 'TRAIN_STATION',
    name: 'Train Station',
    cost: 4,
    expansion: Expansion.BASE,
    description: 'You may roll 1 or 2 dice.',
    ability: 'ROLL_TWO_DICE',
  },
  SHOPPING_MALL: {
    id: 'SHOPPING_MALL',
    name: 'Shopping Mall',
    cost: 10,
    expansion: Expansion.BASE,
    description: 'Each of your cup and bread establishments earn +1 coin.',
    ability: 'SHOPPING_MALL_BONUS',
  },
  AMUSEMENT_PARK: {
    id: 'AMUSEMENT_PARK',
    name: 'Amusement Park',
    cost: 16,
    expansion: Expansion.BASE,
    description: 'If you roll doubles, take another turn after this one.',
    ability: 'EXTRA_TURN_ON_DOUBLES',
  },
  RADIO_TOWER: {
    id: 'RADIO_TOWER',
    name: 'Radio Tower',
    cost: 22,
    expansion: Expansion.BASE,
    description: 'Once per turn, you may reroll your dice.',
    ability: 'REROLL_ONCE',
  },

  // Harbor Expansion
  HARBOR: {
    id: 'HARBOR',
    name: 'Harbor',
    cost: 2,
    expansion: Expansion.HARBOR,
    description: 'If the dice sum is 10 or more, you may add 2 to your roll.',
    ability: 'HARBOR_BONUS',
  },
  CITY_HALL_HARBOR: {
    id: 'CITY_HALL_HARBOR',
    name: 'City Hall',
    cost: 7,
    expansion: Expansion.HARBOR,
    description: 'Immediately before buying establishments, if you have 0 coins, the bank pays you 1 coin.',
    ability: 'CITY_HALL',
  },
  AIRPORT: {
    id: 'AIRPORT',
    name: 'Airport',
    cost: 30,
    expansion: Expansion.HARBOR,
    description: 'If you choose not to buy anything on your turn, the bank gives you 10 coins.',
    ability: 'AIRPORT_BONUS',
  },

  // Millionaire's Row Expansion
  FRENCH_RESTAURANT: {
    id: 'FRENCH_RESTAURANT',
    name: "French Restaurant",
    cost: 100,
    expansion: Expansion.MILLIONAIRES_ROW,
    description: 'For each landmark your opponents have built, you gain 5 coins from them on your turn.',
    ability: 'FRENCH_RESTAURANT',
  },
};

// ─── Establishment Card Definitions ───────────────────────────────────────────

export const CARDS = {

  // ═══════════════════════════════════════════════════════════════
  // BASE GAME
  // ═══════════════════════════════════════════════════════════════

  WHEAT_FIELD: {
    id: 'WHEAT_FIELD',
    name: 'Wheat Field',
    type: CardType.PRIMARY_INDUSTRY,
    icon: '🌾',
    activation: [1],
    cost: 1,
    expansion: Expansion.BASE,
    maxPerPlayer: null, // unlimited
    effect: { type: EffectType.GET_COINS, amount: 1 },
    description: 'Get 1 coin from the bank on anyone\'s turn.',
  },

  RANCH: {
    id: 'RANCH',
    name: 'Ranch',
    type: CardType.PRIMARY_INDUSTRY,
    icon: '🐄',
    activation: [2],
    cost: 1,
    expansion: Expansion.BASE,
    maxPerPlayer: null,
    effect: { type: EffectType.GET_COINS, amount: 1 },
    description: 'Get 1 coin from the bank on anyone\'s turn.',
  },

  BAKERY: {
    id: 'BAKERY',
    name: 'Bakery',
    type: CardType.SECONDARY_INDUSTRY,
    icon: '🍞',
    activation: [2, 3],
    cost: 1,
    expansion: Expansion.BASE,
    maxPerPlayer: null,
    effect: { type: EffectType.GET_COINS, amount: 1 },
    description: 'Get 1 coin from the bank on your turn only.',
    shoppingMallBonus: true,
  },

  CAFE: {
    id: 'CAFE',
    name: 'Cafe',
    type: CardType.RESTAURANT,
    icon: '☕',
    activation: [3],
    cost: 2,
    expansion: Expansion.BASE,
    maxPerPlayer: null,
    effect: { type: EffectType.TAKE_COINS, amount: 1 },
    description: 'Take 1 coin from the active player.',
    shoppingMallBonus: true,
  },

  CONVENIENCE_STORE: {
    id: 'CONVENIENCE_STORE',
    name: 'Convenience Store',
    type: CardType.SECONDARY_INDUSTRY,
    icon: '🏪',
    activation: [4],
    cost: 2,
    expansion: Expansion.BASE,
    maxPerPlayer: null,
    effect: { type: EffectType.GET_COINS, amount: 3 },
    description: 'Get 3 coins from the bank on your turn only.',
    shoppingMallBonus: true,
  },

  FOREST: {
    id: 'FOREST',
    name: 'Forest',
    type: CardType.PRIMARY_INDUSTRY,
    icon: '🌲',
    activation: [5],
    cost: 3,
    expansion: Expansion.BASE,
    maxPerPlayer: null,
    effect: { type: EffectType.GET_COINS, amount: 1 },
    description: 'Get 1 coin from the bank on anyone\'s turn.',
  },

  STADIUM: {
    id: 'STADIUM',
    name: 'Stadium',
    type: CardType.MAJOR_ESTABLISHMENT,
    icon: '🏟️',
    activation: [6],
    cost: 6,
    expansion: Expansion.BASE,
    maxPerPlayer: 1,
    effect: { type: EffectType.STEAL_COINS, amount: 2 },
    description: 'Take 2 coins from each other player on your turn only.',
  },

  TV_STATION: {
    id: 'TV_STATION',
    name: 'TV Station',
    type: CardType.MAJOR_ESTABLISHMENT,
    icon: '📺',
    activation: [6],
    cost: 7,
    expansion: Expansion.BASE,
    maxPerPlayer: 1,
    effect: { type: EffectType.TAKE_ALL_COINS, amount: 5 },
    description: 'Take 5 coins from any one player on your turn only.',
  },

  BUSINESS_CENTER: {
    id: 'BUSINESS_CENTER',
    name: 'Business Center',
    type: CardType.MAJOR_ESTABLISHMENT,
    icon: '🏢',
    activation: [6],
    cost: 8,
    expansion: Expansion.BASE,
    maxPerPlayer: 1,
    effect: { type: EffectType.SWAP_ESTABLISHMENT, amount: 0 },
    description: 'Trade one non-major establishment with another player on your turn only.',
  },

  CHEESE_FACTORY: {
    id: 'CHEESE_FACTORY',
    name: 'Cheese Factory',
    type: CardType.SECONDARY_INDUSTRY,
    icon: '🧀',
    activation: [7],
    cost: 5,
    expansion: Expansion.BASE,
    maxPerPlayer: null,
    effect: { type: EffectType.GET_COINS_PER_CARD, amount: 3, cardType: CardType.PRIMARY_INDUSTRY, icon: '🐄' },
    description: 'Get 3 coins from the bank for each Ranch (🐄) you own on your turn only.',
  },

  FURNITURE_FACTORY: {
    id: 'FURNITURE_FACTORY',
    name: 'Furniture Factory',
    type: CardType.SECONDARY_INDUSTRY,
    icon: '🪑',
    activation: [8],
    cost: 3,
    expansion: Expansion.BASE,
    maxPerPlayer: null,
    effect: { type: EffectType.GET_COINS_PER_CARD, amount: 3, cardIds: ['FOREST', 'MINE'] },
    description: 'Get 3 coins from the bank for each Forest or Mine you own on your turn only.',
  },

  MINE: {
    id: 'MINE',
    name: 'Mine',
    type: CardType.PRIMARY_INDUSTRY,
    icon: '⛏️',
    activation: [9],
    cost: 6,
    expansion: Expansion.BASE,
    maxPerPlayer: null,
    effect: { type: EffectType.GET_COINS, amount: 5 },
    description: 'Get 5 coins from the bank on anyone\'s turn.',
  },

  FAMILY_RESTAURANT: {
    id: 'FAMILY_RESTAURANT',
    name: 'Family Restaurant',
    type: CardType.RESTAURANT,
    icon: '🍽️',
    activation: [9, 10],
    cost: 3,
    expansion: Expansion.BASE,
    maxPerPlayer: null,
    effect: { type: EffectType.TAKE_COINS, amount: 2 },
    description: 'Take 2 coins from the active player.',
    shoppingMallBonus: true,
  },

  APPLE_ORCHARD: {
    id: 'APPLE_ORCHARD',
    name: 'Apple Orchard',
    type: CardType.PRIMARY_INDUSTRY,
    icon: '🍎',
    activation: [10],
    cost: 3,
    expansion: Expansion.BASE,
    maxPerPlayer: null,
    effect: { type: EffectType.GET_COINS, amount: 3 },
    description: 'Get 3 coins from the bank on anyone\'s turn.',
  },

  FARMERS_MARKET: {
    id: 'FARMERS_MARKET',
    name: "Farmer's Market",
    type: CardType.SECONDARY_INDUSTRY,
    icon: '🌽',
    activation: [11, 12],
    cost: 2,
    expansion: Expansion.BASE,
    maxPerPlayer: null,
    effect: { type: EffectType.GET_COINS_PER_CARD, amount: 2, cardIds: ['WHEAT_FIELD', 'APPLE_ORCHARD'] },
    description: 'Get 2 coins from the bank for each Wheat Field or Apple Orchard you own on your turn only.',
  },

  // ═══════════════════════════════════════════════════════════════
  // HARBOR EXPANSION
  // ═══════════════════════════════════════════════════════════════

  SUSHI_BAR: {
    id: 'SUSHI_BAR',
    name: 'Sushi Bar',
    type: CardType.RESTAURANT,
    icon: '🍣',
    activation: [1],
    cost: 2,
    expansion: Expansion.HARBOR,
    maxPerPlayer: null,
    requiresLandmark: 'HARBOR',
    effect: { type: EffectType.TAKE_COINS, amount: 3 },
    description: 'If you have the Harbor, take 3 coins from the active player.',
    shoppingMallBonus: true,
  },

  PIZZA_JOINT: {
    id: 'PIZZA_JOINT',
    name: 'Pizza Joint',
    type: CardType.RESTAURANT,
    icon: '🍕',
    activation: [7],
    cost: 1,
    expansion: Expansion.HARBOR,
    maxPerPlayer: null,
    effect: { type: EffectType.TAKE_COINS, amount: 1 },
    description: 'Take 1 coin from the active player.',
    shoppingMallBonus: true,
  },

  HAMBURGER_STAND: {
    id: 'HAMBURGER_STAND',
    name: 'Hamburger Stand',
    type: CardType.RESTAURANT,
    icon: '🍔',
    activation: [8],
    cost: 1,
    expansion: Expansion.HARBOR,
    maxPerPlayer: null,
    effect: { type: EffectType.TAKE_COINS, amount: 1 },
    description: 'Take 1 coin from the active player.',
    shoppingMallBonus: true,
  },

  MACKEREL_BOAT: {
    id: 'MACKEREL_BOAT',
    name: 'Mackerel Boat',
    type: CardType.PRIMARY_INDUSTRY,
    icon: '🎣',
    activation: [8],
    cost: 2,
    expansion: Expansion.HARBOR,
    maxPerPlayer: null,
    requiresLandmark: 'HARBOR',
    effect: { type: EffectType.GET_COINS_IF_HARBOR, amount: 3 },
    description: 'If you have the Harbor, get 3 coins from the bank on anyone\'s turn.',
  },

  TUNA_BOAT: {
    id: 'TUNA_BOAT',
    name: 'Tuna Boat',
    type: CardType.PRIMARY_INDUSTRY,
    icon: '🐟',
    activation: [12, 13, 14],
    cost: 5,
    expansion: Expansion.HARBOR,
    maxPerPlayer: null,
    requiresLandmark: 'HARBOR',
    effect: { type: EffectType.GET_COINS_IF_HARBOR, amount: 'DICE_SUM' },
    description: 'If you have the Harbor, receive as many coins as the dice total on anyone\'s turn.',
  },

  FLOWER_GARDEN: {
    id: 'FLOWER_GARDEN',
    name: 'Flower Garden',
    type: CardType.PRIMARY_INDUSTRY,
    icon: '💐',
    activation: [4],
    cost: 2,
    expansion: Expansion.HARBOR,
    maxPerPlayer: null,
    effect: { type: EffectType.GET_COINS, amount: 1 },
    description: 'Get 1 coin from the bank on anyone\'s turn.',
  },

  FLOWER_SHOP: {
    id: 'FLOWER_SHOP',
    name: 'Flower Shop',
    type: CardType.SECONDARY_INDUSTRY,
    icon: '🌸',
    activation: [6],
    cost: 1,
    expansion: Expansion.HARBOR,
    maxPerPlayer: null,
    effect: { type: EffectType.GET_COINS_PER_CARD, amount: 1, cardIds: ['FLOWER_GARDEN'] },
    description: 'Get 1 coin for each Flower Garden you own on your turn only.',
    shoppingMallBonus: true,
  },

  FOOD_WAREHOUSE: {
    id: 'FOOD_WAREHOUSE',
    name: 'Food Warehouse',
    type: CardType.SECONDARY_INDUSTRY,
    icon: '🏭',
    activation: [11, 12],
    cost: 2,
    expansion: Expansion.HARBOR,
    maxPerPlayer: null,
    effect: { type: EffectType.GET_COINS_PER_CARD, amount: 2, cardType: CardType.RESTAURANT },
    description: 'Get 2 coins from the bank for each Restaurant (🍽️) establishment you own on your turn only.',
  },

  GENERAL_STORE: {
    id: 'GENERAL_STORE',
    name: 'General Store',
    type: CardType.SECONDARY_INDUSTRY,
    icon: '🏬',
    activation: [2],
    cost: 0,
    expansion: Expansion.HARBOR,
    maxPerPlayer: null,
    effect: { type: EffectType.GET_COINS, amount: 2 },
    description: 'Get 2 coins from the bank on your turn only (if you have fewer than 2 landmarks built).',
    condition: 'FEW_LANDMARKS',
    shoppingMallBonus: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // MILLIONAIRE'S ROW EXPANSION
  // ═══════════════════════════════════════════════════════════════

  LOAN_OFFICE: {
    id: 'LOAN_OFFICE',
    name: 'Loan Office',
    type: CardType.MAJOR_ESTABLISHMENT,
    icon: '🏦',
    activation: [5, 6],
    cost: 0,
    expansion: Expansion.MILLIONAIRES_ROW,
    maxPerPlayer: 1,
    effect: { type: EffectType.TAKE_COINS, amount: -2 }, // negative = you pay
    description: 'On your turn only: take 2 coins from the bank. But if you roll a 5 or 6 on your turn, pay 2 coins to the bank.',
    special: 'LOAN_OFFICE',
  },

  PUBLISHER: {
    id: 'PUBLISHER',
    name: 'Publisher',
    type: CardType.MAJOR_ESTABLISHMENT,
    icon: '📰',
    activation: [7],
    cost: 5,
    expansion: Expansion.MILLIONAIRES_ROW,
    maxPerPlayer: 1,
    effect: { type: EffectType.TAKE_COINS_PER_CARD, cardType: [CardType.RESTAURANT, CardType.SECONDARY_INDUSTRY], amount: 1 },
    description: 'Take 1 coin from each other player for each cup or bread establishment they have on your turn only.',
  },

  TAX_OFFICE: {
    id: 'TAX_OFFICE',
    name: 'Tax Office',
    type: CardType.MAJOR_ESTABLISHMENT,
    icon: '💼',
    activation: [8, 9],
    cost: 4,
    expansion: Expansion.MILLIONAIRES_ROW,
    maxPerPlayer: 1,
    effect: { type: EffectType.TAKE_ALL_COINS, amount: 0, fraction: 0.5 },
    description: "If any player has 10 or more coins on your turn, take half their coins (rounded down).",
    special: 'TAX_OFFICE',
  },

  TECH_STARTUP: {
    id: 'TECH_STARTUP',
    name: 'Tech Startup',
    type: CardType.MAJOR_ESTABLISHMENT,
    icon: '💻',
    activation: [10],
    cost: 1,
    expansion: Expansion.MILLIONAIRES_ROW,
    maxPerPlayer: 1,
    effect: { type: EffectType.GET_COINS, amount: 0 },
    description: 'Invest coins into this card. On your turn, receive the invested amount from each other player.',
    special: 'TECH_STARTUP',
  },

  RENOVATION_COMPANY: {
    id: 'RENOVATION_COMPANY',
    name: 'Renovation Company',
    type: CardType.MAJOR_ESTABLISHMENT,
    icon: '🔨',
    activation: [11],
    cost: 3,
    expansion: Expansion.MILLIONAIRES_ROW,
    maxPerPlayer: 1,
    effect: { type: EffectType.GET_COINS_PER_LANDMARK, amount: 1 },
    description: 'On your turn only: choose a landmark. All players with that landmark pay you 3 coins.',
    special: 'RENOVATION_COMPANY',
  },

};

// ─── Starting Hand ─────────────────────────────────────────────────────────────

export const STARTING_HAND = {
  [Expansion.BASE]: {
    cards: { WHEAT_FIELD: 1, BAKERY: 1 },
    coins: 3,
    landmarks: ['TRAIN_STATION', 'SHOPPING_MALL', 'AMUSEMENT_PARK', 'RADIO_TOWER'],
  },
  [Expansion.HARBOR]: {
    cards: { WHEAT_FIELD: 1, BAKERY: 1 },
    coins: 3,
    landmarks: ['HARBOR', 'CITY_HALL_HARBOR', 'TRAIN_STATION', 'SHOPPING_MALL', 'AMUSEMENT_PARK', 'RADIO_TOWER', 'AIRPORT'],
  },
};

// ─── Market Supply Counts ──────────────────────────────────────────────────────
// How many of each card go into the shared supply

export const SUPPLY_COUNTS = {
  // Base
  WHEAT_FIELD: 6,
  RANCH: 6,
  BAKERY: 6,
  CAFE: 6,
  CONVENIENCE_STORE: 6,
  FOREST: 6,
  STADIUM: 4,
  TV_STATION: 4,
  BUSINESS_CENTER: 4,
  CHEESE_FACTORY: 6,
  FURNITURE_FACTORY: 6,
  MINE: 6,
  FAMILY_RESTAURANT: 6,
  APPLE_ORCHARD: 6,
  FARMERS_MARKET: 6,
  // Harbor
  SUSHI_BAR: 6,
  PIZZA_JOINT: 6,
  HAMBURGER_STAND: 6,
  MACKEREL_BOAT: 6,
  TUNA_BOAT: 6,
  FLOWER_GARDEN: 6,
  FLOWER_SHOP: 6,
  FOOD_WAREHOUSE: 6,
  GENERAL_STORE: 6,
  // Millionaire's Row
  LOAN_OFFICE: 4,
  PUBLISHER: 4,
  TAX_OFFICE: 4,
  TECH_STARTUP: 4,
  RENOVATION_COMPANY: 4,
};
