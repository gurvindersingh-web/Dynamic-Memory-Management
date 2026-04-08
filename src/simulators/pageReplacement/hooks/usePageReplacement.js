import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  computeAllAlgorithms,
  analyzeLocality,
  detectThrashing,
  detectBeladyAnomaly,
  getEfficiencyGrade,
  generateRandomRefString,
} from '../../../algorithms';

const DEFAULT_REF_STRING = [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2];

export function usePageReplacement() {
  // --- Simulation state ---
  const [algorithm, setAlgorithm] = useState('FIFO');
  const [frameCount, setFrameCount] = useState(3);
  const [refStringInput, setRefStringInput] = useState('7 0 1 2 0 3 0 4 2 3 0 3 2');
  const [referenceString, setReferenceString] = useState(DEFAULT_REF_STRING);

  const [isLoaded, setIsLoaded] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);

  // FIX: track currentStep in a ref to avoid stale closures in callbacks
  const currentStepRef = useRef(currentStep);
  useEffect(() => { currentStepRef.current = currentStep; }, [currentStep]);

  const [allResults, setAllResults] = useState(null);
  const [eventLog, setEventLog] = useState([]);
  const [animatingFrames, setAnimatingFrames] = useState({});
  const [showConfetti, setShowConfetti] = useState(false);
  const [streakCount, setStreakCount] = useState(0);

  // FIX BUG-2: Use refs for TLB state to avoid stale closures during auto-play
  const [tlbState, setTlbState] = useState({ entries: [], hits: 0, misses: 0 });
  const tlbRef = useRef({ entries: [], hits: 0, misses: 0 });

  // Keep ref in sync with state
  const updateTlb = useCallback((updater) => {
    setTlbState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      tlbRef.current = next;
      return next;
    });
  }, []);

  const playTimerRef = useRef(null);
  const animTimerRef = useRef(null);

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

  // Algorithm color
  const algoColor = useMemo(() => {
    switch (algorithm) {
      case 'FIFO': return 'var(--fifo)';
      case 'LRU': return 'var(--lru)';
      case 'OPT': return 'var(--opt)';
      case 'LFU': return 'var(--lfu)';
      case 'CLOCK': return 'var(--clock)';
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

  // Mode string
  const modeString = useMemo(() => {
    if (!isLoaded) return 'IDLE';
    if (currentStep >= referenceString.length) return 'COMPLETE';
    if (isPlaying) return 'PLAYING';
    return 'STEPPING';
  }, [isLoaded, isPlaying, currentStep, referenceString.length]);

  // Recommendation
  const recommendation = useMemo(() => {
    if (!allResults || currentStep < referenceString.length) return null;

    const results = [
      { name: 'FIFO', ...allResults.FIFO },
      { name: 'LRU', ...allResults.LRU },
      { name: 'OPT', ...allResults.OPT },
      { name: 'LFU', ...allResults.LFU },
      { name: 'CLOCK', ...allResults.CLOCK },
    ];
    const best = results.reduce((a, b) => (a.hitRate > b.hitRate ? a : b));
    const localityLevel = locality.temporalLocality;

    let suggestion = '';
    if (localityLevel === 'HIGH') {
      suggestion = `High temporal locality detected — LRU/CLOCK usually perform well for this pattern. `;
    } else if (localityLevel === 'LOW') {
      suggestion = `Low locality — access pattern is scattered. All algorithms perform similarly. `;
    } else {
      suggestion = `Moderate locality — LRU/CLOCK tend to beat FIFO. `;
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
        LFU: allResults.LFU.hitRate,
        CLOCK: allResults.CLOCK.hitRate,
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
        } else if (algorithm === 'LFU') {
          const c = currentStepData.counts?.get(vpn);
          const lu = currentStepData.lastUsed?.get(vpn);
          meta = c !== undefined ? `c=${c}${lu !== undefined ? `,t=${lu}` : ''}` : '—';
        } else if (algorithm === 'CLOCK') {
          const refBits = currentStepData.refBits || [];
          const h = currentStepData.hand;
          meta = frameIdx !== -1 ? `R=${refBits[frameIdx] ?? 0}${h === frameIdx ? ' ⟲' : ''}` : '—';
        }
      }

      return { vpn, frame: valid ? frameIdx : null, valid, meta };
    });
  }, [currentResults, currentStep, currentStepData, referenceString, algorithm]);

  // --- Helper: rebuild TLB+log to a given step ---
  const rebuildStateToStep = useCallback((results, targetStep) => {
    const newLog = [];
    const newTlb = [];
    let nh = 0;
    let nm = 0;

    for (let i = 0; i < targetStep; i++) {
      const sd = results.steps[i];
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
            : `loaded into F${sd.frameIndex}${
                sd.evictedPage !== null
                  ? ` (replaced page ${sd.evictedPage})`
                  : ''
              }`,
      });

      // TLB simulation
      const idx = newTlb.findIndex((e) => e.vpn === sd.page);
      if (idx !== -1) {
        nh++;
        const entry = newTlb.splice(idx, 1)[0];
        entry.frame = sd.frameIndex;
        newTlb.push(entry);
      } else {
        nm++;
        if (newTlb.length >= 4) newTlb.shift();
        newTlb.push({ vpn: sd.page, frame: sd.frameIndex });
      }
    }

    return { log: newLog, tlb: newTlb, tlbHits: nh, tlbMisses: nm };
  }, []);

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
    updateTlb({ entries: [], hits: 0, misses: 0 });

    const results = computeAllAlgorithms(ref, frameCount);
    setAllResults(results);
    setIsLoaded(true);
  }, [parsedRef, frameCount, updateTlb]);

  // FIX BUG-1: Auto-load on mount (intentional one-time init)
  useEffect(() => {
    loadSimulation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Step forward — FIX BUG-2: read TLB from ref, and currentStep from ref to avoid stale closures
  const stepForward = useCallback(() => {
    const rawStep = currentStepRef.current;
    if (!currentResults || rawStep >= referenceString.length) return;

    const newStep = rawStep + 1;
    const stepData = currentResults.steps[newStep - 1];

    // TLB update using ref for fresh state
    const prevTlb = tlbRef.current;
    const pg = stepData.page;
    const tlbIndex = prevTlb.entries.findIndex((e) => e.vpn === pg);
    const newTlbEntries = [...prevTlb.entries];
    let newTlbHits = prevTlb.hits;
    let newTlbMisses = prevTlb.misses;

    if (tlbIndex !== -1) {
      newTlbHits++;
      const entry = newTlbEntries.splice(tlbIndex, 1)[0];
      entry.frame = stepData.frameIndex;
      newTlbEntries.push(entry);
    } else {
      newTlbMisses++;
      if (newTlbEntries.length >= 4) {
        newTlbEntries.shift();
      }
      newTlbEntries.push({ vpn: pg, frame: stepData.frameIndex });
    }
    updateTlb({ entries: newTlbEntries, hits: newTlbHits, misses: newTlbMisses });

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
    if (animTimerRef.current) clearTimeout(animTimerRef.current);
    animTimerRef.current = setTimeout(() => setAnimatingFrames({}), 800);

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
  }, [currentResults, referenceString, updateTlb]);

  // Step backward — uses rebuildStateToStep for consistency
  const stepBackward = useCallback(() => {
    if (currentStep <= 0) return;

    const newStep = currentStep - 1;
    setCurrentStep(newStep);
    setShowConfetti(false);

    if (!currentResults) return;

    const rebuilt = rebuildStateToStep(currentResults, newStep);
    setEventLog(rebuilt.log);
    updateTlb({ entries: rebuilt.tlb, hits: rebuilt.tlbHits, misses: rebuilt.tlbMisses });
    setStreakCount(0);
    setAnimatingFrames({});
  }, [currentStep, currentResults, rebuildStateToStep, updateTlb]);

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

  // Cleanup animation timer
  useEffect(() => {
    return () => {
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
    };
  }, []);

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
    updateTlb({ entries: [], hits: 0, misses: 0 });
    if (playTimerRef.current) clearTimeout(playTimerRef.current);
    if (animTimerRef.current) clearTimeout(animTimerRef.current);
  }, [updateTlb]);

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

  // FIX BUG-4: Step click (timeline navigation) — synchronous rebuild, no setTimeout
  const handleStepClick = useCallback(
    (s) => {
      if (!currentResults || s > currentStep) return;

      const rebuilt = rebuildStateToStep(currentResults, s);
      setEventLog(rebuilt.log);
      updateTlb({ entries: rebuilt.tlb, hits: rebuilt.tlbHits, misses: rebuilt.tlbMisses });
      setStreakCount(0);
      setAnimatingFrames({});
      setCurrentStep(s);
    },
    [currentResults, currentStep, rebuildStateToStep, updateTlb]
  );

  return {
    // State
    algorithm,
    frameCount,
    refStringInput,
    referenceString,
    currentStep,
    currentFrames,
    currentStepData,
    isLoaded,
    isPlaying,
    speed,
    allResults,
    currentResults,
    eventLog,
    faultHistory,
    animatingFrames,
    showConfetti,
    streakCount,
    tlb: tlbState.entries,
    tlbHits: tlbState.hits,
    tlbMisses: tlbState.misses,
    locality,
    uniquePages,
    algoColor,
    modeString,
    workingSet,
    efficiencyGrade,
    thrashingInfo,
    recommendation,
    beladyAnomaly,
    pageTableData,
    hitRateHistory,
    faultRateHistory,
    parsedRefLength: parsedRef.length,
    totalSteps: referenceString.length,

    // Actions
    setAlgorithm: handleAlgorithmChange,
    setFrameCount,
    setRefStringInput,
    setSpeed,
    stepForward,
    stepBackward,
    togglePlay,
    loadSimulation,
    resetSimulation,
    generateRandom,
    handleStepClick,
  };
}
