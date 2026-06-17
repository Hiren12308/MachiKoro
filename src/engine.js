class MachiKoroGame {
  constructor(playerNames) {
    this.players = playerNames.map((name, i) => ({
      id: i, name,
      coins: 0,  // players start with 0 coins
      hand: { WHEAT_FIELD: 1, BAKERY: 1 },
      landmarks: {},
      techStartupInvestment: 0,
    }));

    // Give City Hall to all players at start (it's free and pre-built)
    for (const p of this.players) {
      p.landmarks['CITY_HALL'] = true;
    }

    this._buildDeck();
    this.marketLow    = [];
    this.marketHigh   = [];
    this.marketPurple = [];
    this._fillMarket();

    this.currentPlayerIndex = 0;
    this.phase = 'ROLL';
    this.diceValues = [];
    this.diceSum = 0;
    this.log = [];
    this.winner = null;
    this.pendingEffect = null;
    this.hasRolledThisTurn = false;
    this.hasRerolledThisTurn = false;
    this.extraTurn = false;
    this.didBuyThisTurn = false;
    this.harborBonusAvailable = false;
    this.harborBonusUsed = false;
  }

  // ─── DECK & MARKET ─────────────────────────────────────────────────────────
  _buildDeck() {
    this.deck = [];
    for (const [id, count] of Object.entries(SUPPLY_COUNTS))
      for (let i = 0; i < count; i++) this.deck.push(id);
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  _bin(cardId) {
    const card = CARDS[cardId];
    if (!card) return 'low';
    if (card.type === CardType.MAJOR_ESTABLISHMENT) return 'purple';
    if (card.activation.some(n => n >= 7)) return 'high';
    return 'low';
  }

  _drawForBin(bin) {
    const skipped = [];
    let found = null;
    while (this.deck.length > 0) {
      const id = this.deck.shift();
      if (this._bin(id) === bin) { found = id; break; }
      skipped.push(id);
    }
    for (const id of skipped) this.deck.push(id);
    return found;
  }

  _fillRow(row, bin, maxSlots) {
    while (row.length < maxSlots) {
      const id = this._drawForBin(bin);
      if (id === null) return;
      const existing = row.find(s => s.id === id);
      if (existing) existing.count++;
      else row.push({ id, count: 1 });
    }
    const skipped = [];
    while (this.deck.length > 0) {
      const id = this.deck.shift();
      if (this._bin(id) !== bin) { skipped.push(id); continue; }
      const existing = row.find(s => s.id === id);
      if (existing) { existing.count++; }
      else { this.deck.unshift(id); break; }
    }
    this.deck.unshift(...skipped);
  }

  _fillMarket() {
    this._fillRow(this.marketLow,    'low',    5);
    this._fillRow(this.marketHigh,   'high',   5);
    this._fillRow(this.marketPurple, 'purple', 4);
  }

  // ─── HELPERS ───────────────────────────────────────────────────────────────
  get currentPlayer() { return this.players[this.currentPlayerIndex]; }
  hasLandmark(p, id) { return !!p.landmarks[id]; }
  anyPlayerHasLandmark(id) { return this.players.some(p => p.landmarks[id]); }
  builtLandmarkCount(p) { return ALL_LANDMARK_IDS.filter(id => p.landmarks[id]).length; }
  playerCardCountByType(p, type) {
    return Object.entries(p.hand).reduce((s,[id,q]) => CARDS[id]?.type===type ? s+q : s, 0);
  }
  playerCardCountByTypes(p, types) {
    return Object.entries(p.hand).reduce((s,[id,q]) => types.includes(CARDS[id]?.type) ? s+q : s, 0);
  }
  addLog(msg) { this.log.unshift(msg); if (this.log.length > 80) this.log.pop(); }
  transferCoins(from, to, amt) { const a=Math.min(from.coins,amt); from.coins-=a; to.coins+=a; return a; }
  takeFromBank(p, amt) { p.coins += amt; }
  payToBank(p, amt) { const a=Math.min(p.coins,amt); p.coins-=a; return a; }

  // ─── ROLL ──────────────────────────────────────────────────────────────────
  rollDice(numDice) {
    this.diceValues = Array.from({length:numDice}, () => Math.ceil(Math.random()*6));
    this.diceSum = this.diceValues.reduce((a,b)=>a+b, 0);
    this.hasRolledThisTurn = true;
    this.addLog(`${this.currentPlayer.name} rolled [${this.diceValues.join(', ')}] = ${this.diceSum}`);
    this._checkHarborBonus();
  }

  _checkHarborBonus() {
    const p = this.currentPlayer;
    if (this.hasLandmark(p,'HARBOR') && this.diceSum >= 10 && !this.harborBonusUsed) {
      this.harborBonusAvailable = true; this.phase = 'HARBOR_BONUS';
    } else { this.processIncome(); }
  }

  applyHarborBonus(use) {
    if (use) { this.diceSum += 2; this.addLog(`${this.currentPlayer.name} used Harbor +2 → ${this.diceSum}`); }
    this.harborBonusUsed = true;
    this.processIncome();
  }

  // ─── INCOME ────────────────────────────────────────────────────────────────
  processIncome() {
    this.phase = 'INCOME';
    const roll = this.diceSum, active = this.currentPlayer;

    // RED — restaurants activate on active player's roll; OTHER players collect
    for (let i = 0; i < this.players.length; i++) {
      if (i === this.currentPlayerIndex) continue;
      const owner = this.players[i];
      for (const [cardId, qty] of Object.entries(owner.hand)) {
        const card = CARDS[cardId];
        if (!card || card.type !== CardType.RESTAURANT) continue;
        if (!card.activation.includes(roll)) continue;
        if (card.requiresLandmark && !this.hasLandmark(owner, card.requiresLandmark)) continue;

        if (card.special === 'MEMBERS_ONLY_CLUB') {
          if (this.builtLandmarkCount(active) === 0) {
            const took = this.transferCoins(active, owner, active.coins);
            this.addLog(`${owner.name}'s 🎩 Member's Only Club: took all ${took} coins from ${active.name}`);
          }
          continue;
        }

        let earn = card.effect.amount;
        if (card.shoppingMallBonus && this.hasLandmark(owner,'SHOPPING_MALL')) earn++;
        earn *= qty;
        const took = this.transferCoins(active, owner, earn);
        this.addLog(`${owner.name}'s ${card.icon} ${card.name} ×${qty}: took ${took} from ${active.name}`);
      }
    }

    // BLUE — primary industry, all players collect from bank
    for (const player of this.players) {
      for (const [cardId, qty] of Object.entries(player.hand)) {
        const card = CARDS[cardId];
        if (!card || card.type !== CardType.PRIMARY_INDUSTRY) continue;
        if (!card.activation.includes(roll)) continue;
        let earn = 0;
        if (card.effect.type === EffectType.GET_COINS) {
          earn = card.effect.amount * qty;
        } else if (card.effect.type === EffectType.GET_COINS_IF_HARBOR) {
          if (!this.hasLandmark(player,'HARBOR')) continue;
          earn = (card.effect.amount === 'DICE_SUM' ? this.diceSum : card.effect.amount) * qty;
        }
        if (earn > 0) { this.takeFromBank(player, earn); this.addLog(`${player.name}'s ${card.icon} ${card.name} ×${qty}: +${earn} from bank`); }
      }
    }

    // GREEN — secondary industry, active player only
    for (const [cardId, qty] of Object.entries(active.hand)) {
      const card = CARDS[cardId];
      if (!card || card.type !== CardType.SECONDARY_INDUSTRY) continue;
      if (!card.activation.includes(roll)) continue;
      if (card.condition === 'FEW_LANDMARKS' && this.builtLandmarkCount(active) >= 2) continue;

      if (card.special === 'LOAN_OFFICE') {
        // Loan Office: take 2 coins from bank (it's a debt — you'll pay it back via game mechanics)
        this.takeFromBank(active, 2);
        this.addLog(`${active.name}'s 🏦 Loan Office: took 2 coins from bank (loan!)`);
        continue;
      }
      if (card.special === 'SODA_ALL_PLAYERS') {
        const totalRest = this.players.reduce((s,p) => s + this.playerCardCountByType(p, CardType.RESTAURANT), 0);
        const earn = totalRest * qty;
        if (earn > 0) { this.takeFromBank(active, earn); this.addLog(`${active.name}'s 🥤 Soda Bottling Plant: +${earn} (${totalRest} restaurants total)`); }
        continue;
      }

      let earn = 0;
      if (card.effect.type === EffectType.GET_COINS) {
        earn = card.effect.amount;
        if (card.shoppingMallBonus && this.hasLandmark(active,'SHOPPING_MALL')) earn++;
        earn *= qty;
      } else if (card.effect.type === EffectType.GET_COINS_PER_CARD) {
        const { cardIds, cardType } = card.effect;
        const counted = cardIds
          ? cardIds.reduce((s,id) => s+(active.hand[id]||0), 0)
          : this.playerCardCountByType(active, cardType);
        earn = card.effect.amount * counted * qty;
        if (card.shoppingMallBonus && this.hasLandmark(active,'SHOPPING_MALL')) earn += qty;
      }
      if (earn > 0) { this.takeFromBank(active, earn); this.addLog(`${active.name}'s ${card.icon} ${card.name} ×${qty}: +${earn} from bank`); }
    }

    // PURPLE — major establishments, active player only
    for (const [cardId] of Object.entries(active.hand).filter(([id]) =>
        CARDS[id]?.type === CardType.MAJOR_ESTABLISHMENT && CARDS[id].activation.includes(roll))) {
      const card = CARDS[cardId];

      if (card.effect.type === EffectType.STEAL_COINS) {
        let total = 0;
        for (const o of this.players) { if (o.id!==active.id) total += this.transferCoins(o,active,card.effect.amount); }
        this.addLog(`${active.name}'s 🏟️ Stadium: took ${total} total`);
      } else if (card.special === 'TAX_OFFICE') {
        let total = 0;
        for (const o of this.players) {
          if (o.id===active.id || o.coins<10) continue;
          const got = this.transferCoins(o,active,Math.floor(o.coins/2));
          total += got; this.addLog(`${active.name}'s 💼 Tax Office: took ${got} from ${o.name}`);
        }
        if (!total) this.addLog(`${active.name}'s 💼 Tax Office: no targets with 10+ coins`);
      } else if (card.effect.type === EffectType.TAKE_COINS_PER_CARD) {
        let total = 0;
        for (const o of this.players) {
          if (o.id===active.id) continue;
          const count = this.playerCardCountByTypes(o, card.effect.cardType);
          if (count) total += this.transferCoins(o,active,count*card.effect.amount);
        }
        this.addLog(`${active.name}'s 📰 Publisher: collected ${total}`);
      } else if (card.special === 'TECH_STARTUP') {
        const inv = active.techStartupInvestment; let total = 0;
        if (inv > 0) {
          for (const o of this.players) { if (o.id!==active.id) total += this.transferCoins(o,active,inv); }
          this.addLog(`${active.name}'s 💻 Tech Startup: collected ${total} (${inv}/player)`);
        } else { this.addLog(`${active.name}'s 💻 Tech Startup: no investment yet`); }
      } else if (card.special === 'PARK') {
        const total = this.players.reduce((s,p) => s+p.coins, 0);
        const share = Math.floor(total / this.players.length);
        const remainder = total - share * this.players.length;
        for (const p of this.players) p.coins = share;
        this.addLog(`${active.name}'s 🌳 Park: redistributed coins (${share} each, ${remainder} to bank)`);
      } else if (card.special === 'INTERNATIONAL_EXHIBIT_HALL') {
        const myLm = this.builtLandmarkCount(active);
        const maxLm = Math.max(...this.players.map(p => this.builtLandmarkCount(p)));
        if (myLm >= maxLm) {
          const pool = this.players.filter(p=>p.id!==active.id).reduce((s,p)=>{const t=p.coins;p.coins=0;return s+t;},0);
          active.coins += pool;
          this.addLog(`${active.name}'s 🏛️ Intl. Exhibit Hall: took ${pool} coins (most landmarks)`);
        } else {
          this.addLog(`${active.name}'s 🏛️ Intl. Exhibit Hall: no effect (not leading in landmarks)`);
        }
      } else if (card.special === 'RENOVATION_COMPANY') {
        this.phase = 'RENOVATION_TARGET'; this.pendingEffect = { card }; return;
      } else if (card.effect.type === EffectType.TAKE_ALL_COINS && !card.special) {
        // TV Station
        this.phase = 'TV_TARGET'; this.pendingEffect = { card }; return;
      } else if (card.effect.type === EffectType.SWAP_ESTABLISHMENT) {
        this.phase = 'BC_GIVE'; this.pendingEffect = { card }; return;
      }
    }

    this._checkCityHall();
  }

  resolveTVStation(targetPlayerId) {
    const active = this.currentPlayer, target = this.players[targetPlayerId];
    const took = this.transferCoins(target, active, 5);
    this.addLog(`${active.name}'s 📺 TV Station: took ${took} from ${target.name}`);
    this._checkCityHall();
  }

  resolveRenovationCompany(landmarkId) {
    const active = this.currentPlayer; let total = 0;
    for (const o of this.players) {
      if (o.id !== active.id && this.hasLandmark(o, landmarkId))
        total += this.transferCoins(o, active, 3);
    }
    this.addLog(`${active.name}'s 🔨 Renovation Co.: collected ${total} (${LANDMARKS[landmarkId]?.name})`);
    this._checkCityHall();
  }

  resolveBusinessCenter(giveCardId, takeFromPlayerId, takeCardId) {
    const active = this.currentPlayer, other = this.players[takeFromPlayerId];
    active.hand[giveCardId]--; if (!active.hand[giveCardId]) delete active.hand[giveCardId];
    other.hand[giveCardId] = (other.hand[giveCardId]||0) + 1;
    other.hand[takeCardId]--; if (!other.hand[takeCardId]) delete other.hand[takeCardId];
    active.hand[takeCardId] = (active.hand[takeCardId]||0) + 1;
    this.addLog(`${active.name}'s 🏢 BC: gave ${CARDS[giveCardId]?.name}, got ${CARDS[takeCardId]?.name} from ${other.name}`);
    this._checkCityHall();
  }

  _checkCityHall() {
    const p = this.currentPlayer;
    if (p.coins === 0 && this.hasLandmark(p,'CITY_HALL')) {
      this.takeFromBank(p, 1); this.addLog(`${p.name}'s 🏛️ City Hall: +1 from bank`);
    }
    this.phase = 'BUY';
    if (!this.canAffordAnything(p)) {
      this.addLog(`${p.name} can't afford anything — turn ends automatically`);
      this.endTurn();
    }
  }

  canAffordAnything(p) {
    const coins = p.coins;
    for (const row of [this.marketLow, this.marketHigh, this.marketPurple]) {
      for (const slot of row) {
        const card = CARDS[slot.id];
        if (!card) continue;
        if (card.maxPerPlayer === 1 && (p.hand[slot.id]||0) >= 1) continue;
        if (slot === this.marketHigh && !this.hasLandmark(p,'TRAIN_STATION')) continue;
        if (coins >= card.cost) return true;
      }
    }
    for (const lmId of ALL_LANDMARK_IDS) {
      const lm = LANDMARKS[lmId];
      if (!lm || p.landmarks[lmId]) continue;
      if (coins >= lm.cost) return true;
    }
    return false;
  }

  // ─── BUY ───────────────────────────────────────────────────────────────────
  buyCard(cardId, slotType) {
    if (this.didBuyThisTurn) return false;
    const p = this.currentPlayer, card = CARDS[cardId];
    if (!card || p.coins < card.cost) return false;
    if (card.maxPerPlayer === 1 && (p.hand[cardId]||0) >= 1) return false;
    if (slotType === 'high' && !this.hasLandmark(p,'TRAIN_STATION')) return false;

    const row = slotType==='low' ? this.marketLow : slotType==='high' ? this.marketHigh : this.marketPurple;
    const slot = row.find(s => s.id === cardId);
    if (!slot) return false;

    slot.count--;
    if (slot.count <= 0) {
      row.splice(row.indexOf(slot), 1);
      this._fillRow(row, slotType, slotType==='purple' ? 4 : 5);
    }

    p.coins -= card.cost;
    p.hand[cardId] = (p.hand[cardId]||0) + 1;
    this.didBuyThisTurn = true;
    this.addLog(`${p.name} bought ${card.icon} ${card.name} for ${card.cost} coin(s)`);
    this.checkWin();
    return true;
  }

  buyLandmark(landmarkId) {
    if (this.didBuyThisTurn) return false;
    const p = this.currentPlayer, lm = LANDMARKS[landmarkId];
    if (!lm || p.coins < lm.cost || this.hasLandmark(p, landmarkId)) return false;
    p.coins -= lm.cost;
    p.landmarks[landmarkId] = true;
    this.didBuyThisTurn = true;
    this.addLog(`${p.name} built 🏛️ ${lm.name} for ${lm.cost} coin(s)`);
    this.checkWin();
    return true;
  }

  investInTechStartup(amount) {
    const p = this.currentPlayer;
    if (amount > p.coins) return false;
    p.coins -= amount; p.techStartupInvestment += amount;
    this.addLog(`${p.name} invested ${amount} into 💻 Tech Startup (total: ${p.techStartupInvestment})`);
    return true;
  }

  skipBuy() {
    const p = this.currentPlayer;
    if (!this.didBuyThisTurn && this.canAffordAnything(p)) return false;
    if (!this.didBuyThisTurn && this.hasLandmark(p,'AIRPORT')) {
      this.takeFromBank(p, 10); this.addLog(`${p.name} couldn't buy anything: ✈️ Airport gave 10 coins!`);
    }
    this.endTurn();
    return true;
  }

  endTurn() {
    const doubles = this.diceValues.length===2 && this.diceValues[0]===this.diceValues[1];
    if (doubles && this.hasLandmark(this.currentPlayer,'AMUSEMENT_PARK') && !this.extraTurn) {
      this.extraTurn = true;
      this.addLog(`${this.currentPlayer.name} rolled doubles + 🎢 Amusement Park: extra turn!`);
    } else {
      this.extraTurn = false;
      this.currentPlayerIndex = (this.currentPlayerIndex+1) % this.players.length;
    }
    this.phase='ROLL'; this.diceValues=[]; this.diceSum=0;
    this.hasRolledThisTurn=false; this.hasRerolledThisTurn=false;
    this.didBuyThisTurn=false; this.harborBonusAvailable=false;
    this.harborBonusUsed=false; this.pendingEffect=null;
  }

  reroll() {
    if (this.hasRerolledThisTurn || !this.hasLandmark(this.currentPlayer,'RADIO_TOWER')) return false;
    this.hasRerolledThisTurn = true;
    this.harborBonusUsed = false;
    this.rollDice(this.diceValues.length);
    return true;
  }

  checkWin() {
    for (const player of this.players) {
      if (ALL_LANDMARK_IDS.every(id => player.landmarks[id])) {
        this.winner = player; this.phase = 'GAME_OVER';
        this.addLog(`🎉 ${player.name} built all landmarks and WINS!`);
      }
    }
  }
}

// Node.js export
if (typeof module !== 'undefined') {
  module.exports = { MachiKoroGame };
}
