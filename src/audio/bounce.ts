/**
 * Compute the 16 absolute step start times within a loop of `loopDuration` seconds.
 * bounce=0 → uniform spacing
 * bounce=1 + forward → early steps wider, late steps compressed (ball slows down)
 * bounce=1 + reverse → early steps compressed, late steps wider (ball speeds up)
 * Swing nudges even-indexed steps slightly later.
 */
export function computeBounceOffsets(
  bounce: number,
  direction: 'forward' | 'reverse',
  loopDuration: number,
  swing: number
): number[] {
  const n = 16;
  // Compute normalised cumulative positions [0, 1] for each step start
  const positions = Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1); // 0 → 1
    let eased: number;
    if (bounce === 0) {
      eased = t;
    } else {
      // Exponential ease-in (compress tail) — forward
      eased = 1 - Math.pow(1 - t, 1 + bounce * 4);
    }
    return direction === 'forward' ? eased : 1 - eased;
  });

  // Re-sort so positions are always ascending (reverse flips them)
  const sorted = direction === 'reverse'
    ? positions.map((_, i) => 1 - positions[n - 1 - i])
    : positions;

  // Convert to absolute times
  const times = sorted.map(p => p * loopDuration);

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
