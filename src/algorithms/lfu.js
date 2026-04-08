export function lfuStep(frames, page, counts, lastUsed, currentStep) {
  const frameIndex = frames.indexOf(page);

  // HIT: bump frequency + recency
  if (frameIndex !== -1) {
    const newCounts = new Map(counts);
    const newLastUsed = new Map(lastUsed);
    newCounts.set(page, (newCounts.get(page) || 0) + 1);
    newLastUsed.set(page, currentStep);
    return {
      type: 'HIT',
      frames: [...frames],
      frameIndex,
      evictedPage: null,
      counts: newCounts,
      lastUsed: newLastUsed,
    };
  }

  // FAULT: place in empty frame or evict LFU (tie-break by oldest lastUsed)
  let evictedPage = null;
  let targetFrame = frames.indexOf(null);

  if (targetFrame === -1) {
    let bestPage = null;
    let bestCount = Infinity;
    let bestLastUsed = Infinity;

    frames.forEach((p) => {
      if (p === null) return;
      const c = counts.get(p) ?? 0;
      const lu = lastUsed.get(p) ?? 0;
      if (c < bestCount || (c === bestCount && lu < bestLastUsed)) {
        bestCount = c;
        bestLastUsed = lu;
        bestPage = p;
      }
    });

    evictedPage = bestPage;
    targetFrame = frames.indexOf(evictedPage);
  }

  const newFrames = [...frames];
  newFrames[targetFrame] = page;

  const newCounts = new Map(counts);
  const newLastUsed = new Map(lastUsed);
  if (evictedPage !== null) {
    newCounts.delete(evictedPage);
    newLastUsed.delete(evictedPage);
  }
  // On first load, initialize frequency to 1
  newCounts.set(page, (newCounts.get(page) || 0) + 1);
  newLastUsed.set(page, currentStep);

  return {
    type: 'FAULT',
    frames: newFrames,
    frameIndex: targetFrame,
    evictedPage,
    counts: newCounts,
    lastUsed: newLastUsed,
  };
}

export function runLfu(referenceString, frameCount) {
  let frames = Array(frameCount).fill(null);
  let counts = new Map();
  let lastUsed = new Map();
  let faults = 0;
  let hits = 0;
  const steps = [];

  referenceString.forEach((page, index) => {
    const result = lfuStep(frames, page, counts, lastUsed, index + 1);
    frames = result.frames;
    counts = result.counts;
    lastUsed = result.lastUsed;

    if (result.type === 'FAULT') faults++;
    else hits++;

    steps.push({
      step: index + 1,
      page,
      type: result.type,
      frames: [...result.frames],
      counts: new Map(result.counts),
      lastUsed: new Map(result.lastUsed),
      frameIndex: result.frameIndex,
      evictedPage: result.evictedPage,
      faults,
      hits,
    });
  });

  return {
    faults,
    hits,
    hitRate: referenceString.length > 0 ? hits / referenceString.length : 0,
    steps,
  };
}

