import { useRef, useEffect, type MouseEvent } from 'react';
import rough from 'roughjs';

interface TransportButtonProps {
  label: string;
  color: string;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  width?: number;
  height?: number;
}

export function TransportButton({ label, color, onClick, width = 80, height = 44 }: TransportButtonProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const rc = rough.svg(svg);
    const rect = rc.rectangle(3, 3, width - 6, height - 6, {
      roughness: 2.2,
      bowing: 1.5,
      strokeWidth: 2.5,
      stroke: color,
      fillStyle: 'hachure',
      fill: color,
      fillWeight: 1.2,
      hachureGap: 6,
      hachureAngle: -41,
    });
    svg.appendChild(rect);
  }, [color, width, height]);

  return (
    <button className="transport-btn" onClick={onClick} style={{ width, height }}>
      <svg ref={svgRef} width={width} height={height} />
      <span style={{ color }}>{label}</span>
    </button>
  );
}
