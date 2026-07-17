import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const inkColors = [
  { name: 'RED', hex: '#e8735f' },
  { name: 'GREEN', hex: '#4fb88a' },
  { name: 'PURPLE', hex: '#9b8cf2' },
  { name: 'AMBER', hex: '#d9a441' }
];

export default function Warmup({ onGoToDocket }) {
  const [activeGame, setActiveGame] = useState('reaction');
  const [attempts, setAttempts] = useState([]);
  const [bestReaction, setBestReaction] = useState(null);

  // Helper to log attempts
  const logAttempt = (label, value, unit, isBest) => {
    setAttempts((prev) => [
      ...prev,
      { label, value, unit, isBest, id: Date.now() }
    ]);
  };

  // --- REACTION GAME ---
  const [reactionState, setReactionState] = useState('idle'); // idle | waiting | go | early | result
  const [reactionMs, setReactionMs] = useState(null);
  const rTimer = useRef(null);
  const rStart = useRef(0);

  const handleReactionClick = () => {
    if (reactionState === 'idle' || reactionState === 'result' || reactionState === 'early') {
      setReactionState('waiting');
      const delay = 1200 + Math.random() * 2200;
      rTimer.current = setTimeout(() => {
        setReactionState('go');
        rStart.current = performance.now();
      }, delay);
    } else if (reactionState === 'waiting') {
      clearTimeout(rTimer.current);
      setReactionState('early');
    } else if (reactionState === 'go') {
      const rt = Math.round(performance.now() - rStart.current);
      setReactionMs(rt);
      const isBest = bestReaction === null || rt < bestReaction;
      if (isBest) setBestReaction(rt);
      logAttempt('Reaction attempt', rt, 'ms', isBest);
      setReactionState('result');
    }
  };

  useEffect(() => {
    return () => clearTimeout(rTimer.current);
  }, []);

  // --- SEQUENCE TAP GAME ---
  const [seqNext, setSeqNext] = useState(1);
  const [seqGrid, setSeqGrid] = useState([]);
  const [seqTimerText, setSeqTimerText] = useState('Click 1 to start');
  const [completedTiles, setCompletedTiles] = useState([]);
  const seqStart = useRef(0);

  const resetSequence = () => {
    setSeqNext(1);
    setCompletedTiles([]);
    setSeqTimerText('Click 1 to start');
    const shuffled = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
    setSeqGrid(shuffled);
  };

  const handleTileClick = (num) => {
    if (num !== seqNext) return;
    if (seqNext === 1) seqStart.current = performance.now();

    setCompletedTiles((prev) => [...prev, num]);
    const nextNum = seqNext + 1;

    if (nextNum > 9) {
      const elapsed = ((performance.now() - seqStart.current) / 1000).toFixed(2);
      setSeqTimerText(`Done in ${elapsed}s — click a tile to reset`);
      logAttempt('Sequence tap', elapsed, 's', false);
      setSeqNext(10); // temporary state to hold board reset
      setTimeout(resetSequence, 1400);
    } else {
      setSeqNext(nextNum);
      setSeqTimerText(`Next: ${nextNum}`);
    }
  };

  useEffect(() => {
    if (activeGame === 'sequence') {
      resetSequence();
    }
  }, [activeGame]);

  // --- FOCUS MATCH GAME (STROOP EFFECT) ---
  const [focusWord, setFocusWord] = useState('');
  const [focusInkColor, setFocusInkColor] = useState(inkColors[0]);
  const [focusRound, setFocusRound] = useState(0);
  const [focusCorrect, setFocusCorrect] = useState(0);
  const [focusFinishedMsg, setFocusFinishedMsg] = useState('');

  const nextFocusRound = () => {
    if (focusRound >= 5) {
      logAttempt('Focus warmup', `${focusCorrect}/5`, ' correct', false);
      setFocusFinishedMsg(`${focusCorrect} of 5 correct — click a swatch to play again`);
      setFocusRound(0);
      setFocusCorrect(0);
      return;
    }
    setFocusFinishedMsg('');
    const wordObj = inkColors[Math.floor(Math.random() * inkColors.length)];
    const inkObj = inkColors[Math.floor(Math.random() * inkColors.length)];
    setFocusWord(wordObj.name);
    setFocusInkColor(inkObj);
  };

  const handleSwatchClick = (hex) => {
    const correct = hex === focusInkColor.hex;
    const nextCorrect = correct ? focusCorrect + 1 : focusCorrect;
    const nextRound = focusRound + 1;

    if (nextRound >= 5) {
      logAttempt('Focus warmup', `${nextCorrect}/5`, ' correct', false);
      setFocusFinishedMsg(`${nextCorrect} of 5 correct — click a swatch to play again`);
      setFocusRound(0);
      setFocusCorrect(0);
    } else {
      setFocusCorrect(nextCorrect);
      setFocusRound(nextRound);
      const nextWord = inkColors[Math.floor(Math.random() * inkColors.length)];
      const nextInk = inkColors[Math.floor(Math.random() * inkColors.length)];
      setFocusWord(nextWord.name);
      setFocusInkColor(nextInk);
    }
  };

  useEffect(() => {
    if (activeGame === 'focus') {
      setFocusRound(0);
      setFocusCorrect(0);
      setFocusFinishedMsg('');
      nextFocusRound();
    }
  }, [activeGame]);

  // Combined games configurations
  const gameConfig = {
    reaction: {
      title: 'Reaction warmup',
      hint: 'Click as soon as it turns green',
      bestText: bestReaction ? `${bestReaction}ms` : '—'
    },
    sequence: {
      title: 'Sequence warmup',
      hint: 'Tap the tiles in order, 1 through 9',
      bestText: '—'
    },
    focus: {
      title: 'Focus warmup',
      hint: 'Click the swatch matching the ink color, not the word',
      bestText: '—'
    }
  };

  return (
    <div className="warmup">
      <div className="warmup-main">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>Warm up first.</h1>
          <p className="lede">
            A quick exercise to shake off the fog before you open today's docket. Doesn't count toward anything — just a clean start.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="game-picker"
        >
          <button 
            className={activeGame === 'reaction' ? 'active' : ''} 
            onClick={() => setActiveGame('reaction')}
          >
            Reaction
          </button>
          <button 
            className={activeGame === 'sequence' ? 'active' : ''} 
            onClick={() => setActiveGame('sequence')}
          >
            Sequence
          </button>
          <button 
            className={activeGame === 'focus' ? 'active' : ''} 
            onClick={() => setActiveGame('focus')}
          >
            Focus
          </button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="game-card"
        >
          <div className="game-head">
            <span className="title">{gameConfig[activeGame].title}</span>
            <span className="entry-num">not filed · practice only</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeGame}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Reaction Game Surface */}
              {activeGame === 'reaction' && (
                <div 
                  className={`game-surface ${
                    reactionState === 'waiting' ? 'wait' : 
                    reactionState === 'go' ? 'go' : 
                    reactionState === 'early' ? 'early' : 'wait'
                  }`} 
                  onClick={handleReactionClick}
                >
                  <div className="big-num">
                    {reactionState === 'go' && 'GO!'}
                    {reactionState === 'result' && `${reactionMs}ms`}
                    {reactionState === 'early' && 'Too soon'}
                  </div>
                  <div className="msg">
                    {reactionState === 'idle' && 'Click to start'}
                    {reactionState === 'waiting' && 'Wait for green…'}
                    {reactionState === 'early' && 'Click to retry'}
                    {reactionState === 'result' && 'Click to try again'}
                  </div>
                </div>
              )}

              {/* Sequence Game Surface */}
              {activeGame === 'sequence' && (
                <div className="seq-surface" style={{ display: 'flex' }}>
                  <div className="seq-timer">{seqTimerText}</div>
                  <div className="seq-grid">
                    {seqGrid.map((num, i) => (
                      <div 
                        key={i} 
                        className={`seq-tile ${completedTiles.includes(num) ? 'done' : ''}`}
                        onClick={() => handleTileClick(num)}
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Focus Game Surface */}
              {activeGame === 'focus' && (
                <div className="focus-surface" style={{ display: 'flex' }}>
                  {focusFinishedMsg ? (
                    <div className="focus-score" style={{ fontSize: '15px' }}>{focusFinishedMsg}</div>
                  ) : (
                    <>
                      <div className="focus-word" style={{ color: focusInkColor.hex }}>
                        {focusWord}
                      </div>
                      <div className="focus-swatches">
                        {inkColors.map((c, i) => (
                          <div 
                            key={i} 
                            className="focus-swatch" 
                            style={{ background: c.hex }} 
                            onClick={() => handleSwatchClick(c.hex)}
                          />
                        ))}
                      </div>
                      <div className="focus-score">
                        {focusCorrect} of {focusRound} correct
                      </div>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="game-footer">
            <span>{gameConfig[activeGame].hint}</span>
            <span className="best">Best today: <b>{gameConfig[activeGame].bestText}</b></span>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 15 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="side-title">Today's attempts</div>
        <div id="attempts">
          {attempts.length === 0 ? (
            <div className="attempt-row">
              <span className="n">—</span>
              <span className="t">No attempts yet</span>
              <span className="ms">—</span>
            </div>
          ) : (
            attempts.slice().reverse().map((a, index) => {
              const num = String(attempts.length - index).padStart(3, '0');
              return (
                <div key={a.id} className="attempt-row">
                  <span className="n">{num}</span>
                  <span className="t">{a.label}</span>
                  <span className={`ms ${a.isBest ? 'fast' : ''}`}>
                    {a.value}
                    {a.unit}
                  </span>
                </div>
              );
            })
          )}
        </div>
        <div className="continue-note">
          Feeling sharp?{' '}
          <a 
            href="#" 
            onClick={(e) => { 
              e.preventDefault(); 
              onGoToDocket(); 
            }}
          >
            Go to your docket →
          </a>
        </div>
      </motion.div>
    </div>
  );
}
