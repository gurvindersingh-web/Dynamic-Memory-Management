export function clockStep(frames, page, refBits, hand) {
  const frameIndex = frames.indexOf(page);

  // HIT: set reference bit
  if (frameIndex !== -1) {
    const newRefBits = [...refBits];
    newRefBits[frameIndex] = 1;
    return {
      type: 'HIT',
      frames: [...frames],
      refBits: newRefBits,
      hand,
      frameIndex,
      evictedPage: null,
    };
  }

  // FAULT: scan for a victim with refBit = 0 (second chance)
  const n = frames.length;
  let newHand = hand;
  const newFrames = [...frames];
  const newRefBits = [...refBits];
  let evictedPage = null;

  // Find a slot:
  // - if empty frame encountered at hand, take it
  // - else if refBit==1, clear and advance
  // - else (refBit==0), evict and take it
  // Worst-case: one full pass + one selection.
  while (true) {
    if (newFrames[newHand] === null) {
      break;
    }
    if (newRefBits[newHand] === 1) {
      newRefBits[newHand] = 0;
      newHand = (newHand + 1) % n;
      continue;
    }
    break;
  }

  if (newFrames[newHand] !== null) {
    evictedPage = newFrames[newHand];
  }
  newFrames[newHand] = page;
  newRefBits[newHand] = 1;
  const placedFrame = newHand;
  newHand = (newHand + 1) % n;

  return {
    type: 'FAULT',
    frames: newFrames,
    refBits: newRefBits,
    hand: newHand,
    frameIndex: placedFrame,
    evictedPage,
  };
}

export function runClock(referenceString, frameCount) {
  let frames = Array(frameCount).fill(null);
  let refBits = Array(frameCount).fill(0);
  let hand = 0;
  let faults = 0;
  let hits = 0;
  const steps = [];

  referenceString.forEach((page, index) => {
    const result = clockStep(frames, page, refBits, hand);
    frames = result.frames;
    refBits = result.refBits;
    hand = result.hand;

    if (result.type === 'FAULT') faults++;
    else hits++;

    steps.push({
      step: index + 1,
      page,
      type: result.type,
      frames: [...result.frames],
      refBits: [...result.refBits],
      hand: result.hand,
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

