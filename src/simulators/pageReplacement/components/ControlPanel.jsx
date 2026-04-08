import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ALGO_DATA = {
  FIFO: {
    name: 'FIFO',
    desc: 'First In, First Out',
    hint: 'Best for: Sequential access',
    perfWidth: '45%',
    color: 'var(--fifo)',
    tooltip: `FIFO evicts the page that has been in memory the longest, regardless of how recently or frequently it was accessed.\n\nQueue behavior:\n  IN → [A][B][C] → OUT\n  New page pushes to back,\n  oldest page removed from front.\n\nSimple but can suffer from Belady's anomaly.`,
  },
  LRU: {
    name: 'LRU',
    desc: 'Least Recently Used',
    hint: 'Best for: Temporal locality',
    perfWidth: '65%',
    color: 'var(--lru)',
    tooltip: `LRU evicts the page that hasn't been accessed for the longest time. It exploits temporal locality.\n\nTimestamp tracking:\n  Access page → update timestamp\n  Evict → find min(timestamp)\n\nGood approximation of OPT for most workloads.`,
  },
  OPT: {
    name: 'OPT',
    desc: 'Optimal (Bélády)',
    hint: 'Theoretical best case',
    perfWidth: '85%',
    color: 'var(--opt)',
    tooltip: `OPT evicts the page that won't be needed for the longest time in the future. Requires future knowledge.\n\nLookahead:\n  For each frame, find next use\n  Evict page with max(next_use)\n\nUsed as benchmark — impossible to implement in practice.`,
  },
  LFU: {
    name: 'LFU',
    desc: 'Least Frequently Used',
    hint: 'Best for: Stable hot set',
    perfWidth: '55%',
    color: 'var(--lfu)',
    tooltip: `LFU evicts the page with the lowest access count.\n\nState:\n  count[page]++ on each access\n  Evict min(count)\n  Tie-break: oldest last-used\n\nCan keep pages that were popular long ago if counts are not aged.`,
  },
  CLOCK: {
    name: 'CLOCK',
    desc: 'Second Chance',
    hint: 'Best for: Fast LRU-ish',
    perfWidth: '60%',
    color: 'var(--clock)',
    tooltip: `CLOCK approximates LRU with a reference bit per frame.\n\nOn access:\n  refBit = 1\nOn fault:\n  advance hand\n  if refBit==1 → clear & skip\n  if refBit==0 → evict\n\nPractical, efficient, and widely used.`,
  },
};

