import { runFifo } from './fifo';
import { runLru } from './lru';
import { runOptimal } from './optimal';
import { runLfu } from './lfu';
import { runClock } from './clock';

export { runFifo, runLru, runOptimal, runLfu, runClock };

export function computeAllAlgorithms(referenceString, frameCount) {
  return {
    FIFO: runFifo(referenceString, frameCount),
    LRU: runLru(referenceString, frameCount),
    OPT: runOptimal(referenceString, frameCount),
    LFU: runLfu(referenceString, frameCount),
    CLOCK: runClock(referenceString, frameCount),
  };
}

export function analyzeLocality(referenceString) {
  if (!referenceString || referenceString.length < 2) {
    return { localityScore: 0, temporalLocality: 'LOW', avgDistance: Infinity };
  }

  const distances = [];
  const lastSeen = new Map();

  referenceString.forEach((page, index) => {
    if (lastSeen.has(page)) {
      distances.push(index - lastSeen.get(page));
    }
    lastSeen.set(page, index);
  });

  if (distances.length === 0) {
    return { localityScore: 0, temporalLocality: 'LOW', avgDistance: Infinity };
  }

  const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
  const localityScore = 1 / (1 + avgDistance / 5);

  return {
    localityScore,
    temporalLocality:
      localityScore > 0.6 ? 'HIGH' : localityScore > 0.35 ? 'MEDIUM' : 'LOW',
    avgDistance,
  };
}

export function detectThrashing(eventLog, windowSize = 5) {
  if (!eventLog || eventLog.length < windowSize) {
    return { thrashing: false, index: 0, message: 'Insufficient data.' };
  }

  const recent = eventLog.slice(-windowSize);
  const faultCount = recent.filter((e) => e.type === 'FAULT').length;
  const faultRate = faultCount / windowSize;

  return {
    thrashing: faultRate > 0.7,
    index: faultRate,
    message:
      faultRate > 0.7
        ? 'Working set exceeds physical memory. Performance degraded.'
        : 'Memory utilization normal.',
  };
}

export function detectBeladyAnomaly(referenceString, frameCount) {
  if (frameCount <= 1 || frameCount >= 8) return false;
  const current = runFifo(referenceString, frameCount);
  const more = runFifo(referenceString, frameCount + 1);
  return more.faults > current.faults;
}

export function getEfficiencyGrade(hitRate, optimalHitRate) {
  const diff = optimalHitRate - hitRate;
  if (diff <= 0) return 'A+';
  if (diff <= 0.05) return 'A';
  if (diff <= 0.1) return 'A-';
  if (diff <= 0.15) return 'B+';
  if (diff <= 0.2) return 'B';
  if (diff <= 0.3) return 'B-';
  if (diff <= 0.4) return 'C+';
  if (diff <= 0.5) return 'C';
  if (diff <= 0.6) return 'D';
  return 'F';
}

export function generateRandomRefString(length = 15, uniquePages = 6, locality = 0.7) {
  const pages = Array.from({ length: uniquePages }, (_, i) => i);
  const result = [];
  const recentWindow = 4;

  for (let i = 0; i < length; i++) {
    if (i > 0 && Math.random() < locality && result.length >= 1) {
      const windowStart = Math.max(0, result.length - recentWindow);
      const recent = result.slice(windowStart);
      result.push(recent[Math.floor(Math.random() * recent.length)]);
    } else {
      result.push(pages[Math.floor(Math.random() * pages.length)]);
    }
  }

  return result;
}
