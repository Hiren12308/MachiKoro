import { useState } from 'react';
import { socket } from '../socket';
import { CARDS, LANDMARKS, CardType } from '../constants.js';

const TYPE_COLOR = {
  [CardType.PRIMARY_INDUSTRY]: '#2196f3',
  [CardType.SECONDARY_INDUSTRY]: '#4caf50',
  [CardType.RESTAURANT]: '#f44336',
  [CardType.MAJOR_ESTABLISHMENT]: '#9c27b0',
};

export default function GameBoard({ state, myId }) {
  const [pendingTV, setPendingTV] = useState(null);
  const [pendingBC, setPendingBC] = useState({ targetId: null, yourCard: null, theirCard: null });

  const me = state.players.find(p => p.id === myId);
  const activePlayer = state.players[state.turnIndex];
  const isMyTurn = activePlayer?.id === myId;
  const phase = state.phase;

  function roll(diceCount) { socket.emit('roll_dice', { diceCount }); }
  function reroll() { socket.emit('reroll_dice'); }
  function harborDecision(useBonus) { socket.emit('harbor_decision', { useBonus }); }
  function buy(cardId) { socket.emit('buy_card', { cardId }); }
  function buyLandmark(id) { socket.emit('buy_landmark', { landmarkId: id }); }
  function passEndTurn() { socket.emit('end_turn'); }

  function resolveTV(targetPlayerId) {
    socket.emit('resolve_action', { targetPlayerId });
    setPendingTV(null);
  }

  function resolveBC() {
    socket.emit('resolve_action', {
      targetPlayerId: pendingBC.targetId,
      yourCardId: pendingBC.yourCard,
      theirCardId: pendingBC.theirCard,
    });
    setPendingBC({ targetId: null, yourCard: null, theirCard: null });
  }

  const canReroll = isMyTurn && !state.turn.hasRerolled
    && me?.landmarks?.RADIO_TOWER && phase === 'ROLLING' && state.turn.diceRoll !== null;

  return (
    <div style={styles.layout}>

      {/* ── Left: Players ── */}
      <aside style={styles.sidebar}>
        <h3 style={styles.sideTitle}>Players</h3>
        {state.players.map((p, i) => (
          <PlayerPanel key={p.id} player={p} isActive={i === state.turnIndex} isMe={p.id === myId} />
        ))}
        <div style={styles.roundBadge}>Round {state.round}</div>
      </aside>

      {/* ── Center: Main ── */}
      <main style={styles.main}>

        {/* Turn banner */}
        <div style={{ ...styles.banner, background: isMyTurn ? '#4caf5020' : '#ffffff08', borderColor: isMyTurn ? '#4caf50' : '#ffffff20' }}>
          {isMyTurn ? `🎯 Your turn — ${phaseLabel(phase)}` : `⏳ ${activePlayer?.name}'s turn`}
          {state.turn.diceRoll && (
            <span style={styles.diceResult}>
              🎲 [{state.turn.diceRoll.join(' + ')}] = <strong>{state.turn.diceSum}</strong>
              {state.turn.isDoubles && ' 🎉 Doubles!'}
            </span>
          )}
        </div>

        {/* Action area */}
        {isMyTurn && (
          <div style={styles.actionArea}>

            {/* ROLLING */}
            {(phase === 'ROLLING') && (
              <div style={styles.diceArea}>
                <button className="btn-primary" style={styles.diceBtn} onClick={() => roll(1)}>🎲 Roll 1 Die</button>
                {me?.landmarks?.TRAIN_STATION && (
                  <button className="btn-secondary" style={styles.diceBtn} onClick={() => roll(2)}>🎲🎲 Roll 2 Dice</button>
                )}
                {canReroll && (
                  <button className="btn-secondary" onClick={reroll} style={{ fontSize: 13 }}>📻 Reroll (Radio Tower)</button>
                )}
              </div>
            )}

            {/* HARBOR DECISION */}
            {phase === 'HARBOR_DECISION' && (
              <div style={styles.decisionArea}>
                <p style={{ marginBottom: 12 }}>⚓ Harbor: Add +2 to your roll of <strong>{state.turn.diceSum}</strong>?</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn-primary" onClick={() => harborDecision(true)}>Yes (+2 = {state.turn.diceSum + 2})</button>
                  <button className="btn-secondary" onClick={() => harborDecision(false)}>No, keep {state.turn.diceSum}</button>
                </div>
              </div>
            )}

            {/* PENDING ACTION: TV Station */}
            {phase === 'PENDING_ACTION' && state.turn.pendingAction === 'TV_STATION_CHOOSE_PLAYER' && (
              <div style={styles.decisionArea}>
                <p style={{ marginBottom: 12 }}>📺 TV Station: Choose a player to take 5 coins from</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {state.players.filter(p => p.id !== myId).map(p => (
                    <button key={p.id} className="btn-primary" onClick={() => resolveTV(p.id)}>
                      {p.name} ({p.coins}🪙)
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PENDING ACTION: Business Center */}
            {phase === 'PENDING_ACTION' && state.turn.pendingAction === 'BUSINESS_CENTER_CHOOSE' && (
              <div style={styles.decisionArea}>
                <p style={{ marginBottom: 12 }}>🏢 Business Center: Select a card to give and a card to receive</p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                  {state.players.filter(p => p.id !== myId).map(p => (
                    <button key={p.id} className={pendingBC.targetId === p.id ? 'btn-primary' : 'btn-secondary'}
                      onClick={() => setPendingBC(b => ({ ...b, targetId: p.id }))}>
                      {p.name}
                    </button>
                  ))}
                </div>
                {pendingBC.targetId && (
                  <>
                    <p style={{ fontSize: 13, marginBottom: 6 }}>Your card to give:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                      {Object.entries(me?.establishments || {}).filter(([, c]) => c > 0 && CARDS[_]?.type !== CardType.MAJOR_ESTABLISHMENT).map(([id, count]) => (
                        <button key={id} className={pendingBC.yourCard === id ? 'btn-primary' : 'btn-secondary'} style={{ fontSize: 12 }}
                          onClick={() => setPendingBC(b => ({ ...b, yourCard: id }))}>
                          {CARDS[id]?.name} ×{count}
                        </button>
                      ))}
                    </div>
                    <p style={{ fontSize: 13, marginBottom: 6 }}>Their card to take:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                      {Object.entries(state.players.find(p => p.id === pendingBC.targetId)?.establishments || {})
                        .filter(([id, c]) => c > 0 && CARDS[id]?.type !== CardType.MAJOR_ESTABLISHMENT).map(([id, count]) => (
                        <button key={id} className={pendingBC.theirCard === id ? 'btn-primary' : 'btn-secondary'} style={{ fontSize: 12 }}
                          onClick={() => setPendingBC(b => ({ ...b, theirCard: id }))}>
                          {CARDS[id]?.name} ×{count}
                        </button>
                      ))}
                    </div>
                    <button className="btn-success" disabled={!pendingBC.yourCard || !pendingBC.theirCard} onClick={resolveBC}>
                      Confirm Swap
                    </button>
                  </>
                )}
              </div>
            )}

            {/* BUYING */}
            {phase === 'BUYING' && (
              <button className="btn-secondary" onClick={passEndTurn} style={{ alignSelf: 'flex-start' }}>
                Pass / End Turn
              </button>
            )}
          </div>
        )}

        {/* Market */}
        {(phase === 'BUYING' || phase === 'ROLLING') && (
          <Market supply={state.supply} playerCoins={me?.coins ?? 0} isMyTurn={isMyTurn && phase === 'BUYING'}
            onBuy={buy} playerEstablishments={me?.establishments ?? {}} />
        )}

        {/* My Landmarks */}
        <LandmarkRow player={me} isMyTurn={isMyTurn && phase === 'BUYING'} onBuy={buyLandmark} />

        {/* Action Log */}
        <ActionLog log={state.log} />
      </main>

    </div>
  );
}

// ── Player Panel ──────────────────────────────────────────────────────────────

function PlayerPanel({ player, isActive, isMe }) {
  const builtCount = Object.values(player.landmarks).filter(Boolean).length;
  const totalCount = Object.keys(player.landmarks).length;
  return (
    <div style={{ ...styles.playerCard, borderColor: isActive ? '#e94560' : 'transparent' }}>
      <div style={styles.playerHeader}>
        <span style={{ fontWeight: 700 }}>{isMe ? '⭐ ' : ''}{player.name}</span>
        <span style={styles.coins}>🪙 {player.coins}</span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
        🏛️ {builtCount}/{totalCount} landmarks
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
        {Object.entries(player.establishments).filter(([, c]) => c > 0).map(([id, c]) =>
          `${CARDS[id]?.icon ?? '?'} ×${c}`
        ).join('  ')}
      </div>
    </div>
  );
}

// ── Market ────────────────────────────────────────────────────────────────────

function Market({ supply, playerCoins, isMyTurn, onBuy, playerEstablishments }) {
  const availableCards = Object.entries(supply).filter(([, count]) => count > 0);

  return (
    <div style={styles.market}>
      <h3 style={styles.sideTitle}>Market</h3>
      <div style={styles.cardGrid}>
        {availableCards.map(([cardId, count]) => {
          const card = CARDS[cardId];
          if (!card) return null;
          const canBuy = isMyTurn && playerCoins >= card.cost
            && !(card.maxPerPlayer === 1 && (playerEstablishments[cardId] ?? 0) >= 1);
          return (
            <div key={cardId} style={{ ...styles.cardTile, borderColor: TYPE_COLOR[card.type] + '60' }}>
              <div style={{ fontSize: 20 }}>{card.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{card.name}</div>
              <div style={{ fontSize: 11, color: TYPE_COLOR[card.type] }}>{card.activation.join(', ')}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.3 }}>{card.description}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                <span style={{ fontSize: 12 }}>🪙 {card.cost}  ·  ×{count} left</span>
                {isMyTurn && (
                  <button className="btn-sm btn-primary" disabled={!canBuy} onClick={() => onBuy(cardId)}>Buy</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Landmarks ─────────────────────────────────────────────────────────────────

function LandmarkRow({ player, isMyTurn, onBuy }) {
  if (!player) return null;
  return (
    <div style={styles.landmarks}>
      <h3 style={styles.sideTitle}>My Landmarks</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {Object.entries(player.landmarks).map(([id, built]) => {
          const lm = LANDMARKS[id];
          if (!lm) return null;
          const canBuy = isMyTurn && !built && player.coins >= lm.cost;
          return (
            <div key={id} style={{ ...styles.landmarkTile, opacity: built ? 1 : 0.5, borderColor: built ? '#f5a623' : '#ffffff20' }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{built ? '✅ ' : '🔒 '}{lm.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{lm.description}</div>
              {!built && <div style={{ fontSize: 12, marginTop: 4 }}>🪙 {lm.cost}</div>}
              {isMyTurn && !built && (
                <button className="btn-sm btn-primary" disabled={!canBuy} style={{ marginTop: 6 }} onClick={() => onBuy(id)}>
                  Build
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Action Log ────────────────────────────────────────────────────────────────

function ActionLog({ log }) {
  const recent = [...log].reverse().slice(0, 20);
  return (
    <div style={styles.logBox}>
      <h3 style={styles.sideTitle}>Log</h3>
      <div style={styles.logScroll}>
        {recent.map((entry, i) => (
          <div key={i} style={{ fontSize: 13, color: i === 0 ? 'var(--text)' : 'var(--text-muted)', padding: '2px 0' }}>
            {entry.message}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function phaseLabel(phase) {
  return {
    ROLLING: 'Roll your dice',
    HARBOR_DECISION: 'Harbor bonus?',
    INCOME: 'Resolving income…',
    BUYING: 'Buy a card or pass',
    PENDING_ACTION: 'Choose a target',
    GAME_OVER: 'Game over!',
  }[phase] ?? phase;
}

const styles = {
  layout: { display: 'flex', gap: 16, padding: 16, minHeight: '100vh', maxWidth: 1400, margin: '0 auto' },
  sidebar: { width: 220, flexShrink: 0 },
  main: { flex: 1, display: 'flex', flexDirection: 'column', gap: 14 },
  sideTitle: { fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  playerCard: { background: 'var(--surface)', borderRadius: 8, padding: '10px 12px', marginBottom: 8, border: '2px solid transparent', transition: 'border-color 0.2s' },
  playerHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  coins: { fontWeight: 700, color: 'var(--accent2)' },
  roundBadge: { textAlign: 'center', padding: '6px 0', fontSize: 13, color: 'var(--text-muted)', marginTop: 8 },
  banner: { borderRadius: 8, padding: '12px 16px', border: '1px solid', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  diceResult: { fontSize: 15, color: 'var(--accent2)' },
  actionArea: { background: 'var(--surface)', borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 },
  diceArea: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  diceBtn: { fontSize: 16, padding: '10px 20px' },
  decisionArea: { display: 'flex', flexDirection: 'column' },
  market: { background: 'var(--surface)', borderRadius: 8, padding: 16 },
  cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 10, marginTop: 8 },
  cardTile: { background: 'var(--surface2)', borderRadius: 6, padding: 10, border: '1px solid', display: 'flex', flexDirection: 'column' },
  landmarks: { background: 'var(--surface)', borderRadius: 8, padding: 16 },
  landmarkTile: { background: 'var(--surface2)', borderRadius: 6, padding: 10, border: '1px solid', minWidth: 160, maxWidth: 220 },
  logBox: { background: 'var(--surface)', borderRadius: 8, padding: 16 },
  logScroll: { maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column' },
};
