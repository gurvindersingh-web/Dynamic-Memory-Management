"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  simulateFIFO,
  simulateLRU,
  simulateOptimal,
  detectBeladyAnomaly,
  computeWorkingSet,
  SimulationResult,
  SimulationStep,
} from "@/lib/algorithms";

type Algorithm = "FIFO" | "LRU" | "Optimal";

const ALGO_COLORS: Record<Algorithm, string> = {
  FIFO: "from-blue-500 to-blue-700",
  LRU: "from-emerald-500 to-emerald-700",
  Optimal: "from-violet-500 to-violet-700",
};

const DEFAULT_PAGES = "7 0 1 2 0 3 0 4 2 3 0 3 2 1 2 0 1 7 0 1";
const DEFAULT_FRAMES = 3;

export default function MemorySimulator() {
  const [pageInput, setPageInput] = useState(DEFAULT_PAGES);
  const [frameCount, setFrameCount] = useState(DEFAULT_FRAMES);
  const [algorithm, setAlgorithm] = useState<Algorithm>("FIFO");
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(800); // ms per step
  const [workingSetDelta, setWorkingSetDelta] = useState(3);
  const [beladyResult, setBeladyResult] = useState<{
    anomalyDetected: boolean;
    results: { frames: number; faults: number }[];
  } | null>(null);
  const [error, setError] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const parsePages = useCallback((input: string): number[] | null => {
    const parts = input.trim().split(/[\s,]+/);
    const nums = parts.map(Number);
    if (nums.some((n) => isNaN(n) || n < 0 || !Number.isInteger(n))) return null;
    return nums;
  }, []);

  const runSimulation = useCallback(() => {
    const pages = parsePages(pageInput);
    if (!pages || pages.length === 0) {
      setError("Please enter valid non-negative integers separated by spaces or commas.");
      return;
    }
    if (pages.length > 100) {
      setError("Please enter at most 100 page references.");
      return;
    }
    if (frameCount < 1 || frameCount > 20) {
      setError("Frame count must be between 1 and 20.");
      return;
    }
    setError("");

    let res: SimulationResult;
    if (algorithm === "FIFO") res = simulateFIFO(pages, frameCount);
    else if (algorithm === "LRU") res = simulateLRU(pages, frameCount);
    else res = simulateOptimal(pages, frameCount);

    setResult(res);
    setCurrentStep(0);
    setPlaying(false);

    // Belady anomaly (FIFO only, up to 8 frames)
    if (algorithm === "FIFO") {
      setBeladyResult(detectBeladyAnomaly(pages, Math.min(8, pages.length)));
    } else {
      setBeladyResult(null);
    }
  }, [pageInput, frameCount, algorithm, parsePages]);

  // Auto-play
  useEffect(() => {
    if (playing && result) {
      intervalRef.current = setInterval(() => {
        setCurrentStep((s) => {
          if (s >= result.steps.length - 1) {
            setPlaying(false);
            return s;
          }
          return s + 1;
        });
      }, speed);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, result, speed]);

  // Scroll active step into view
  useEffect(() => {
    if (tableRef.current) {
      const activeCell = tableRef.current.querySelector("[data-active='true']");
      activeCell?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    }
  }, [currentStep]);

  const step = result?.steps[currentStep];
  const pages = parsePages(pageInput) ?? [];
  const workingSets = result ? computeWorkingSet(pages, workingSetDelta) : [];

  return (
    <div className="space-y-6">
      {/* ── Controls ── */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
          Simulation Settings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Algorithm */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
              Algorithm
            </label>
            <div className="flex gap-2 flex-wrap">
              {(["FIFO", "LRU", "Optimal"] as Algorithm[]).map((a) => (
                <button
                  key={a}
                  onClick={() => setAlgorithm(a)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    algorithm === a
                      ? `bg-gradient-to-r ${ALGO_COLORS[a]} text-white shadow-md`
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Frames */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
              Number of Frames:{" "}
              <span className="font-bold text-blue-600">{frameCount}</span>
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={frameCount}
              onChange={(e) => setFrameCount(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>1</span>
              <span>10</span>
            </div>
          </div>

          {/* Speed */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
              Animation Speed:{" "}
              <span className="font-bold text-blue-600">
                {speed >= 1000 ? `${speed / 1000}s` : `${speed}ms`}
              </span>
            </label>
            <input
              type="range"
              min={100}
              max={2000}
              step={100}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>Fast</span>
              <span>Slow</span>
            </div>
          </div>
        </div>

        {/* Page Reference String */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
            Page Reference String{" "}
            <span className="text-xs text-gray-400">(space or comma separated)</span>
          </label>
          <input
            type="text"
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            placeholder="e.g. 7 0 1 2 0 3 0 4 2 3"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <button
          onClick={runSimulation}
          className="w-full md:w-auto px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow transition-all"
        >
          ▶ Run Simulation
        </button>
      </section>

      {/* ── Results ── */}
      {result && (
        <>
          {/* Stats */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "Total References",
                value: result.steps.length,
                borderClass: "border-blue-500",
                textClass: "text-blue-600 dark:text-blue-400",
              },
              {
                label: "Page Faults",
                value: result.pageFaults,
                borderClass: "border-red-500",
                textClass: "text-red-600 dark:text-red-400",
              },
              {
                label: "Page Hits",
                value: result.pageHits,
                borderClass: "border-green-500",
                textClass: "text-green-600 dark:text-green-400",
              },
              {
                label: "Hit Ratio",
                value: `${(result.hitRatio * 100).toFixed(1)}%`,
                borderClass: "border-indigo-500",
                textClass: "text-indigo-600 dark:text-indigo-400",
              },
            ].map(({ label, value, borderClass, textClass }) => (
              <div
                key={label}
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow p-4 border-t-4 ${borderClass}`}
              >
                <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                <p className={`text-3xl font-bold ${textClass}`}>{value}</p>
              </div>
            ))}
          </section>

          {/* Playback Controls */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => { setCurrentStep(0); setPlaying(false); }}
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              title="Reset"
            >
              ⏮ Reset
            </button>
            <button
              onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
              disabled={currentStep === 0}
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              ◀ Prev
            </button>
            <button
              onClick={() => setPlaying((p) => !p)}
              className={`px-5 py-1.5 rounded-lg text-sm font-semibold transition ${
                playing
                  ? "bg-orange-500 hover:bg-orange-600 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {playing ? "⏸ Pause" : "▶ Play"}
            </button>
            <button
              onClick={() => setCurrentStep((s) => Math.min(result.steps.length - 1, s + 1))}
              disabled={currentStep === result.steps.length - 1}
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              Next ▶
            </button>
            <button
              onClick={() => { setCurrentStep(result.steps.length - 1); setPlaying(false); }}
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              title="Skip to end"
            >
              ⏭ End
            </button>
            <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
              Step{" "}
              <span className="font-bold text-blue-600">{currentStep + 1}</span>{" "}
              / {result.steps.length}
            </span>
          </section>

          {/* Current Step Detail */}
          {step && (
            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">Accessing page</span>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full font-bold text-lg">
                    {step.page}
                  </span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    step.pageFault
                      ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                      : "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                  }`}
                >
                  {step.pageFault ? "❌ PAGE FAULT" : "✅ PAGE HIT"}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    step.tlbHit
                      ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  }`}
                >
                  TLB: {step.tlbHit ? "HIT" : "MISS"}
                </span>
                {step.replaced !== null && (
                  <span className="text-sm text-orange-600 dark:text-orange-400">
                    Evicted page <strong>{step.replaced}</strong>
                  </span>
                )}
              </div>

              {/* Memory Frames */}
              <div className="flex flex-wrap gap-3">
                {step.frames.map((f, i) => (
                  <div
                    key={i}
                    className={`relative w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold transition-all duration-300 shadow ${
                      f === null
                        ? "bg-gray-100 dark:bg-gray-700 text-gray-400"
                        : f === step.page && step.pageFault
                        ? "bg-red-400 text-white scale-110"
                        : f === step.page
                        ? "bg-green-400 text-white scale-105"
                        : f === step.replaced
                        ? "bg-orange-300 text-white"
                        : "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                    }`}
                  >
                    {f !== null ? f : "—"}
                    <span className="absolute -top-2 -left-2 text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-full w-5 h-5 flex items-center justify-center font-normal">
                      {i}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Full Step Table */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
              Step-by-Step Trace
            </h3>
            <div ref={tableRef} className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="px-3 py-2 text-left text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-600">
                      Step
                    </th>
                    <th className="px-3 py-2 text-left text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-600">
                      Page
                    </th>
                    {Array.from({ length: frameCount }, (_, i) => (
                      <th
                        key={i}
                        className="px-3 py-2 text-center text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-600"
                      >
                        F{i}
                      </th>
                    ))}
                    <th className="px-3 py-2 text-center text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-600">
                      Fault
                    </th>
                    <th className="px-3 py-2 text-center text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-600">
                      TLB
                    </th>
                    <th className="px-3 py-2 text-center text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-600">
                      Working Set
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.steps.map((s: SimulationStep, idx: number) => {
                    const isActive = idx === currentStep;
                    return (
                      <tr
                        key={idx}
                        data-active={isActive}
                        onClick={() => { setCurrentStep(idx); setPlaying(false); }}
                        className={`cursor-pointer transition-colors ${
                          isActive
                            ? "bg-blue-50 dark:bg-blue-900/40"
                            : idx % 2 === 0
                            ? "bg-white dark:bg-gray-800"
                            : "bg-gray-50/50 dark:bg-gray-750"
                        } hover:bg-blue-50 dark:hover:bg-blue-900/30`}
                      >
                        <td className="px-3 py-2 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-2 font-bold text-gray-800 dark:text-gray-100 border-b border-gray-100 dark:border-gray-700">
                          {s.page}
                        </td>
                        {s.frames.map((f, fi) => (
                          <td
                            key={fi}
                            className={`px-3 py-2 text-center font-mono border-b border-gray-100 dark:border-gray-700 ${
                              f === s.page && s.pageFault
                                ? "text-red-600 dark:text-red-400 font-bold"
                                : f === s.page
                                ? "text-green-600 dark:text-green-400 font-bold"
                                : "text-gray-600 dark:text-gray-300"
                            }`}
                          >
                            {f !== null ? f : "—"}
                          </td>
                        ))}
                        <td className="px-3 py-2 text-center border-b border-gray-100 dark:border-gray-700">
                          {s.pageFault ? (
                            <span className="inline-block px-2 py-0.5 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded text-xs font-semibold">
                              FAULT
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded text-xs">
                              HIT
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-center border-b border-gray-100 dark:border-gray-700">
                          {s.tlbHit ? (
                            <span className="text-yellow-600 dark:text-yellow-400 text-xs font-semibold">
                              HIT
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">MISS</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700">
                          {workingSets[idx] ?? "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Working Set Delta Control */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Working Set Window (Δ):
            </span>
            <input
              type="range"
              min={1}
              max={Math.max(1, pages.length)}
              value={workingSetDelta}
              onChange={(e) => setWorkingSetDelta(Number(e.target.value))}
              className="flex-1 max-w-xs accent-blue-600"
            />
            <span className="font-bold text-blue-600">{workingSetDelta}</span>
          </section>

          {/* Belady's Anomaly */}
          {beladyResult && (
            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-1">
                Belady&apos;s Anomaly (FIFO)
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Increasing frames sometimes causes <em>more</em> page faults with FIFO — that&apos;s
                Belady&apos;s anomaly.
              </p>
              {beladyResult.anomalyDetected ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 rounded-xl text-sm font-semibold mb-4">
                  ⚠️ Belady&apos;s anomaly detected for this reference string!
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-xl text-sm font-semibold mb-4">
                  ✅ No Belady&apos;s anomaly detected.
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                {beladyResult.results.map((r, i) => {
                  const prevFaults =
                    i > 0 ? beladyResult.results[i - 1].faults : null;
                  const isAnomaly = prevFaults !== null && r.faults > prevFaults;
                  return (
                    <div
                      key={r.frames}
                      className={`flex flex-col items-center p-3 rounded-xl border-2 min-w-[64px] ${
                        r.frames === frameCount
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                          : isAnomaly
                          ? "border-orange-400 bg-orange-50 dark:bg-orange-900/30"
                          : "border-gray-200 dark:border-gray-600"
                      }`}
                    >
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {r.frames}F
                      </span>
                      <span
                        className={`text-xl font-bold ${
                          isAnomaly ? "text-orange-600 dark:text-orange-400" : "text-gray-700 dark:text-gray-200"
                        }`}
                      >
                        {r.faults}
                      </span>
                      {isAnomaly && (
                        <span className="text-xs text-orange-500">▲</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Algorithm Comparison */}
          <AlgorithmComparison pages={pages} frameCount={frameCount} />
        </>
      )}
    </div>
  );
}

// ─── Side-by-side algorithm comparison ───────────────────────────────────────

function AlgorithmComparison({
  pages,
  frameCount,
}: {
  pages: number[];
  frameCount: number;
}) {
  if (pages.length === 0) return null;

  const results: Record<Algorithm, SimulationResult> = {
    FIFO: simulateFIFO(pages, frameCount),
    LRU: simulateLRU(pages, frameCount),
    Optimal: simulateOptimal(pages, frameCount),
  };

  const minFaults = Math.min(...Object.values(results).map((r) => r.pageFaults));

  return (
    <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
        Algorithm Comparison ({frameCount} frames)
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(["FIFO", "LRU", "Optimal"] as Algorithm[]).map((algo) => {
          const r = results[algo];
          const isBest = r.pageFaults === minFaults;
          return (
            <div
              key={algo}
              className={`rounded-xl p-4 border-2 ${
                isBest
                  ? "border-green-400 bg-green-50 dark:bg-green-900/20"
                  : "border-gray-200 dark:border-gray-600"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r ${ALGO_COLORS[algo]} text-white`}
                >
                  {algo}
                </span>
                {isBest && (
                  <span className="text-xs text-green-600 dark:text-green-400 font-semibold">
                    🏆 Best
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Page Faults</span>
                  <span className="font-bold text-red-600 dark:text-red-400">
                    {r.pageFaults}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Page Hits</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {r.pageHits}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Hit Ratio</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {(r.hitRatio * 100).toFixed(1)}%
                  </span>
                </div>
                {/* Bar */}
                <div className="mt-2">
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${ALGO_COLORS[algo]} rounded-full transition-all duration-500`}
                      style={{ width: `${r.hitRatio * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
