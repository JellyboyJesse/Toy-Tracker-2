import { useRef, useEffect, useState, useCallback, memo } from 'react';
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

// Shared rough cell border — drawn once per (color, active)
function useCellBorder(
  svgRef: React.RefObject<SVGSVGElement | null>,
  color: string,
  active: boolean,
  width: number,
  height: number
) {
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    const rc = rough.svg(svg);
    const rect = rc.rectangle(1, 1, width - 2, height - 2, {
      roughness: 1.2,
      bowing: 0.5,
      strokeWidth: active ? 2 : 1,
      stroke: active ? color : '#ccc',
      fillStyle: active ? 'hachure' : 'none',
      fill: active ? color : 'none',
      fillWeight: 0.8,
      hachureGap: 8,
      hachureAngle: 30,
    });
    svg.appendChild(rect);
  }, [svgRef, color, active, width, height]);
}

// ─── Note Cell ───────────────────────────────────────────────────────────────

interface NoteCellProps {
  note: string;
  color: string;
  isActive: boolean;
  onChange: (note: string) => void;
}

export const NoteCell = memo(function NoteCell({ note, color, isActive, onChange }: NoteCellProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note);
  const inputRef = useRef<HTMLInputElement>(null);
  const filled = note !== '---';

  useCellBorder(svgRef, color, filled, 54, 28);

  const commit = useCallback(() => {
    const val = draft.trim().toUpperCase();
    onChange(val || '---');
    setEditing(false);
  }, [draft, onChange]);

  useEffect(() => {
    if (editing) {
      setDraft(note === '---' ? '' : note);
      setTimeout(() => inputRef.current?.select(), 0);
    }
  }, [editing, note]);

  return (
    <div
      className={`step-cell${isActive ? ' active-step' : ''}`}
      style={{ color: filled ? color : '#ccc' }}
      onClick={() => setEditing(true)}
    >
      <svg ref={svgRef} className="cell-border" width={54} height={28} />
      <div className="cell-content">
        {editing ? (
          <input
            ref={inputRef}
            className="cell-input"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === 'Tab') commit();
              if (e.key === 'Escape') { setEditing(false); }
            }}
            maxLength={4}
            placeholder="---"
            style={{ color: color }}
          />
        ) : (
          <span>{note}</span>
        )}
      </div>
    </div>
  );
});

// ─── Instrument Cell ──────────────────────────────────────────────────────────

interface InstrumentCellProps {
  instrument: InstrumentType;
  color: string;
  isActive: boolean;
  onChange: (inst: InstrumentType) => void;
}

export const InstrumentCell = memo(function InstrumentCell({ instrument, color, isActive, onChange }: InstrumentCellProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const filled = true;

  useCellBorder(svgRef, color, filled, 54, 28);

  const cycle = useCallback(() => {
    const idx = INSTRUMENTS.indexOf(instrument);
    onChange(INSTRUMENTS[(idx + 1) % INSTRUMENTS.length]);
  }, [instrument, onChange]);

  return (
    <div
      className={`step-cell${isActive ? ' active-step' : ''}`}
      style={{ color }}
      onClick={cycle}
    >
      <svg ref={svgRef} className="cell-border" width={54} height={28} />
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
  isActive: boolean;
  onChange: (eff: EffectCode | null) => void;
}

export const EffectCell = memo(function EffectCell({ effect, color, isActive, onChange }: EffectCellProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const filled = effect !== null;

  useCellBorder(svgRef, color, filled, 54, 28);

  const cycle = useCallback(() => {
    const idx = EFFECTS.indexOf(effect);
    onChange(EFFECTS[(idx + 1) % EFFECTS.length]);
  }, [effect, onChange]);

  return (
    <div
      className={`step-cell${isActive ? ' active-step' : ''}`}
      style={{ color: filled ? color : '#ccc' }}
      onClick={cycle}
    >
      <svg ref={svgRef} className="cell-border" width={54} height={28} />
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
  isActive: boolean;
  disabled: boolean;
  onChange: (v: number) => void;
}

export const EffectValueCell = memo(function EffectValueCell({ value, color, isActive, disabled, onChange }: EffectValueCellProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);
  const filled = !disabled && value > 0;

  useCellBorder(svgRef, color, filled, 54, 28);

  const commit = useCallback(() => {
    const n = parseInt(draft, 10);
    onChange(isNaN(n) ? 0 : Math.max(0, Math.min(255, n)));
    setEditing(false);
  }, [draft, onChange]);

  useEffect(() => {
    if (editing) {
      setDraft(String(value));
      setTimeout(() => inputRef.current?.select(), 0);
    }
  }, [editing, value]);

  return (
    <div
      className={`step-cell${isActive ? ' active-step' : ''}`}
      style={{ color: disabled ? '#ccc' : filled ? color : '#888' }}
      onClick={() => !disabled && setEditing(true)}
    >
      <svg ref={svgRef} className="cell-border" width={54} height={28} />
      <div className="cell-content">
        {editing ? (
          <input
            ref={inputRef}
            className="cell-input"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === 'Tab') commit();
              if (e.key === 'Escape') setEditing(false);
            }}
            maxLength={3}
            style={{ color }}
          />
        ) : (
          <span>{disabled ? '---' : value.toString().padStart(3, '0')}</span>
        )}
      </div>
    </div>
  );
});

// ─── Repeat Cell ──────────────────────────────────────────────────────────────

interface RepeatCellProps {
  repeat: number;
  color: string;
  isActive: boolean;
  onChange: (r: number) => void;
}

export const RepeatCell = memo(function RepeatCell({ repeat, color, isActive, onChange }: RepeatCellProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const filled = repeat > 1;

  useCellBorder(svgRef, color, filled, 54, 28);

  const cycle = useCallback(() => {
    onChange(repeat >= 8 ? 1 : repeat + 1);
  }, [repeat, onChange]);

  return (
    <div
      className={`step-cell${isActive ? ' active-step' : ''}`}
      style={{ color: filled ? color : '#ccc' }}
      onClick={cycle}
    >
      <svg ref={svgRef} className="cell-border" width={54} height={28} />
      <div className="cell-content">
        <span>{repeat > 1 ? `×${repeat}` : '×1'}</span>
      </div>
    </div>
  );
});
