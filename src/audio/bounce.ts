/**
 * Compute the 16 absolute step start times within a loop of `loopDuration` seconds.
 * bounce=0 → uniform spacing
 * forward: ease-out — wide early gaps narrowing toward end (ball decelerates)
 * reverse: ease-in  — narrow early gaps widening toward end (ball accelerates)
 * Swing nudges even-indexed steps slightly later.
 */
export function computeBounceOffsets(
  bounce: number,
  direction: 'forward' | 'reverse',
  loopDuration: number,
  swing: number
): number[] {
  const n = 16;
  const exponent = 1 + bounce * 4;

  // Monotonically increasing positions [0..1] for each step start
  const positions = Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1); // 0 → 1
    if (bounce === 0) return t;
    // forward: ease-out (1-(1-t)^E) — rushes early, slows at end
    // reverse: ease-in (t^E)        — slow start, rushes at end
    return direction === 'forward'
      ? 1 - Math.pow(1 - t, exponent)
      : Math.pow(t, exponent);
  });

  // Convert normalised positions to absolute times
  const times = positions.map(p => p * loopDuration);

  // Apply swing: nudge even-indexed steps (0,2,4…) slightly later
  if (swing > 0) {
    const avgStep = loopDuration / n;
    const nudge = swing * avgStep * 0.15;
    for (let i = 0; i < n; i += 2) {
      times[i] = Math.min(times[i] + nudge, loopDuration - 0.001);
    }
  }

  return times;
}

/** Duration of each step slot (time until next step fires) */
export function computeStepDurations(times: number[], loopDuration: number): number[] {
  return times.map((t, i) => {
    const next = i < times.length - 1 ? times[i + 1] : loopDuration;
    return Math.max(next - t, 0.01);
  });
}
