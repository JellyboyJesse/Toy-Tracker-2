import { useRef, useEffect, useMemo, memo } from 'react';
import rough from 'roughjs';
import { useKnobDrag } from '@/hooks/useKnobDrag';

const SIZE = 64;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 26;

// Knob goes from 7:30 o'clock (135° SVG) to 4:30 o'clock (405°=45° SVG)
// Total clockwise sweep = 270°
const MIN_SVG = 135; // 7:30 o'clock position in SVG degrees
const SWEEP = 270;
const NEEDLE_LEN = 18;

function polarToXY(angleDeg: number, r: number): [number, number] {
  const rad = (angleDeg * Math.PI) / 180;
  return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)];
}

function arcPath(startDeg: number, endDeg: number, r: number): string {
  const [x1, y1] = polarToXY(startDeg, r);
  const [x2, y2] = polarToXY(endDeg, r);
  const diff = endDeg - startDeg;
  const large = diff > 180 ? 1 : 0;
  const sweep = 1; // always clockwise
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} ${sweep} ${x2} ${y2}`;
}

interface RoughCircleProps {
  color: string;
}

const RoughCircle = memo(function RoughCircle({ color }: RoughCircleProps) {
  const svgRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const g = svgRef.current;
    if (!g) return;
    const tempSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const rc = rough.svg(tempSvg);
    const circle = rc.circle(CX, CY, R * 2, {
      roughness: 2.5,
      strokeWidth: 2,
      stroke: color,
      fillStyle: 'none',
    });
    while (g.firstChild) g.removeChild(g.firstChild);
    const cloned = circle.cloneNode(true) as SVGGElement;
    Array.from(cloned.childNodes).forEach(n => g.appendChild(n));
  }, [color]);

  return <g ref={svgRef} />;
});

interface KnobProps {
  value: number; // 0-1
  onChange: (v: number) => void;
  color?: string;
  label: string;
  displayValue?: string;
  sensitivity?: number;
}

export function Knob({ value, onChange, color = '#9C27B0', label, displayValue, sensitivity }: KnobProps) {
  const { onPointerDown, onPointerMove } = useKnobDrag(value, onChange, sensitivity);

  // Needle rotation from 12 o'clock: -135° at min, +135° at max
  const needleRotation = -135 + value * SWEEP;

  // Arc end angle for value arc (clockwise from MIN_SVG)
  const valueEndSVG = MIN_SVG + value * SWEEP;

  const arcRange = useMemo(
    () => arcPath(MIN_SVG, MIN_SVG + SWEEP, R - 4),
    []
  );
  const arcValue = useMemo(
    () => value > 0.005 ? arcPath(MIN_SVG, valueEndSVG, R - 4) : '',
    [value, valueEndSVG]
  );

  return (
    <div className="knob-wrap">
      <svg
        className="knob-svg"
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        style={{ filter: 'url(#crayon-grain)' }}
      >
        <RoughCircle color={color} />

        {/* Range arc (gray background) */}
        <path d={arcRange} fill="none" stroke="#ccc" strokeWidth={2} strokeLinecap="round" />

        {/* Value arc (coloured fill) */}
        {arcValue && (
          <path d={arcValue} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
        )}

        {/* Needle — drawn pointing up, then rotated by needleRotation */}
        <g transform={`rotate(${needleRotation}, ${CX}, ${CY})`}>
          <line
            x1={CX}
            y1={CY}
            x2={CX}
            y2={CY - NEEDLE_LEN}
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        </g>
      </svg>
      <div className="knob-label">{displayValue ?? label}</div>
      {displayValue && <div className="knob-label" style={{ fontSize: 9, marginTop: -2 }}>{label}</div>}
    </div>
  );
}
