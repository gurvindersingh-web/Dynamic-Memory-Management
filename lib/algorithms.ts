/**
 * Page Replacement Algorithm Implementations
 * FIFO, LRU, and Optimal
 */

export interface SimulationStep {
  page: number;
  frames: (number | null)[];
  pageFault: boolean;
  replaced: number | null;
  tlbHit: boolean;
}

export interface SimulationResult {
  steps: SimulationStep[];
  pageFaults: number;
  pageHits: number;
  hitRatio: number;
}

// ─── FIFO ────────────────────────────────────────────────────────────────────

export function simulateFIFO(
  pages: number[],
  frameCount: number
): SimulationResult {
  const frames: (number | null)[] = Array(frameCount).fill(null);
  const queue: number[] = []; // FIFO order: front = oldest
  const steps: SimulationStep[] = [];
  let pageFaults = 0;

  // Simple 1-entry TLB
  let tlbEntry: number | null = null;

  for (const page of pages) {
    const tlbHit = tlbEntry === page;
    let pageFault = false;
    let replaced: number | null = null;

    if (!frames.includes(page)) {
      pageFault = true;
      pageFaults++;

      if (queue.length < frameCount) {
        // Find empty slot
        const emptyIdx = frames.indexOf(null);
        frames[emptyIdx] = page;
        queue.push(page);
      } else {
        // Evict oldest
        const oldest = queue.shift()!;
        replaced = oldest;
        const idx = frames.indexOf(oldest);
        frames[idx] = page;
        queue.push(page);
      }
    }

    tlbEntry = page;
    steps.push({
      page,
      frames: [...frames],
      pageFault,
      replaced,
      tlbHit,
    });
  }

  const pageHits = pages.length - pageFaults;
  return {
    steps,
    pageFaults,
    pageHits,
    hitRatio: pages.length > 0 ? pageHits / pages.length : 0,
  };
}

// ─── LRU ─────────────────────────────────────────────────────────────────────

export function simulateLRU(
  pages: number[],
  frameCount: number
): SimulationResult {
  const frames: (number | null)[] = Array(frameCount).fill(null);
  const recentUse: number[] = []; // least-recently-used is at index 0
  const steps: SimulationStep[] = [];
  let pageFaults = 0;

  let tlbEntry: number | null = null;

  for (const page of pages) {
    const tlbHit = tlbEntry === page;
    let pageFault = false;
    let replaced: number | null = null;

    if (!frames.includes(page)) {
      pageFault = true;
      pageFaults++;

      if (recentUse.length < frameCount) {
        const emptyIdx = frames.indexOf(null);
        frames[emptyIdx] = page;
        recentUse.push(page);
      } else {
        const lru = recentUse.shift()!;
        replaced = lru;
        const idx = frames.indexOf(lru);
        frames[idx] = page;
        recentUse.push(page);
      }
    } else {
      // Move to most-recently-used
      const idx = recentUse.indexOf(page);
      recentUse.splice(idx, 1);
      recentUse.push(page);
    }

    tlbEntry = page;
    steps.push({
      page,
      frames: [...frames],
      pageFault,
      replaced,
      tlbHit,
    });
  }

  const pageHits = pages.length - pageFaults;
  return {
    steps,
    pageFaults,
    pageHits,
    hitRatio: pages.length > 0 ? pageHits / pages.length : 0,
  };
}

// ─── Optimal ─────────────────────────────────────────────────────────────────

export function simulateOptimal(
  pages: number[],
  frameCount: number
): SimulationResult {
  const frames: (number | null)[] = Array(frameCount).fill(null);
  const loaded: number[] = [];
  const steps: SimulationStep[] = [];
  let pageFaults = 0;

  let tlbEntry: number | null = null;

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const tlbHit = tlbEntry === page;
    let pageFault = false;
    let replaced: number | null = null;

    if (!frames.includes(page)) {
      pageFault = true;
      pageFaults++;

      if (loaded.length < frameCount) {
        const emptyIdx = frames.indexOf(null);
        frames[emptyIdx] = page;
        loaded.push(page);
      } else {
        // Find which loaded page is used farthest in the future (or never)
        let victim = loaded[0];
        let farthest = -1;

        for (const f of loaded) {
          const nextUse = pages.slice(i + 1).indexOf(f);
          const dist = nextUse === -1 ? Infinity : nextUse;
          if (dist > farthest) {
            farthest = dist;
            victim = f;
          }
        }

        replaced = victim;
        const idx = frames.indexOf(victim);
        frames[idx] = page;
        loaded.splice(loaded.indexOf(victim), 1);
        loaded.push(page);
      }
    }

    tlbEntry = page;
    steps.push({
      page,
      frames: [...frames],
      pageFault,
      replaced,
      tlbHit,
    });
  }

  const pageHits = pages.length - pageFaults;
  return {
    steps,
    pageFaults,
    pageHits,
    hitRatio: pages.length > 0 ? pageHits / pages.length : 0,
  };
}

// ─── Belady's Anomaly Detection ───────────────────────────────────────────────

/**
 * Checks whether FIFO exhibits Belady's anomaly for the given page sequence.
 * Compares page faults for frameCount vs frameCount+1.
 * Returns true if more page faults occur with more frames.
 */
export function detectBeladyAnomaly(
  pages: number[],
  maxFrames: number
): { anomalyDetected: boolean; results: { frames: number; faults: number }[] } {
  const results: { frames: number; faults: number }[] = [];
  let anomalyDetected = false;

  for (let f = 1; f <= maxFrames; f++) {
    const { pageFaults } = simulateFIFO(pages, f);
    results.push({ frames: f, faults: pageFaults });
    if (f > 1 && pageFaults > results[f - 2].faults) {
      anomalyDetected = true;
    }
  }

  return { anomalyDetected, results };
}

// ─── Working Set ─────────────────────────────────────────────────────────────

/**
 * Computes the working set size at each reference step using a window Δ.
 */
export function computeWorkingSet(pages: number[], delta: number): number[] {
  return pages.map((_, i) => {
    const window = pages.slice(Math.max(0, i - delta + 1), i + 1);
    return new Set(window).size;
  });
}
