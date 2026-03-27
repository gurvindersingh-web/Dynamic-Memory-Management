export function lruStep(frames, page, timestamps, currentStep) {
  const frameIndex = frames.indexOf(page);

  if (frameIndex !== -1) {
    const newTimestamps = new Map(timestamps);
    newTimestamps.set(page, currentStep);
    return {
      type: 'HIT',
      frames: [...frames],
      timestamps: newTimestamps,
      frameIndex,
      evictedPage: null,
    };
  }

  let evictedPage = null;
  let targetFrame = frames.indexOf(null);

  if (targetFrame === -1) {
    let oldestTime = Infinity;
    let oldestPage = null;

    frames.forEach((p) => {
      if (p === null) return;
      const time = timestamps.get(p) || 0;
      if (time < oldestTime) {
        oldestTime = time;
        oldestPage = p;
      }
    });

    evictedPage = oldestPage;
    targetFrame = frames.indexOf(evictedPage);
  }

  const newFrames = [...frames];
  newFrames[targetFrame] = page;
  const newTimestamps = new Map(timestamps);
  if (evictedPage !== null) newTimestamps.delete(evictedPage);
  newTimestamps.set(page, currentStep);

  return {
    type: 'FAULT',
    frames: newFrames,
    timestamps: newTimestamps,
    frameIndex: targetFrame,
    evictedPage,
  };
}

export function runLru(referenceString, frameCount) {
  let frames = Array(frameCount).fill(null);
  let timestamps = new Map();
  let faults = 0;
  let hits = 0;
  const steps = [];

  referenceString.forEach((page, index) => {
    const result = lruStep(frames, page, timestamps, index + 1);
    frames = result.frames;
    timestamps = result.timestamps;

    if (result.type === 'FAULT') faults++;
    else hits++;

    steps.push({
      step: index + 1,
      page,
      type: result.type,
      frames: [...result.frames],
      timestamps: new Map(result.timestamps),
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
