import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import IntroPage from './components/IntroPage';
import Header from './components/Header';
import ConfigPanel from './components/ConfigPanel';
import SimulationStage from './components/SimulationStage';
import StatsPanel from './components/StatsPanel';
import HelpModal from './components/HelpModal';
import ConfettiEffect from './components/ConfettiEffect';
import ThemeSelector, { THEMES } from './components/ThemeSelector';
import {
  computeAllAlgorithms,
  analyzeLocality,
  detectThrashing,
  detectBeladyAnomaly,
  getEfficiencyGrade,
  generateRandomRefString,
} from './algorithms';

const DEFAULT_REF_STRING = [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2];

export default function App() {
  // --- Page state ---
  const [page, setPage] = useState('intro'); // 'intro' | 'simulation'

  // --- Theme state ---
  const [theme, setTheme] = useState('midnight');
  const [showTheme, setShowTheme] = useState(false);

  // Apply theme CSS variables
  useEffect(() => {
    const t = THEMES.find((t) => t.id === theme);
    if (t) {
      Object.entries(t.colors).forEach(([prop, val]) => {
        document.documentElement.style.setProperty(prop, val);
      });
    }
    return () => {
      // Reset on unmount (won't usually fire, but safe)
    };
  }, [theme]);

  // --- Simulation state ---
  const [algorithm, setAlgorithm] = useState('FIFO');
  const [frameCount, setFrameCount] = useState(3);
  const [refStringInput, setRefStringInput] = useState('7 0 1 2 0 3 0 4 2 3 0 3 2');
  const [referenceString, setReferenceString] = useState(DEFAULT_REF_STRING);

  const [isLoaded, setIsLoaded] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);

  const [allResults, setAllResults] = useState(null);
  const [eventLog, setEventLog] = useState([]);
  const [animatingFrames, setAnimatingFrames] = useState({});
  const [showHelp, setShowHelp] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [streakCount, setStreakCount] = useState(0);

  const [tlb, setTlb] = useState([]);
  const [tlbHits, setTlbHits] = useState(0);
  const [tlbMisses, setTlbMisses] = useState(0);

  const playTimerRef = useRef(null);
  const timelineRef = useRef(null);

  // Parse reference string
  const parsedRef = useMemo(() => {
    const nums = refStringInput
      .replace(/,/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .map(Number)
      .filter((n) => !isNaN(n) && n >= 0 && n <= 99);
    return nums;
  }, [refStringInput]);

  // Locality analysis
  const locality = useMemo(() => analyzeLocality(parsedRef), [parsedRef]);
  const uniquePages = useMemo(() => new Set(parsedRef).size, [parsedRef]);

  // Current algorithm results
  const currentResults = useMemo(() => {
    if (!allResults) return null;
    return allResults[algorithm];
  }, [allResults, algorithm]);

  // Current step data
  const currentStepData = useMemo(() => {
    if (!currentResults || currentStep === 0) return null;
    return currentResults.steps[currentStep - 1];
  }, [currentResults, currentStep]);

  // Current frames state
  const currentFrames = useMemo(() => {
    if (!currentStepData) return Array(frameCount).fill(null);
    return currentStepData.frames;
  }, [currentStepData, frameCount]);

  // Fault history for chart
  const faultHistory = useMemo(() => {
    if (!currentResults) return [];
    return currentResults.steps.slice(0, currentStep).map((s) => ({
      step: s.step,
      faults: s.faults,
      hits: s.hits,
    }));
  }, [currentResults, currentStep]);

  // Thrashing detection
  const thrashingInfo = useMemo(
    () => detectThrashing(eventLog),
    [eventLog]
  );

  // Belady's anomaly
  const beladyAnomaly = useMemo(() => {
    if (algorithm !== 'FIFO' || !isLoaded) return false;
    return detectBeladyAnomaly(referenceString, frameCount);
  }, [algorithm, referenceString, frameCount, isLoaded]);

  // Efficiency grade
  const efficiencyGrade = useMemo(() => {
    if (!allResults || currentStep === 0) return 'N/A';
    const currentHitRate =
      currentStepData ? currentStepData.hits / currentStep : 0;
    const optHitRate = allResults.OPT.hitRate;
    return getEfficiencyGrade(currentHitRate, optHitRate);
  }, [allResults, currentStep, currentStepData]);

  // Hit/fault rates for sparklines
  const hitRateHistory = useMemo(() => {
    if (!currentResults) return [];
    return currentResults.steps.slice(0, currentStep).map((s) => ({
      step: s.step,
      rate: s.step > 0 ? s.hits / s.step : 0,
    }));
  }, [currentResults, currentStep]);

  const faultRateHistory = useMemo(() => {
    if (!currentResults) return [];
    return currentResults.steps.slice(0, currentStep).map((s) => ({
      step: s.step,
      rate: s.step > 0 ? s.faults / s.step : 0,
    }));
  }, [currentResults, currentStep]);

  // Load simulation
  const loadSimulation = useCallback(() => {
    const ref = parsedRef.length > 0 ? parsedRef : DEFAULT_REF_STRING;
    setReferenceString(ref);
    setCurrentStep(0);
    setIsPlaying(false);
    setEventLog([]);
    setAnimatingFrames({});
    setShowConfetti(false);
    setStreakCount(0);
    setTlb([]);
    setTlbHits(0);
    setTlbMisses(0);

    const results = computeAllAlgorithms(ref, frameCount);
    setAllResults(results);
    setIsLoaded(true);
  }, [parsedRef, frameCount]);

  // Auto-load on mount/page change
  useEffect(() => {
    if (page === 'simulation') {
      loadSimulation();
    }
  }, [page]);

  // Step forward
  const stepForward = useCallback(() => {
    if (!currentResults || currentStep >= referenceString.length) return;

    const newStep = currentStep + 1;
    const stepData = currentResults.steps[newStep - 1];

    // Update TLB
    const pg = stepData.page;
    const tlbIndex = tlb.findIndex((e) => e.vpn === pg);
    let newTlb = [...tlb];
    let newTlbHits = tlbHits;
    let newTlbMisses = tlbMisses;

    if (tlbIndex !== -1) {
      newTlbHits++;
      const entry = newTlb.splice(tlbIndex, 1)[0];
      entry.frame = stepData.frameIndex;
      newTlb.push(entry);
    } else {
      newTlbMisses++;
      if (newTlb.length >= 4) {
        newTlb.shift();
      }
      newTlb.push({ vpn: pg, frame: stepData.frameIndex });
    }
    setTlb(newTlb);
    setTlbHits(newTlbHits);
    setTlbMisses(newTlbMisses);

    // Event log entry
    const logEntries = [];
    if (stepData.evictedPage !== null) {
      logEntries.push({
        step: newStep,
        type: 'EVICT',
        page: stepData.evictedPage,
        details: `evicted from F${stepData.frameIndex}`,
      });
    }
    logEntries.push({
      step: newStep,
      type: stepData.type,
      page: stepData.page,
      details:
        stepData.type === 'HIT'
          ? `found in F${stepData.frameIndex}`
          : `loaded into F${stepData.frameIndex}${
              stepData.evictedPage !== null
                ? ` (replaced page ${stepData.evictedPage})`
                : ''
            }`,
    });

    setEventLog((prev) => [...prev, ...logEntries]);

    // Animation state
    const animState = {};
    animState[stepData.frameIndex] = stepData.type === 'HIT' ? 'hit' : 'fault';
    setAnimatingFrames(animState);
    setTimeout(() => setAnimatingFrames({}), 800);

    // Streak tracking
    if (stepData.type === 'HIT') {
      setStreakCount((prev) => prev + 1);
    } else {
      setStreakCount(0);
    }

    // Check for completion
    if (newStep >= referenceString.length) {
      setIsPlaying(false);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }

    setCurrentStep(newStep);
  }, [currentResults, currentStep, referenceString, tlb, tlbHits, tlbMisses]);

  // Step backward
  const stepBackward = useCallback(() => {
    if (currentStep <= 0) return;

    const newStep = currentStep - 1;
    setCurrentStep(newStep);
    setShowConfetti(false);

    if (!currentResults) return;
    const newLog = [];
    for (let i = 0; i < newStep; i++) {
      const sd = currentResults.steps[i];
      if (sd.evictedPage !== null) {
        newLog.push({
          step: i + 1,
          type: 'EVICT',
          page: sd.evictedPage,
          details: `evicted from F${sd.frameIndex}`,
        });
      }
      newLog.push({
        step: i + 1,
        type: sd.type,
        page: sd.page,
        details:
          sd.type === 'HIT'
            ? `found in F${sd.frameIndex}`
            : `loaded into F${sd.frameIndex}`,
      });
    }
    setEventLog(newLog);

    // Rebuild TLB
    const newTlb2 = [];
    let nh = 0;
    let nm = 0;
    for (let i = 0; i < newStep; i++) {
      const sd = currentResults.steps[i];
      const idx = newTlb2.findIndex((e) => e.vpn === sd.page);
      if (idx !== -1) {
        nh++;
        const entry = newTlb2.splice(idx, 1)[0];
        entry.frame = sd.frameIndex;
        newTlb2.push(entry);
      } else {
        nm++;
        if (newTlb2.length >= 4) newTlb2.shift();
        newTlb2.push({ vpn: sd.page, frame: sd.frameIndex });
      }
    }
    setTlb(newTlb2);
    setTlbHits(nh);
    setTlbMisses(nm);

    setStreakCount(0);
    setAnimatingFrames({});
  }, [currentStep, currentResults]);

  // Auto-play
  useEffect(() => {
    if (isPlaying && currentStep < referenceString.length) {
      playTimerRef.current = setTimeout(() => {
        requestAnimationFrame(() => stepForward());
      }, speed);
    }
    return () => {
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
    };
  }, [isPlaying, currentStep, speed, stepForward, referenceString.length]);

  // Play/Pause toggle
  const togglePlay = useCallback(() => {
    if (currentStep >= referenceString.length) return;
    setIsPlaying((prev) => !prev);
  }, [currentStep, referenceString.length]);

  // Reset
  const resetSimulation = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
    setEventLog([]);
    setAnimatingFrames({});
    setShowConfetti(false);
    setStreakCount(0);
    setTlb([]);
    setTlbHits(0);
    setTlbMisses(0);
  }, []);

  // Change algorithm
  const handleAlgorithmChange = useCallback(
    (algo) => {
      setAlgorithm(algo);
      if (isLoaded) {
        resetSimulation();
      }
    },
    [isLoaded, resetSimulation]
  );

  // Random reference string
  const generateRandom = useCallback(() => {
    const ref = generateRandomRefString(15, 6, 0.6);
    setRefStringInput(ref.join(' '));
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;

      // Enter to start simulation from intro
      if (page === 'intro' && e.key === 'Enter') {
        e.preventDefault();
        setPage('simulation');
        return;
      }

      if (page !== 'simulation') return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (!isPlaying) stepForward();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (!isPlaying) stepBackward();
          break;
        case 'r':
        case 'R':
          if (!e.ctrlKey && !e.metaKey) resetSimulation();
          break;
        case '1':
          handleAlgorithmChange('FIFO');
          break;
        case '2':
          handleAlgorithmChange('LRU');
          break;
        case '3':
          handleAlgorithmChange('OPT');
          break;
        case 'h':
        case 'H':
        case '?':
          setShowHelp((prev) => !prev);
          break;
        case 't':
        case 'T':
          setShowTheme((prev) => !prev);
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [page, togglePlay, stepForward, stepBackward, resetSimulation, handleAlgorithmChange, isPlaying]);

  // Mode string
  const modeString = useMemo(() => {
    if (!isLoaded) return 'IDLE';
    if (currentStep >= referenceString.length) return 'COMPLETE';
    if (isPlaying) return 'PLAYING';
    return 'STEPPING';
  }, [isLoaded, isPlaying, currentStep, referenceString.length]);

  // Algorithm color
  const algoColor = useMemo(() => {
    switch (algorithm) {
      case 'FIFO': return 'var(--fifo)';
      case 'LRU': return 'var(--lru)';
      case 'OPT': return 'var(--opt)';
      default: return 'var(--fifo)';
    }
  }, [algorithm]);

  // Working set
  const workingSet = useMemo(() => {
    if (currentStep === 0 || !currentResults) return new Set();
    const windowSize = 5;
    const start = Math.max(0, currentStep - windowSize);
    const pages = referenceString.slice(start, currentStep);
    return new Set(pages);
  }, [currentStep, referenceString, currentResults]);

  // Recommendation
  const recommendation = useMemo(() => {
    if (!allResults || currentStep < referenceString.length) return null;

    const results = [
      { name: 'FIFO', ...allResults.FIFO },
      { name: 'LRU', ...allResults.LRU },
      { name: 'OPT', ...allResults.OPT },
    ];
    const best = results.reduce((a, b) => (a.hitRate > b.hitRate ? a : b));
    const localityLevel = locality.temporalLocality;

    let suggestion = '';
    if (localityLevel === 'HIGH') {
      suggestion = `High temporal locality detected — LRU is optimal for this pattern. `;
    } else if (localityLevel === 'LOW') {
      suggestion = `Low locality — access pattern is scattered. All algorithms perform similarly. `;
    } else {
      suggestion = `Moderate locality — LRU has a slight edge over FIFO. `;
    }

    if (uniquePages > frameCount * 2) {
      suggestion += `Working set (${uniquePages} pages) far exceeds frame count (${frameCount}). Consider increasing frames.`;
    }

    return {
      best: best.name,
      suggestion,
      hitRates: {
        FIFO: allResults.FIFO.hitRate,
        LRU: allResults.LRU.hitRate,
        OPT: allResults.OPT.hitRate,
      },
    };
  }, [allResults, currentStep, referenceString.length, locality, uniquePages, frameCount]);

  // Page table data
  const pageTableData = useMemo(() => {
    if (!currentResults || currentStep === 0) return [];
    const allPages = [...new Set(referenceString)].sort((a, b) => a - b);
    const frames = currentStepData?.frames || [];

    return allPages.map((vpn) => {
      const frameIdx = frames.indexOf(vpn);
      const valid = frameIdx !== -1;
      let meta = '—';

      if (valid && currentStepData) {
        if (algorithm === 'FIFO') {
          const queue = currentStepData.queue || [];
          const pos = queue.indexOf(vpn);
          meta = pos !== -1 ? `Q:${pos + 1}` : '—';
        } else if (algorithm === 'LRU') {
          const ts = currentStepData.timestamps;
          meta = ts?.get(vpn) !== undefined ? `t=${ts.get(vpn)}` : '—';
        } else if (algorithm === 'OPT') {
          const nextUseIdx = referenceString.indexOf(vpn, currentStep);
          meta = nextUseIdx === -1 ? '∞' : `+${nextUseIdx - currentStep + 1}`;
        }
      }

      return { vpn, frame: valid ? frameIdx : null, valid, meta };
    });
  }, [currentResults, currentStep, currentStepData, referenceString, algorithm]);

  // --- Render Intro Page ---
  if (page === 'intro') {
    return <IntroPage onStart={() => setPage('simulation')} />;
  }

  // --- Render Simulation Page ---
  return (
    <div className="app-container">
      <Header
        algorithm={algorithm}
        algoColor={algoColor}
        modeString={modeString}
        hitRateHistory={hitRateHistory}
        faultRateHistory={faultRateHistory}
        onHelpClick={() => setShowHelp(true)}
        onThemeClick={() => setShowTheme(true)}
        onBackClick={() => setPage('intro')}
      />

      <div className="main-layout">
        <ConfigPanel
          algorithm={algorithm}
          onAlgorithmChange={handleAlgorithmChange}
          frameCount={frameCount}
          onFrameCountChange={setFrameCount}
          refStringInput={refStringInput}
          onRefStringChange={setRefStringInput}
          onRandom={generateRandom}
          locality={locality}
          uniquePages={uniquePages}
          parsedRefLength={parsedRef.length}
          isLoaded={isLoaded}
          onLoad={loadSimulation}
          speed={speed}
          onSpeedChange={setSpeed}
          isPlaying={isPlaying}
          onTogglePlay={togglePlay}
          onStepForward={stepForward}
          onStepBackward={stepBackward}
          currentStep={currentStep}
          totalSteps={referenceString.length}
          modeString={modeString}
          onReset={resetSimulation}
          algoColor={algoColor}
          thrashingLikely={uniquePages > frameCount}
        />

        <SimulationStage
          referenceString={referenceString}
          currentStep={currentStep}
          currentFrames={currentFrames}
          currentStepData={currentStepData}
          frameCount={frameCount}
          algorithm={algorithm}
          algoColor={algoColor}
          animatingFrames={animatingFrames}
          allResults={allResults}
          isLoaded={isLoaded}
          locality={locality}
          workingSet={workingSet}
          timelineRef={timelineRef}
          pageTableData={pageTableData}
          tlb={tlb}
          tlbHits={tlbHits}
          tlbMisses={tlbMisses}
          onStepClick={(s) => {
            if (s <= currentStep) {
              setCurrentStep(0);
              setEventLog([]);
              setTlb([]);
              setTlbHits(0);
              setTlbMisses(0);
              setStreakCount(0);
              setTimeout(() => {
                const newLog = [];
                const newTlb = [];
                let nh = 0, nm = 0;
                for (let i = 0; i < s; i++) {
                  const sd = currentResults.steps[i];
                  if (sd.evictedPage !== null) {
                    newLog.push({ step: i + 1, type: 'EVICT', page: sd.evictedPage, details: `evicted from F${sd.frameIndex}` });
                  }
                  newLog.push({ step: i + 1, type: sd.type, page: sd.page, details: sd.type === 'HIT' ? `found in F${sd.frameIndex}` : `loaded into F${sd.frameIndex}` });
                  const idx = newTlb.findIndex(e => e.vpn === sd.page);
                  if (idx !== -1) { nh++; const entry = newTlb.splice(idx, 1)[0]; entry.frame = sd.frameIndex; newTlb.push(entry); }
                  else { nm++; if (newTlb.length >= 4) newTlb.shift(); newTlb.push({ vpn: sd.page, frame: sd.frameIndex }); }
                }
                setEventLog(newLog);
                setTlb(newTlb);
                setTlbHits(nh);
                setTlbMisses(nm);
                setCurrentStep(s);
              }, 0);
            }
          }}
        />

        <StatsPanel
          currentStep={currentStep}
          currentStepData={currentStepData}
          faultHistory={faultHistory}
          allResults={allResults}
          algorithm={algorithm}
          algoColor={algoColor}
          efficiencyGrade={efficiencyGrade}
          thrashingInfo={thrashingInfo}
          eventLog={eventLog}
          isPlaying={isPlaying}
          referenceString={referenceString}
          frameCount={frameCount}
          recommendation={recommendation}
          beladyAnomaly={beladyAnomaly}
          isLoaded={isLoaded}
        />
      </div>

      {thrashingInfo.thrashing && (
        <div className="thrashing-overlay" />
      )}

      <AnimatePresence>
        {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showTheme && (
          <ThemeSelector
            currentTheme={theme}
            onThemeChange={setTheme}
            isOpen={showTheme}
            onToggle={() => setShowTheme(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showConfetti && <ConfettiEffect />}
      </AnimatePresence>

      {streakCount >= 5 && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20 }}
          style={{
            position: 'fixed',
            top: 56,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 150,
            background: 'linear-gradient(135deg, var(--hit), var(--working))',
            color: '#000',
            padding: '6px 16px',
            borderRadius: 8,
            fontFamily: 'var(--font-display)',
            fontSize: 14,
            fontWeight: 700,
            boxShadow: '0 0 24px var(--hit-glow)',
          }}
        >
          🔥 {streakCount}× HIT STREAK!
        </motion.div>
      )}
    </div>
  );
}
