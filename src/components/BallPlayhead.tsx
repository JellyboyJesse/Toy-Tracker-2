import { useRef, useEffect } from 'react';
import { useStore } from '@/store';
import { computeBounceOffsets, computeStepDurations } from '@/audio/bounce';

const CELL_H = 28 + 3; // step height + gap
const STEP_COUNT = 16;

interface BallPlayheadProps {
  trackId: 0 | 1 | 2 | 3;
  color: string;
  bounce: number;
}

export function BallPlayhead({ trackId, color, bounce }: BallPlayheadProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const rafRef = useRef<number>(0);

  const totalH = STEP_COUNT * CELL_H;

  useEffect(() => {
    let lastStep = -1;
    let stepStartTime = 0;
    let currentStepDuration = 0.5; // seconds, computed from store

    function getStepDuration(stepIndex: number): number {
      const state = useStore.getState();
      const track = state.tracks[trackId];
      const beatDuration = 60 / state.bpm;
      const loopDuration = (16 * beatDuration) / track.tempo;
      const offsets = computeBounceOffsets(track.bounce, track.bounceDirection, loopDuration, state.swing);
      const durations = computeStepDurations(offsets, loopDuration);
      return durations[stepIndex] ?? loopDuration / 16;
    }

    function frame() {
      const circle = circleRef.current;
      if (!circle) {
        rafRef.current = requestAnimationFrame(frame);
        return;
      }

      const state = useStore.getState();
      const activeStep = state.activeSteps[trackId];
      const playing = state.playing;

      if (!playing) {
        circle.setAttribute('cy', String(activeStep * CELL_H + CELL_H / 2));
        circle.setAttribute('cx', '8');
        rafRef.current = requestAnimationFrame(frame);
        return;
      }

      if (activeStep !== lastStep) {
        lastStep = activeStep;
        stepStartTime = performance.now();
        currentStepDuration = getStepDuration(activeStep);
      }

      const elapsed = (performance.now() - stepStartTime) / 1000;
      const stepFrac = Math.min(elapsed / currentStepDuration, 1);

      const fromY = activeStep * CELL_H + CELL_H / 2;
      const nextStep = (activeStep + 1) % STEP_COUNT;
      const dy = nextStep === 0 ? -(STEP_COUNT - 1) * CELL_H : CELL_H;
      const baseY = fromY + dy * stepFrac;

      // Sideways bounce arc: half-sine peaks at midpoint
      const arcLift = 10 * bounce * Math.sin(stepFrac * Math.PI);

      circle.setAttribute('cy', String(baseY));
      circle.setAttribute('cx', String(8 + arcLift));

      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [trackId, bounce]);

  return (
    <svg
      ref={svgRef}
      className="ball-playhead"
      width={24}
      height={totalH}
      style={{ left: -20, top: 18 }}
    >
      <circle
        ref={circleRef}
        r={7}
        cx={8}
        cy={CELL_H / 2}
        fill={color}
        opacity={0.85}
        style={{ filter: 'url(#crayon-grain)' }}
      />
    </svg>
  );
}
