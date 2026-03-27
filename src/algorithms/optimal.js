export function optimalStep(frames, page, referenceString, currentIndex) {
  const frameIndex = frames.indexOf(page);

  if (frameIndex !== -1) {
    return {
      type: 'HIT',
      frames: [...frames],
      frameIndex,
      evictedPage: null,
    };
  }

  let evictedPage = null;
  let targetFrame = frames.indexOf(null);

  if (targetFrame === -1) {
    let farthestIndex = -1;
    let pageToEvict = null;

    frames.forEach((p) => {
      if (p === null) return;
      const nextUse = referenceString.indexOf(p, currentIndex + 1);
      const distance = nextUse === -1 ? Infinity : nextUse;

      if (distance > farthestIndex) {
        farthestIndex = distance;
        pageToEvict = p;
      }
    });

    evictedPage = pageToEvict;
    targetFrame = frames.indexOf(evictedPage);
  }

  const newFrames = [...frames];
  newFrames[targetFrame] = page;

  return {
    type: 'FAULT',
    frames: newFrames,
    frameIndex: targetFrame,
    evictedPage,
  };
}

export function runOptimal(referenceString, frameCount) {
  let frames = Array(frameCount).fill(null);
  let faults = 0;
  let hits = 0;
  const steps = [];

  referenceString.forEach((page, index) => {
    const result = optimalStep(frames, page, referenceString, index);
    frames = result.frames;

    if (result.type === 'FAULT') faults++;
    else hits++;

    steps.push({
      step: index + 1,
      page,
      type: result.type,
      frames: [...result.frames],
      frameIndex: result.frameIndex,
      evictedPage: result.evictedPage,
      faults,
      hits,
      nextUses: frames.map((p) => {
        if (p === null) return null;
        const next = referenceString.indexOf(p, index + 1);
        return next === -1 ? Infinity : next - index;
      }),
    });
  });

  return {
    faults,
    hits,
    hitRate: referenceString.length > 0 ? hits / referenceString.length : 0,
    steps,
  };
}
