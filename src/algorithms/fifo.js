export function fifoStep(frames, page, queue) {
  const frameIndex = frames.indexOf(page);

  if (frameIndex !== -1) {
    return {
      type: 'HIT',
      frames: [...frames],
      queue: [...queue],
      frameIndex,
      evictedPage: null,
    };
  }

  let evictedPage = null;
  let targetFrame = frames.indexOf(null);
  let newQueue = [...queue];

  if (targetFrame === -1) {
    evictedPage = newQueue[0];
    newQueue = newQueue.slice(1);
    targetFrame = frames.indexOf(evictedPage);
  }

  const newFrames = [...frames];
  newFrames[targetFrame] = page;
  newQueue.push(page);

  return {
    type: 'FAULT',
    frames: newFrames,
    queue: newQueue,
    frameIndex: targetFrame,
    evictedPage,
  };
}

export function runFifo(referenceString, frameCount) {
  let frames = Array(frameCount).fill(null);
  let queue = [];
  let faults = 0;
  let hits = 0;
  const steps = [];

  referenceString.forEach((page, index) => {
    const result = fifoStep(frames, page, queue);
    frames = result.frames;
    queue = result.queue;

    if (result.type === 'FAULT') faults++;
    else hits++;

    steps.push({
      step: index + 1,
      page,
      type: result.type,
      frames: [...result.frames],
      queue: [...result.queue],
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
