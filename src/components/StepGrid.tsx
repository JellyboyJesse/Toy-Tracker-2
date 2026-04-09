import { memo } from 'react';
import { useStore } from '@/store';
import { NoteCell, InstrumentCell, EffectCell, EffectValueCell, RepeatCell } from './StepCell';
import type { Step } from '@/store/types';

interface StepGridProps {
  trackId: 0 | 1 | 2 | 3;
  color: string;
  steps: Step[];
  activeStep: number;
}

export const StepGrid = memo(function StepGrid({ trackId, color, steps, activeStep }: StepGridProps) {
  const setStepNote = useStore(s => s.setStepNote);
  const setStepInstrument = useStore(s => s.setStepInstrument);
  const setStepEffect = useStore(s => s.setStepEffect);
  const setStepEffectValue = useStore(s => s.setStepEffectValue);
  const setStepRepeat = useStore(s => s.setStepRepeat);

  return (
    <div>
      <div className="grid-col-headers">
        {['Note', 'Inst', 'Eff', 'Val', 'Rep'].map(h => (
          <div key={h} className="grid-col-header">{h}</div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {steps.map((step, i) => (
          <div key={i} className="step-grid">
            <NoteCell
              note={step.note}
              color={color}
              isActive={i === activeStep}
              onChange={v => setStepNote(trackId, i, v)}
            />
            <InstrumentCell
              instrument={step.instrument}
              color={color}
              isActive={i === activeStep}
              onChange={v => setStepInstrument(trackId, i, v)}
            />
            <EffectCell
              effect={step.effect}
              color={color}
              isActive={i === activeStep}
              onChange={v => setStepEffect(trackId, i, v)}
            />
            <EffectValueCell
              value={step.effectValue}
              color={color}
              isActive={i === activeStep}
              disabled={step.effect === null}
              onChange={v => setStepEffectValue(trackId, i, v)}
            />
            <RepeatCell
              repeat={step.repeat}
              color={color}
              isActive={i === activeStep}
              onChange={v => setStepRepeat(trackId, i, v)}
            />
          </div>
        ))}
      </div>
    </div>
  );
});
