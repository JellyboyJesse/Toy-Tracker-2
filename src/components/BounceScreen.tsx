import { useMemo } from 'react';
import { useStore } from '@/store';
import { RoughPanel } from './RoughPanel';
import { Knob } from './Knob';
import { audioEngine } from '@/audio/AudioEngine';
import { computeBounceOffsets, computeStepDurations } from '@/audio/bounce';

// Same rainbow palette as StepGrid
const STEP_GLOW_COLORS = [
  '#FF2020', '#FF4A10', '#FF7000', '#FF9A00', '#FFCA00', '#E8F700',
  '#88EE00', '#00CC44', '#00CCAA', '#00AAEE', '#0066FF', '#0022FF',
  '#4400DD', '#7700BB', '#AA0099', '#DD0077',
];

const TRACK_NAMES = ['Track 1', 'Track 2', 'Track 3', 'Track 4'];

interface BounceBarChartProps {
  bounce: number;
  direction: 'forward' | 'reverse';
  color: string;
}

function BounceBarChart({ bounce, direction, color }: BounceBarChartProps) {
  const durations = useMemo(() => {
    // Use loopDuration=1 for normalised display, no swing
    const offsets = computeBounceOffsets(bounce, direction, 1, 0);
    return computeStepDurations(offsets, 1);
  }, [bounce, direction]);

  const maxDur = Math.max(...durations);
  const chartW = 160;
  const chartH = 56;
  const barW = chartW / 16 - 1;

  return (
    <svg
      className="bounce-bar-chart"
      viewBox={`0 0 ${chartW} ${chartH}`}
      style={{ width: '100%', height: 56 }}
    >
      {durations.map((d, i) => {
        const barH = maxDur > 0 ? (d / maxDur) * (chartH - 4) : 0;
        const x = i * (chartW / 16);
        return (
          <rect
            key={i}
            x={x + 0.5}
            y={chartH - barH - 2}
            width={barW}
            height={barH}
            fill={STEP_GLOW_COLORS[i]}
            opacity={0.75}
            rx={1}
          />
        );
      })}
      {/* Baseline */}
      <line x1={0} y1={chartH - 1} x2={chartW} y2={chartH - 1} stroke={color} strokeWidth={1} opacity={0.3} />
    </svg>
  );
}

interface BounceTrackColumnProps {
  trackId: 0 | 1 | 2 | 3;
}

function BounceTrackColumn({ trackId }: BounceTrackColumnProps) {
  const color = useStore(s => s.tracks[trackId].color);
  const bounce = useStore(s => s.tracks[trackId].bounce);
  const direction = useStore(s => s.tracks[trackId].bounceDirection);
  const setTrackBounce = useStore(s => s.setTrackBounce);
  const setTrackBounceDirection = useStore(s => s.setTrackBounceDirection);

  return (
    <RoughPanel color={color} padding={10} className="bounce-track">
      <div className="bounce-track-label crayon-text" style={{ color }}>
        {TRACK_NAMES[trackId]}
      </div>

      <Knob
        value={bounce}
        onChange={v => {
          setTrackBounce(trackId, v);
          audioEngine.updateTrackBounce(trackId);
        }}
        color={color}
        label="Bounce"
        displayValue={`${Math.round(bounce * 100)}%`}
        size={72}
      />

      <div className="bounce-dir-group">
        <button
          className={`bounce-dir-btn${direction === 'forward' ? ' active' : ''}`}
          style={{ color: direction === 'forward' ? color : undefined }}
          onClick={() => {
            setTrackBounceDirection(trackId, 'forward');
            audioEngine.updateTrackBounce(trackId);
          }}
        >
          ▶ fwd
        </button>
        <button
          className={`bounce-dir-btn${direction === 'reverse' ? ' active' : ''}`}
          style={{ color: direction === 'reverse' ? color : undefined }}
          onClick={() => {
            setTrackBounceDirection(trackId, 'reverse');
            audioEngine.updateTrackBounce(trackId);
          }}
        >
          rev ◀
        </button>
      </div>

      <BounceBarChart bounce={bounce} direction={direction} color={color} />
    </RoughPanel>
  );
}

export function BounceScreen() {
  return (
    <div className="bounce-screen">
      <div className="bounce-tracks">
        {([0, 1, 2, 3] as const).map(id => (
          <BounceTrackColumn key={id} trackId={id} />
        ))}
      </div>
    </div>
  );
}
