import { useRef, useEffect, useCallback, memo } from 'react';
import rough from 'roughjs';
import type { InstrumentType, EffectCode } from '@/store/types';

const INSTRUMENTS: InstrumentType[] = ['PolySynth', 'FMSynth', 'AMSynth', 'MembraneSynth', 'PluckSynth', 'Sample'];
const INST_SHORT: Record<InstrumentType, string> = {
  PolySynth: 'Poly',
  FMSynth: 'FM',
  AMSynth: 'AM',
  MembraneSynth: 'Mem',
  PluckSynth: 'Plk',
  Sample: 'Smp',
};
const EFFECTS: (EffectCode | null)[] = [null, 'V', 'P', 'D', 'C'];
const EFFECT_NAMES: Record<string, string> = { V: 'Vol', P: 'Pch', D: 'Dly', C: 'Cut' };

// Chromatic note cycling
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const OCTAVES = [2, 3, 4, 5, 6, 7];
const NOTE_SEQ = ['---', ...OCTAVES.flatMap(oct => NOTES.map(n => `${n}${oct}`))];

function cycleNote(current: string, delta: 1 | -1): string {
  const idx = NOTE_SEQ.indexOf(current);
  const base = idx < 0 ? 0 : idx;
  return NOTE_SEQ[(base + delta + NOTE_SEQ.length) % NOTE_SEQ.length];
}

// Dynamic cell border — measures actual container dimensions via ResizeObserver
function useCellBorder(
  containerRef: React.RefObject<HTMLDivElement | null>,
  svgRef: React.RefObject<SVGSVGElement | null>,
  color: string,
  active: boolean,
  seed: number
) {
  const lastSize = useRef({ w: 0, h: 0 });

  const draw = useCallback(() => {
    const container = containerRef.current;
    const svg = svgRef.current;
    if (!container || !svg) return;
    const { width, height } = container.getBoundingClientRect();
    if (width < 4 || height < 4) return;
    if (
      Math.abs(width - lastSize.current.w) <= 2 &&
      Math.abs(height - lastSize.current.h) <= 2 &&
      lastSize.current.w > 0
    ) return;
    lastSize.current = { w: width, h: height };

    svg.setAttribute('width', String(width));
    svg.setAttribute('height', String(height));
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const rc = rough.svg(svg);
    svg.appendChild(rc.rectangle(1, 1, width - 2, height - 2, {
      roughness: 1.2,
      bowing: 0.5,
      strokeWidth: active ? 2 : 1,
      stroke: active ? color : '#ccc',
      fillStyle: active ? 'hachure' : 'none',
      fill: active ? color : 'none',
      fillWeight: 0.8,
      hachureGap: 8,
      hachureAngle: 30,
      seed,
    }));
  }, [containerRef, svgRef, color, active, seed]);

  useEffect(() => {
    // Reset size threshold so color/active changes always trigger a redraw
    lastSize.current = { w: 0, h: 0 };
    draw();
    const observer = new ResizeObserver(draw);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [draw, containerRef]);
}

// ─── Note Cell ───────────────────────────────────────────────────────────────

interface NoteCellProps {
  note: string;
  color: string;
  isActive?: boolean;
  onChange: (note: string) => void;
}

export const NoteCell = memo(function NoteCell({ note, color, onChange }: NoteCellProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const seed = useRef(Math.floor(Math.random() * 10000)).current;
  const filled = note !== '---';

  useCellBorder(containerRef, svgRef, color, filled, seed);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onChange(cycleNote(note, 1));
  }, [note, onChange]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onChange(cycleNote(note, -1));
  }, [note, onChange]);

  return (
    <div
      ref={containerRef}
      className="step-cell"
      style={{ color: filled ? color : '#ccc' }}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      <svg ref={svgRef} className="cell-border" aria-hidden />
      <div className="cell-content">
        <span>{note}</span>
      </div>
    </div>
  );
});

// ─── Instrument Cell ──────────────────────────────────────────────────────────

interface InstrumentCellProps {
  instrument: InstrumentType;
  color: string;
  isActive?: boolean;
  onChange: (inst: InstrumentType) => void;
}