function AlgorithmCard({ algo, active, onClick }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const data = ALGO_DATA[algo];

  return (
    <motion.div
      className={`algo-card ${active ? 'active' : ''}`}
      style={{
        borderColor: active ? data.color : undefined,
        borderLeftColor: data.color,
        borderLeftWidth: '4px',
        borderLeftStyle: 'solid',
      }}
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="algo-card-header">
        <div className="algo-card-label">
          <span className="algo-badge" style={{ background: data.color + '22', color: data.color }}>{algo}</span>
          <span className="algo-card-name">{data.name}</span>
        </div>
        <button
          className="algo-help-btn"
          onClick={(e) => { e.stopPropagation(); setShowTooltip(!showTooltip); }}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >?</button>
      </div>
      <span className="algo-card-desc">{data.desc}</span>
      <div className="algo-perf-bar">
        <div className="algo-perf-fill" style={{ width: data.perfWidth, background: data.color }} />
      </div>
      <span className="algo-card-hint">{data.hint}</span>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            className="algo-tooltip"
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ duration: 0.15 }}
          >
            <pre style={{ whiteSpace: 'pre-wrap' }}>{data.tooltip}</pre>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ControlPanel({
  algorithm, onAlgorithmChange,
  frameCount, onFrameCountChange,
  refStringInput, onRefStringChange,
  onRandom, locality, uniquePages, parsedRefLength,
  isLoaded, onLoad, speed, onSpeedChange,
  isPlaying, onTogglePlay, onStepForward, onStepBackward,
  currentStep, totalSteps, modeString, onReset, algoColor,
  thrashingLikely,
}) {
  const isComplete = currentStep >= totalSteps && totalSteps > 0;
  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;
  const localityClass =
    locality.temporalLocality === 'HIGH' ? 'locality-high'
    : locality.temporalLocality === 'MEDIUM' ? 'locality-medium'
    : 'locality-low';

  return (
    <div className="panel config-panel">
      {/* Algorithm Selection */}
      <div className="panel-section">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {['FIFO', 'LRU', 'OPT', 'LFU', 'CLOCK'].map((algo) => (
            <AlgorithmCard key={algo} algo={algo} active={algorithm === algo} onClick={() => onAlgorithmChange(algo)} />
          ))}
        </div>
      </div>

      {/* Memory Configuration */}
      <div className="panel-section">
        <div className="panel-section-title">Memory Configuration</div>
        <div className="frame-control">
          <span className="frame-control-label">Physical Frames</span>
          <div className="frame-stepper">
            <button className="frame-stepper-btn" onClick={() => onFrameCountChange(Math.max(1, frameCount - 1))} disabled={frameCount <= 1}>−</button>
            <div className="frame-visual">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className={`frame-visual-dot ${i < frameCount ? 'filled' : ''}`} style={{ background: i < frameCount ? algoColor : undefined }} />
              ))}
            </div>
            <button className="frame-stepper-btn" onClick={() => onFrameCountChange(Math.min(8, frameCount + 1))} disabled={frameCount >= 8}>+</button>
          </div>
          <span className="frame-value">{frameCount}</span>
        </div>

        <div style={{ marginTop: 16 }}>
          <div className="ref-input-header">
            <span className="ref-input-label">Reference String</span>
            <div className="ref-input-actions">
              <button className="ref-action-btn" onClick={onRandom}>Random</button>
            </div>
          </div>
          <textarea
            className="ref-textarea"
            value={refStringInput}
            onChange={(e) => onRefStringChange(e.target.value)}
            placeholder="Enter page numbers (e.g., 7 0 1 2 0 3)"
            rows={3}
          />
          <div className="ref-analysis">
            <span className="ref-analysis-item">
              <span className="ref-analysis-dot" style={{ background: 'var(--fifo)' }} />
              {uniquePages} unique
            </span>
            <span className="ref-analysis-item">
              <span className="ref-analysis-dot" style={{ background: 'var(--text2)' }} />
              {parsedRefLength} accesses
            </span>
            <span className={`ref-analysis-item ${localityClass}`}>
              locality: {locality.temporalLocality}
            </span>
          </div>
          {thrashingLikely && (
            <div className="thrashing-warning">
              ⚠ THRASHING LIKELY — {uniquePages} pages &gt; {frameCount} frames
            </div>
          )}
        </div>

        <button
          className="load-btn"
          onClick={onLoad}
          style={{ marginTop: 16, background: `linear-gradient(135deg, ${algoColor}, ${algoColor}88)` }}
        >
          ▶ INITIALIZE SIMULATION
        </button>
      </div>

      {/* Playback Controls */}
      {isLoaded && (
        <div className="panel-section">
          <div className="panel-section-title">Playback</div>
          <div className="speed-control">
            <div className="speed-header">
              <span className="speed-label">Speed</span>
              <span className="speed-value">{speed}ms</span>
            </div>
            <input
              type="range"
              className="speed-slider"
              min={100} max={2000} step={50}
              value={2100 - speed}
              onChange={(e) => onSpeedChange(2100 - Number(e.target.value))}
            />
            <div className="speed-labels"><span>SLOW</span><span>FAST</span></div>
          </div>

          <div className="transport-controls">
            <button className="transport-btn" onClick={onStepBackward} disabled={currentStep <= 0 || isPlaying} title="Step Back (←)">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z" /></svg>
              <span>Back</span>
            </button>
            <button className={`transport-btn ${isPlaying ? 'playing' : ''}`} onClick={onTogglePlay} disabled={isComplete} title="Play/Pause (Space)">
              {isPlaying ? (
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7L8 5z" /></svg>
              )}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            <button className="transport-btn" onClick={onStepForward} disabled={isComplete || isPlaying} title="Step Forward (→)">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zm10-12v12h2V6h-2z" /></svg>
              <span>Step</span>
            </button>
          </div>

          <div className="step-counter">
            <div className="step-counter-label">Step</div>
            <motion.div
              className={`step-counter-value ${isComplete ? 'complete' : ''}`}
              key={currentStep}
              initial={{ rotateX: -30, opacity: 0.5 }}
              animate={{ rotateX: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {String(currentStep).padStart(2, '0')}/{String(totalSteps).padStart(2, '0')}
            </motion.div>
            <div className="step-progress">
              <div className="step-progress-fill" style={{ width: `${progress}%`, background: isComplete ? 'var(--hit)' : algoColor }} />
            </div>
          </div>

          <button className="reset-btn" onClick={onReset}>↻ RESET SIMULATION</button>
        </div>
      )}
    </div>
  );
}
