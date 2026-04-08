import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function FrameCell({ index, page, animState, algorithm, stepData, currentStep, referenceString, algoColor, frameCount }) {
  const isEmpty = page === null;
  const isHit = animState === 'hit';
  const isFault = animState === 'fault';

  let metaText = '';
  let agePercent = 0;

  if (!isEmpty && stepData) {
    if (algorithm === 'FIFO') {
      const queue = stepData.queue || [];
      const pos = queue.indexOf(page);
      if (pos !== -1) {
        metaText = `QUEUE:${pos + 1}`;
        agePercent = ((pos + 1) / frameCount) * 100;
      }
    } else if (algorithm === 'LRU') {
      const ts = stepData.timestamps;
      if (ts && ts.get(page) !== undefined) {
        const age = currentStep - ts.get(page);
        metaText = `AGE:${age}`;
        agePercent = Math.min((age / Math.max(currentStep, 1)) * 100 * 3, 100);
      }
    } else if (algorithm === 'OPT') {
      const nextUseIdx = referenceString.indexOf(page, currentStep);
      if (nextUseIdx === -1) {
        metaText = 'NEXT:∞';
        agePercent = 100;
      } else {
        const dist = nextUseIdx - currentStep + 1;
        metaText = `NEXT:+${dist}`;
        agePercent = Math.min((dist / referenceString.length) * 100 * 2, 100);
      }
    } else if (algorithm === 'LFU') {
      const c = stepData.counts?.get(page);
      const lu = stepData.lastUsed?.get(page);
      if (c !== undefined) {
        metaText = `COUNT:${c}`;
        // Higher count = "newer"/hotter → smaller bar
        agePercent = Math.max(0, 100 - Math.min(c * 18, 100));
      } else if (lu !== undefined) {
        metaText = `LAST:${lu}`;
      }
    } else if (algorithm === 'CLOCK') {
      const rb = stepData.refBits || [];
      const r = rb[index] ?? 0;
      const h = stepData.hand;
      metaText = `R:${r}${h === index ? ' ⟲' : ''}`;
      agePercent = r ? 30 : 80;
    }
  }

  const animVariants = {
    idle: {
      backgroundColor: 'var(--bg3)',
      borderColor: isEmpty ? 'var(--border)' : 'var(--border)',
      scale: 1,
      boxShadow: '0 0 0 transparent',
      rotate: 0,
      y: 0,
    },
    hit: {
      backgroundColor: 'var(--hit-dim)',
      borderColor: 'var(--hit)',
      scale: 1.05,
      boxShadow: '0 0 24px var(--hit-glow)',
      rotate: 0,
      y: 0,
    },
    fault: {
      backgroundColor: 'var(--fault-dim)',
      borderColor: 'var(--fault)',
      scale: 1.08,
      boxShadow: '0 0 32px var(--fault-glow)',
      rotate: 0,
      y: 0,
    },
  };

  const currentVariant = isHit ? 'hit' : isFault ? 'fault' : 'idle';

  return (
    <motion.div
      className={`frame-cell ${isEmpty ? 'empty' : ''} ${!animState ? 'breathing' : ''}`}
      variants={animVariants}
      animate={currentVariant}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      layout
    >
      <div className="frame-cell-header">
        <span className="frame-index">F{index}</span>
        {(isHit || isFault) && (
          <motion.span
            className="frame-activity"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            style={{ color: isHit ? 'var(--hit)' : 'var(--fault)' }}
          >
            ⚡
          </motion.span>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={page ?? 'empty'}
          className={`frame-page ${isEmpty ? 'empty-dash' : ''}`}
          initial={{ rotateX: -90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: 90, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          {isEmpty ? '—' : page}
        </motion.div>
      </AnimatePresence>

      {!isEmpty && (
        <>
          <div className="frame-meta">{metaText}</div>
          <div className="frame-age-bar">
            <motion.div
              className="frame-age-fill"
              style={{ background: algoColor }}
              animate={{ width: `${agePercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </>
      )}

      <span className={`frame-status ${isEmpty ? 'empty-status' : 'resident'}`}>
        {isEmpty ? 'EMPTY' : 'RESIDENT'}
      </span>
    </motion.div>
  );
}

const MemoizedFrameCell = React.memo(FrameCell, (prev, next) => {
  return (
    prev.page === next.page &&
    prev.animState === next.animState &&
    prev.currentStep === next.currentStep &&
    prev.algorithm === next.algorithm &&
    prev.stepData === next.stepData
  );
});

function VirtualMemoryView({ referenceString, currentFrames, currentStep, algoColor }) {
  const allPages = useMemo(() => {
    return [...new Set(referenceString)].sort((a, b) => a - b);
  }, [referenceString]);

  const currentPage = currentStep > 0 ? referenceString[currentStep - 1] : null;

  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
      {allPages.map((page) => {
        const isLoaded = currentFrames.includes(page);
        const isCurrent = page === currentPage;
        return (
          <motion.div
            key={page}
            animate={{
              boxShadow: isCurrent ? `0 0 16px ${algoColor}88` : '0 0 0 transparent',
              borderColor: isCurrent ? algoColor : isLoaded ? 'var(--hit)' : 'var(--border)',
            }}
            transition={{ duration: 0.3 }}
            style={{
              width: 52, height: 52,
              background: isLoaded ? 'var(--bg4)' : 'var(--bg3)',
              border: '1px solid', borderRadius: 6,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}
          >
            <span style={{ position: 'absolute', top: 3, right: 5, fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--text4)', textTransform: 'uppercase' }}>V</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: isCurrent ? algoColor : 'var(--text)' }}>{page}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: isLoaded ? 'var(--hit)' : 'var(--text4)', textTransform: 'uppercase', marginTop: 1 }}>
              {isLoaded ? 'LOADED' : 'NOT RES.'}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

function ConnectionLines({ currentFrames, referenceString, algoColor }) {
  const allPages = useMemo(() => [...new Set(referenceString)].sort((a, b) => a - b), [referenceString]);
  const connections = useMemo(() => {
    const conns = [];
    currentFrames.forEach((page, frameIdx) => {
      if (page === null) return;
      const vpnIdx = allPages.indexOf(page);
      if (vpnIdx === -1) return;
      conns.push({ vpnIdx, frameIdx, page });
    });
    return conns;
  }, [currentFrames, allPages]);

  if (connections.length === 0) return null;
  const vpnCount = allPages.length;
  const frameCountLocal = currentFrames.length;

  return (
    <svg style={{ width: '100%', height: 40, overflow: 'visible' }}>
      {connections.map((conn) => {
        const startX = ((conn.vpnIdx + 0.5) / vpnCount) * 100;
        const endX = ((conn.frameIdx + 0.5) / frameCountLocal) * 100;
        return (
          <g key={`${conn.page}-${conn.frameIdx}`}>
            <line x1={`${startX}%`} y1="0" x2={`${endX}%`} y2="40" stroke={algoColor} strokeWidth="1.5" strokeOpacity="0.35" strokeDasharray="4 3">
              <animate attributeName="stroke-dashoffset" from="0" to="-14" dur="1.5s" repeatCount="indefinite" />
            </line>
            <circle cx={`${startX}%`} cy="0" r="2.5" fill={algoColor} opacity="0.6" />
            <circle cx={`${endX}%`} cy="40" r="2.5" fill={algoColor} opacity="0.6" />
          </g>
        );
      })}
    </svg>
  );
}

export default function FrameGrid({
  referenceString, currentStep, currentFrames, currentStepData,
  frameCount, algorithm, algoColor, animatingFrames, isLoaded,
}) {
  const utilization = currentFrames.filter((f) => f !== null).length;

  if (!isLoaded) {
    return (
      <div className="sim-section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <div style={{ textAlign: 'center', color: 'var(--text3)' }}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ opacity: 0.3, marginBottom: 16 }}>
            <rect x="4" y="12" width="24" height="24" rx="4" stroke="currentColor" strokeWidth="2" />
            <rect x="36" y="12" width="24" height="24" rx="4" stroke="currentColor" strokeWidth="2" />
            <rect x="4" y="40" width="24" height="12" rx="3" stroke="currentColor" strokeWidth="2" />
            <rect x="36" y="40" width="24" height="12" rx="3" stroke="currentColor" strokeWidth="2" />
          </svg>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Initialize Simulation</div>
          <div style={{ fontSize: 13, color: 'var(--text3)' }}>Configure parameters and hit Initialize to begin</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Virtual Address Space */}
      <div className="sim-section" style={{ flex: '0 0 auto' }}>
        <div className="sim-section-header">
          <span className="sim-section-title">Virtual Address Space</span>
          <span className="sim-section-info">PID:1337 · {new Set(referenceString).size} pages allocated</span>
        </div>
        <VirtualMemoryView referenceString={referenceString} currentFrames={currentFrames} currentStep={currentStep} algoColor={algoColor} />
      </div>

      {/* Connection Lines */}
      <div style={{ padding: '0 20px' }}>
        <ConnectionLines currentFrames={currentFrames} referenceString={referenceString} algoColor={algoColor} />
      </div>

      {/* Physical Frames */}
      <div className="sim-section" style={{ flex: '0 0 auto' }}>
        <div className="sim-section-header">
          <span className="sim-section-title">Physical Frames</span>
          <span className="sim-section-info">
            CAPACITY: {utilization}/{frameCount} · UTILIZATION: {frameCount > 0 ? Math.round((utilization / frameCount) * 100) : 0}%
          </span>
        </div>
        <div className="frames-grid">
          {currentFrames.map((page, i) => (
            <MemoizedFrameCell
              key={i} index={i} page={page}
              animState={animatingFrames[i]}
              algorithm={algorithm} stepData={currentStepData}
              currentStep={currentStep} referenceString={referenceString}
              algoColor={algoColor} frameCount={frameCount}
            />
          ))}
        </div>
      </div>
    </>
  );
}
