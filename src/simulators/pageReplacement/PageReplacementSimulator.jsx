import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';
import FrameGrid from './components/FrameGrid';
import ReferenceTimeline from './components/ReferenceTimeline';
import ControlPanel from './components/ControlPanel';
import StatsPanel from './components/StatsPanel';
import PageTable from './components/PageTable';
import ConfettiEffect from '../../components/ConfettiEffect';
import { usePageReplacement } from './hooks/usePageReplacement';

export default function PageReplacementSimulator() {
  const sim = usePageReplacement();

  // Store sim in a ref to avoid re-registering handler every render
  const simRef = useRef(sim);
  useEffect(() => { simRef.current = sim; });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
      const s = simRef.current;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          s.togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (!s.isPlaying) s.stepForward();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (!s.isPlaying) s.stepBackward();
          break;
        case 'r':
        case 'R':
          if (!e.ctrlKey && !e.metaKey) s.resetSimulation();
          break;
        case '1':
          s.setAlgorithm('FIFO');
          break;
        case '2':
          s.setAlgorithm('LRU');
          break;
        case '3':
          s.setAlgorithm('OPT');
          break;
        case '4':
          s.setAlgorithm('LFU');
          break;
        case '5':
          s.setAlgorithm('CLOCK');
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);


  const hitCount = sim.currentStepData ? sim.currentStepData.hits : 0;
  const hitRate = sim.currentStep > 0 ? ((hitCount / sim.currentStep) * 100).toFixed(1) : '0.0';

  return (
    <div className="page-replacement-simulator">
      <div className="main-layout">
        {/* Left: Control Panel */}
        <ControlPanel
          algorithm={sim.algorithm}
          onAlgorithmChange={sim.setAlgorithm}
          frameCount={sim.frameCount}
          onFrameCountChange={sim.setFrameCount}
          refStringInput={sim.refStringInput}
          onRefStringChange={sim.setRefStringInput}
          onRandom={sim.generateRandom}
          locality={sim.locality}
          uniquePages={sim.uniquePages}
          parsedRefLength={sim.parsedRefLength}
          isLoaded={sim.isLoaded}
          onLoad={sim.loadSimulation}
          speed={sim.speed}
          onSpeedChange={sim.setSpeed}
          isPlaying={sim.isPlaying}
          onTogglePlay={sim.togglePlay}
          onStepForward={sim.stepForward}
          onStepBackward={sim.stepBackward}
          currentStep={sim.currentStep}
          totalSteps={sim.totalSteps}
          modeString={sim.modeString}
          onReset={sim.resetSimulation}
          algoColor={sim.algoColor}
          thrashingLikely={sim.uniquePages > sim.frameCount}
        />

        {/* Center: Simulation Stage */}
        <div className="panel simulation-panel">
          <FrameGrid
            referenceString={sim.referenceString}
            currentStep={sim.currentStep}
            currentFrames={sim.currentFrames}
            currentStepData={sim.currentStepData}
            frameCount={sim.frameCount}
            algorithm={sim.algorithm}
            algoColor={sim.algoColor}
            animatingFrames={sim.animatingFrames}
            isLoaded={sim.isLoaded}
          />

          {sim.isLoaded && (
            <>
              <PageTable
                pageTableData={sim.pageTableData}
                currentStepData={sim.currentStepData}
                algorithm={sim.algorithm}
                algoColor={sim.algoColor}
                tlb={sim.tlb}
                tlbHits={sim.tlbHits}
                tlbMisses={sim.tlbMisses}
                workingSet={sim.workingSet}
                frameCount={sim.frameCount}
              />

              <ReferenceTimeline
                referenceString={sim.referenceString}
                currentStep={sim.currentStep}
                currentResults={sim.currentResults}
                algoColor={sim.algoColor}
                hitCount={hitCount}
                hitRate={hitRate}
                onStepClick={sim.handleStepClick}
              />
            </>
          )}
        </div>

        {/* Right: Stats Panel */}
        <StatsPanel
          currentStep={sim.currentStep}
          currentStepData={sim.currentStepData}
          faultHistory={sim.faultHistory}
          allResults={sim.allResults}
          algorithm={sim.algorithm}
          algoColor={sim.algoColor}
          efficiencyGrade={sim.efficiencyGrade}
          thrashingInfo={sim.thrashingInfo}
          eventLog={sim.eventLog}
          isPlaying={sim.isPlaying}
          recommendation={sim.recommendation}
          beladyAnomaly={sim.beladyAnomaly}
          isLoaded={sim.isLoaded}
        />
      </div>

      {sim.thrashingInfo.thrashing && <div className="thrashing-overlay" />}

      <AnimatePresence>
        {sim.showConfetti && <ConfettiEffect />}
      </AnimatePresence>

      {sim.streakCount >= 5 && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20 }}
          style={{
            position: 'fixed', top: 72, left: '50%', transform: 'translateX(-50%)',
            zIndex: 150,
            background: 'linear-gradient(135deg, var(--hit), var(--working))',
            color: '#000', padding: '6px 16px', borderRadius: 8,
            fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700,
            boxShadow: '0 0 24px var(--hit-glow)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Flame size={16} fill="currentColor" /> {sim.streakCount}× HIT STREAK!
          </div>
        </motion.div>
      )}
    </div>
  );
}
