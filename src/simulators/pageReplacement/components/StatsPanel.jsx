import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend,
} from 'recharts';
import EventLog from './EventLog';

function useThemeColors() {
  const [colors, setColors] = useState({});
  const read = useCallback(() => {
    const s = getComputedStyle(document.documentElement);
    setColors({
      text: s.getPropertyValue('--text').trim() || '#e6edf3',
      text2: s.getPropertyValue('--text2').trim() || '#8b949e',
      text3: s.getPropertyValue('--text3').trim() || '#484f58',
      border: s.getPropertyValue('--border').trim() || '#21262d',
      border2: s.getPropertyValue('--border2').trim() || '#30363d',
      bg2: s.getPropertyValue('--bg2').trim() || '#0d1117',
      bg3: s.getPropertyValue('--bg3').trim() || '#161b22',
      glass: s.getPropertyValue('--glass').trim() || 'rgba(22,27,34,0.95)',
    });
  }, []);
  useEffect(() => {
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    return () => observer.disconnect();
  }, [read]);
  return colors;
}

function MetricCard({ label, value, color, sub, bar, barColor }) {
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <motion.div className="metric-value" style={{ color }} key={value}
        initial={{ rotateX: -30, opacity: 0 }}
        animate={{ rotateX: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >{value}</motion.div>
      {bar !== undefined && (
        <div className="metric-bar">
          <div className="metric-bar-fill" style={{ width: `${Math.min(bar * 100, 100)}%`, background: barColor || color }} />
        </div>
      )}
      {sub && <div className="metric-sub">{sub}</div>}
    </div>
  );
}

function FaultChart({ faultHistory, themeColors }) {
  if (faultHistory.length === 0) {
    return (
      <div className="fault-chart-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text4)' }}>
        No data yet
      </div>
    );
  }
  return (
    <div className="fault-chart-container" style={{ minWidth: 50, minHeight: 80 }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={50} minHeight={80}>
        <AreaChart data={faultHistory} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="faultGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--fault)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--fault)" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="hitGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--hit)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--hit)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis dataKey="step" tick={{ fontSize: 9, fontFamily: 'var(--font-mono)', fill: themeColors.text3 }} axisLine={{ stroke: themeColors.border }} tickLine={false} />
          <YAxis tick={{ fontSize: 9, fontFamily: 'var(--font-mono)', fill: themeColors.text3 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: themeColors.glass, border: `1px solid ${themeColors.border2}`, borderRadius: 8, backdropFilter: 'blur(12px)', fontSize: 11, fontFamily: 'var(--font-mono)', color: themeColors.text }} labelStyle={{ color: themeColors.text2 }} />
          <Area type="monotone" dataKey="faults" stroke="#f85149" strokeWidth={2} fill="url(#faultGrad)" name="Faults" dot={false} activeDot={{ r: 4, fill: '#f85149' }} />
          <Area type="monotone" dataKey="hits" stroke="#3fb950" strokeWidth={2} fill="url(#hitGrad)" name="Hits" dot={false} activeDot={{ r: 4, fill: '#3fb950' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function AlgoRadarChart({ allResults, themeColors }) {
  if (!allResults) return null;
  const totalSteps = allResults.FIFO.steps.length || 1;
  const data = [
    { metric: 'Hit Rate', FIFO: allResults.FIFO.hitRate * 100, LRU: allResults.LRU.hitRate * 100, OPT: allResults.OPT.hitRate * 100, LFU: allResults.LFU.hitRate * 100, CLOCK: allResults.CLOCK.hitRate * 100 },
    { metric: 'Low Faults', FIFO: (1 - allResults.FIFO.faults / totalSteps) * 100, LRU: (1 - allResults.LRU.faults / totalSteps) * 100, OPT: (1 - allResults.OPT.faults / totalSteps) * 100, LFU: (1 - allResults.LFU.faults / totalSteps) * 100, CLOCK: (1 - allResults.CLOCK.faults / totalSteps) * 100 },
    { metric: 'Efficiency', FIFO: (allResults.FIFO.hitRate / Math.max(allResults.OPT.hitRate, 0.01)) * 100, LRU: (allResults.LRU.hitRate / Math.max(allResults.OPT.hitRate, 0.01)) * 100, OPT: 100, LFU: (allResults.LFU.hitRate / Math.max(allResults.OPT.hitRate, 0.01)) * 100, CLOCK: (allResults.CLOCK.hitRate / Math.max(allResults.OPT.hitRate, 0.01)) * 100 },
    { metric: 'Predictability', FIFO: 90, LRU: 70, OPT: 40, LFU: 65, CLOCK: 80 },
    { metric: 'Simplicity', FIFO: 95, LRU: 60, OPT: 20, LFU: 55, CLOCK: 85 },
  ];

  return (
    <div className="radar-chart-container" style={{ minWidth: 50, minHeight: 120 }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={50} minHeight={120}>
        <RadarChart data={data} margin={{ top: 16, right: 32, bottom: 16, left: 32 }}>
          <PolarGrid stroke={themeColors.border} />
          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9, fontFamily: 'var(--font-mono)', fill: themeColors.text2 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar name="FIFO" dataKey="FIFO" stroke="#2f81f7" fill="#2f81f7" fillOpacity={0.1} strokeWidth={2} />
          <Radar name="LRU" dataKey="LRU" stroke="#a371f7" fill="#a371f7" fillOpacity={0.1} strokeWidth={2} />
          <Radar name="OPT" dataKey="OPT" stroke="#39c5cf" fill="#39c5cf" fillOpacity={0.1} strokeWidth={2} />
          <Radar name="LFU" dataKey="LFU" stroke="var(--lfu)" fill="var(--lfu)" fillOpacity={0.08} strokeWidth={2} />
          <Radar name="CLOCK" dataKey="CLOCK" stroke="var(--clock)" fill="var(--clock)" fillOpacity={0.08} strokeWidth={2} />
          <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'var(--font-mono)' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ComparisonTable({ allResults }) {
  if (!allResults) return null;
  const algos = [
    { name: 'FIFO', color: 'var(--fifo)', data: allResults.FIFO },
    { name: 'LRU', color: 'var(--lru)', data: allResults.LRU },
    { name: 'OPT', color: 'var(--opt)', data: allResults.OPT },
    { name: 'LFU', color: 'var(--lfu)', data: allResults.LFU },
    { name: 'CLOCK', color: 'var(--clock)', data: allResults.CLOCK },
  ];
  const bestFaults = Math.min(...algos.map((a) => a.data.faults));

  return (
    <table className="comparison-table">
      <thead><tr><th>Algorithm</th><th>Faults</th><th>Hits</th><th>Hit Rate</th></tr></thead>
      <tbody>
        {algos.map((algo) => (
          <tr key={algo.name} className={algo.data.faults === bestFaults ? 'best' : ''}>
            <td style={{ color: algo.color }}>{algo.data.faults === bestFaults ? '★ ' : ''}{algo.name}</td>
            <td>{algo.data.faults}</td>
            <td>{algo.data.hits}</td>
            <td>{(algo.data.hitRate * 100).toFixed(1)}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Recommendation({ recommendation }) {
  if (!recommendation) return null;
  return (
    <div className="recommendation-card">
      <div className="recommendation-title">Recommendation</div>
      <div className="recommendation-text">
        Best algorithm: <span className="recommendation-highlight">{recommendation.best}</span>
        <br /><br />
        {recommendation.suggestion}
      </div>
    </div>
  );
}

export default function StatsPanel({
  currentStep, currentStepData, faultHistory, allResults,
  algorithm, algoColor, efficiencyGrade, thrashingInfo,
  eventLog, isPlaying, recommendation, beladyAnomaly, isLoaded,
}) {
  const themeColors = useThemeColors();
  const faultCount = currentStepData ? currentStepData.faults : 0;
  const hitCount = currentStepData ? currentStepData.hits : 0;
  const hitRate = currentStep > 0 ? hitCount / currentStep : 0;

  const faultDelta = useMemo(() => {
    if (currentStep <= 1 || !currentStepData) return 0;
    const prevStep = allResults?.[algorithm]?.steps[currentStep - 2];
    if (!prevStep) return 0;
    return currentStepData.faults - prevStep.faults;
  }, [currentStep, currentStepData, allResults, algorithm]);

  return (
    <div className="panel stats-panel">
      <div className="panel-section">
        <div className="metrics-grid">
          <MetricCard label="Page Faults" value={faultCount} color="var(--fault)"
            sub={faultDelta > 0 ? `▲ +${faultDelta} from prev` : currentStep > 0 ? '● no change' : ''} />
          <MetricCard label="Cache Hits" value={hitCount} color="var(--hit)"
            bar={hitRate} barColor="var(--hit)" sub={`${(hitRate * 100).toFixed(1)}%`} />
          <MetricCard label="Efficiency" value={efficiencyGrade}
            color={efficiencyGrade.startsWith('A') ? 'var(--hit)' : efficiencyGrade.startsWith('B') ? 'var(--fifo)' : efficiencyGrade.startsWith('C') ? 'var(--evict)' : 'var(--fault)'}
            sub={allResults ? `vs OPT: ${allResults.OPT.faults}F` : ''} />
          <MetricCard label="Thrashing" value={thrashingInfo.index.toFixed(2)}
            color={thrashingInfo.thrashing ? 'var(--thrash)' : 'var(--text2)'}
            sub={thrashingInfo.thrashing ? '⚠ THRASHING' : '◉ NORMAL'} />
        </div>
      </div>

      {beladyAnomaly && (
        <div className="panel-section" style={{ padding: '8px 16px' }}>
          <div className="thrashing-warning" style={{ background: 'rgba(248, 81, 73, 0.1)', borderColor: 'var(--fault-dim)' }}>
            <span style={{ color: 'var(--fault)' }}>
              ⚠ <strong>Belady's Anomaly detected!</strong> Adding more frames could increase faults with FIFO.
            </span>
          </div>
        </div>
      )}

      <div className="panel-section">
        <div className="panel-section-title">Fault Accumulation</div>
        <FaultChart faultHistory={faultHistory} themeColors={themeColors} />
      </div>

      {isLoaded && (
        <div className="panel-section">
          <div className="panel-section-title">Algorithm Comparison</div>
          <ComparisonTable allResults={allResults} />
        </div>
      )}

      {isLoaded && allResults && (
        <div className="panel-section">
          <div className="panel-section-title">Performance Analysis</div>
          <AlgoRadarChart allResults={allResults} themeColors={themeColors} />
        </div>
      )}

      {recommendation && (
        <div className="panel-section">
          <Recommendation recommendation={recommendation} />
        </div>
      )}

      <div className="panel-section" style={{ flex: 1 }}>
        <EventLog eventLog={eventLog} isPlaying={isPlaying} />
      </div>
    </div>
  );
}