export const InstrumentCell = memo(function InstrumentCell({ instrument, color, onChange }: InstrumentCellProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const seed = useRef(Math.floor(Math.random() * 10000)).current;

  useCellBorder(containerRef, svgRef, color, true, seed);

  const cycle = useCallback(() => {
    const idx = INSTRUMENTS.indexOf(instrument);
    onChange(INSTRUMENTS[(idx + 1) % INSTRUMENTS.length]);
  }, [instrument, onChange]);

  return (
    <div
      ref={containerRef}
      className="step-cell"
      style={{ color }}
      onClick={cycle}
    >
      <svg ref={svgRef} className="cell-border" aria-hidden />
      <div className="cell-content">
        <span>{INST_SHORT[instrument]}</span>
      </div>
    </div>
  );
});

// ─── Effect Cell ──────────────────────────────────────────────────────────────

interface EffectCellProps {
  effect: EffectCode | null;
  color: string;
  isActive?: boolean;
  onChange: (eff: EffectCode | null) => void;
}

export const EffectCell = memo(function EffectCell({ effect, color, onChange }: EffectCellProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const seed = useRef(Math.floor(Math.random() * 10000)).current;
  const filled = effect !== null;

  useCellBorder(containerRef, svgRef, color, filled, seed);

  const cycle = useCallback(() => {
    const idx = EFFECTS.indexOf(effect);
    onChange(EFFECTS[(idx + 1) % EFFECTS.length]);
  }, [effect, onChange]);

  return (
    <div
      ref={containerRef}
      className="step-cell"
      style={{ color: filled ? color : '#ccc' }}
      onClick={cycle}
    >
      <svg ref={svgRef} className="cell-border" aria-hidden />
      <div className="cell-content">
        <span>{effect ? EFFECT_NAMES[effect] : '---'}</span>
      </div>
    </div>
  );
});

// ─── Effect Value Cell ────────────────────────────────────────────────────────

interface EffectValueCellProps {
  value: number;
  color: string;
  isActive?: boolean;
  disabled: boolean;
  onChange: (v: number) => void;
}

export const EffectValueCell = memo(function EffectValueCell({ value, color, disabled, onChange }: EffectValueCellProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const seed = useRef(Math.floor(Math.random() * 10000)).current;
  const filled = !disabled && value > 0;

  useCellBorder(containerRef, svgRef, color, filled, seed);

  // Click cycles value by 16 steps (0→16→32→…→255→0)
  const cycle = useCallback(() => {
    if (disabled) return;
    onChange((value + 16) > 255 ? 0 : value + 16);
  }, [disabled, value, onChange]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled) return;
    onChange(value >= 16 ? value - 16 : 255 - ((255 - value) % 16));
  }, [disabled, value, onChange]);

  return (
    <div
      ref={containerRef}
      className="step-cell"
      style={{ color: disabled ? '#ccc' : filled ? color : '#888' }}
      onClick={cycle}
      onContextMenu={handleContextMenu}
    >
      <svg ref={svgRef} className="cell-border" aria-hidden />
      <div className="cell-content">
        <span>{disabled ? '---' : value.toString().padStart(3, '0')}</span>
      </div>
    </div>
  );
});

// ─── Repeat Cell ──────────────────────────────────────────────────────────────

interface RepeatCellProps {
  repeat: number;
  color: string;
  isActive?: boolean;
  onChange: (r: number) => void;
}

export const RepeatCell = memo(function RepeatCell({ repeat, color, onChange }: RepeatCellProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const seed = useRef(Math.floor(Math.random() * 10000)).current;
  const filled = repeat > 1;

  useCellBorder(containerRef, svgRef, color, filled, seed);

  const cycle = useCallback(() => {
    onChange(repeat >= 8 ? 1 : repeat + 1);
  }, [repeat, onChange]);

  return (
    <div
      ref={containerRef}
      className="step-cell"
      style={{ color: filled ? color : '#ccc' }}
      onClick={cycle}
    >
      <svg ref={svgRef} className="cell-border" aria-hidden />
      <div className="cell-content">
        <span>{repeat > 1 ? `×${repeat}` : '×1'}</span>
      </div>
    </div>
  );
});
