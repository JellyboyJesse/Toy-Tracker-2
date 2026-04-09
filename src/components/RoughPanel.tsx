import { useRef, useEffect, useCallback, type ReactNode, type CSSProperties } from 'react';
import rough from 'roughjs';

interface RoughPanelProps {
  color?: string;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  roughness?: number;
  fillStyle?: 'none' | 'hachure' | 'zigzag' | 'cross-hatch' | 'dots' | 'dashed' | 'zigzag-line';
  fill?: string;
  hachureGap?: number;
  hachureAngle?: number;
  strokeWidth?: number;
  padding?: number;
}

export function RoughPanel({
  color = '#2a2018',
  children,
  className = '',
  style,
  roughness = 2.8,
  fillStyle = 'none',
  fill = 'none',
  hachureGap,
  hachureAngle,
  strokeWidth = 2.5,
  padding = 12,
}: RoughPanelProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const draw = useCallback(() => {
    const wrap = wrapRef.current;
    const svg = svgRef.current;
    if (!wrap || !svg) return;
    const { width, height } = wrap.getBoundingClientRect();
    if (width === 0 || height === 0) return;

    svg.setAttribute('width', String(width));
    svg.setAttribute('height', String(height));
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    // Clear previous
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const rc = rough.svg(svg);
    const opts: Parameters<typeof rc.rectangle>[4] = {
      roughness,
      bowing: 1.2,
      strokeWidth,
      stroke: color,
      fillStyle,
      fill: fillStyle !== 'none' ? fill : 'none',
    };
    if (hachureGap !== undefined) opts.hachureGap = hachureGap;
    if (hachureAngle !== undefined) opts.hachureAngle = hachureAngle;

    const node = rc.rectangle(3, 3, width - 6, height - 6, opts);
    svg.appendChild(node);
  }, [color, roughness, fillStyle, fill, hachureGap, hachureAngle, strokeWidth]);

  useEffect(() => {
    draw();
    const observer = new ResizeObserver(() => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(draw, 50);
    });
    if (wrapRef.current) observer.observe(wrapRef.current);
    return () => {
      observer.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [draw]);

  return (
    <div
      ref={wrapRef}
      className={`rough-panel ${className}`}
      style={{ padding, ...style }}
    >
      <svg ref={svgRef} className="rough-svg" aria-hidden />
      {children}
    </div>
  );
}
